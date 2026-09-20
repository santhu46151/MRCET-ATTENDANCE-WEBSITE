import { db } from '../firebase';
import { OFFICIAL_TIMETABLES } from '../data/defaultTimetables';

export const DEFAULT_CLASSES = [
  { id: 'IV_D', name: 'IV CSE DS D', year: 'IV', section: 'D', department: 'DS', branch: 'CSE' },
  { id: 'IV_C', name: 'IV CSE DS C', year: 'IV', section: 'C', department: 'DS', branch: 'CSE' },
  { id: 'IV_B', name: 'IV CSE DS B', year: 'IV', section: 'B', department: 'DS', branch: 'CSE' },
  { id: 'IV_A', name: 'IV CSE DS A', year: 'IV', section: 'A', department: 'DS', branch: 'CSE' },
  { id: 'III_D', name: 'III CSE DS D', year: 'III', section: 'D', department: 'DS', branch: 'CSE' },
  { id: 'III_C', name: 'III CSE DS C', year: 'III', section: 'C', department: 'DS', branch: 'CSE' },
  { id: 'III_B', name: 'III CSE DS B', year: 'III', section: 'B', department: 'DS', branch: 'CSE' },
  { id: 'III_A', name: 'III CSE DS A', year: 'III', section: 'A', department: 'DS', branch: 'CSE' }
];

// In-memory caches
let memoryClasses = null;
let classesCacheTime = 0;
const CLASSES_TTL = 5 * 60 * 1000; // 5 minutes

let memoryHolidays = null;
let holidaysCacheTime = 0;
const HOLIDAYS_TTL = 15 * 60 * 1000; // 15 minutes

const timetableCache = new Map();

/**
 * Fetch list of classes metadata without downloading rosters and history.
 * Cached in memory and localStorage to avoid repeated Firestore queries.
 */
export async function fetchClassList(forceRefresh = false) {
  const now = Date.now();

  if (!forceRefresh && memoryClasses && (now - classesCacheTime < CLASSES_TTL)) {
    return memoryClasses;
  }

  // Try local storage cache
  if (!forceRefresh) {
    try {
      const stored = localStorage.getItem('mrcet_cached_classes');
      const storedTime = Number(localStorage.getItem('mrcet_cached_classes_time') || 0);
      if (stored && (now - storedTime < CLASSES_TTL)) {
        memoryClasses = JSON.parse(stored);
        classesCacheTime = storedTime;
        return memoryClasses;
      }
    } catch {}
  }

  try {
    const snapshot = await db.collection('classes').get();
    const list = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      const id = doc.id;
      list.push({
        id,
        name: (data.year && data.section) 
          ? `${data.year} ${data.branch || 'CSE'} ${data.department || 'DS'} ${data.section}` 
          : id,
        year: data.year || '',
        section: data.section || '',
        department: data.department || 'DS',
        branch: data.branch || 'CSE'
      });
    });

    const result = list.length > 0 ? list.sort((a, b) => a.id.localeCompare(b.id)) : DEFAULT_CLASSES;
    memoryClasses = result;
    classesCacheTime = now;

    try {
      localStorage.setItem('mrcet_cached_classes', JSON.stringify(result));
      localStorage.setItem('mrcet_cached_classes_time', String(now));
    } catch {}

    return result;
  } catch (err) {
    console.warn("fetchClassList error, using fallback:", err);
    return memoryClasses || DEFAULT_CLASSES;
  }
}

export function invalidateClassListCache() {
  memoryClasses = null;
  classesCacheTime = 0;
  try {
    localStorage.removeItem('mrcet_cached_classes');
    localStorage.removeItem('mrcet_cached_classes_time');
  } catch {}
}

/**
 * Fetch holidays list with caching.
 */
export async function fetchHolidays(forceRefresh = false) {
  const now = Date.now();

  if (!forceRefresh && memoryHolidays && (now - holidaysCacheTime < HOLIDAYS_TTL)) {
    return memoryHolidays;
  }

  if (!forceRefresh) {
    try {
      const stored = localStorage.getItem('mrcet_cached_holidays');
      const storedTime = Number(localStorage.getItem('mrcet_cached_holidays_time') || 0);
      if (stored && (now - storedTime < HOLIDAYS_TTL)) {
        memoryHolidays = JSON.parse(stored);
        holidaysCacheTime = storedTime;
        return memoryHolidays;
      }
    } catch {}
  }

  try {
    const snapshot = await db.collection('holidays').get();
    const list = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      list.push(data.date || doc.id);
    });

    memoryHolidays = list;
    holidaysCacheTime = now;

    try {
      localStorage.setItem('mrcet_cached_holidays', JSON.stringify(list));
      localStorage.setItem('mrcet_cached_holidays_time', String(now));
    } catch {}

    return list;
  } catch (err) {
    console.warn("fetchHolidays error:", err);
    return memoryHolidays || [];
  }
}

export function invalidateHolidaysCache() {
  memoryHolidays = null;
  holidaysCacheTime = 0;
  try {
    localStorage.removeItem('mrcet_cached_holidays');
    localStorage.removeItem('mrcet_cached_holidays_time');
  } catch {}
}

/**
 * Fetch or get cached timetable for a specific class.
 */
export async function fetchClassTimetable(classId) {
  if (!classId) return {};

  if (timetableCache.has(classId)) {
    return timetableCache.get(classId);
  }

  try {
    const doc = await db.collection('timetables').doc(classId).get();
    if (doc.exists && doc.data().schedule && Object.keys(doc.data().schedule).length > 0) {
      const sched = doc.data().schedule;
      timetableCache.set(classId, sched);
      return sched;
    }
  } catch (err) {
    console.warn(`fetchClassTimetable error for ${classId}:`, err);
  }

  // Fallback to official timetable defaults
  const fallback = OFFICIAL_TIMETABLES[classId]?.schedule || OFFICIAL_TIMETABLES['IV_D']?.schedule || {};
  timetableCache.set(classId, fallback);
  return fallback;
}
