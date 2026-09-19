import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAttendance } from '../context/AttendanceContext';
import { 
  GraduationCap, 
  Calendar, 
  LogOut, 
  FileText, 
  ShieldAlert, 
  BarChart2, 
  Clock, 
  UserCheck, 
  HelpCircle,
  Smartphone
} from 'lucide-react';

const Navbar = ({ onOpenTimetable, onOpenInchargeApprovals, onOpenSelfAttendance }) => {
  const { user, logout, isAdmin, isHod, isIncharge, isStudent } = useAuth();
  const { 
    availableClasses, 
    currentClassId, 
    setCurrentClassId, 
    selectedDate, 
    setSelectedDate, 
    syncStatus,
    inchargeRequests
  } = useAttendance();
  const navigate = useNavigate();

  const handleLogout = async () => {
    if (window.confirm("Are you sure you want to log out?")) {
      await logout();
      navigate('/login');
    }
  };

  const getSyncDotColor = () => {
    if (syncStatus === 'syncing') return '#f59e0b';
    if (syncStatus === 'error') return '#ef4444';
    return '#10b981';
  };

  const getSyncDotTitle = () => {
    if (syncStatus === 'syncing') return 'Syncing to Cloud Firestore...';
    if (syncStatus === 'error') return 'Sync Error - Check connection';
    return 'Cloud Sync Active (Live)';
  };

  return (
    <header className="glass-panel no-print" style={{ padding: '0.85rem 1.25rem', marginBottom: '1.25rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        
        {/* Left: Brand & Class / Date selectors */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', textDecoration: 'none', color: 'inherit' }}>
            <img 
              src="/logo.png" 
              alt="MRCET Logo" 
              style={{ width: '38px', height: '38px', objectFit: 'contain' }}
              onError={(e) => { e.target.style.display = 'none'; }}
            />
            <div>
              <div style={{ fontSize: '1.15rem', fontWeight: 800, letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                MRCET ATTENDANCE
                <span 
                  style={{ 
                    display: 'inline-block', 
                    width: '9px', 
                    height: '9px', 
                    borderRadius: '50%', 
                    backgroundColor: getSyncDotColor(),
                    boxShadow: `0 0 8px ${getSyncDotColor()}`,
                    transition: 'var(--transition)'
                  }} 
                  title={getSyncDotTitle()}
                />
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                Smart Cloud Portal
              </div>
            </div>
          </Link>

          {/* Class Select */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <GraduationCap size={16} color="var(--primary)" />
            <select
              value={currentClassId}
              onChange={(e) => setCurrentClassId(e.target.value)}
              style={{ 
                padding: '0.35rem 0.65rem', 
                fontSize: '0.85rem', 
                fontWeight: 700, 
                cursor: 'pointer' 
              }}
            >
              {availableClasses.length === 0 && (
                <option value={currentClassId}>{currentClassId}</option>
              )}
              {availableClasses.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name || cls.id}
                </option>
              ))}
            </select>
          </div>

          {/* Date Picker */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Calendar size={16} color="var(--primary)" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              style={{ padding: '0.35rem 0.65rem', fontSize: '0.85rem', fontWeight: 600 }}
            />
          </div>
        </div>

        {/* Right: Quick Links & Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
          
          {/* Timetable View Button */}
          <button 
            className="btn btn-outline btn-sm"
            onClick={onOpenTimetable}
            title="View weekly timetable"
          >
            <Clock size={15} />
            <span>Timetable</span>
          </button>

          {/* Incharge Approvals Button with counter badge */}
          {isIncharge && (
            <button 
              className="btn btn-primary btn-sm"
              onClick={onOpenInchargeApprovals}
              style={{ position: 'relative' }}
              title="Review pending student self-attendance requests"
            >
              <UserCheck size={15} />
              <span>Approvals</span>
              {inchargeRequests.length > 0 && (
                <span 
                  style={{
                    background: '#ef4444',
                    color: '#fff',
                    borderRadius: '999px',
                    padding: '0.1rem 0.45rem',
                    fontSize: '0.7rem',
                    fontWeight: 800,
                    marginLeft: '0.2rem'
                  }}
                >
                  {inchargeRequests.length}
                </span>
              )}
            </button>
          )}

          {/* Student Self-Attendance Request */}
          {isStudent && (
            <button 
              className="btn btn-primary btn-sm"
              onClick={onOpenSelfAttendance}
            >
              <Clock size={15} />
              <span>Request Attendance</span>
            </button>
          )}

          {/* HOD Portal */}
          {isHod && (
            <Link to="/hod" className="btn btn-outline btn-sm" title="HOD Department Analytics">
              <BarChart2 size={15} />
              <span>HOD Portal</span>
            </Link>
          )}

          {/* Admin Portal */}
          {isAdmin && (
            <Link to="/admin" className="btn btn-outline btn-sm" title="Admin Command Center">
              <ShieldAlert size={15} />
              <span>Admin</span>
            </Link>
          )}

          {/* User Profile Badge */}
          {user && (
            <div 
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.5rem',
                padding: '0.35rem 0.65rem',
                background: 'rgba(255, 255, 255, 0.05)',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--card-border)'
              }}
            >
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)', maxWidth: '110px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user.name}
                </div>
                <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: 'var(--primary)', fontWeight: 800 }}>
                  {user.role}
                </div>
              </div>

              <button 
                className="btn btn-outline btn-sm" 
                onClick={handleLogout}
                style={{ padding: '0.3rem', border: 'none', background: 'transparent' }}
                title="Log Out"
              >
                <LogOut size={16} color="var(--danger)" />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
