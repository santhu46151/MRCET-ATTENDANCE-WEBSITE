import React, { useState, useMemo } from 'react';
import { useAttendance } from '../context/AttendanceContext';
import { History, ChevronDown, ChevronUp, Calendar } from 'lucide-react';

const HistoryLogDrawer = () => {
  const { history, currentClassId, setSelectedDate, setSelectedPeriod } = useAttendance();
  const [isOpen, setIsOpen] = useState(false);

  // Filter history keys for currentClassId (memoized)
  const historyEntries = useMemo(() => {
    return Object.keys(history)
      .filter((k) => {
        if (k.startsWith(`${currentClassId}_`)) return true;
        const dateMatch = k.match(/\d{4}-\d{2}-\d{2}/);
        if (dateMatch && !k.includes('IV_') && !k.includes('III_')) return true;
        return false;
      })
      .map((k) => {
        const dateMatch = k.match(/\d{4}-\d{2}-\d{2}/);
        const date = dateMatch ? dateMatch[0] : '';
        const periodMatch = k.match(/_P?(\d+)$/);
        const period = periodMatch ? periodMatch[1] : '1';

        const entry = history[k] || {};
        const attMap = entry.attendance || {};
        const present = Object.values(attMap).filter(v => v === 'present' || v === 'Approved').length;
        const total = Object.keys(attMap).length;
        const pct = total > 0 ? Math.round((present / total) * 100) : 0;

        return {
          key: k,
          date: date || 'Today',
          period,
          subject: entry.subject || entry.subjectName || 'General',
          faculty: entry.faculty || '',
          present,
          total,
          percentage: pct,
          timestamp: entry.timestamp || (date ? new Date(date).getTime() : 0)
        };
      })
      .filter((item) => item.date !== '')
      .sort((a, b) => {
        if (b.date !== a.date) return b.date.localeCompare(a.date);
        return Number(b.period) - Number(a.period);
      });
  }, [history, currentClassId]);

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
            Attendance History Logs ({historyEntries.length} Recorded Periods)
          </span>
        </div>
        {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
      </div>

      {isOpen && (
        <div style={{ marginTop: '0.85rem', paddingTop: '0.85rem', borderTop: '1px solid var(--card-border)' }}>
          {historyEntries.length === 0 ? (
            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', textAlign: 'center', padding: '1rem' }}>
              No past periods saved for class {currentClassId} yet.
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '0.65rem', maxHeight: '300px', overflowY: 'auto' }}>
              {historyEntries.slice(0, 20).map((log) => (
                <div
                  key={log.key}
                  onClick={() => {
                    setSelectedDate(log.date);
                    setSelectedPeriod(log.period);
                  }}
                  style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid var(--card-border)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '0.6rem 0.75rem',
                    cursor: 'pointer',
                    transition: 'var(--transition)'
                  }}
                  title="Click to view/edit this period"
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.2rem' }}>
                    <span style={{ fontWeight: 800, fontSize: '0.82rem', color: 'var(--primary)' }}>
                      Period {log.period}
                    </span>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: log.percentage >= 75 ? 'var(--success)' : 'var(--danger)' }}>
                      {log.percentage}% ({log.present}/{log.total})
                    </span>
                  </div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {log.subject}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                    <span>{log.date}</span>
                    <span>{log.faculty}</span>
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
