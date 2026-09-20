import React from 'react';
import { CheckCircle2, XCircle, Clock } from 'lucide-react';

const StudentCard = React.memo(({ student, status, onToggle, onEdit }) => {
  // status: 'present' | 'absent' | 'Pending' | 'Approved' | 'Rejected'
  const isPresent = status === 'present' || status === 'Approved';
  const isPending = status === 'Pending';
  const isAbsent = status === 'absent' || (!isPresent && !isPending);

  // 2-digit roll number suffix (e.g., K9, L0, L1 or LE-22 for lateral entry)
  const rollStr = String(student.rollNo || '').trim().toUpperCase();
  const suffix = (rollStr.includes('35A') || rollStr.includes('LE'))
    ? `LE-${rollStr.slice(-2)}`
    : (rollStr ? rollStr.slice(-2) : '??');

  const handleClick = (e) => {
    e.preventDefault();
    if (onToggle) {
      onToggle(student.rollNo);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick(e);
    }
  };

  return (
    <article
      tabIndex={0}
      role="button"
      aria-label={`Roll Number ${student.rollNo}, ${student.name}, currently marked ${isAbsent ? 'Absent' : isPending ? 'Pending' : 'Present'}`}
      className={`student-card ${isAbsent ? 'absent' : isPending ? 'pending' : 'present'}`}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      style={{
        cursor: 'pointer',
        userSelect: 'none',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        borderRadius: 'var(--radius-md)',
        border: isAbsent
          ? '1.5px solid var(--danger-border)'
          : isPending
          ? '1.5px solid var(--warning-border, #f59e0b)'
          : '1.5px solid var(--success-border)',
        background: isAbsent
          ? 'var(--danger-bg)'
          : isPending
          ? 'rgba(245, 158, 11, 0.08)'
          : 'var(--success-bg)',
        transition: 'all 0.15s ease',
        position: 'relative'
      }}
      title="Click to toggle Present / Absent"
    >
      {/* 48px Circular Avatar with 2-digit Roll Suffix */}
      <div
        className="student-avatar"
        style={{
          width: '46px',
          height: '46px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 800,
          fontSize: '1.1rem',
          letterSpacing: '0.5px',
          background: isAbsent
            ? 'var(--danger)'
            : isPending
            ? 'var(--warning)'
            : 'var(--success)',
          color: '#ffffff',
          boxShadow: isAbsent
            ? '0 2px 8px rgba(239, 68, 68, 0.4)'
            : '0 2px 8px rgba(16, 185, 129, 0.35)',
          marginBottom: '0.65rem',
          transition: 'background-color 0.15s ease'
        }}
      >
        {suffix}
      </div>

      {/* Student Details */}
      <div className="student-info" style={{ width: '100%', pointerEvents: 'none' }}>
        <div
          className="student-roll"
          style={{
            fontSize: '0.85rem',
            fontWeight: 700,
            letterSpacing: '0.03em',
            color: isAbsent
              ? 'var(--danger)'
              : isPending
              ? 'var(--warning)'
              : 'var(--success)',
            marginBottom: '0.2rem'
          }}
        >
          {student.rollNo}
        </div>
        <div
          className="student-name"
          style={{
            fontSize: '0.8rem',
            fontWeight: 600,
            lineHeight: 1.25,
            color: isAbsent ? 'var(--danger)' : 'var(--text-primary)',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            maxWidth: '100%'
          }}
          title={student.name}
        >
          {student.name}
        </div>
      </div>

      {/* Status Pill Badge */}
      <div style={{ marginTop: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.35rem', pointerEvents: 'none' }}>
        <span
          className={`badge ${isAbsent ? 'badge-danger' : isPending ? 'badge-warning' : 'badge-success'}`}
          style={{
            fontSize: '0.72rem',
            fontWeight: 800,
            letterSpacing: '0.5px',
            padding: '0.2rem 0.6rem',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.25rem'
          }}
        >
          {isAbsent ? (
            <>
              <XCircle size={13} /> ABSENT
            </>
          ) : isPending ? (
            <>
              <Clock size={13} /> PENDING
            </>
          ) : (
            <>
              <CheckCircle2 size={13} /> PRESENT
            </>
          )}
        </span>
      </div>
    </article>
  );
});

export default StudentCard;
