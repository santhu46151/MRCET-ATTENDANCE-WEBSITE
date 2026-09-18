import React, { useState, useMemo, useEffect } from 'react';
import { useAttendance } from '../context/AttendanceContext';
import { Share2, Check, UserX, UserCheck, Copy, Phone } from 'lucide-react';

// Suffix helper: handles regular students (e.g. 23N31A67L1 -> L1) and lateral entry (24N35A6722 -> LE-22)
export const getStudentSuffix = (rollNo) => {
  if (!rollNo) return '??';
  const clean = String(rollNo).trim().toUpperCase();
  if (clean.includes('35A') || clean.includes('LE')) {
    const last2 = clean.slice(-2);
    return `LE-${last2}`;
  }
  return clean.slice(-2);
};

const AbsenteesSidebar = () => {
  const { 
    stats, 
    availableClasses,
    currentClassId, 
    selectedDate, 
    selectedPeriod 
  } = useAttendance();

  const { total, presentCount, absentCount, absentees, presentees } = stats;

  // Auto-select mode: if more than half class is absent, default to presentees (or user can toggle)
  const [mode, setMode] = useState(() => (absentCount > presentCount && presentCount > 0 ? 'presentees' : 'absentees'));
  const [copied, setCopied] = useState(false);

  // When attendance counts change significantly, keep mode aligned if not manually changed
  useEffect(() => {
    if (absentCount > presentCount && presentCount > 0) {
      setMode('presentees');
    } else {
      setMode('absentees');
    }
  }, [absentCount === 0, presentCount === 0]);

  // Format Class Display Title (e.g. IV/CSE/DS/D)
  const displayClassName = useMemo(() => {
    const cls = (availableClasses || []).find(c => c.id === currentClassId);
    if (cls?.year && cls?.section) {
      return `${cls.year}/${cls.branch || 'CSE'}/${cls.department || 'DS'}/${cls.section}`;
    }
    if (currentClassId === 'IV_D') {
      return 'IV/CSE/DS/D';
    }
    if (currentClassId && currentClassId.includes('_')) {
      const [yr, sec] = currentClassId.split('_');
      return `${yr}/CSE/DS/${sec}`;
    }
    return currentClassId || 'IV/CSE/DS/D';
  }, [availableClasses, currentClassId]);

  // Format Date (DD/MM/YYYY)
  const formattedDate = useMemo(() => {
    if (!selectedDate) return '';
    const parts = selectedDate.split('-');
    if (parts.length === 3) {
      const [y, m, d] = parts;
      return `${d.padStart(2, '0')}/${m.padStart(2, '0')}/${y}`;
    }
    return selectedDate;
  }, [selectedDate]);

  // Active target list and header
  const targetList = mode === 'presentees' ? (presentees || []) : (absentees || []);
  const typeHeader = mode === 'presentees' ? 'Presentees :' : 'Absentees :';

  // Sort by roll number
  const sortedTargetList = useMemo(() => {
    return [...targetList].sort((a, b) => a.rollNo.localeCompare(b.rollNo));
  }, [targetList]);

  // Comma-separated suffixes (e.g. L1,L6,L8,M0,M5,N1,Q0,Q1,Q6,Q7,LE-22)
  const rollSuffixes = useMemo(() => {
    return sortedTargetList.map(s => getStudentSuffix(s.rollNo)).join(',');
  }, [sortedTargetList]);

  // Exact message format matching faculty WhatsApp requirements
  const messageText = useMemo(() => {
    return `${displayClassName}
${formattedDate} ${typeHeader}

${rollSuffixes || 'None'}

Absent - ${absentCount}
Present - ${presentCount}
Total - ${total}`;
  }, [displayClassName, formattedDate, typeHeader, rollSuffixes, absentCount, presentCount, total]);

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(messageText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleShareWhatsApp = () => {
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(messageText)}`;
    window.open(url, '_blank');
  };

  return (
    <aside className="glass-panel" style={{ padding: '1rem', height: 'fit-content' }}>
      
      {/* Panel Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
          {mode === 'presentees' ? (
            <UserCheck size={18} color="var(--success)" />
          ) : (
            <UserX size={18} color="var(--danger)" />
          )}
          <span style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            {mode === 'presentees' ? `PRESENTEES (${presentCount})` : `ABSENTEES (${absentCount})`}
          </span>
        </div>

        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>
          P{selectedPeriod}
        </div>
      </div>

      {/* Mode Selector Tabs (Absentees vs Presentees) */}
      <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.75rem', background: 'var(--bg-secondary)', padding: '0.25rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--card-border)' }}>
        <button
          type="button"
          onClick={() => setMode('absentees')}
          style={{
            flex: 1,
            padding: '0.35rem 0.5rem',
            fontSize: '0.75rem',
            fontWeight: 700,
            borderRadius: '4px',
            border: 'none',
            cursor: 'pointer',
            background: mode === 'absentees' ? 'var(--danger)' : 'transparent',
            color: mode === 'absentees' ? '#ffffff' : 'var(--text-secondary)',
            transition: 'all 0.15s ease'
          }}
        >
          Absentees ({absentCount})
        </button>

        <button
          type="button"
          onClick={() => setMode('presentees')}
          style={{
            flex: 1,
            padding: '0.35rem 0.5rem',
            fontSize: '0.75rem',
            fontWeight: 700,
            borderRadius: '4px',
            border: 'none',
            cursor: 'pointer',
            background: mode === 'presentees' ? 'var(--success)' : 'transparent',
            color: mode === 'presentees' ? '#ffffff' : 'var(--text-secondary)',
            transition: 'all 0.15s ease'
          }}
        >
          Presentees ({presentCount})
        </button>
      </div>

      {/* Readonly Formatted Textarea */}
      <div style={{ marginBottom: '0.75rem' }}>
        <textarea
          id="absent-message-box"
          readOnly
          value={messageText}
          style={{
            width: '100%',
            minHeight: '165px',
            fontFamily: 'Consolas, Monaco, monospace',
            fontSize: '0.88rem',
            fontWeight: 600,
            lineHeight: 1.45,
            color: 'var(--text-primary)',
            background: 'var(--bg-secondary)',
            padding: '0.85rem',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--card-border)',
            resize: 'vertical',
            outline: 'none',
            boxSizing: 'border-box'
          }}
          placeholder="Formatted message will appear here..."
        />
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <button
          type="button"
          onClick={handleCopyMessage}
          className="btn btn-primary"
          style={{
            width: '100%',
            justifyContent: 'center',
            padding: '0.65rem 1rem',
            fontSize: '0.88rem',
            fontWeight: 700,
            background: copied ? '#059669' : '#10b981',
            borderColor: copied ? '#059669' : '#10b981',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem'
          }}
          title="Copy formatted message to clipboard"
        >
          {copied ? <Check size={16} /> : <Copy size={16} />}
          <span>{copied ? 'Copied to Clipboard!' : 'Copy Message'}</span>
        </button>

        <button
          type="button"
          onClick={handleShareWhatsApp}
          className="btn btn-outline btn-sm"
          style={{
            width: '100%',
            justifyContent: 'center',
            padding: '0.5rem 1rem',
            fontSize: '0.82rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            borderColor: 'rgba(37, 211, 102, 0.4)',
            color: '#25D366'
          }}
          title="Directly share on WhatsApp"
        >
          <Share2 size={15} />
          <span>Share via WhatsApp</span>
        </button>
      </div>

      {/* Collapsible Roll Call List */}
      {sortedTargetList.length > 0 && (
        <div style={{ marginTop: '1rem', borderTop: '1px solid var(--card-border)', paddingTop: '0.75rem' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            {mode === 'presentees' ? 'Present Students' : 'Absent Students'} ({sortedTargetList.length})
          </div>

          <div style={{ maxHeight: '220px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.35rem', paddingRight: '0.2rem' }}>
            {sortedTargetList.map((st, idx) => {
              const suffix = getStudentSuffix(st.rollNo);
              return (
                <div
                  key={st.rollNo}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.35rem 0.55rem',
                    background: mode === 'presentees' ? 'rgba(16, 185, 129, 0.08)' : 'rgba(239, 68, 68, 0.08)',
                    border: mode === 'presentees' ? '1px solid rgba(16, 185, 129, 0.2)' : '1px solid rgba(239, 68, 68, 0.2)',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.78rem'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', minWidth: 0 }}>
                    <span 
                      style={{ 
                        fontSize: '0.72rem', 
                        fontWeight: 800, 
                        color: mode === 'presentees' ? 'var(--success)' : 'var(--danger)',
                        width: '38px' 
                      }}
                    >
                      {suffix}
                    </span>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '140px' }} title={st.name}>
                        {st.name}
                      </div>
                    </div>
                  </div>

                  {st.phone && (
                    <a
                      href={`tel:${st.phone}`}
                      style={{ fontSize: '0.7rem', color: 'var(--primary)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.2rem' }}
                      title={`Call ${st.name}: ${st.phone}`}
                    >
                      <Phone size={12} />
                    </a>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </aside>
  );
};

export default AbsenteesSidebar;
