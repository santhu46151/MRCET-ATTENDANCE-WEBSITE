import React, { useState, useMemo } from 'react';
import { useAttendance } from '../context/AttendanceContext';
import { History, ChevronDown, ChevronUp, Calendar } from 'lucide-react';

const HistoryLogDrawer = () => {
  const { history, currentClassId, setSelectedDate, getDayAttendanceRecord } = useAttendance();
  const [isOpen, setIsOpen] = useState(false);

  // Group history keys by distinct recorded Date (memoized)
  const historyEntries = useMemo(() => {
    const datesMap = new Map();

    Object.keys(history).forEach((k) => {
      // Must match class or legacy unscoped
      if (k.startsWith(`${currentClassId}_`) || (!k.includes('IV_') && !k.includes('III_') && !k.includes('II_') && !k.includes('I_'))) {
        const dateMatch = k.match(/\d{4}-\d{2}-\d{2}/);
        if (dateMatch) {
          const date = dateMatch[0];
          datesMap.set(date, true);
        }
      }
    });

    const entries = [];
    datesMap.forEach((_, date) => {
      const rec = getDayAttendanceRecord ? getDayAttendanceRecord(date, currentClassId) : null;
      const attMap = rec?.attendance || {};
      const present = Object.values(attMap).filter(v => v === 'present' || v === 'Approved').length;
      const total = Object.keys(attMap).length;
      if (total > 0) {
        const pct = Math.round((present / total) * 100);
        entries.push({
          date,
          present,
          total,
          percentage: pct
        });
      }
    });

    return entries.sort((a, b) => b.date.localeCompare(a.date));
  }, [history, currentClassId, getDayAttendanceRecord]);

  return (
    <div className="glass-panel" style={{ padding: '0.85rem 1.25rem', marginTop: '1.25rem' }}>
      <div
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
          userSelect: 'none'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <History size={18} color="var(--primary)" />
          <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            Attendance History Logs ({historyEntries.length} Recorded Dates)
          </span>
        </div>
        {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
      </div>

      {isOpen && (
        <div style={{ marginTop: '0.85rem', paddingTop: '0.85rem', borderTop: '1px solid var(--card-border)' }}>
          {historyEntries.length === 0 ? (
            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', textAlign: 'center', padding: '1rem' }}>
              No past dates saved for class {currentClassId} yet.
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.65rem', maxHeight: '300px', overflowY: 'auto' }}>
              {historyEntries.slice(0, 30).map((log) => (
                <div
                  key={log.date}
                  onClick={() => setSelectedDate(log.date)}
                  style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid var(--card-border)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '0.65rem 0.85rem',
                    cursor: 'pointer',
                    transition: 'var(--transition)'
                  }}
                  title={`Click to view attendance for ${log.date}`}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                    <span style={{ fontWeight: 800, fontSize: '0.85rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Calendar size={14} color="var(--primary)" /> {log.date}
                    </span>
                    <span style={{ fontSize: '0.78rem', fontWeight: 700, color: log.percentage >= 75 ? 'var(--success)' : 'var(--danger)' }}>
                      {log.percentage}%
                    </span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Present: <strong style={{ color: 'var(--text-primary)' }}>{log.present}</strong> / {log.total} students
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default HistoryLogDrawer;
