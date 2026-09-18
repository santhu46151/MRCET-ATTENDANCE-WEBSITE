import React, { useState, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import * as XLSX from 'xlsx';
import { useAttendance } from '../context/AttendanceContext';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import PeriodSelector from '../components/PeriodSelector';
import StatsRing from '../components/StatsRing';
import StudentCard from '../components/StudentCard';
import AbsenteesSidebar from '../components/AbsenteesSidebar';
import HistoryLogDrawer from '../components/HistoryLogDrawer';
import AppDownloadBanner from '../components/AppDownloadBanner';
import EditStudentModal from '../components/Modals/EditStudentModal';
import InchargeApprovalsModal from '../components/Modals/InchargeApprovalsModal';
import SelfAttendanceModal from '../components/Modals/SelfAttendanceModal';
import GiveAllConfirmModal from '../components/Modals/GiveAllConfirmModal';
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
  Clock 
} from 'lucide-react';

const Dashboard = () => {
  const { user, isStudent } = useAuth();
  const {
    roster,
    currentPeriodRecord,
    toggleStudentStatus,
    saveAttendance,
    giveAllPeriodsAttendance,
    searchQuery,
    setSearchQuery,
    selectedPeriod,
    selectedDate,
    currentClassId,
    previousPeriod,
    copyFromPreviousPeriod
  } = useAttendance();

  // Modal states
  const [editingStudent, setEditingStudent] = useState(null);
  const [showInchargeModal, setShowInchargeModal] = useState(false);
  const [showSelfAttendanceModal, setShowSelfAttendanceModal] = useState(false);
  const [showGiveAllModal, setShowGiveAllModal] = useState(false);
  const [showTimetableModal, setShowTimetableModal] = useState(false);

  // Toast / Saving status
  const [isSaving, setIsSaving] = useState(false);
  const [isGivingAll, setIsGivingAll] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await saveAttendance();
      triggerToast(`Attendance for Period ${selectedPeriod} saved successfully to Cloud!`);
    } catch (err) {
      triggerToast(`Error saving: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfirmGiveAll = async () => {
    setIsGivingAll(true);
    try {
      await giveAllPeriodsAttendance();
      setShowGiveAllModal(false);
      triggerToast(`Period ${selectedPeriod} attendance copied to all 6 periods and saved to Cloud!`);
    } catch (err) {
      triggerToast(`Error: ${err.message}`);
    } finally {
      setIsGivingAll(false);
    }
  };

  const handleCopyPrev = () => {
    if (!previousPeriod) return;
    const ok = copyFromPreviousPeriod();
    if (ok) {
      triggerToast(`Copied Period ${previousPeriod} attendance into Period ${selectedPeriod}!`);
    } else {
      triggerToast(`No attendance found in Period ${previousPeriod} to copy.`);
    }
  };

  const handleExportCSV = () => {
    try {
      const rows = roster.map((s, idx) => ({
        'S.No': idx + 1,
        'Roll Number': s.rollNo,
        'Student Name': s.name,
        'Date': selectedDate,
        'Period': `Period ${selectedPeriod}`,
        'Class': currentClassId,
        'Status': (currentPeriodRecord[s.rollNo] || 'present').toUpperCase()
      }));

      const ws = XLSX.utils.json_to_sheet(rows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, `Attendance_P${selectedPeriod}`);
      XLSX.writeFile(wb, `MRCET_${currentClassId}_${selectedDate}_P${selectedPeriod}.csv`, { bookType: 'csv' });
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
    <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '1rem' }}>
      
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
        className="glass-panel" 
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
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
            className="btn btn-primary btn-sm" 
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.82rem', padding: '0.4rem 0.75rem' }}
            title="Subject-wise Attendance Register"
          >
            <BookOpen size={15} /> Subject Report
          </Link>

          <Link 
            to="/reports/weekly" 
            className="btn btn-outline btn-sm" 
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.82rem', padding: '0.4rem 0.75rem' }}
            title="Weekly Periods 1-6 Matrix"
          >
            <Calendar size={15} /> Weekly Report
          </Link>

          <Link 
            to="/reports/monthly" 
            className="btn btn-outline btn-sm" 
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.82rem', padding: '0.4rem 0.75rem' }}
            title="Monthly Attendance Register"
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
            title="Export Current Period Attendance to CSV"
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

      {/* Period Selection (1 to 6) */}
      <PeriodSelector />

      {/* Stats Counter & Save / Mark Actions */}
      <StatsRing
        onSave={handleSave}
        onOpenGiveAll={() => setShowGiveAllModal(true)}
        onCopyPrev={handleCopyPrev}
        isSaving={isSaving}
      />

      {/* Main Content Layout: Student Grid (Left) + Absentees Sidebar (Right) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 300px', gap: '1.25rem', alignItems: 'start' }}>
        
        {/* Left: Search Bar & Students Grid */}
        <div>
          <div className="glass-panel" style={{ padding: '0.65rem 1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
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
                padding: '0.2rem',
                fontSize: '0.9rem',
                boxShadow: 'none'
              }}
            />
            {searchQuery && (
              <button
                className="btn btn-outline btn-sm"
                onClick={() => setSearchQuery('')}
                style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}
              >
                Clear
              </button>
            )}
          </div>

          {filteredRoster.length === 0 ? (
            <div className="glass-panel" style={{ padding: '3rem 1.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
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
        </div>

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

      {showGiveAllModal && (
        <GiveAllConfirmModal
          onClose={() => setShowGiveAllModal(false)}
          onConfirm={handleConfirmGiveAll}
          isApplying={isGivingAll}
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
