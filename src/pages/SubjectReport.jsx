import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { OFFICIAL_TIMETABLES, DEFAULT_STUDENTS_IV_D } from '../data/defaultTimetables';
import * as XLSX from 'xlsx';
import { 
  FileSpreadsheet, 
  ArrowLeft, 
  Printer, 
  Download, 
  Search, 
  Calendar, 
  BookOpen, 
  GraduationCap
} from 'lucide-react';

const SubjectReport = () => {
  const { user, isStudent } = useAuth();

  const [availableClasses, setAvailableClasses] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState(() => {
    if (isStudent && user?.year && user?.section) {
      return `${user.year}_${user.section}`;
    }
    return 'IV_D';
  });

  const [startDate, setStartDate] = useState('2026-07-06');
  const [endDate, setEndDate] = useState(() => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  });

  const [selectedSubject, setSelectedSubject] = useState('');
  const [subjectsList, setSubjectsList] = useState([]);
  const [roster, setRoster] = useState([]);
  const [history, setHistory] = useState({});
  const [timetable, setTimetable] = useState(null);
  const [holidays, setHolidays] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

  const tableContainerRef = useRef(null);

  // 1. Fetch available classes & holidays
  useEffect(() => {
    const unsubClasses = db.collection('classes').onSnapshot((snap) => {
      const list = [];
      snap.forEach((doc) => {
        const id = doc.id;
        const data = doc.data();
        if (isStudent && user?.year && user?.section) {
          if (id !== `${user.year}_${user.section}`) return;
        }
        list.push({ 
          id, 
          name: (data.year && data.section) ? `${data.year} ${data.branch || 'CSE'} ${data.department || 'DS'} ${data.section}` : id 
        });
      });
      setAvailableClasses(list);
      if (list.length > 0 && (!selectedClassId || !list.some(c => c.id === selectedClassId))) {
        setSelectedClassId(list[0].id);
      }
    });

    const unsubHolidays = db.collection('holidays').onSnapshot((snap) => {
      const h = [];
      snap.forEach(d => h.push(d.data().date || d.id));
      setHolidays(h);
    });

    return () => {
      unsubClasses();
      unsubHolidays();
    };
  }, [user, isStudent]);

  // 2. Fetch Class Roster, History, and Timetable with local storage fallback
  useEffect(() => {
    if (!selectedClassId) return;
    setLoading(true);

    const docRef = db.collection('classes').doc(selectedClassId);
    const unsub = docRef.onSnapshot((doc) => {
      let localHist = {};
      try {
        const scoped = localStorage.getItem('attendance_history_' + selectedClassId);
        if (scoped) localHist = { ...localHist, ...JSON.parse(scoped) };
        const global = localStorage.getItem('attendance_history');
        if (global) localHist = { ...localHist, ...JSON.parse(global) };
      } catch {}

      if (doc.exists) {
        const data = doc.data();
        setRoster(data.roster && data.roster.length > 0 ? data.roster : (selectedClassId === 'IV_D' ? DEFAULT_STUDENTS_IV_D : []));
        setHistory({ ...localHist, ...(data.history || {}) });
      } else {
        setRoster(selectedClassId === 'IV_D' ? DEFAULT_STUDENTS_IV_D : []);
        setHistory(localHist);
      }
      setLoading(false);
    });

    // Timetable
    const ttRef = db.collection('timetables').doc(selectedClassId);
    ttRef.get().then((ttDoc) => {
      let sched = ttDoc.exists && ttDoc.data().schedule ? ttDoc.data().schedule : null;
      if (!sched && OFFICIAL_TIMETABLES[selectedClassId]) {
        sched = OFFICIAL_TIMETABLES[selectedClassId].schedule;
      }
      setTimetable(sched);

      // Extract unique subjects
      const subjs = new Set();
      if (sched) {
        Object.values(sched).forEach((daySlots) => {
          Object.values(daySlots).forEach((slot) => {
            if (slot.subjectName) subjs.add(slot.subjectName.trim().toUpperCase());
          });
        });
      }
      const sList = Array.from(subjs).sort();
      setSubjectsList(sList);
      if (sList.length > 0) {
        setSelectedSubject(sList[0]);
      }
    });

    return () => unsub();
  }, [selectedClassId]);

  // Days of week when the selected subject is scheduled in timetable
  const scheduledDaysSet = useMemo(() => {
    const days = new Set();
    if (!timetable || !selectedSubject) return days;

    const target = selectedSubject.trim().toUpperCase();
    Object.entries(timetable).forEach(([dayName, periods]) => {
      Object.values(periods).forEach((slot) => {
        if (slot?.subjectName && slot.subjectName.trim().toUpperCase() === target) {
          days.add(dayName);
        }
      });
    });
    return days;
  }, [timetable, selectedSubject]);

  // Generate date columns based on timetable schedule
  const subjectDates = useMemo(() => {
    if (!startDate || !endDate) return [];
    const dates = [];
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    const curr = new Date(startDate);
    const end = new Date(endDate);

    while (curr <= end) {
      const y = curr.getFullYear();
      const m = String(curr.getMonth() + 1).padStart(2, '0');
      const d = String(curr.getDate()).padStart(2, '0');
      const dateKey = `${y}-${m}-${d}`;
      const dayName = dayNames[curr.getDay()];

      // Exclude Sundays and Holidays
      const isSun = curr.getDay() === 0;
      const isHol = isSun || holidays.includes(dateKey);

      if (!isHol) {
        // Check if subject was scheduled on this day in timetable
        const isScheduled = scheduledDaysSet.has(dayName);

        // Or check if actual attendance was recorded for this subject on this date
        let hasRecorded = false;
        for (let p = 1; p <= 7; p++) {
          const rec = history[`${selectedClassId}_${dateKey}_P${p}`] || history[`${dateKey}_P${p}`];
          if (rec?.subject && rec.subject.trim().toUpperCase() === selectedSubject.trim().toUpperCase()) {
            hasRecorded = true;
            break;
          }
        }

        if (isScheduled || hasRecorded) {
          dates.push({
            dateKey,
            displayDate: `${d}/${m}`,
            dayName: dayName.substring(0, 3)
          });
        }
      }

      curr.setDate(curr.getDate() + 1);
    }

    return dates;
  }, [startDate, endDate, scheduledDaysSet, selectedSubject, history, holidays, selectedClassId]);

  // Helper to get attendance status for a student on a specific date for selectedSubject
  const getSubjectAttendanceStatus = (dateKey, rollNo) => {
    let hasRecord = false;
    let isAbsent = false;

    // dateKey is YYYY-MM-DD
    const dateVars = [dateKey];
    const parts = dateKey.split('-');
    if (parts.length === 3) {
      const [y, m, d] = parts;
      dateVars.push(`${d}/${m}/${y}`);
      dateVars.push(`${d}-${m}-${y}`);
      dateVars.push(`${parseInt(d, 10)}/${parseInt(m, 10)}/${y}`);
    }

    for (const dk of dateVars) {
      for (let p = 1; p <= 7; p++) {
        const k1 = `${selectedClassId}_${dk}_P${p}`;
        const k2 = `${dk}_P${p}`;
        const k3 = `${selectedClassId}_${dk}_${p}`;
        const k4 = `${dk}_${p}`;
        const rec = history[k1] || history[k2] || history[k3] || history[k4];

        if (rec?.attendance) {
          const sub = (rec.subject || rec.subjectName || '').trim().toUpperCase();
          if (!selectedSubject || sub === selectedSubject.trim().toUpperCase() || sub.includes(selectedSubject.trim().toUpperCase())) {
            if (rec.attendance[rollNo] !== undefined) {
              hasRecord = true;
              const st = String(rec.attendance[rollNo]).toLowerCase();
              if (st === 'absent' || st === 'ab') {
                isAbsent = true;
              }
            }
          }
        }
      }

      // Direct day key fallback
      const dayRec = history[`${selectedClassId}_${dk}`] || history[dk];
      if (dayRec?.attendance && dayRec.attendance[rollNo] !== undefined) {
        hasRecord = true;
        const st = String(dayRec.attendance[rollNo]).toLowerCase();
        if (st === 'absent' || st === 'ab') {
          isAbsent = true;
        }
      }
    }

    if (!hasRecord) return 'PRESENT'; // Default present if scheduled
    return isAbsent ? 'AB' : 'PRESENT';
  };

  // Student rows with running present count (1, 2, 3...) and AB
  const studentRows = useMemo(() => {
    return roster.map((student) => {
      let runningCount = 0;
      let totalHeld = subjectDates.length;

      const dateCells = subjectDates.map(({ dateKey }) => {
        const status = getSubjectAttendanceStatus(dateKey, student.rollNo);
        if (status === 'PRESENT') {
          runningCount++;
          return {
            text: runningCount,
            isAbsent: false
          };
        } else {
          return {
            text: 'AB',
            isAbsent: true
          };
        }
      });

      const percentage = totalHeld > 0 ? ((runningCount / totalHeld) * 100).toFixed(1) : '100.0';

      return {
        rollNo: student.rollNo,
        name: student.name,
        dateCells,
        attended: runningCount,
        totalHeld,
        percentage
      };
    });
  }, [roster, subjectDates, history, selectedSubject, selectedClassId]);

  // Filtered by search query
  const filteredRows = useMemo(() => {
    if (!searchQuery.trim()) return studentRows;
    const q = searchQuery.toLowerCase();
    return studentRows.filter(s => s.rollNo.toLowerCase().includes(q) || s.name.toLowerCase().includes(q));
  }, [studentRows, searchQuery]);

  // Export to genuine Excel
  const handleExportExcel = () => {
    const headers = [
      'S.No',
      'Roll Number',
      'Student Name',
      ...subjectDates.map(d => `${d.displayDate} (${d.dayName})`),
      'Total Conducted',
      'Attended',
      'Percentage (%)'
    ];

    const dataRows = studentRows.map((s, idx) => [
      idx + 1,
      s.rollNo,
      s.name,
      ...s.dateCells.map(c => c.text),
      s.totalHeld,
      s.attended,
      `${s.percentage}%`
    ]);

    const ws = XLSX.utils.aoa_to_sheet([
      [`MALLA REDDY COLLEGE OF ENGINEERING & TECHNOLOGY (AUTONOMOUS)`],
      [`Subject Attendance Register - ${selectedClassId} - ${selectedSubject} (${startDate} to ${endDate})`],
      [],
      headers,
      ...dataRows
    ]);

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Subject Register');
    XLSX.writeFile(wb, `MRCET_${selectedClassId}_${selectedSubject}_Register.xlsx`);
  };

  return (
    <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '1rem' }}>
      
      {/* Top Header & Controls */}
      <div className="glass-panel no-print" style={{ padding: '1rem 1.25rem', marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <Link to="/" className="btn btn-outline btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
              <ArrowLeft size={16} /> Back to Dashboard
            </Link>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <BookOpen color="var(--primary)" size={22} /> Subject Attendance Register
              </h2>
              <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Timetable-synchronized session matrix with cumulative presence (1, 2, 3...) and AB marking
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
            {/* Class Dropdown */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <GraduationCap size={16} color="var(--primary)" />
              <select
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
                disabled={isStudent}
                style={{ padding: '0.4rem 0.75rem', fontSize: '0.85rem', fontWeight: 700 }}
              >
                {availableClasses.map(c => (
                  <option key={c.id} value={c.id}>{c.name || c.id}</option>
                ))}
              </select>
            </div>

            {/* Subject Dropdown */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <BookOpen size={16} color="var(--primary)" />
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                style={{ padding: '0.4rem 0.75rem', fontSize: '0.85rem', fontWeight: 700, minWidth: '180px' }}
              >
                {subjectsList.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            {/* Date Range */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Calendar size={15} color="var(--text-muted)" />
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                style={{ padding: '0.35rem 0.55rem', fontSize: '0.82rem' }}
                title="Start Date"
              />
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>to</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                style={{ padding: '0.35rem 0.55rem', fontSize: '0.82rem' }}
                title="End Date (Today)"
              />
            </div>

            <button
              onClick={handleExportExcel}
              className="btn btn-primary btn-sm"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <Download size={16} /> Export Excel
            </button>

            <button
              onClick={() => window.print()}
              className="btn btn-outline btn-sm"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <Printer size={16} /> Print
            </button>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="glass-panel no-print" style={{ padding: '0.65rem 1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
        <Search size={18} color="var(--text-muted)" />
        <input
          type="text"
          placeholder="Search by Roll Number or Name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ width: '100%', background: 'transparent', border: 'none', padding: '0.2rem', fontSize: '0.9rem', outline: 'none' }}
        />
        {searchQuery && (
          <button className="btn btn-outline btn-sm" onClick={() => setSearchQuery('')} style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}>
            Clear
          </button>
        )}
      </div>

      {/* College Report Header (Print Ready) */}
      <div className="glass-panel report-printable-area" style={{ padding: '1.5rem', overflowX: 'auto', background: '#fff', color: '#000' }}>
        <div style={{ textAlign: 'center', borderBottom: '2px solid #000', paddingBottom: '0.75rem', marginBottom: '1rem' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: '0 0 0.2rem 0', color: '#312e81', textTransform: 'uppercase' }}>
            Malla Reddy College of Engineering and Technology
          </h3>
          <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#dc2626' }}>
            Autonomous Institution - UGC, Govt. of India | Affiliated to JNTUH
          </div>
          <div style={{ fontSize: '0.9rem', fontWeight: 800, marginTop: '0.4rem', borderTop: '1px dashed #666', paddingTop: '0.35rem' }}>
            SUBJECT ATTENDANCE REGISTER - {selectedClassId} | {selectedSubject} ({startDate} TO {endDate})
          </div>
        </div>

        {/* Matrix Table */}
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.75rem', textAlign: 'center' }}>
          <thead>
            <tr style={{ background: '#f1f5f9', borderBottom: '2px solid #000' }}>
              <th style={{ border: '1px solid #94a3b8', padding: '6px 4px', width: '35px' }}>S.No</th>
              <th style={{ border: '1px solid #94a3b8', padding: '6px 4px', width: '95px' }}>Roll No</th>
              <th style={{ border: '1px solid #94a3b8', padding: '6px 8px', textAlign: 'left', minWidth: '150px' }}>Student Name</th>
              
              {subjectDates.map(d => (
                <th key={d.dateKey} style={{ border: '1px solid #94a3b8', padding: '4px 2px', minWidth: '34px' }}>
                  <div style={{ fontWeight: 800, fontSize: '0.72rem' }}>{d.displayDate}</div>
                  <div style={{ fontSize: '0.65rem', color: '#475569' }}>{d.dayName}</div>
                </th>
              ))}

              <th style={{ border: '1px solid #94a3b8', padding: '4px', width: '45px' }}>Tot</th>
              <th style={{ border: '1px solid #94a3b8', padding: '4px', width: '45px' }}>Att</th>
              <th style={{ border: '1px solid #94a3b8', padding: '4px', width: '55px' }}>%</th>
            </tr>
          </thead>
          <tbody>
            {filteredRows.map((s, idx) => {
              const pct = parseFloat(s.percentage);
              const pctColor = pct < 65 ? '#ef4444' : pct < 75 ? '#f59e0b' : '#10b981';

              return (
                <tr key={s.rollNo} style={{ borderBottom: '1px solid #e2e8f0', background: idx % 2 === 0 ? '#fff' : '#f8fafc' }}>
                  <td style={{ border: '1px solid #cbd5e1', padding: '4px' }}>{idx + 1}</td>
                  <td style={{ border: '1px solid #cbd5e1', padding: '4px', fontWeight: 700, fontSize: '0.72rem' }}>{s.rollNo}</td>
                  <td style={{ border: '1px solid #cbd5e1', padding: '4px 6px', textAlign: 'left', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '160px' }}>
                    {s.name}
                  </td>

                  {s.dateCells.map((cell, cIdx) => (
                    <td 
                      key={cIdx} 
                      style={{ 
                        border: '1px solid #cbd5e1', 
                        padding: '3px 1px',
                        fontWeight: 700,
                        fontSize: '0.72rem',
                        background: cell.isAbsent ? '#fee2e2' : 'transparent',
                        color: cell.isAbsent ? '#dc2626' : '#1e293b'
                      }}
                    >
                      {cell.text}
                    </td>
                  ))}

                  <td style={{ border: '1px solid #cbd5e1', padding: '4px', fontWeight: 700 }}>{s.totalHeld}</td>
                  <td style={{ border: '1px solid #cbd5e1', padding: '4px', fontWeight: 700 }}>{s.attended}</td>
                  <td style={{ border: '1px solid #cbd5e1', padding: '4px', fontWeight: 800, color: pctColor }}>
                    {s.percentage}%
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

    </div>
  );
};

export default SubjectReport;
