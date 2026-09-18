import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserPlus, User, Mail, Lock, CheckCircle2, AlertCircle, ArrowLeft, GraduationCap, Briefcase, Eye, EyeOff } from 'lucide-react';

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  // Step: 'select_role' or 'form'
  const [step, setStep] = useState('select_role');
  const [role, setRole] = useState('student'); // 'student' or 'faculty'

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [year, setYear] = useState('IV');
  const [section, setSection] = useState('D');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSelectRole = (selectedRole) => {
    setRole(selectedRole);
    setStep('form');
    setError('');
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await register(name.trim(), email.trim(), password, role, year, section);
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      console.error("Registration error:", err);
      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
      <div style={{ maxWidth: '480px', width: '100%' }}>
        
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{ 
            width: '54px', 
            height: '54px', 
            borderRadius: '16px', 
            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(16, 185, 129, 0.2))', 
            border: '1px solid rgba(255, 255, 255, 0.1)',
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            margin: '0 auto 1rem auto' 
          }}>
            <UserPlus size={26} color="var(--primary)" />
          </div>
          <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            {step === 'select_role' ? 'Register Account' : `Create ${role === 'faculty' ? 'Faculty' : 'Student'} Account`}
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            {step === 'select_role' ? 'Select your account type to get started' : 'Enter your details to create an account'}
          </p>
        </div>

        <div className="glass-panel" style={{ padding: '2rem 1.75rem' }}>
          
          {error && (
            <div style={{ background: 'var(--danger-bg)', border: '1px solid var(--danger-border)', color: 'var(--danger)', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-sm)', marginBottom: '1.25rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          {success ? (
            <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
              <CheckCircle2 size={48} color="var(--success)" style={{ margin: '0 auto 0.75rem auto' }} />
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                Registration Submitted!
              </h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.5rem', lineHeight: 1.5 }}>
                Your account is pending administrator approval. Once verified by your department, you can sign in with your credentials.
              </p>
              <div style={{ marginTop: '1.25rem' }}>
                <Link to="/login" className="btn btn-primary btn-sm">
                  Go to Login
                </Link>
              </div>
            </div>
          ) : step === 'select_role' ? (
            /* STEP 1: ROLE SELECTION CARDS BEFORE FORM */
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                
                {/* Faculty Card */}
                <div
                  id="role-card-faculty"
                  onClick={() => handleSelectRole('faculty')}
                  style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1.5px solid var(--card-border)',
                    borderRadius: 'var(--radius-md)',
                    padding: '1.5rem 1rem',
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.25s ease',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.75rem'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--primary)';
                    e.currentTarget.style.transform = 'translateY(-3px)';
                    e.currentTarget.style.background = 'rgba(99, 102, 241, 0.08)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--card-border)';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                  }}
                >
                  <div style={{
                    width: '54px',
                    height: '54px',
                    borderRadius: '50%',
                    background: 'rgba(99, 102, 241, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--primary)'
                  }}>
                    <Briefcase size={28} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.2rem' }}>
                      Faculty
                    </h3>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.3 }}>
                      Teachers & Mentors
                    </p>
                  </div>
                </div>

                {/* Student Card */}
                <div
                  id="role-card-student"
                  onClick={() => handleSelectRole('student')}
                  style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1.5px solid var(--card-border)',
                    borderRadius: 'var(--radius-md)',
                    padding: '1.5rem 1rem',
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.25s ease',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.75rem'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--success)';
                    e.currentTarget.style.transform = 'translateY(-3px)';
                    e.currentTarget.style.background = 'rgba(16, 185, 129, 0.08)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--card-border)';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                  }}
                >
                  <div style={{
                    width: '54px',
                    height: '54px',
                    borderRadius: '50%',
                    background: 'rgba(16, 185, 129, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--success)'
                  }}>
                    <GraduationCap size={28} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.2rem' }}>
                      Student
                    </h3>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.3 }}>
                      B.Tech Undergraduates
                    </p>
                  </div>
                </div>

              </div>
            </div>
          ) : (
            /* STEP 2: REGISTRATION FORM WITH ROLE CARDS AT TOP */
            <form onSubmit={handleRegister}>
              
              {/* Back to Role Selection & Role Cards Switcher */}
              <div style={{ marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <button
                    type="button"
                    onClick={() => setStep('select_role')}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--primary)',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      padding: 0
                    }}
                  >
                    <ArrowLeft size={14} />
                    <span>Change Account Type</span>
                  </button>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Role: <strong style={{ color: role === 'faculty' ? 'var(--primary)' : 'var(--success)' }}>{role.toUpperCase()}</strong>
                  </span>
                </div>

                {/* Role Switcher Cards placed before inputs */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem' }}>
                  <div
                    onClick={() => setRole('faculty')}
                    style={{
                      padding: '0.65rem 0.85rem',
                      borderRadius: 'var(--radius-sm)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.6rem',
                      border: role === 'faculty' ? '1.5px solid var(--primary)' : '1px solid var(--card-border)',
                      background: role === 'faculty' ? 'rgba(99, 102, 241, 0.12)' : 'rgba(255, 255, 255, 0.02)',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <Briefcase size={18} color={role === 'faculty' ? 'var(--primary)' : 'var(--text-muted)'} />
                    <span style={{ fontSize: '0.85rem', fontWeight: role === 'faculty' ? 700 : 500, color: role === 'faculty' ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                      Faculty
                    </span>
                  </div>

                  <div
                    onClick={() => setRole('student')}
                    style={{
                      padding: '0.65rem 0.85rem',
                      borderRadius: 'var(--radius-sm)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.6rem',
                      border: role === 'student' ? '1.5px solid var(--success)' : '1px solid var(--card-border)',
                      background: role === 'student' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(255, 255, 255, 0.02)',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <GraduationCap size={18} color={role === 'student' ? 'var(--success)' : 'var(--text-muted)'} />
                    <span style={{ fontSize: '0.85rem', fontWeight: role === 'student' ? 700 : 500, color: role === 'student' ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                      Student
                    </span>
                  </div>
                </div>
              </div>

              {/* Full Name */}
              <div style={{ marginBottom: '1.1rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                  Full Name
                </label>
                <div style={{ position: 'relative' }}>
                  <User size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="text"
                    required
                    placeholder="Enter your full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    style={{ width: '100%', paddingLeft: '36px' }}
                  />
                </div>
              </div>

              {/* Email */}
              <div style={{ marginBottom: '1.1rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                  Email Address
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="email"
                    required
                    placeholder={role === 'faculty' ? 'e.g. faculty@mrcet.ac.in' : 'e.g. 21N31A66xx@mrcet.ac.in'}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{ width: '100%', paddingLeft: '36px' }}
                  />
                </div>
              </div>

              {/* Password */}
              <div style={{ marginBottom: '1.1rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                  Password
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={6}
                    placeholder="At least 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={{ width: '100%', paddingLeft: '36px', paddingRight: '36px' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: 'var(--text-muted)',
                      cursor: 'pointer',
                      padding: 0,
                      display: 'flex',
                      alignItems: 'center'
                    }}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Year & Section (Only for Student) */}
              {role === 'student' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.25rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                      Year
                    </label>
                    <select
                      value={year}
                      onChange={(e) => setYear(e.target.value)}
                      style={{ width: '100%' }}
                    >
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
                    <select
                      value={section}
                      onChange={(e) => setSection(e.target.value)}
                      style={{ width: '100%' }}
                    >
                      <option value="A">Section A</option>
                      <option value="B">Section B</option>
                      <option value="C">Section C</option>
                      <option value="D">Section D</option>
                    </select>
                  </div>
                </div>
              )}

              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
                style={{ width: '100%', padding: '0.75rem', fontSize: '0.95rem', marginTop: '0.5rem' }}
              >
                <UserPlus size={18} />
                <span>{loading ? 'Submitting Registration...' : `Create ${role === 'faculty' ? 'Faculty' : 'Student'} Account`}</span>
              </button>
            </form>
          )}

          <div style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 700, textDecoration: 'none' }}>
              Sign In
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Register;
