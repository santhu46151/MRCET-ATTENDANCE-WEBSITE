import React, { useState } from 'react';
import { db, firebase } from '../../firebase';
import { useAuth } from '../../context/AuthContext';
import { useAttendance } from '../../context/AttendanceContext';
import { Clock, Send, X, AlertCircle, CheckCircle2 } from 'lucide-react';

const SelfAttendanceModal = ({ onClose }) => {
  const { user } = useAuth();
  const { 
    currentClassId, 
    selectedDate, 
    setHistory, 
    activeDayKey,
    history 
  } = useAttendance();

  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  // Extract student roll number from user profile or name
  const studentRoll = user?.email?.split('@')[0]?.toUpperCase() || user?.name || 'STUDENT';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const requestData = {
        studentUid: user?.uid,
        rollNo: studentRoll,
        name: user?.name || studentRoll,
        classId: currentClassId,
        date: selectedDate,
        reason: reason.trim(),
        status: 'Pending',
        requestedAt: firebase.firestore.FieldValue.serverTimestamp()
      };

      await db.collection('attendance_requests').add(requestData);

      // Create in-app notification for Class Incharge
      await db.collection('notifications').add({
        type: 'attendance_request',
        title: 'New Self-Attendance Request',
        message: `${studentRoll} (${user?.name}) requested day attendance for ${selectedDate}.`,
        classId: currentClassId,
        recipientRole: 'incharge',
        read: false,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });

      // Update local state to show 'Pending' immediately on student card
      const curRecord = history[activeDayKey] || { isHoliday: false, attendance: {} };
      setHistory({
        ...history,
        [activeDayKey]: {
          ...curRecord,
          attendance: {
            ...(curRecord.attendance || {}),
            [studentRoll]: 'Pending'
          }
        }
      });

      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err) {
      console.error("Self attendance request error:", err);
      setError(err.message || 'Failed to submit request');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ padding: '1.5rem' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--card-border)', paddingBottom: '0.85rem', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Clock size={20} color="var(--primary)" />
            <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              Request Self-Attendance
            </h2>
          </div>
          <button className="btn btn-outline btn-sm" onClick={onClose} style={{ padding: '0.3rem' }}>
            <X size={16} />
          </button>
        </div>

        {error && (
          <div style={{ background: 'var(--danger-bg)', border: '1px solid var(--danger-border)', color: 'var(--danger)', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-sm)', marginBottom: '1rem', fontSize: '0.85rem' }}>
            {error}
          </div>
        )}

        {success ? (
          <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
            <CheckCircle2 size={42} color="var(--success)" style={{ margin: '0 auto 0.75rem auto' }} />
            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              Request Submitted Successfully!
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
              Your Class Incharge has been notified. Attendance will be marked present upon approval.
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--card-border)', marginBottom: '1.25rem', fontSize: '0.85rem' }}>
              <div><strong>Class:</strong> {currentClassId}</div>
              <div style={{ marginTop: '0.25rem' }}><strong>Date:</strong> {selectedDate} (Day Attendance)</div>
              <div style={{ marginTop: '0.25rem' }}><strong>Student Roll:</strong> {studentRoll} ({user?.name})</div>
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                Reason / Note (Optional)
              </label>
              <textarea
                rows={3}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g. Attending placement interview / Lab session / Medical leave"
                style={{ width: '100%', resize: 'none' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', borderTop: '1px solid var(--card-border)', paddingTop: '1rem' }}>
              <button type="button" className="btn btn-outline" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                <Send size={16} />
                <span>{submitting ? 'Sending Request...' : 'Submit Request'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default SelfAttendanceModal;
