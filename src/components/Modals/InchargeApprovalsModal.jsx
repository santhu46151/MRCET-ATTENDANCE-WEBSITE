import React, { useState } from 'react';
import { db, firebase } from '../../firebase';
import { useAuth } from '../../context/AuthContext';
import { useAttendance } from '../../context/AttendanceContext';
import { UserCheck, CheckCircle2, XCircle, Clock, X, AlertCircle } from 'lucide-react';

const InchargeApprovalsModal = ({ onClose }) => {
  const { user } = useAuth();
  const { inchargeRequests, currentClassId, history, setHistory } = useAttendance();
  const [processingId, setProcessingId] = useState(null);
  const [feedback, setFeedback] = useState('');

  const handleApprove = async (req) => {
    setProcessingId(req.id);
    try {
      // 1. Update request status to Approved in Firestore
      await db.collection('attendance_requests').doc(req.id).update({
        status: 'Approved',
        reviewedBy: user?.email || 'Incharge',
        reviewedAt: firebase.firestore.FieldValue.serverTimestamp()
      });

      // 2. Immediately update period attendance in history so it counts as Present
      const targetPeriod = req.period || '1';
      const targetDate = req.date;
      const periodKey = `${currentClassId}_${targetDate}_P${targetPeriod}`;

      const curRecord = history[periodKey] || { isHoliday: false, attendance: {} };
      const updatedMap = {
        ...(curRecord.attendance || {}),
        [req.rollNo]: 'Approved'
      };

      const updatedHistory = {
        ...history,
        [periodKey]: {
          ...curRecord,
          isHoliday: false,
          attendance: updatedMap,
          timestamp: Date.now()
        }
      };

      setHistory(updatedHistory);

      await db.collection('classes').doc(currentClassId).set({
        history: updatedHistory,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      }, { merge: true });

      setFeedback(`Approved request for ${req.rollNo}`);
      setTimeout(() => setFeedback(''), 3000);
    } catch (err) {
      console.error("Error approving request:", err);
      alert("Error approving request: " + err.message);
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (req) => {
    setProcessingId(req.id);
    try {
      await db.collection('attendance_requests').doc(req.id).update({
        status: 'Rejected',
        reviewedBy: user?.email || 'Incharge',
        reviewedAt: firebase.firestore.FieldValue.serverTimestamp()
      });

      setFeedback(`Rejected request for ${req.rollNo}`);
      setTimeout(() => setFeedback(''), 3000);
    } catch (err) {
      console.error("Error rejecting request:", err);
      alert("Error rejecting request: " + err.message);
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ padding: '1.5rem', maxWidth: '680px' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--card-border)', paddingBottom: '0.85rem', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <UserCheck size={22} color="var(--primary)" />
            <div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                Class Incharge Approvals
              </h2>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Review pending self-attendance requests for {currentClassId}
              </p>
            </div>
          </div>
          <button className="btn btn-outline btn-sm" onClick={onClose} style={{ padding: '0.3rem' }}>
            <X size={16} />
          </button>
        </div>

        {feedback && (
          <div style={{ background: 'var(--success-bg)', border: '1px solid var(--success-border)', color: 'var(--success)', padding: '0.6rem 0.85rem', borderRadius: 'var(--radius-sm)', marginBottom: '1rem', fontSize: '0.85rem' }}>
            {feedback}
          </div>
        )}

        {inchargeRequests.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: 'var(--text-muted)' }}>
            <Clock size={36} style={{ margin: '0 auto 0.75rem auto', opacity: 0.5 }} />
            <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              No Pending Requests
            </div>
            <div style={{ fontSize: '0.8rem', marginTop: '0.25rem' }}>
              All self-attendance requests for class {currentClassId} have been reviewed.
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '420px', overflowY: 'auto' }}>
            {inchargeRequests.map((req) => (
              <div
                key={req.id}
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid var(--card-border)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '0.85rem 1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '1rem',
                  flexWrap: 'wrap'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <span style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--primary)' }}>
                      {req.rollNo}
                    </span>
                    <span style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                      {req.name}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                    Date: <strong>{req.date}</strong> | Period: <strong>P{req.period}</strong> ({req.subject || 'General'})
                  </div>
                  {req.reason && (
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.2rem', fontStyle: 'italic' }}>
                      Reason: "{req.reason}"
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <button
                    className="btn btn-success btn-sm"
                    onClick={() => handleApprove(req)}
                    disabled={processingId === req.id}
                    style={{ padding: '0.4rem 0.8rem' }}
                  >
                    <CheckCircle2 size={15} />
                    <span>Approve</span>
                  </button>

                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => handleReject(req)}
                    disabled={processingId === req.id}
                    style={{ padding: '0.4rem 0.8rem' }}
                  >
                    <XCircle size={15} />
                    <span>Reject</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div style={{ marginTop: '1.25rem', paddingTop: '0.85rem', borderTop: '1px solid var(--card-border)', textAlign: 'right' }}>
          <button className="btn btn-outline" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default InchargeApprovalsModal;
