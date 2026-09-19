import React from 'react';
import { useAttendance } from '../context/AttendanceContext';

const StatsRing = () => {
  const { stats } = useAttendance();
  const { total, presentCount, absentCount, percentage } = stats;

  // SVG Circular progress math
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const getColor = () => {
    if (percentage >= 75) return 'var(--success)';
    if (percentage >= 65) return 'var(--warning)';
    return 'var(--danger)';
  };

  return (
    <div className="glass-panel" style={{ padding: '1.1rem 1.25rem', marginBottom: '1.25rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.25rem' }}>
        
        {/* Circular Ring + Stat Numbers */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
          
          {/* Circular SVG Ring */}
          <div style={{ position: 'relative', width: '92px', height: '92px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="92" height="92" style={{ transform: 'rotate(-90deg)' }}>
              <circle
                cx="46"
                cy="46"
                r={radius}
                stroke="rgba(255, 255, 255, 0.08)"
                strokeWidth="7"
                fill="transparent"
              />
              <circle
                cx="46"
                cy="46"
                r={radius}
                stroke={getColor()}
                strokeWidth="7"
                fill="transparent"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                style={{ transition: 'stroke-dashoffset 0.4s ease-out, stroke 0.4s ease' }}
              />
            </svg>
            <div style={{ position: 'absolute', textAlign: 'center' }}>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>
                {percentage}%
              </div>
              <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)', fontWeight: 600, marginTop: '2px' }}>
                ATTENDANCE
              </div>
            </div>
          </div>

          {/* Stat metrics */}
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '0.5rem 0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--card-border)' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>TOTAL ROSTER</div>
              <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)' }}>{total}</div>
            </div>

            <div style={{ background: 'var(--success-bg)', padding: '0.5rem 0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--success-border)' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--success)', fontWeight: 600 }}>PRESENT</div>
              <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--success)' }}>{presentCount}</div>
            </div>

            <div style={{ background: 'var(--danger-bg)', padding: '0.5rem 0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--danger-border)' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--danger)', fontWeight: 600 }}>ABSENT</div>
              <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--danger)' }}>{absentCount}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsRing;
