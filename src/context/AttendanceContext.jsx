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

  const [selectedPeriod, setSelectedPeriod] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('period') || "1";
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

  // Period key: e.g. IV_D_2026-09-18_P1
  const activePeriodKey = `${currentClassId}_${selectedDate}_P${selectedPeriod}`;

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
        if (!classId || !dataToSave || Object.keys(dataToSave).length === 0) return;

        lastLocalUploadTimeRef.current = Date.now();
        isLocalEditRef.current = false;

        try {
          await db.collection('classes').doc(classId).set({
            history: dataToSave,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
          }, { merge: true });
          setSyncStatus('synced');
        } catch (err) {
          console.error("Auto-save to Cloud Firestore error:", err);
          setSyncStatus('error');
        }
      }, 800);
    }

    return () => {
      if (cloudAutoSaveTimerRef.current) clearTimeout(cloudAutoSaveTimerRef.current);
    };
  }, [history, currentClassId]);

  // Flush pending auto-save immediately if browser tab is closed or navigated
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (isLocalEditRef.current && currentClassIdRef.current) {
        try {
          db.collection('classes').doc(currentClassIdRef.current).set({
            history: latestHistoryRef.current,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
          }, { merge: true });
        } catch {}
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

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

  // 4. Listen to timetable for active class
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

  // Helper to find any marked attendance record for this date (legacy compatibility)
  const findAnyAttendanceForDate = useCallback((date, classId) => {
    if (!date) return null;
    const targetClass = classId || currentClassId;
    const dateVars = getDateVariants(date);

    for (const d of dateVars) {
      // 1. Check current period key
      const curKey = `${targetClass}_${d}_P${selectedPeriod}`;
      if (history[curKey]?.attendance && Object.keys(history[curKey].attendance).length > 0) {
        return history[curKey];
      }

      // 2. Check any other period P1 to P7 for this class
      for (let p = 1; p <= 7; p++) {
        const k1 = `${targetClass}_${d}_P${p}`;
        const k2 = `${targetClass}_${d}_${p}`;
        if (history[k1]?.attendance && Object.keys(history[k1].attendance).length > 0) return history[k1];
        if (history[k2]?.attendance && Object.keys(history[k2].attendance).length > 0) return history[k2];
      }

      // 3. Check legacy period keys
      for (let p = 1; p <= 7; p++) {
        const k1 = `${d}_P${p}`;
        const k2 = `${d}_${p}`;
        if (history[k1]?.attendance && Object.keys(history[k1].attendance).length > 0) return history[k1];
        if (history[k2]?.attendance && Object.keys(history[k2].attendance).length > 0) return history[k2];
      }

      // 4. Check class-date whole day key
      const classDateKey = `${targetClass}_${d}`;
      if (history[classDateKey]?.attendance && Object.keys(history[classDateKey].attendance).length > 0) {
        return history[classDateKey];
      }

      if (history[d]?.attendance && Object.keys(history[d].attendance).length > 0) {
        return history[d];
      }
    }

    return null;
  }, [history, currentClassId, selectedPeriod]);

  // Robust history entry lookup with multiple fallback strategies matching legacy app
  const getHistoryEntry = useCallback(() => {
    const dateVars = getDateVariants(selectedDate);

    for (const d of dateVars) {
      const fullKey = `${currentClassId}_${d}_P${selectedPeriod}`;
      if (history[fullKey]?.attendance && Object.keys(history[fullKey].attendance).length > 0) return history[fullKey];

      const fullKeyAlt = `${currentClassId}_${d}_${selectedPeriod}`;
      if (history[fullKeyAlt]?.attendance && Object.keys(history[fullKeyAlt].attendance).length > 0) return history[fullKeyAlt];

      const legacyKey = `${d}_P${selectedPeriod}`;
      if (history[legacyKey]?.attendance && Object.keys(history[legacyKey].attendance).length > 0) return history[legacyKey];

      const legacyKeyAlt = `${d}_${selectedPeriod}`;
      if (history[legacyKeyAlt]?.attendance && Object.keys(history[legacyKeyAlt].attendance).length > 0) return history[legacyKeyAlt];

      const classDateKey = `${currentClassId}_${d}`;
      if (history[classDateKey]?.attendance && Object.keys(history[classDateKey].attendance).length > 0) return history[classDateKey];

      if (history[d]?.attendance && Object.keys(history[d].attendance).length > 0) return history[d];
    }

    // Fallback to any previous attendance record for today (gives previous attendance to all subjects)
    const prevDayRec = findAnyAttendanceForDate(selectedDate, currentClassId);
    if (prevDayRec?.attendance && Object.keys(prevDayRec.attendance).length > 0) {
      return prevDayRec;
    }

    return null;
  }, [history, currentClassId, selectedDate, selectedPeriod, findAnyAttendanceForDate]);

  // Current attendance map for active period
  const activeRecord = useMemo(() => getHistoryEntry(), [getHistoryEntry]);
  const currentPeriodRecord = useMemo(() => activeRecord?.attendance || {}, [activeRecord]);
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
  const activeSubjectInfo = timetable[activeDay]?.[selectedPeriod] || null;

  // Single-period toggling (<0.1ms instant local update + automatic cloud sync)
  const toggleStudentStatus = useCallback((rollNo) => {
    isLocalEditRef.current = true;
    setHistory((prevHistory) => {
      const curRecord = prevHistory[activePeriodKey] || latestRecordRef.current || { isHoliday: false, attendance: {} };
      const curMap = curRecord.attendance || {};
      const currentStatus = curMap[rollNo] || 'present';

      // Toggle present <-> absent (or if approved/pending, toggle to absent)
      const newStatus = (currentStatus === 'present' || currentStatus === 'Approved') ? 'absent' : 'present';

      const updatedMap = {
        ...curMap,
        [rollNo]: newStatus
      };

      return {
        ...prevHistory,
        [activePeriodKey]: {
          ...curRecord,
          isHoliday: false,
          attendance: updatedMap,
          subject: activeSubjectInfo?.subjectName || curRecord.subject || '',
          faculty: activeSubjectInfo?.faculty || curRecord.faculty || '',
          timestamp: Date.now()
        }
      };
    });
  }, [activePeriodKey, activeSubjectInfo]);

  // Mark all present or absent for active period (+ automatic cloud sync)
  const markAllStatus = useCallback((status) => {
    isLocalEditRef.current = true;
    setHistory((prevHistory) => {
      const curRecord = prevHistory[activePeriodKey] || { isHoliday: false, attendance: {} };
      const newMap = {};
      roster.forEach((s) => {
        newMap[s.rollNo] = status;
      });

      return {
        ...prevHistory,
        [activePeriodKey]: {
          ...curRecord,
          isHoliday: false,
          attendance: newMap,
          subject: activeSubjectInfo?.subjectName || '',
          faculty: activeSubjectInfo?.faculty || '',
          timestamp: Date.now()
        }
      };
    });
  }, [activePeriodKey, roster, activeSubjectInfo]);

  // Save active period to Cloud Firestore (manual or instant force save)
  const saveAttendance = async () => {
    if (!currentClassId) throw new Error("No class selected");
    if (cloudAutoSaveTimerRef.current) clearTimeout(cloudAutoSaveTimerRef.current);
    setSyncStatus('syncing');
    lastLocalUploadTimeRef.current = Date.now();
    isLocalEditRef.current = false;

    try {
      await db.collection('classes').doc(currentClassId).set({
        history: history,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      }, { merge: true });

      setSyncStatus('synced');
      return true;
    } catch (err) {
      console.error("Save attendance error:", err);
      setSyncStatus('error');
      throw err;
    }
  };

  // Give attendance to all periods (1 to 6)
  const giveAllPeriodsAttendance = async () => {
    const curMap = currentPeriodRecord;
    const updatedHistory = { ...history };

    for (let p = 1; p <= 6; p++) {
      const key = `${currentClassId}_${selectedDate}_P${p}`;
      const subj = timetable[activeDay]?.[String(p)];
      updatedHistory[key] = {
        isHoliday: false,
        attendance: { ...curMap },
        subject: subj?.subjectName || '',
        faculty: subj?.faculty || '',
        timestamp: Date.now()
      };
    }

    setHistory(updatedHistory);
    lastLocalUploadTimeRef.current = Date.now();
    setSyncStatus('syncing');

    try {
      await db.collection('classes').doc(currentClassId).set({
        history: updatedHistory,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      }, { merge: true });
      setSyncStatus('synced');
      return true;
    } catch (err) {
      console.error("Bulk attendance save error:", err);
      setSyncStatus('error');
      throw err;
    }
  };

  // Previous period identifier (e.g., if selectedPeriod is "2", previous is "1")
  const previousPeriod = Number(selectedPeriod) > 1 ? String(Number(selectedPeriod) - 1) : null;

  // Copy attendance from previous period (e.g. P1 into P2)
  const copyFromPreviousPeriod = useCallback(() => {
    if (!previousPeriod) return false;

    const dateVars = getDateVariants(selectedDate);
    let sourceRec = null;

    for (const d of dateVars) {
      const k1 = `${currentClassId}_${d}_P${previousPeriod}`;
      const k2 = `${currentClassId}_${d}_${previousPeriod}`;
      const k3 = `${d}_P${previousPeriod}`;
      const k4 = `${d}_${previousPeriod}`;
      if (history[k1]?.attendance && Object.keys(history[k1].attendance).length > 0) { sourceRec = history[k1]; break; }
      if (history[k2]?.attendance && Object.keys(history[k2].attendance).length > 0) { sourceRec = history[k2]; break; }
      if (history[k3]?.attendance && Object.keys(history[k3].attendance).length > 0) { sourceRec = history[k3]; break; }
      if (history[k4]?.attendance && Object.keys(history[k4].attendance).length > 0) { sourceRec = history[k4]; break; }
    }

    // Fallback: any previous attendance recorded for this date
    if (!sourceRec?.attendance || Object.keys(sourceRec.attendance).length === 0) {
      sourceRec = findAnyAttendanceForDate(selectedDate, currentClassId);
    }

    if (!sourceRec?.attendance || Object.keys(sourceRec.attendance).length === 0) {
      return false;
    }

    isLocalEditRef.current = true;
    setHistory((prevHistory) => {
      const curRecord = prevHistory[activePeriodKey] || { isHoliday: false, attendance: {} };
      return {
        ...prevHistory,
        [activePeriodKey]: {
          ...curRecord,
          isHoliday: false,
          attendance: { ...sourceRec.attendance },
          subject: activeSubjectInfo?.subjectName || curRecord.subject || '',
          faculty: activeSubjectInfo?.faculty || curRecord.faculty || '',
          timestamp: Date.now()
        }
      };
    });

    return true;
  }, [previousPeriod, selectedDate, currentClassId, history, activePeriodKey, activeSubjectInfo, findAnyAttendanceForDate]);

  // Copy attendance from any specified period (default Period 1)
  const copyFromPeriod = useCallback((targetPeriodNum = 1) => {
    const targetPeriod = String(targetPeriodNum);
    const dateVars = getDateVariants(selectedDate);
    let sourceRec = null;

    for (const d of dateVars) {
      const k1 = `${currentClassId}_${d}_P${targetPeriod}`;
      const k2 = `${currentClassId}_${d}_${targetPeriod}`;
      const k3 = `${d}_P${targetPeriod}`;
      const k4 = `${d}_${targetPeriod}`;
      if (history[k1]?.attendance && Object.keys(history[k1].attendance).length > 0) { sourceRec = history[k1]; break; }
      if (history[k2]?.attendance && Object.keys(history[k2].attendance).length > 0) { sourceRec = history[k2]; break; }
      if (history[k3]?.attendance && Object.keys(history[k3].attendance).length > 0) { sourceRec = history[k3]; break; }
      if (history[k4]?.attendance && Object.keys(history[k4].attendance).length > 0) { sourceRec = history[k4]; break; }
    }

    if (!sourceRec?.attendance || Object.keys(sourceRec.attendance).length === 0) {
      sourceRec = findAnyAttendanceForDate(selectedDate, currentClassId);
    }

    if (!sourceRec?.attendance || Object.keys(sourceRec.attendance).length === 0) {
      return false;
    }

    isLocalEditRef.current = true;
    setHistory((prevHistory) => {
      const curRecord = prevHistory[activePeriodKey] || { isHoliday: false, attendance: {} };
      return {
        ...prevHistory,
        [activePeriodKey]: {
          ...curRecord,
          isHoliday: false,
          attendance: { ...sourceRec.attendance },
          subject: activeSubjectInfo?.subjectName || curRecord.subject || '',
          faculty: activeSubjectInfo?.faculty || curRecord.faculty || '',
          timestamp: Date.now()
        }
      };
    });

    return true;
  }, [selectedDate, currentClassId, history, activePeriodKey, activeSubjectInfo, findAnyAttendanceForDate]);

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
  }, [roster, currentPeriodRecord]);

  const value = useMemo(() => ({
    availableClasses,
    currentClassId,
    setCurrentClassId,
    selectedDate,
    setSelectedDate,
    selectedPeriod,
    setSelectedPeriod,
    previousPeriod,
    copyFromPreviousPeriod,
    copyFromPeriod,
    roster,
    setRoster,
    history,
    timetable,
    holidays,
    syncStatus,
    searchQuery,
    setSearchQuery,
    inchargeRequests,
    activePeriodKey,
    activeDay,
    activeSubjectInfo,
    currentPeriodRecord,
    toggleStudentStatus,
    markAllStatus,
    saveAttendance,
    giveAllPeriodsAttendance,
    stats,
    periodTimes: PERIOD_TIMES
  }), [
    availableClasses,
    currentClassId,
    selectedDate,
    selectedPeriod,
    previousPeriod,
    copyFromPreviousPeriod,
    copyFromPeriod,
    roster,
    history,
    timetable,
    holidays,
    syncStatus,
    searchQuery,
    inchargeRequests,
    activePeriodKey,
    activeDay,
    activeSubjectInfo,
    currentPeriodRecord,
    toggleStudentStatus,
    markAllStatus,
    saveAttendance,
    giveAllPeriodsAttendance,
    stats
  ]);

  return <AttendanceContext.Provider value={value}>{children}</AttendanceContext.Provider>;
};

export const useAttendance = () => useContext(AttendanceContext);
