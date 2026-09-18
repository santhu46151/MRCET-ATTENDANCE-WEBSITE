import React, { useState, useEffect } from 'react';
import { db, firebase } from '../../firebase';
import { useAuth } from '../../context/AuthContext';
import { useAttendance } from '../../context/AttendanceContext';
import { User, X, Save, AlertCircle } from 'lucide-react';

const EditStudentModal = ({ student, onClose }) => {
  const { user } = useAuth();
  const { currentClassId, roster, setRoster } = useAttendance();

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    fatherName: '',
    fatherPhone: ''
  });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (student) {
      setFormData({
        name: student.name || '',
        phone: student.phone || '',
        fatherName: student.fatherName || '',
        fatherPhone: student.fatherPhone || ''
      });
    }
  }, [student]);

  if (!student) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setError('');

    try {
      // 1. Audit Log Record (Rule 5)
      const auditLog = {
        editorUid: user?.uid || 'anonymous',
        editorName: user?.name || 'Faculty',
        editorRole: user?.role || 'faculty',
        rollNo: student.rollNo,
        classId: currentClassId,
        oldData: {
          name: student.name || '',
          phone: student.phone || '',
          fatherName: student.fatherName || '',
          fatherPhone: student.fatherPhone || ''
        },
        newData: { ...formData },
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
      };

      await db.collection('audit_logs').add(auditLog);

      // 2. Update local and cloud roster
      const updatedRoster = roster.map((s) => {
        if (s.rollNo === student.rollNo) {
          return {
            ...s,
            name: formData.name.trim().toUpperCase(),
            phone: formData.phone.trim(),
            fatherName: formData.fatherName.trim().toUpperCase(),
            fatherPhone: formData.fatherPhone.trim()
          };
        }
        return s;
      });

      setRoster(updatedRoster);

      await db.collection('classes').doc(currentClassId).set({
        roster: updatedRoster,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      }, { merge: true });

      onClose();
    } catch (err) {
      console.error("Error updating student:", err);
      setError(err.message || 'Failed to update student details');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ padding: '1.5rem' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--card-border)', paddingBottom: '0.85rem', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <User size={20} color="var(--primary)" />
            <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              Edit Student Details
            </h2>
          </div>
          <button className="btn btn-outline btn-sm" onClick={onClose} style={{ padding: '0.3rem' }}>
            <X size={16} />
          </button>
        </div>

        {error && (
          <div style={{ background: 'var(--danger-bg)', border: '1px solid var(--danger-border)', color: 'var(--danger)', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-sm)', marginBottom: '1rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Roll Number (Locked unique key) */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
              Roll Number (Permanent Identifier)
            </label>
            <input
              type="text"
              value={student.rollNo}
              disabled
              style={{ width: '100%', opacity: 0.7, cursor: 'not-allowed', background: 'rgba(255, 255, 255, 0.04)' }}
            />
          </div>

          {/* Student Name */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
              Student Name
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              style={{ width: '100%' }}
            />
          </div>

          {/* Student Phone */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
              Student Mobile Number
            </label>
            <input
              type="text"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="e.g. 9876543210"
              style={{ width: '100%' }}
            />
          </div>

          {/* Father Name */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
              Father / Guardian Name
            </label>
            <input
              type="text"
              value={formData.fatherName}
              onChange={(e) => setFormData({ ...formData, fatherName: e.target.value })}
              style={{ width: '100%' }}
            />
          </div>

          {/* Father Phone */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
              Father / Guardian Mobile Number
            </label>
            <input
              type="text"
              value={formData.fatherPhone}
              onChange={(e) => setFormData({ ...formData, fatherPhone: e.target.value })}
              placeholder="e.g. 9876543210"
              style={{ width: '100%' }}
            />
          </div>

          {/* Footer Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', borderTop: '1px solid var(--card-border)', paddingTop: '1rem' }}>
            <button type="button" className="btn btn-outline" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={isSaving}>
              <Save size={16} />
              <span>{isSaving ? 'Saving & Auditing...' : 'Save Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditStudentModal;
