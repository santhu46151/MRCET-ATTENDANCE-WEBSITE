import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { DEFAULT_STUDENTS_IV_D } from '../data/defaultTimetables';
import * as XLSX from 'xlsx';
import { 
  FileSpreadsheet, 
  ArrowLeft, 
  Printer, 
  Download, 
  Calendar, 
  GraduationCap,
  Search,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

const WeeklyReport = () => {
  const { user, isStudent } = useAuth();

  // Helper date formatting YYYY-MM-DD
  const formatDateKey = (d) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  const getMonday = (d) => {
    const date = new Date(d);
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(date.setDate(diff));
  };

  const [availableClasses, setAvailableClasses] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState(() => {
    if (isStudent && user?.year && user?.section) return `${user.year}_${user.section}`;
    return localStorage.getItem('current_class_id') || 'IV_D';
  });

  const [currentWeekMonday, setCurrentWeekMonday] = useState(() => getMonday(new Date()));
  const [roster, setRoster] = useState(() => {
    try {
      const curId = localStorage.getItem('current_class_id') || 'IV_D';
      const cached = localStorage.getItem('attendance_roster_' + curId);
      if (cached) return JSON.parse(cached);
    } catch {}
    return DEFAULT_STUDENTS_IV_D;
  });

  const [history, setHistory] = useState({});
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

  // 2. Fetch Class Roster and History with local storage fallback merge
  useEffect(() => {
    if (!selectedClassId) return;
    setLoading(true);

    const unsubClass = db.collection('classes').doc(selectedClassId).onSnapshot((doc) => {
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
    }, () => setLoading(false));

    return () => unsubClass();
  }, [selectedClassId]);

  // Days of current week (Monday to Saturday) - Day attendance columns
  const weekDays = useMemo(() => {
    const days = [];
    const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    for (let i = 0; i < 6; i++) {
      const d = new Date(currentWeekMonday);
      d.setDate(currentWeekMonday.getDate() + i);
      const dateKey = formatDateKey(d);
      const isHol = holidays.includes(dateKey);

      days.push({
        date: d,
        dateKey,
        dayName: dayNames[i],
        shortDay: dayNames[i].substring(0, 3),
        displayDate: `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`,
        isHoliday: isHol
      });
    }
    return days;
  }, [currentWeekMonday, holidays]);

  // Helper to get Day Attendance for a student on dateKey
  const getDayAttendance = (dateKey, rollNo) => {
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
        if (rec?.attendance && rec.attendance[rollNo] !== undefined) {
          hasRecord = true;
          const st = String(rec.attendance[rollNo]).toLowerCase();
          if (st === 'absent' || st === 'ab') {
            isAbsent = true;
          }
        }
      }

      // Direct day key
      const dayRec = history[`${selectedClassId}_${dk}`] || history[dk];
      if (dayRec?.attendance && dayRec.attendance[rollNo] !== undefined) {
        hasRecord = true;
        const st = String(dayRec.attendance[rollNo]).toLowerCase();
        if (st === 'absent' || st === 'ab') {
          isAbsent = true;
        }
      }
    }

    if (!hasRecord) return null;
    return isAbsent ? 'AB' : 'PRESENT';
  };

  // Student rows with day-wise presence (1, 2, 3...) and AB
  const studentRows = useMemo(() => {
    const workingDaysCount = weekDays.filter(d => !d.isHoliday).length;

    return roster.map((student) => {
      let runningCount = 0;

      const dayCells = weekDays.map((w) => {
        if (w.isHoliday) {
          return {
            text: 'HOL',
            isHoliday: true,
            isAbsent: false
          };
        }

        const status = getDayAttendance(w.dateKey, student.rollNo);
        if (status === 'PRESENT') {
          runningCount++;
          return {
            text: runningCount,
            isHoliday: false,
            isAbsent: false
          };
        } else if (status === 'AB') {
          return {
            text: 'AB',
            isHoliday: false,
            isAbsent: true
          };
        } else {
          // No attendance recorded yet
          return {
            text: '-',
            isHoliday: false,
            isAbsent: false
          };
        }
      });

      const percentage = workingDaysCount > 0 ? ((runningCount / workingDaysCount) * 100).toFixed(1) : '100.0';

      return {
        rollNo: student.rollNo,
        name: student.name,
        dayCells,
        presentDays: runningCount,
        totalWorkingDays: workingDaysCount,
        percentage
      };
    });
  }, [roster, weekDays, history, selectedClassId]);

  // Search filter
  const filteredRows = useMemo(() => {
    if (!searchQuery.trim()) return studentRows;
    const q = searchQuery.toLowerCase();
    return studentRows.filter(s => s.rollNo.toLowerCase().includes(q) || s.name.toLowerCase().includes(q));
  }, [studentRows, searchQuery]);

  const handlePrevWeek = () => {
    const d = new Date(currentWeekMonday);
    d.setDate(d.getDate() - 7);
    setCurrentWeekMonday(d);
  };

  const handleNextWeek = () => {
    const d = new Date(currentWeekMonday);
    d.setDate(d.getDate() + 7);
    setCurrentWeekMonday(d);
  };

  const handleExportExcel = () => {
    const headers = [
      'S.No',
      'Roll Number',
      'Student Name',
      ...weekDays.map(w => `${w.dayName} (${w.displayDate})`),
      'Present Days',
      'Total Working Days',
      'Percentage (%)'
    ];

    const dataRows = studentRows.map((s, idx) => [
      idx + 1,
      s.rollNo,
      s.name,
      ...s.dayCells.map(c => c.text),
      s.presentDays,
      s.totalWorkingDays,
      `${s.percentage}%`
    ]);

    const ws = XLSX.utils.aoa_to_sheet([
      [`MALLA REDDY COLLEGE OF ENGINEERING & TECHNOLOGY (AUTONOMOUS)`],
      [`Weekly Day Attendance Register - ${selectedClassId} (${weekDays[0].displayDate} to ${weekDays[5].displayDate})`],
      [],
      headers,
      ...dataRows
    ]);

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Weekly Register');
    XLSX.writeFile(wb, `MRCET_${selectedClassId}_Weekly_${weekDays[0].dateKey}.xlsx`);
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
                <Calendar color="var(--primary)" size={22} /> Weekly Attendance Register
              </h2>
              <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Day-wise cumulative presence (1, 2, 3...) and AB marking (Monday to Saturday)
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

            {/* Week Stepper */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', background: 'var(--bg-secondary)', padding: '0.2rem 0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--card-border)' }}>
              <button 
                onClick={handlePrevWeek} 
                className="btn btn-outline btn-sm" 
                style={{ padding: '0.25rem 0.45rem' }} 
                title="Previous Week"
              >
                <ChevronLeft size={16} />
              </button>
              <span style={{ fontSize: '0.82rem', fontWeight: 700, padding: '0 0.5rem' }}>
                {weekDays[0].displayDate} - {weekDays[5].displayDate}
              </span>
              <button 
                onClick={handleNextWeek} 
                className="btn btn-outline btn-sm" 
                style={{ padding: '0.25rem 0.45rem' }} 
                title="Next Week"
              >
                <ChevronRight size={16} />
              </button>
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
            WEEKLY DAY ATTENDANCE REGISTER - {selectedClassId} ({weekDays[0].displayDate} TO {weekDays[5].displayDate})
          </div>
        </div>

        {/* Matrix Table */}
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem', textAlign: 'center' }}>
          <thead>
            <tr style={{ background: '#f1f5f9', borderBottom: '2px solid #000' }}>
              <th style={{ border: '1px solid #94a3b8', padding: '8px 4px', width: '40px' }}>S.No</th>
              <th style={{ border: '1px solid #94a3b8', padding: '8px 4px', width: '105px' }}>Roll No</th>
              <th style={{ border: '1px solid #94a3b8', padding: '8px 10px', textAlign: 'left', minWidth: '160px' }}>Student Name</th>
              
              {weekDays.map(w => (
                <th 
                  key={w.dateKey} 
                  style={{ 
                    border: '1px solid #94a3b8', 
                    padding: '6px 4px', 
                    minWidth: '70px',
                    background: w.isHoliday ? '#fef3c7' : '#f1f5f9',
                    color: w.isHoliday ? '#b45309' : '#000'
                  }}
                >
                  <div style={{ fontWeight: 800, fontSize: '0.75rem' }}>{w.shortDay}</div>
                  <div style={{ fontSize: '0.68rem', color: '#475569' }}>{w.displayDate}</div>
                </th>
              ))}

              <th style={{ border: '1px solid #94a3b8', padding: '8px 4px', width: '55px' }}>Pres</th>
              <th style={{ border: '1px solid #94a3b8', padding: '8px 4px', width: '55px' }}>Work</th>
              <th style={{ border: '1px solid #94a3b8', padding: '8px 4px', width: '65px' }}>%</th>
            </tr>
          </thead>
          <tbody>
            {filteredRows.map((s, idx) => {
              const pct = parseFloat(s.percentage);
              const pctColor = pct < 65 ? '#ef4444' : pct < 75 ? '#f59e0b' : '#10b981';

              return (
                <tr key={s.rollNo} style={{ borderBottom: '1px solid #e2e8f0', background: idx % 2 === 0 ? '#fff' : '#f8fafc' }}>
                  <td style={{ border: '1px solid #cbd5e1', padding: '6px 4px' }}>{idx + 1}</td>
                  <td style={{ border: '1px solid #cbd5e1', padding: '6px 4px', fontWeight: 700, fontSize: '0.75rem' }}>{s.rollNo}</td>
                  <td style={{ border: '1px solid #cbd5e1', padding: '6px 10px', textAlign: 'left', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '170px' }}>
                    {s.name}
                  </td>

                  {s.dayCells.map((cell, cIdx) => (
                    <td 
                      key={cIdx} 
                      style={{ 
                        border: '1px solid #cbd5e1', 
                        padding: '6px 4px',
                        fontWeight: 700,
                        fontSize: '0.75rem',
                        background: cell.isAbsent ? '#fee2e2' : cell.isHoliday ? '#fef3c7' : 'transparent',
                        color: cell.isAbsent ? '#dc2626' : cell.isHoliday ? '#b45309' : cell.text !== '-' ? '#1e293b' : '#94a3b8'
                      }}
                    >
                      {cell.text}
                    </td>
                  ))}

                  <td style={{ border: '1px solid #cbd5e1', padding: '6px 4px', fontWeight: 700 }}>{s.presentDays}</td>
                  <td style={{ border: '1px solid #cbd5e1', padding: '6px 4px', fontWeight: 700 }}>{s.totalWorkingDays}</td>
                  <td style={{ border: '1px solid #cbd5e1', padding: '6px 4px', fontWeight: 800, color: pctColor }}>
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

export default WeeklyReport;
