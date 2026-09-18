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
  CalendarDays, 
  GraduationCap,
  Search,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

const MonthlyReport = () => {
  const { user, isStudent } = useAuth();

  const [availableClasses, setAvailableClasses] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState(() => {
    if (isStudent && user?.year && user?.section) {
      return `${user.year}_${user.section}`;
    }
    return 'IV_D';
  });

  const now = new Date();
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1); // 1-12

  const [roster, setRoster] = useState([]);
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

  // 2. Fetch Class Roster and History with local storage fallback
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

  // Days in selected month
  const monthDays = useMemo(() => {
    const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
    const days = [];
    for (let day = 1; day <= daysInMonth; day++) {
      const d = new Date(selectedYear, selectedMonth - 1, day);
      const isSun = d.getDay() === 0;
      const dateKey = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const isHol = isSun || holidays.includes(dateKey);

      days.push({
        dayNumber: day,
        dateKey,
        isSunday: isSun,
        isHoliday: isHol
      });
    }
    return days;
  }, [selectedYear, selectedMonth, holidays]);

  // Helper to determine day attendance
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

  // Student rows with cumulative presence (1, 2, 3...) and AB
  const studentRows = useMemo(() => {
    const workingDaysCount = monthDays.filter(d => !d.isHoliday).length;

    return roster.map((student) => {
      let runningCount = 0;

      const dayCells = monthDays.map((d) => {
        if (d.isSunday) {
          return {
            text: 'SUN',
            isHoliday: true,
            isAbsent: false
          };
        }
        if (d.isHoliday) {
          return {
            text: 'HOL',
            isHoliday: true,
            isAbsent: false
          };
        }

        const status = getDayAttendance(d.dateKey, student.rollNo);
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
  }, [roster, monthDays, history, selectedClassId]);

  // Search filter
  const filteredRows = useMemo(() => {
    if (!searchQuery.trim()) return studentRows;
    const q = searchQuery.toLowerCase();
    return studentRows.filter(s => s.rollNo.toLowerCase().includes(q) || s.name.toLowerCase().includes(q));
  }, [studentRows, searchQuery]);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const handlePrevMonth = () => {
    if (selectedMonth === 1) {
      setSelectedMonth(12);
      setSelectedYear(selectedYear - 1);
    } else {
      setSelectedMonth(selectedMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 12) {
      setSelectedMonth(1);
      setSelectedYear(selectedYear + 1);
    } else {
      setSelectedMonth(selectedMonth + 1);
    }
  };

  const handleExportExcel = () => {
    const headers = [
      'S.No',
      'Roll Number',
      'Student Name',
      ...monthDays.map(d => `Day ${d.dayNumber}`),
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
      [`Monthly Day Attendance Register - ${selectedClassId} (${monthNames[selectedMonth - 1]} ${selectedYear})`],
      [],
      headers,
      ...dataRows
    ]);

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Monthly Register');
    XLSX.writeFile(wb, `MRCET_${selectedClassId}_Monthly_${selectedYear}_${String(selectedMonth).padStart(2, '0')}.xlsx`);
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
                <CalendarDays color="var(--primary)" size={22} /> Monthly Attendance Register
              </h2>
              <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Day 1 to 31 cumulative attendance (1, 2, 3...) and AB marking
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

            {/* Month Stepper */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', background: 'var(--bg-secondary)', padding: '0.2rem 0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--card-border)' }}>
              <button 
                onClick={handlePrevMonth} 
                className="btn btn-outline btn-sm" 
                style={{ padding: '0.25rem 0.45rem' }} 
                title="Previous Month"
              >
                <ChevronLeft size={16} />
              </button>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, padding: '0 0.5rem' }}>
                {monthNames[selectedMonth - 1]} {selectedYear}
              </span>
              <button 
                onClick={handleNextMonth} 
                className="btn btn-outline btn-sm" 
                style={{ padding: '0.25rem 0.45rem' }} 
                title="Next Month"
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
            MONTHLY DAY ATTENDANCE REGISTER - {selectedClassId} ({monthNames[selectedMonth - 1].toUpperCase()} {selectedYear})
          </div>
        </div>

        {/* Matrix Table */}
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.73rem', textAlign: 'center' }}>
          <thead>
            <tr style={{ background: '#f1f5f9', borderBottom: '2px solid #000' }}>
              <th style={{ border: '1px solid #94a3b8', padding: '6px 4px', width: '35px' }}>S.No</th>
              <th style={{ border: '1px solid #94a3b8', padding: '6px 4px', width: '95px' }}>Roll No</th>
              <th style={{ border: '1px solid #94a3b8', padding: '6px 8px', textAlign: 'left', minWidth: '150px' }}>Student Name</th>
              
              {monthDays.map(d => (
                <th 
                  key={d.dayNumber} 
                  style={{ 
                    border: '1px solid #94a3b8', 
                    padding: '4px 1px', 
                    width: '24px', 
                    background: d.isHoliday ? '#fef3c7' : '#f1f5f9',
                    color: d.isHoliday ? '#b45309' : '#000'
                  }}
                  title={d.isSunday ? 'Sunday' : d.isHoliday ? 'Holiday' : `Day ${d.dayNumber}`}
                >
                  {d.dayNumber}
                </th>
              ))}

              <th style={{ border: '1px solid #94a3b8', padding: '4px', width: '45px' }}>Pres</th>
              <th style={{ border: '1px solid #94a3b8', padding: '4px', width: '45px' }}>Work</th>
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

                  {s.dayCells.map((cell, cIdx) => (
                    <td 
                      key={cIdx} 
                      style={{ 
                        border: '1px solid #cbd5e1', 
                        padding: '3px 1px',
                        fontWeight: 700,
                        fontSize: '0.7rem',
                        background: cell.isAbsent ? '#fee2e2' : cell.isHoliday ? '#fef3c7' : 'transparent',
                        color: cell.isAbsent ? '#dc2626' : cell.isHoliday ? '#b45309' : cell.text !== '-' ? '#1e293b' : '#94a3b8'
                      }}
                    >
                      {cell.text}
                    </td>
                  ))}

                  <td style={{ border: '1px solid #cbd5e1', padding: '4px', fontWeight: 700 }}>{s.presentDays}</td>
                  <td style={{ border: '1px solid #cbd5e1', padding: '4px', fontWeight: 700 }}>{s.totalWorkingDays}</td>
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

export default MonthlyReport;
