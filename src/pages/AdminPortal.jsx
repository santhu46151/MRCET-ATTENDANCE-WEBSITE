import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { db, firebase } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { 
  Shield, 
  Users, 
  Calendar, 
  Upload, 
  Check, 
  Trash2, 
  ArrowLeft, 
  Plus, 
  FileSpreadsheet,
  AlertCircle,
  Clock
} from 'lucide-react';

const AdminPortal = () => {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  // Redirect non-admin
  useEffect(() => {
    if (!isAdmin) {
      alert("Access Denied: Admin privileges required.");
      navigate('/');
    }
  }, [isAdmin, navigate]);

  // Tab navigation
  const [activeTab, setActiveTab] = useState('approvals'); // 'approvals' | 'classes' | 'timetables' | 'holidays'

  // 1. Pending user approvals
  const [pendingUsers, setPendingUsers] = useState([]);
  useEffect(() => {
    const unsub = db.collection('users').where('isApproved', '==', false).onSnapshot((snap) => {
      const list = [];
      snap.forEach((doc) => list.push({ id: doc.id, ...doc.data() }));
      setPendingUsers(list);
    });
    return () => unsub();
  }, []);

  const handleApproveUser = async (id) => {
    try {
      await db.collection('users').doc(id).update({ isApproved: true });
    } catch (err) {
      alert("Error approving user: " + err.message);
    }
  };

  const handleRejectUser = async (id) => {
    if (!window.confirm("Are you sure you want to reject and delete this registration?")) return;
    try {
      await db.collection('users').doc(id).delete();
    } catch (err) {
      alert("Error rejecting user: " + err.message);
    }
  };

  // 2. Class creation & CSV upload
  const [classYear, setClassYear] = useState('IV');
  const [classSection, setClassSection] = useState('D');
  const [department, setDepartment] = useState('DS');
  const [csvFile, setCsvFile] = useState(null);
  const [isUploadingClass, setIsUploadingClass] = useState(false);

  const handleUploadClass = async () => {
    if (!classYear || !classSection || !csvFile) {
      alert("Please specify Year, Section, and choose a CSV file.");
      return;
    }

    setIsUploadingClass(true);
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const text = e.target.result;
        const lines = text.split('\n');
        const roster = [];

        for (let i = 1; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line) continue;
          const parts = line.split(',');
          if (parts.length >= 2) {
            roster.push({
              rollNo: parts[0]?.trim() || '',
              name: parts[1]?.trim().toUpperCase() || '',
              phone: parts[2]?.trim() || '',
              fatherName: parts[3]?.trim().toUpperCase() || '',
              fatherPhone: parts[4]?.trim() || '',
              status: 'present'
            });
          }
        }

        if (roster.length === 0) {
          alert("No valid rows found in CSV file.");
          setIsUploadingClass(false);
          return;
        }

        const classId = `${classYear}_${classSection}`;
        await db.collection('classes').doc(classId).set({
          year: classYear,
          section: classSection,
          department: department,
          branch: 'CSE',
          roster: roster,
          updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        }, { merge: true });

        alert(`Class ${classId} created/updated successfully with ${roster.length} students!`);
        setCsvFile(null);
      } catch (err) {
        alert("Error uploading class: " + err.message);
      } finally {
        setIsUploadingClass(false);
      }
    };
    reader.readAsText(csvFile);
  };

  // 3. Holidays management
  const [holidaysList, setHolidaysList] = useState([]);
  const [holidayDate, setHolidayDate] = useState('');
  const [holidayReason, setHolidayReason] = useState('');

  useEffect(() => {
    const unsub = db.collection('holidays').onSnapshot((snap) => {
      const list = [];
      snap.forEach((doc) => list.push({ id: doc.id, ...doc.data() }));
      setHolidaysList(list);
    });
    return () => unsub();
  }, []);

  const handleAddHoliday = async (e) => {
    e.preventDefault();
    if (!holidayDate) return;
    try {
      await db.collection('holidays').add({
        date: holidayDate,
        reason: holidayReason || 'General Holiday',
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      setHolidayDate('');
      setHolidayReason('');
    } catch (err) {
      alert("Error adding holiday: " + err.message);
    }
  };

  const handleDeleteHoliday = async (id) => {
    if (!window.confirm("Remove this holiday?")) return;
    try {
      await db.collection('holidays').doc(id).delete();
    } catch (err) {
      alert("Error removing holiday: " + err.message);
    }
  };

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '1.25rem' }}>
      
      {/* Top Header */}
      <header className="glass-panel" style={{ padding: '1rem 1.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Link to="/" className="btn btn-outline btn-sm">
            <ArrowLeft size={16} />
            <span>Dashboard</span>
          </Link>
          <div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Shield size={22} color="var(--primary)" />
              MRCET Admin Command Center
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Logged in as {user?.email} (System Administrator)
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <Link to="/reports/subject" className="btn btn-outline btn-sm">
            <FileSpreadsheet size={15} />
            <span>Subject Register</span>
          </Link>
          <Link to="/hod" className="btn btn-outline btn-sm">
            HOD Portal
          </Link>
        </div>
      </header>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.6rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <button
          className={`btn ${activeTab === 'approvals' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setActiveTab('approvals')}
        >
          <Users size={16} />
          <span>User Approvals ({pendingUsers.length})</span>
        </button>

        <button
          className={`btn ${activeTab === 'classes' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setActiveTab('classes')}
        >
          <Upload size={16} />
          <span>Class Roster Upload</span>
        </button>

        <button
          className={`btn ${activeTab === 'holidays' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setActiveTab('holidays')}
        >
          <Calendar size={16} />
          <span>Holiday Calendar ({holidaysList.length})</span>
        </button>
      </div>

      {/* Tab 1: User Approvals */}
      {activeTab === 'approvals' && (
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '1rem', color: 'var(--text-primary)' }}>
            Pending User Registrations
          </h2>

          {pendingUsers.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              No pending registrations. All user accounts have been approved.
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--card-border)', textAlign: 'left', color: 'var(--text-muted)' }}>
                    <th style={{ padding: '0.65rem' }}>Name</th>
                    <th style={{ padding: '0.65rem' }}>Email</th>
                    <th style={{ padding: '0.65rem' }}>Role</th>
                    <th style={{ padding: '0.65rem' }}>Class / Section</th>
                    <th style={{ padding: '0.65rem', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingUsers.map((u) => (
                    <tr key={u.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                      <td style={{ padding: '0.75rem 0.65rem', fontWeight: 700 }}>{u.name || 'Unknown'}</td>
                      <td style={{ padding: '0.75rem 0.65rem', color: 'var(--text-secondary)' }}>{u.email}</td>
                      <td style={{ padding: '0.75rem 0.65rem' }}>
                        <span className="badge badge-primary">{u.role}</span>
                      </td>
                      <td style={{ padding: '0.75rem 0.65rem' }}>
                        {u.year ? `${u.year} - ${u.section}` : 'N/A'}
                      </td>
                      <td style={{ padding: '0.75rem 0.65rem', textAlign: 'right' }}>
                        <button
                          className="btn btn-success btn-sm"
                          onClick={() => handleApproveUser(u.id)}
                          style={{ marginRight: '0.4rem' }}
                        >
                          <Check size={14} />
                          <span>Approve</span>
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleRejectUser(u.id)}
                        >
                          <Trash2 size={14} />
                          <span>Reject</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Class Roster Upload */}
      {activeTab === 'classes' && (
        <div className="glass-panel" style={{ padding: '1.5rem', maxWidth: '650px' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
            Upload / Create Class Roster
          </h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
            Upload a CSV file containing student roster details for a specific section.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                Year
              </label>
              <select value={classYear} onChange={(e) => setClassYear(e.target.value)} style={{ width: '100%' }}>
                <option value="I">I Year</option>
                <option value="II">II Year</option>
                <option value="III">III Year</option>
                <option value="IV">IV Year</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                Section
              </label>
              <select value={classSection} onChange={(e) => setClassSection(e.target.value)} style={{ width: '100%' }}>
                <option value="A">Section A</option>
                <option value="B">Section B</option>
                <option value="C">Section C</option>
                <option value="D">Section D</option>
              </select>
            </div>
          </div>

          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
              Select Student Roster CSV File
            </label>
            <input
              type="file"
              accept=".csv"
              onChange={(e) => setCsvFile(e.target.files[0])}
              style={{ width: '100%', padding: '0.5rem', background: 'rgba(255, 255, 255, 0.04)' }}
            />
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
              Format: RollNo, StudentName, StudentPhone, FatherName, FatherPhone
            </div>
          </div>

          <button
            className="btn btn-primary"
            onClick={handleUploadClass}
            disabled={isUploadingClass}
            style={{ width: '100%', padding: '0.7rem' }}
          >
            <Upload size={16} />
            <span>{isUploadingClass ? 'Parsing & Saving Roster...' : 'Save Class Roster'}</span>
          </button>
        </div>
      )}

      {/* Tab 3: Holiday Calendar */}
      {activeTab === 'holidays' && (
        <div style={{ display: 'grid', gridTemplateColumns: '350px 1fr', gap: '1.25rem' }}>
          
          <div className="glass-panel" style={{ padding: '1.5rem', height: 'fit-content' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '1rem', color: 'var(--text-primary)' }}>
              Add Official Holiday
            </h3>

            <form onSubmit={handleAddHoliday}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                  Holiday Date
                </label>
                <input
                  type="date"
                  required
                  value={holidayDate}
                  onChange={(e) => setHolidayDate(e.target.value)}
                  style={{ width: '100%' }}
                />
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                  Reason / Festival Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Independence Day / Pongal"
                  value={holidayReason}
                  onChange={(e) => setHolidayReason(e.target.value)}
                  style={{ width: '100%' }}
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                <Plus size={16} />
                <span>Add to Academic Calendar</span>
              </button>
            </form>
          </div>

          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '1rem', color: 'var(--text-primary)' }}>
              Registered Holidays
            </h3>

            {holidaysList.length === 0 ? (
              <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                No holidays added to the academic calendar.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {holidaysList.map((h) => (
                  <div
                    key={h.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.65rem 0.85rem',
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid var(--card-border)',
                      borderRadius: 'var(--radius-sm)'
                    }}
                  >
                    <div>
                      <span style={{ fontWeight: 800, fontSize: '0.85rem', color: 'var(--primary)' }}>
                        {h.date}
                      </span>
                      <span style={{ marginLeft: '0.75rem', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                        {h.reason || 'Holiday'}
                      </span>
                    </div>

                    <button
                      className="btn btn-outline btn-sm"
                      onClick={() => handleDeleteHoliday(h.id)}
                      style={{ padding: '0.25rem 0.5rem', color: 'var(--danger)' }}
                      title="Delete holiday"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminPortal;
