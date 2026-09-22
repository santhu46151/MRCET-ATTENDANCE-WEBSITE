import React, { useState, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAttendance } from '../context/AttendanceContext';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import StatsRing from '../components/StatsRing';
import StudentCard from '../components/StudentCard';
import AbsenteesSidebar from '../components/AbsenteesSidebar';
import HistoryLogDrawer from '../components/HistoryLogDrawer';
import AppDownloadBanner from '../components/AppDownloadBanner';
import EditStudentModal from '../components/Modals/EditStudentModal';
import InchargeApprovalsModal from '../components/Modals/InchargeApprovalsModal';
import SelfAttendanceModal from '../components/Modals/SelfAttendanceModal';
import TimetableModal from '../components/Modals/TimetableModal';
import { 
  Search, 
  CheckCircle2, 
  AlertCircle, 
  BarChart2, 
  BookOpen, 
  Calendar, 
  CalendarDays, 
  FileSpreadsheet, 
  Download, 
  Clock, 
  Check, 
  X, 
  Save, 
  Users 
} from 'lucide-react';

const Dashboard = () => {
  const { user, isStudent } = useAuth();
  const {
    roster,
    currentPeriodRecord,
    toggleStudentStatus,
    saveAttendance,
    markAllStatus,
    searchQuery,
    setSearchQuery,
    selectedDate,
    currentClassId,
    syncStatus
  } = useAttendance();

  // Modal states
  const [editingStudent, setEditingStudent] = useState(null);
  const [showInchargeModal, setShowInchargeModal] = useState(false);
  const [showSelfAttendanceModal, setShowSelfAttendanceModal] = useState(false);
  const [showTimetableModal, setShowTimetableModal] = useState(false);

  // Toast / Saving status
  const [isSaving, setIsSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await saveAttendance();
      triggerToast(`Attendance for ${selectedDate} saved successfully to Cloud!`);
    } catch (err) {
      triggerToast(`Error saving: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleExportCSV = async () => {
    try {
      const XLSX = await import('xlsx');
      const rows = roster.map((s, idx) => ({
        'S.No': idx + 1,
        'Roll Number': s.rollNo,
        'Student Name': s.name,
        'Date': selectedDate,
        'Class': currentClassId,
        'Status': (currentPeriodRecord[s.rollNo] || 'present').toUpperCase()
      }));

      const ws = XLSX.utils.json_to_sheet(rows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, `Attendance_${selectedDate}`);
      XLSX.writeFile(wb, `MRCET_${currentClassId}_${selectedDate}_DayAttendance.csv`, { bookType: 'csv' });
      triggerToast('Attendance exported to CSV successfully!');
    } catch (err) {
      triggerToast(`Export error: ${err.message}`);
    }
  };

  const handleEditStudent = useCallback((st) => setEditingStudent(st), []);

  // Filtered student roster based on search query (memoized)
  const filteredRoster = useMemo(() => {
    if (!searchQuery.trim()) return roster;
    const q = searchQuery.toLowerCase();
    return roster.filter((s) => s.rollNo.toLowerCase().includes(q) || s.name.toLowerCase().includes(q));
  }, [roster, searchQuery]);

  return (
    <div className="dashboard-container">
      
      {/* Download APK Banner for mobile web visitors */}
      <AppDownloadBanner />

      {/* Navbar with brand, class selector, date, role links */}
      <Navbar
        onOpenTimetable={() => setShowTimetableModal(true)}
        onOpenInchargeApprovals={() => setShowInchargeModal(true)}
        onOpenSelfAttendance={() => setShowSelfAttendanceModal(true)}
      />

      {/* Reports Toolbar matching legacy header toolbar */}
      <div 
        className="glass-panel reports-toolbar" 
        style={{ 
          padding: '0.75rem 1.25rem', 
          marginBottom: '1.25rem', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          flexWrap: 'wrap', 
          gap: '0.75rem' 
        }}
      >
        <div className="reports-toolbar-buttons" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
          <span 
            style={{ 
              fontSize: '0.8rem', 
              fontWeight: 800, 
              color: 'var(--text-muted)', 
              textTransform: 'uppercase', 
              letterSpacing: '0.5px', 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '0.35rem',
              marginRight: '0.25rem'
            }}
          >
            <BarChart2 size={16} color="var(--primary)" /> Reports:
          </span>

          <Link 
            to="/reports/subject" 
            className="btn btn-outline btn-sm" 
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.82rem', padding: '0.4rem 0.75rem' }}
            title="Subject-wise Attendance Register"
          >
            <BookOpen size={15} /> Subject Report
          </Link>

          <Link 
            to="/reports/weekly" 
            className="btn btn-outline btn-sm" 
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.82rem', padding: '0.4rem 0.75rem' }}
            title="Weekly Attendance Matrix (Monday to Saturday)"
          >
            <Calendar size={15} /> Weekly Report
          </Link>

          <Link 
            to="/reports/monthly" 
            className="btn btn-outline btn-sm" 
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.82rem', padding: '0.4rem 0.75rem' }}
            title="Monthly Attendance Register (1 to 31)"
          >
            <CalendarDays size={15} /> Monthly Report
          </Link>

          <Link 
            to="/reports/semester" 
            className="btn btn-outline btn-sm" 
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.82rem', padding: '0.4rem 0.75rem' }}
            title="Consolidated Semester University Report"
          >
            <FileSpreadsheet size={15} /> Semester Report
          </Link>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button
            className="btn btn-outline btn-sm"
            onClick={() => setShowTimetableModal(true)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.82rem', padding: '0.4rem 0.75rem', color: 'var(--primary)', borderColor: 'rgba(99, 102, 241, 0.4)' }}
            title="View Full Class Timetable"
          >
            <Clock size={15} /> View Timetable
          </button>
          <button
            className="btn btn-outline btn-sm"
            onClick={handleExportCSV}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.82rem', padding: '0.4rem 0.75rem' }}
            title="Export Day Attendance to CSV"
          >
            <Download size={15} /> Export CSV
          </button>
        </div>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            background: 'rgba(17, 24, 39, 0.95)',
            border: '1px solid var(--primary)',
            color: '#fff',
            padding: '0.85rem 1.25rem',
            borderRadius: 'var(--radius-sm)',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.6), 0 0 15px var(--primary-light)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem',
            animation: 'modalFadeIn 0.2s ease-out'
          }}
        >
          <CheckCircle2 size={18} color="var(--success)" />
          <span style={{ fontSize: '0.88rem', fontWeight: 600 }}>{toastMessage}</span>
        </div>
      )}

      {/* Stats Counter */}
      <StatsRing />

      {/* Main Content Layout: Student Grid (Left) + Absentees Sidebar (Right) */}
      <div className="dashboard-content">
        
        {/* Left: Dedicated Attendance / Student Roster Box */}
        <section className="directory-panel glass-panel" aria-label="Student Attendance Roster">
          {/* Box Header with Title, Day Attendance info and Quick Action Buttons */}
          <div className="panel-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
              <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.45rem', color: 'var(--text-primary)' }}>
                <span>Student Roster</span>
              </h2>
              <span className="badge badge-primary" style={{ fontSize: '0.72rem' }}>
                Day Attendance
              </span>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                ({filteredRoster.length} students)
              </span>
            </div>

            {/* Attendance Action Controls */}
            <div className="header-actions roster-action-buttons">
              <button
                type="button"
                className="btn btn-outline btn-sm action-btn-present"
                onClick={() => markAllStatus('present')}
                title="Mark all students present today"
              >
                <Check size={15} color="var(--success)" />
                <span>All Present</span>
              </button>

              <button
                type="button"
                className="btn btn-outline btn-sm action-btn-absent"
                onClick={() => markAllStatus('absent')}
                title="Mark all students absent today"
              >
                <X size={15} color="var(--danger)" />
                <span>All Absent</span>
              </button>

              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={handleSave}
                disabled={isSaving}
                title="Save attendance to Cloud Firestore immediately"
              >
                <Save size={15} />
                <span>{isSaving ? 'Saving...' : 'Save to Cloud'}</span>
              </button>
            </div>
          </div>

          {/* Search Bar inside Roster Box */}
          <div className="search-filter-row">
            <div 
              style={{ 
                width: '100%', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.65rem',
                background: 'rgba(255, 255, 255, 0.03)',
                padding: '0.55rem 0.85rem',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--card-border)'
              }}
            >
              <Search size={18} color="var(--text-muted)" />
              <input
                type="text"
                placeholder="Search by Roll Number or Student Name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  background: 'transparent',
                  border: 'none',
                  padding: '0.1rem',
                  fontSize: '0.88rem',
                  boxShadow: 'none',
                  color: 'var(--text-primary)',
                  outline: 'none'
                }}
              />
              {searchQuery && (
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  onClick={() => setSearchQuery('')}
                  style={{ padding: '0.15rem 0.45rem', fontSize: '0.72rem' }}
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Students Grid inside Roster Box */}
          {filteredRoster.length === 0 ? (
            <div style={{ padding: '3rem 1.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              <AlertCircle size={36} style={{ margin: '0 auto 0.75rem auto', opacity: 0.4 }} />
              <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                No Students Found
              </div>
              <div style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>
                {searchQuery ? `No matches for "${searchQuery}" in ${currentClassId}.` : `Roster for ${currentClassId} is currently empty.`}
              </div>
            </div>
          ) : (
            <div className="students-grid">
              {filteredRoster.map((student) => {
                const status = currentPeriodRecord[student.rollNo] || 'present';
                return (
                  <StudentCard
                    key={student.rollNo}
                    student={student}
                    status={status}
                    isStudentRole={isStudent}
                    onToggle={toggleStudentStatus}
                    onEdit={handleEditStudent}
                  />
                );
              })}
            </div>
          )}
        </section>

        {/* Right: Absentees Summary & Quick WhatsApp Export */}
        <AbsenteesSidebar />
      </div>

      {/* Expandable Attendance History Logs */}
      <HistoryLogDrawer />

      {/* Modals */}
      {editingStudent && (
        <EditStudentModal
          student={editingStudent}
          onClose={() => setEditingStudent(null)}
        />
      )}

      {showInchargeModal && (
        <InchargeApprovalsModal
          onClose={() => setShowInchargeModal(false)}
        />
      )}

      {showSelfAttendanceModal && (
        <SelfAttendanceModal
          onClose={() => setShowSelfAttendanceModal(false)}
        />
      )}

      {showTimetableModal && (
        <TimetableModal
          onClose={() => setShowTimetableModal(false)}
        />
      )}
    </div>
  );
};

export default Dashboard;
