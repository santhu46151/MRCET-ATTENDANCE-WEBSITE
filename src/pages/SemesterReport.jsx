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
  Search, 
  GraduationCap,
  Calendar,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Award
} from 'lucide-react';

const SemesterReport = () => {
  const { user, isStudent } = useAuth();

  const [availableClasses, setAvailableClasses] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState(() => {
    if (isStudent && user?.year && user?.section) {
      return `${user.year}_${user.section}`;
    }
    return 'IV_D';
  });

  // Default semester start date and today's end date
  const [startDate, setStartDate] = useState('2026-07-06');
  const [endDate, setEndDate] = useState(() => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  });

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

  // 2. Fetch Class Roster and History with local storage fallback
  useEffect(() => {
    if (!selectedClassId) return;
    setLoading(true);

    const unsub = db.collection('classes').doc(selectedClassId).onSnapshot((doc) => {
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

    return () => unsub();
  }, [selectedClassId]);

  // Calculate day-wise semester attendance metrics from startDate to endDate (today)
  const semesterData = useMemo(() => {
    if (!startDate || !endDate) {
      return { workingDays: 0, studentMetrics: [] };
    }

    const curr = new Date(startDate);
    const end = new Date(endDate);
    const workingDaysList = [];

    // Find all valid instructional days with recorded attendance
    while (curr <= end) {
      const y = curr.getFullYear();
      const m = String(curr.getMonth() + 1).padStart(2, '0');
      const d = String(curr.getDate()).padStart(2, '0');
      const dateKey = `${y}-${m}-${d}`;

      const isSunday = curr.getDay() === 0;
      const isHol = isSunday || holidays.includes(dateKey);

      if (!isHol) {
        // Check if attendance was recorded on this date
        let hasRecord = false;
        for (let p = 1; p <= 7; p++) {
          const k1 = `${selectedClassId}_${dateKey}_P${p}`;
          const k2 = `${dateKey}_P${p}`;
          if (history[k1]?.attendance || history[k2]?.attendance) {
            hasRecord = true;
            break;
          }
        }
        if (!hasRecord) {
          const dayRec = history[`${selectedClassId}_${dateKey}`] || history[dateKey];
          if (dayRec?.attendance) hasRecord = true;
        }

        if (hasRecord) {
          workingDaysList.push(dateKey);
        }
      }

      curr.setDate(curr.getDate() + 1);
    }

    const workingDaysCount = workingDaysList.length;

    // For each student, calculate present days, absent days, and percentage
    const studentMetrics = roster.map((student) => {
      let presentDays = 0;
      let absentDays = 0;

      workingDaysList.forEach((dateKey) => {
        let isAbsent = false;

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
            if (rec?.attendance && rec.attendance[student.rollNo] !== undefined) {
              const st = String(rec.attendance[student.rollNo]).toLowerCase();
              if (st === 'absent' || st === 'ab') {
                isAbsent = true;
              }
            }
          }

          const dayRec = history[`${selectedClassId}_${dk}`] || history[dk];
          if (dayRec?.attendance && dayRec.attendance[student.rollNo] !== undefined) {
            const st = String(dayRec.attendance[student.rollNo]).toLowerCase();
            if (st === 'absent' || st === 'ab') {
              isAbsent = true;
            }
          }
        }

        if (isAbsent) {
          absentDays++;
        } else {
          presentDays++;
        }
      });

      const percentage = workingDaysCount > 0 
        ? ((presentDays / workingDaysCount) * 100).toFixed(1) 
        : '100.0';

      const pctNum = parseFloat(percentage);

      return {
        rollNo: student.rollNo,
        name: student.name,
        totalDays: workingDaysCount,
        presentDays,
        absentDays,
        percentage,
        pctNum
      };
    });

    return {
      workingDays: workingDaysCount,
      studentMetrics
    };
  }, [startDate, endDate, roster, history, holidays, selectedClassId]);

  const { workingDays, studentMetrics } = semesterData;

  // Filtered by search
  const filteredMetrics = useMemo(() => {
    if (!searchQuery.trim()) return studentMetrics;
    const q = searchQuery.toLowerCase();
    return studentMetrics.filter(s => s.rollNo.toLowerCase().includes(q) || s.name.toLowerCase().includes(q));
  }, [studentMetrics, searchQuery]);

  // Summary statistics
  const summaryStats = useMemo(() => {
    if (studentMetrics.length === 0) return { avg: '0.0', eligible: 0, condonation: 0, detained: 0 };
    const totalPct = studentMetrics.reduce((acc, s) => acc + s.pctNum, 0);
    const avg = (totalPct / studentMetrics.length).toFixed(1);
    const eligible = studentMetrics.filter(s => s.pctNum >= 75).length;
    const condonation = studentMetrics.filter(s => s.pctNum >= 65 && s.pctNum < 75).length;
    const detained = studentMetrics.filter(s => s.pctNum < 65).length;

    return { avg, eligible, condonation, detained };
  }, [studentMetrics]);

  const handleExportExcel = () => {
    const headers = [
      'S.No',
      'Roll.no',
      'Name',
      'Total Days',
      'Present Days',
      'Absent Days',
      'Percentage (%)'
    ];

    const dataRows = studentMetrics.map((s, idx) => [
      idx + 1,
      s.rollNo,
      s.name,
      s.totalDays,
      s.presentDays,
      s.absentDays,
      `${s.percentage}%`
    ]);

    const ws = XLSX.utils.aoa_to_sheet([
      [`MALLA REDDY COLLEGE OF ENGINEERING & TECHNOLOGY (AUTONOMOUS)`],
      [`Consolidated Semester Attendance Report - ${selectedClassId} (${startDate} to ${endDate})`],
      [],
      headers,
      ...dataRows
    ]);

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Semester Report');
    XLSX.writeFile(wb, `MRCET_${selectedClassId}_Semester_${startDate}_to_${endDate}.xlsx`);
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
                <Award color="var(--primary)" size={22} /> Semester Attendance Report
              </h2>
              <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Consolidated day attendance report from semester start date to today
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

            {/* Date Range: Semester Start to Today */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Calendar size={15} color="var(--text-muted)" />
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                style={{ padding: '0.35rem 0.55rem', fontSize: '0.82rem' }}
                title="Semester Start Date"
              />
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>to</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                style={{ padding: '0.35rem 0.55rem', fontSize: '0.82rem' }}
                title="Today's Date"
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

      {/* Summary KPI Cards */}
      <div className="no-print" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
        <div className="glass-panel" style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(99, 102, 241, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
            <Calendar size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Total Working Days</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800 }}>{workingDays} Days</div>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--success)' }}>
            <CheckCircle size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Eligible (≥ 75%)</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--success)' }}>{summaryStats.eligible} Students</div>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(245, 158, 11, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--warning)' }}>
            <AlertTriangle size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Condonation (65% - 74%)</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--warning)' }}>{summaryStats.condonation} Students</div>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(239, 68, 68, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--danger)' }}>
            <XCircle size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Detained (&lt; 65%)</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--danger)' }}>{summaryStats.detained} Students</div>
          </div>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="glass-panel report-printable-area" style={{ padding: '1.5rem', overflowX: 'auto', background: '#fff', color: '#000' }}>
        
        {/* Search Input */}
        <div className="no-print" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#f1f5f9', padding: '0.4rem 0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid #cbd5e1', width: '320px' }}>
            <Search size={16} color="#64748b" />
            <input
              type="text"
              placeholder="Search by Roll Number or Name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ background: 'transparent', border: 'none', width: '100%', fontSize: '0.85rem', color: '#000', outline: 'none' }}
            />
          </div>

          <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#64748b' }}>
            Showing {filteredMetrics.length} of {roster.length} students
          </div>
        </div>

        {/* Printable College Header */}
        <div style={{ textAlign: 'center', borderBottom: '2px solid #000', paddingBottom: '0.75rem', marginBottom: '1rem' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: '0 0 0.2rem 0', color: '#312e81', textTransform: 'uppercase' }}>
            Malla Reddy College of Engineering and Technology
          </h3>
          <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#dc2626' }}>
            Autonomous Institution - UGC, Govt. of India | Affiliated to JNTUH
          </div>
          <div style={{ fontSize: '0.9rem', fontWeight: 800, marginTop: '0.4rem', borderTop: '1px dashed #666', paddingTop: '0.35rem' }}>
            CONSOLIDATED SEMESTER ATTENDANCE REGISTER - {selectedClassId} ({startDate} TO {endDate})
          </div>
        </div>

        {/* Exact Requested Table Columns: Roll.no, name, total days, present days, absent days, percentage */}
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
          <thead>
            <tr style={{ background: '#f1f5f9', borderBottom: '2px solid #000' }}>
              <th style={{ border: '1px solid #94a3b8', padding: '8px', textAlign: 'center', width: '45px' }}>S.No</th>
              <th style={{ border: '1px solid #94a3b8', padding: '8px', textAlign: 'center', width: '120px' }}>Roll.no</th>
              <th style={{ border: '1px solid #94a3b8', padding: '8px 12px', textAlign: 'left' }}>Name</th>
              <th style={{ border: '1px solid #94a3b8', padding: '8px', textAlign: 'center', width: '100px' }}>Total Days</th>
              <th style={{ border: '1px solid #94a3b8', padding: '8px', textAlign: 'center', width: '110px' }}>Present Days</th>
              <th style={{ border: '1px solid #94a3b8', padding: '8px', textAlign: 'center', width: '110px' }}>Absent Days</th>
              <th style={{ border: '1px solid #94a3b8', padding: '8px', textAlign: 'center', width: '100px' }}>Percentage</th>
            </tr>
          </thead>
          <tbody>
            {filteredMetrics.map((s, idx) => {
              const pctColor = s.pctNum < 65 ? '#ef4444' : s.pctNum < 75 ? '#f59e0b' : '#10b981';

              return (
                <tr key={s.rollNo} style={{ borderBottom: '1px solid #e2e8f0', background: idx % 2 === 0 ? '#fff' : '#f8fafc' }}>
                  <td style={{ border: '1px solid #cbd5e1', padding: '6px', textAlign: 'center' }}>{idx + 1}</td>
                  <td style={{ border: '1px solid #cbd5e1', padding: '6px', textAlign: 'center', fontWeight: 700, fontFamily: 'monospace' }}>{s.rollNo}</td>
                  <td style={{ border: '1px solid #cbd5e1', padding: '6px 12px', fontWeight: 600 }}>{s.name}</td>
                  <td style={{ border: '1px solid #cbd5e1', padding: '6px', textAlign: 'center', fontWeight: 700 }}>{s.totalDays}</td>
                  <td style={{ border: '1px solid #cbd5e1', padding: '6px', textAlign: 'center', fontWeight: 700, color: '#166534' }}>{s.presentDays}</td>
                  <td style={{ border: '1px solid #cbd5e1', padding: '6px', textAlign: 'center', fontWeight: 700, color: s.absentDays > 0 ? '#dc2626' : '#64748b' }}>{s.absentDays}</td>
                  <td style={{ border: '1px solid #cbd5e1', padding: '6px', textAlign: 'center', fontWeight: 800, color: pctColor }}>
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

export default SemesterReport;
