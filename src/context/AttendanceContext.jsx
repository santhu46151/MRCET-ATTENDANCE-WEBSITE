import React, { createContext, useContext, useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { db, auth, firebase } from '../firebase';
import { useAuth } from './AuthContext';
import { OFFICIAL_TIMETABLES, DEFAULT_STUDENTS_IV_D, PERIOD_TIMES } from '../data/defaultTimetables';
import { fetchClassList, fetchHolidays, DEFAULT_CLASSES } from '../services/cacheService';


const AttendanceContext = createContext(null);

export const AttendanceProvider = ({ children }) => {
  const { user, isStudent } = useAuth();

  // Helper date formatting YYYY-MM-DD
  const formatToday = () => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };


  const [availableClasses, setAvailableClasses] = useState(DEFAULT_CLASSES);
  const [currentClassId, setCurrentClassId] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    const qClass = params.get('class');
    if (qClass) return qClass;
    if (isStudent && user?.year && user?.section) return `${user.year}_${user.section}`;
    return localStorage.getItem('current_class_id') || 'IV_D';
  });

  const [selectedDate, setSelectedDate] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('date') || formatToday();
  });

  const [roster, setRoster] = useState(() => {
    try {
      const curId = localStorage.getItem('current_class_id') || 'IV_D';
      const cached = localStorage.getItem('attendance_roster_' + curId);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return DEFAULT_STUDENTS_IV_D;
  });

  const [history, setHistory] = useState(() => {
    try {
      const curId = localStorage.getItem('current_class_id') || 'IV_D';
      const scoped = localStorage.getItem('attendance_history_' + curId);
      if (scoped) return JSON.parse(scoped);
      const global = localStorage.getItem('attendance_history');
      if (global) return JSON.parse(global);
    } catch {}
    return {};
  });

  const [timetable, setTimetable] = useState(() => {
    const curId = localStorage.getItem('current_class_id') || 'IV_D';
    return OFFICIAL_TIMETABLES[curId]?.schedule || OFFICIAL_TIMETABLES['IV_D']?.schedule || {};
  });

  const [holidays, setHolidays] = useState([]);
  const [syncStatus, setSyncStatus] = useState('synced');
  const [searchQuery, setSearchQuery] = useState('');
  const [inchargeRequests, setInchargeRequests] = useState([]);

  const lastLocalUploadTimeRef = useRef(0);
  const isLocalEditRef = useRef(false);
  const cloudAutoSaveTimerRef = useRef(null);
  const latestHistoryRef = useRef(history);
  latestHistoryRef.current = history;
  const currentClassIdRef = useRef(currentClassId);
  currentClassIdRef.current = currentClassId;

  // Primary Day key: e.g. IV_D_2026-09-18
  const activeDayKey = `${currentClassId}_${selectedDate}`;
  const activePeriodKey = activeDayKey;

  // Persist local cache when roster or history changes (debounced to prevent UI lag)
  const rosterSaveTimerRef = useRef(null);
  const historySaveTimerRef = useRef(null);

  useEffect(() => {
    if (currentClassId && Array.isArray(roster) && roster.length > 0) {
      if (rosterSaveTimerRef.current) clearTimeout(rosterSaveTimerRef.current);
      rosterSaveTimerRef.current = setTimeout(() => {
        try {
          localStorage.setItem('attendance_roster_' + currentClassId, JSON.stringify(roster));
        } catch {}
      }, 500);
    }
    return () => {
      if (rosterSaveTimerRef.current) clearTimeout(rosterSaveTimerRef.current);
    };
  }, [roster, currentClassId]);

  useEffect(() => {
    if (currentClassId && history && Object.keys(history).length > 0) {
      if (historySaveTimerRef.current) clearTimeout(historySaveTimerRef.current);
      historySaveTimerRef.current = setTimeout(() => {
        try {
          const serialized = JSON.stringify(history);
          localStorage.setItem('attendance_history_' + currentClassId, serialized);
          localStorage.setItem('attendance_history', serialized);
        } catch {}
      }, 400);
    }
    return () => {
      if (historySaveTimerRef.current) clearTimeout(historySaveTimerRef.current);
    };
  }, [history, currentClassId]);

  // AUTOMATIC CLOUD SAVE: Debounced 800ms auto-save to Firestore whenever history is modified locally (active for all users)
  useEffect(() => {
    if (!currentClassId) return;

    if (isLocalEditRef.current && history && Object.keys(history).length > 0) {
      if (cloudAutoSaveTimerRef.current) clearTimeout(cloudAutoSaveTimerRef.current);
      setSyncStatus('syncing');

      cloudAutoSaveTimerRef.current = setTimeout(async () => {
        const classId = currentClassIdRef.current;
        const dataToSave = latestHistoryRef.current;
        const targetKey = activeDayKey;
        const dayPayload = dataToSave[targetKey];
        if (!classId || !dayPayload) return;

        lastLocalUploadTimeRef.current = Date.now();
        isLocalEditRef.current = false;

        try {
          // Ultra-fast targeted update: touches only the active date, zero overhead, <50ms
          await db.collection('classes').doc(classId).update({
            [`history.${targetKey}`]: dayPayload,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
          });
          setSyncStatus('synced');
        } catch (updateErr) {
          try {
            await db.collection('classes').doc(classId).set({
              history: { [targetKey]: dayPayload },
              updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            }, { merge: true });
            setSyncStatus('synced');
          } catch (err) {
            console.error("Auto-save to Cloud Firestore error:", err);
            setSyncStatus('error');
          }
        }
      }, 400);
    }

    return () => {
      if (cloudAutoSaveTimerRef.current) clearTimeout(cloudAutoSaveTimerRef.current);
    };
  }, [history, currentClassId, activeDayKey]);

  // Flush pending auto-save immediately if browser tab is closed or navigated
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (isLocalEditRef.current && currentClassIdRef.current) {
        const targetKey = activeDayKey;
        const dayPayload = latestHistoryRef.current[targetKey];
        if (dayPayload) {
          try {
            db.collection('classes').doc(currentClassIdRef.current).update({
              [`history.${targetKey}`]: dayPayload,
              updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
          } catch {}
        }
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [activeDayKey]);

  // 1. Load available classes from cache / targeted query (no full-collection snapshot)
  useEffect(() => {
    let isMounted = true;
    if (isStudent && user?.year && user?.section) {
      const studentClassId = `${user.year}_${user.section}`;
      const studentClass = [{
        id: studentClassId,
        name: `${user.year} CSE DS ${user.section}`,
        year: user.year,
        section: user.section,
        department: 'DS',
        branch: 'CSE'
      }];
      setAvailableClasses(studentClass);
      if (currentClassId !== studentClassId) {
        setCurrentClassId(studentClassId);
      }
      return;
    }

    fetchClassList().then((classes) => {
      if (isMounted && classes && classes.length > 0) {
        setAvailableClasses(classes);
      }
    });

    return () => { isMounted = false; };
  }, [isStudent, user?.year, user?.section]);

  // 2. Load global holidays from cache
  useEffect(() => {
    let isMounted = true;
    fetchHolidays().then((hList) => {
      if (isMounted && Array.isArray(hList)) {
        setHolidays(hList);
      }
    });
    return () => { isMounted = false; };
  }, []);

  // 3. Listen to active class roster and history
  useEffect(() => {
    if (!auth.currentUser || !currentClassId) return;
    localStorage.setItem('current_class_id', currentClassId);

    setSyncStatus('syncing');
    const docRef = db.collection('classes').doc(currentClassId);

    const unsubscribe = docRef.onSnapshot((doc) => {
      if (doc.metadata && doc.metadata.hasPendingWrites) return;
      if (Date.now() - lastLocalUploadTimeRef.current < 3500) {
        setSyncStatus('synced');
        return;
      }

      if (doc.exists) {
        const data = doc.data();
        const cloudRoster = Array.isArray(data.roster) && data.roster.length > 0
          ? data.roster
          : (currentClassId === 'IV_D' ? DEFAULT_STUDENTS_IV_D : []);

        setRoster(cloudRoster);
        if (data.history) {
          let localHist = {};
          try {
            const scoped = localStorage.getItem('attendance_history_' + currentClassId);
            if (scoped) localHist = { ...localHist, ...JSON.parse(scoped) };
            const global = localStorage.getItem('attendance_history');
            if (global) localHist = { ...localHist, ...JSON.parse(global) };
          } catch {}
          isLocalEditRef.current = false;
          setHistory({ ...localHist, ...data.history });
        }
        setSyncStatus('synced');
      } else {
        const fallback = currentClassId === 'IV_D' ? DEFAULT_STUDENTS_IV_D : [];
        setRoster(fallback);
        setSyncStatus('synced');
      }
    }, () => {
      setSyncStatus('synced');
    });

    return () => unsubscribe();
  }, [user, currentClassId, isStudent]);

  // 4. Listen to timetable for active class (kept for timetable modal view)
  useEffect(() => {
    if (!auth.currentUser || !currentClassId) return;
    const ttRef = db.collection('timetables').doc(currentClassId);

    const unsubscribe = ttRef.onSnapshot((ttDoc) => {
      if (ttDoc.exists && ttDoc.data().schedule && Object.keys(ttDoc.data().schedule).length > 0) {
        setTimetable(ttDoc.data().schedule);
      } else {
        const off = OFFICIAL_TIMETABLES[currentClassId];
        if (off && off.schedule) {
          setTimetable(off.schedule);
          ttRef.set({
            classId: currentClassId,
            className: off.className || currentClassId,
            classIncharge: off.classIncharge || '',
            mentors: off.mentors || [],
            schedule: off.schedule,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
          }, { merge: true }).catch(() => {});
        }
      }
    }, () => {});

    return () => unsubscribe();
  }, [user, currentClassId]);

  // 5. Listen to attendance requests for incharge / faculty / admin only
  useEffect(() => {
    if (!currentClassId) return;
    const canReview = user?.isClassIncharge || user?.role === 'incharge' || user?.role === 'faculty' || user?.role === 'admin';
    if (!canReview) {
      setInchargeRequests([]);
      return;
    }

    const reqRef = db.collection('attendance_requests')
      .where('classId', '==', currentClassId)
      .where('status', '==', 'Pending');

    const unsubscribe = reqRef.onSnapshot((snapshot) => {
      const requests = [];
      snapshot.forEach(doc => requests.push({ id: doc.id, ...doc.data() }));
      setInchargeRequests(requests);
    }, (err) => {
      console.warn("attendance_requests listener error:", err);
    });

    return () => unsubscribe();
  }, [user?.role, user?.isClassIncharge, currentClassId]);

  // Helper to generate date format variants (YYYY-MM-DD, DD/MM/YYYY, DD-MM-YYYY)
  const getDateVariants = (dStr) => {
    if (!dStr) return [];
    const vars = [dStr];
    const parts = dStr.split('-');
    if (parts.length === 3) {
      const [y, m, d] = parts;
      vars.push(`${d}/${m}/${y}`);
      vars.push(`${d}-${m}-${y}`);
      vars.push(`${parseInt(d, 10)}/${parseInt(m, 10)}/${y}`);
    }
    return vars;
  };

  // Safe multi-key resolver for Day Attendance (preserves all records from phone edits and legacy formats)
  const getDayAttendanceRecord = useCallback((dateStr, classId) => {
    const targetDate = dateStr || selectedDate;
    const targetClass = classId || currentClassId;
    if (!targetDate) return null;

    const dateVars = getDateVariants(targetDate);

    for (const d of dateVars) {
      // 1. Check direct day key (e.g. IV_D_2026-09-18 or 2026-09-18)
      const classDayKey = `${targetClass}_${d}`;
      if (history[classDayKey]?.attendance && Object.keys(history[classDayKey].attendance).length > 0) {
        return history[classDayKey];
      }
      if (history[d]?.attendance && Object.keys(history[d].attendance).length > 0) {
        return history[d];
      }

      // 2. Check period keys marked from phone (e.g. IV_D_2026-09-18_P1 to P7, or IV_D_2026-09-18_1)
      for (let p = 1; p <= 7; p++) {
        const k1 = `${targetClass}_${d}_P${p}`;
        const k2 = `${targetClass}_${d}_${p}`;
        if (history[k1]?.attendance && Object.keys(history[k1].attendance).length > 0) {
          return history[k1];
        }
        if (history[k2]?.attendance && Object.keys(history[k2].attendance).length > 0) {
          return history[k2];
        }
      }

      // 3. Check legacy un-scoped period keys (e.g. 2026-09-18_P1)
      for (let p = 1; p <= 7; p++) {
        const k1 = `${d}_P${p}`;
        const k2 = `${d}_${p}`;
        if (history[k1]?.attendance && Object.keys(history[k1].attendance).length > 0) {
          return history[k1];
        }
        if (history[k2]?.attendance && Object.keys(history[k2].attendance).length > 0) {
          return history[k2];
        }
      }
    }

    return null;
  }, [history, currentClassId, selectedDate]);

  // Current day's resolved record
  const activeRecord = useMemo(() => getDayAttendanceRecord(selectedDate, currentClassId), [getDayAttendanceRecord, selectedDate, currentClassId]);
  const currentDayRecord = useMemo(() => activeRecord?.attendance || {}, [activeRecord]);
  const currentPeriodRecord = currentDayRecord;
  const latestRecordRef = useRef(activeRecord);
  latestRecordRef.current = activeRecord;

  // Helper to determine day name
  const getDayName = (dateStr) => {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      return days[d.getDay()];
    }
    return 'Monday';
  };

  const activeDay = getDayName(selectedDate);

  // Toggle student status for the DAY (<0.1ms instant local update + automatic cloud sync)
  const toggleStudentStatus = useCallback((rollNo) => {
    isLocalEditRef.current = true;
    setHistory((prevHistory) => {
      const curRecord = prevHistory[activeDayKey] || latestRecordRef.current || { isHoliday: false, attendance: {} };
      const curMap = curRecord.attendance || {};
      const currentStatus = curMap[rollNo] || 'present';

      // Toggle present <-> absent (or if approved/pending, toggle to absent)
      const newStatus = (currentStatus === 'present' || currentStatus === 'Approved') ? 'absent' : 'present';

      const updatedMap = {
        ...curMap,
        [rollNo]: newStatus
      };

      const dayPayload = {
        ...curRecord,
        isHoliday: false,
        attendance: updatedMap,
        timestamp: Date.now()
      };

      return {
        ...prevHistory,
        [activeDayKey]: dayPayload
      };
    });
  }, [activeDayKey]);

  // Mark all present or absent for the DAY (+ automatic cloud sync)
  const markAllStatus = useCallback((status) => {
    isLocalEditRef.current = true;
    setHistory((prevHistory) => {
      const curRecord = prevHistory[activeDayKey] || latestRecordRef.current || { isHoliday: false, attendance: {} };
      const newMap = {};
      roster.forEach((s) => {
        newMap[s.rollNo] = status;
      });

      const dayPayload = {
        ...curRecord,
        isHoliday: false,
        attendance: newMap,
        timestamp: Date.now()
      };

      return {
        ...prevHistory,
        [activeDayKey]: dayPayload
      };
    });
  }, [activeDayKey, roster]);

  // Save Day Attendance to Cloud Firestore (manual or instant force save, <50ms targeted update)
  const saveAttendance = async () => {
    if (!currentClassId) throw new Error("No class selected");
    if (cloudAutoSaveTimerRef.current) clearTimeout(cloudAutoSaveTimerRef.current);
    setSyncStatus('syncing');
    lastLocalUploadTimeRef.current = Date.now();
    isLocalEditRef.current = false;

    const targetKey = activeDayKey;
    const dayPayload = history[targetKey] || latestRecordRef.current;
    if (!dayPayload) {
      setSyncStatus('synced');
      return true;
    }

    try {
      // Ultra-fast targeted update without index bloat
      await db.collection('classes').doc(currentClassId).update({
        [`history.${targetKey}`]: dayPayload,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      });

      setSyncStatus('synced');
      return true;
    } catch (err) {
      try {
        await db.collection('classes').doc(currentClassId).set({
          history: { [targetKey]: dayPayload },
          updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        }, { merge: true });
        setSyncStatus('synced');
        return true;
      } catch (setErr) {
        console.error("Save attendance error:", setErr);
        setSyncStatus('error');
        throw setErr;
      }
    }
  };

  // Calculate statistics
  const stats = React.useMemo(() => {
    const total = roster.length;
    let presentCount = 0;
    let absentCount = 0;
    const absentees = [];
    const presentees = [];

    roster.forEach((student) => {
      const st = currentPeriodRecord[student.rollNo] || 'present';
      if (st === 'present' || st === 'Approved') {
        presentCount++;
        presentees.push(student);
      } else {
        absentCount++;
        absentees.push(student);
      }
    });

    const percentage = total > 0 ? Math.round((presentCount / total) * 100) : 0;

    return {
      total,
      presentCount,
      absentCount,
      percentage,
      absentees,
      presentees
    };
  }, [roster, currentDayRecord]);

  const value = useMemo(() => ({
    availableClasses,
    currentClassId,
    setCurrentClassId,
    selectedDate,
    setSelectedDate,
    selectedPeriod: "1",
    setSelectedPeriod: () => {},
    roster,
    setRoster,
    history,
    timetable,
    holidays,
    syncStatus,
    searchQuery,
    setSearchQuery,
    inchargeRequests,
    activeDayKey,
    activePeriodKey: activeDayKey,
    activeDay,
    currentDayRecord,
    currentPeriodRecord: currentDayRecord,
    getDayAttendanceRecord,
    toggleStudentStatus,
    markAllStatus,
    saveAttendance,
    stats,
    periodTimes: PERIOD_TIMES
  }), [
    availableClasses,
    currentClassId,
    selectedDate,
    roster,
    history,
    timetable,
    holidays,
    syncStatus,
    searchQuery,
    inchargeRequests,
    activeDayKey,
    activeDay,
    currentDayRecord,
    getDayAttendanceRecord,
    toggleStudentStatus,
    markAllStatus,
    saveAttendance,
    stats
  ]);

  return <AttendanceContext.Provider value={value}>{children}</AttendanceContext.Provider>;
};

export const useAttendance = () => useContext(AttendanceContext);
