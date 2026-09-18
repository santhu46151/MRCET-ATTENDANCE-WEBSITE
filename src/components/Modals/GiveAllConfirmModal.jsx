import React from 'react';
import { Layers, AlertTriangle, X } from 'lucide-react';
import { useAttendance } from '../../context/AttendanceContext';

const GiveAllConfirmModal = ({ onClose, onConfirm, isApplying }) => {
  const { currentClassId, selectedDate, selectedPeriod, stats } = useAttendance();

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ padding: '1.5rem', maxWidth: '520px' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--card-border)', paddingBottom: '0.85rem', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{ background: 'var(--warning-bg)', padding: '0.4rem', borderRadius: '8px' }}>
              <AlertTriangle size={20} color="var(--warning)" />
            </div>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              Give Attendance to All Subjects?
            </h2>
          </div>
          <button className="btn btn-outline btn-sm" onClick={onClose} style={{ padding: '0.3rem' }}>
            <X size={16} />
          </button>
        </div>

        <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '1.25rem' }}>
          This will copy the current attendance record from <strong>Period {selectedPeriod}</strong> across <strong>all 6 periods</strong> for <strong>{currentClassId}</strong> on <strong>{selectedDate}</strong>.
        </div>

        <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--card-border)', marginBottom: '1.5rem', fontSize: '0.85rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>Class:</span>
            <strong>{currentClassId}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>Date:</span>
            <strong>{selectedDate}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>Present Count:</span>
            <strong style={{ color: 'var(--success)' }}>{stats.presentCount} Students</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-muted)' }}>Absent Count:</span>
            <strong style={{ color: 'var(--danger)' }}>{stats.absentCount} Students</strong>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', borderTop: '1px solid var(--card-border)', paddingTop: '1rem' }}>
          <button type="button" className="btn btn-outline" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={onConfirm}
            disabled={isApplying}
          >
            <Layers size={16} />
            <span>{isApplying ? 'Applying to All Periods...' : 'Confirm & Apply (P1–P6)'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default GiveAllConfirmModal;
