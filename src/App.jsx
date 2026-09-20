import React, { Suspense, lazy } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AttendanceProvider } from './context/AttendanceContext';

const Dashboard = lazy(() => import('./pages/Dashboard'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const AdminPortal = lazy(() => import('./pages/AdminPortal'));
const HodPortal = lazy(() => import('./pages/HodPortal'));
const SubjectReport = lazy(() => import('./pages/SubjectReport'));
const WeeklyReport = lazy(() => import('./pages/WeeklyReport'));
const MonthlyReport = lazy(() => import('./pages/MonthlyReport'));
const SemesterReport = lazy(() => import('./pages/SemesterReport'));

const PageLoader = () => (
  <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-primary)' }}>
    <div style={{ textAlign: 'center' }}>
      <div style={{ width: '40px', height: '40px', border: '3px solid rgba(99, 102, 241, 0.2)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 1rem auto' }} />
      <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Loading...</div>
    </div>
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
  </div>
);


// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '40px', height: '40px', border: '3px solid rgba(99, 102, 241, 0.2)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 1rem auto' }} />
          <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>Loading MRCET Portal...</div>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== 'admin' && user.isApproved === false) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem', background: 'var(--bg-primary)' }}>
        <div className="glass-panel" style={{ maxWidth: '440px', width: '100%', padding: '2rem', textAlign: 'center' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--warning-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto', color: 'var(--warning)', fontWeight: 800, fontSize: '1.5rem' }}>
            !
          </div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            Account Pending Approval
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.5rem', lineHeight: 1.5 }}>
            Hello {user.name}, your account registration has been submitted and is awaiting administrator verification.
          </p>
          <div style={{ marginTop: '1.5rem' }}>
            <button
              className="btn btn-outline btn-sm"
              onClick={() => {
                localStorage.removeItem('authUser');
                window.location.reload();
              }}
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    );
  }

  return children;
};

function App() {
  return (
    <AuthProvider>
      <AttendanceProvider>
        <Router>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              <Route path="/" element={<Dashboard />} />
              <Route path="/reports/subject" element={<SubjectReport />} />
              <Route path="/reports/weekly" element={<WeeklyReport />} />
              <Route path="/reports/monthly" element={<MonthlyReport />} />
              <Route path="/reports/semester" element={<SemesterReport />} />

              <Route
                path="/hod"
                element={
                  <ProtectedRoute>
                    <HodPortal />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/admin"
                element={
                  <ProtectedRoute>
                    <AdminPortal />
                  </ProtectedRoute>
                }
              />

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </Router>
      </AttendanceProvider>
    </AuthProvider>
  );
}

export default App;
