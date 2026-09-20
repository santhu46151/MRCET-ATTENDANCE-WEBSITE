import React from 'react';
import { useAttendance } from '../context/AttendanceContext';
import { Clock, BookOpen, User } from 'lucide-react';

const PeriodSelector = () => {
  const { 
    selectedPeriod, 
    setSelectedPeriod, 
    activeDay, 
    timetable, 
    periodTimes 
  } = useAttendance();

  const periods = [1, 2, 3, 4, 5, 6];

  return (
    <div className="glass-panel" style={{ padding: '0.85rem 1.25rem', marginBottom: '1.25rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Clock size={18} color="var(--primary)" />
          <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            SELECT ACTIVE PERIOD ({activeDay.toUpperCase()})
          </span>
        </div>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          Isolated single-period attendance
        </div>
      </div>

      <div className="period-selector-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.65rem' }}>
        {periods.map((p) => {
          const isSelected = String(p) === String(selectedPeriod);
          const timeSlot = periodTimes[p];
          const periodInfo = timetable[activeDay]?.[String(p)];

          return (
            <div
              key={p}
              onClick={() => setSelectedPeriod(String(p))}
              style={{
                padding: '0.65rem 0.85rem',
                borderRadius: 'var(--radius-sm)',
                border: isSelected ? '1.5px solid var(--primary)' : '1px solid var(--card-border)',
                background: isSelected ? 'rgba(99, 102, 241, 0.18)' : 'rgba(255, 255, 255, 0.03)',
                boxShadow: isSelected ? '0 4px 14px rgba(99, 102, 241, 0.3)' : 'none',
                cursor: 'pointer',
                transition: 'var(--transition)',
                userSelect: 'none'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                <span style={{ fontWeight: 800, fontSize: '0.85rem', color: isSelected ? 'var(--primary)' : 'var(--text-primary)' }}>
                  Period {p}
                </span>
                <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                  {timeSlot?.display || ''}
                </span>
              </div>

              {periodInfo ? (
                <div>
                  <div 
                    style={{ 
                      fontSize: '0.75rem', 
                      fontWeight: 700, 
                      color: isSelected ? '#fff' : 'var(--text-secondary)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}
                    title={periodInfo.subjectName}
                  >
                    {periodInfo.subjectName}
                  </div>
                  <div 
                    style={{ 
                      fontSize: '0.68rem', 
                      color: isSelected ? 'rgba(255, 255, 255, 0.8)' : 'var(--text-muted)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}
                  >
                    {periodInfo.faculty || 'Assigned Faculty'}
                  </div>
                </div>
              ) : (
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                  No subject assigned
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PeriodSelector;
