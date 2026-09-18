import React, { useState } from 'react';
import { useAttendance } from '../../context/AttendanceContext';
import { Calendar, Printer, X } from 'lucide-react';

const TimetableModal = ({ onClose }) => {
  const { timetable, currentClassId, periodTimes } = useAttendance();
  const [selectedDayFilter, setSelectedDayFilter] = useState('ALL');

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const displayedDays = selectedDayFilter === 'ALL' ? days : [selectedDayFilter];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content" 
        onClick={(e) => e.stopPropagation()} 
        style={{ padding: '1.5rem', maxWidth: '900px', width: '95%' }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--card-border)', paddingBottom: '0.85rem', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Calendar size={20} color="var(--primary)" />
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                Class Timetable — {currentClassId}
              </h2>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
              Weekly Academic Schedule (Periods 1 to 6)
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <select
              value={selectedDayFilter}
              onChange={(e) => setSelectedDayFilter(e.target.value)}
              style={{ padding: '0.35rem 0.65rem', fontSize: '0.8rem', fontWeight: 600 }}
            >
              <option value="ALL">Full Week</option>
              {days.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>

            <button className="btn btn-outline btn-sm" onClick={handlePrint} title="Print Timetable">
              <Printer size={15} />
              <span>Print</span>
            </button>

            <button className="btn btn-outline btn-sm" onClick={onClose} style={{ padding: '0.35rem' }}>
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Timetable Matrix */}
        <div style={{ overflowX: 'auto' }}>
          {displayedDays.map((day) => (
            <div key={day} style={{ marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '0.45rem' }}>
                {day}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, minmax(130px, 1fr))', gap: '0.5rem' }}>
                {[1, 2, 3, 4, 5, 6].map((p) => {
                  const slot = timetable[day]?.[String(p)];
                  const time = periodTimes[p];

                  return (
                    <div
                      key={p}
                      style={{
                        background: 'rgba(255, 255, 255, 0.03)',
                        border: '1px solid var(--card-border)',
                        borderRadius: 'var(--radius-sm)',
                        padding: '0.6rem',
                        fontSize: '0.75rem'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.68rem', marginBottom: '0.3rem' }}>
                        <span>P{p}</span>
                        <span>{time?.start}</span>
                      </div>
                      {slot ? (
                        <div>
                          <div style={{ fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.2, minHeight: '28px' }}>
                            {slot.subjectName}
                          </div>
                          <div style={{ color: 'var(--text-muted)', fontSize: '0.68rem', marginTop: '0.25rem' }}>
                            {slot.faculty || 'Assigned Faculty'}
                          </div>
                        </div>
                      ) : (
                        <div style={{ color: 'var(--text-muted)', fontStyle: 'italic', minHeight: '40px', display: 'flex', alignItems: 'center' }}>
                          Free / None
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div style={{ textAlign: 'right', marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid var(--card-border)' }}>
          <button className="btn btn-outline" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default TimetableModal;
