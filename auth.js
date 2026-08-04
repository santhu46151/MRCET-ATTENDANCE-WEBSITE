// Local server endpoint URI
const API_BASE_URL = window.location.origin.includes('file://') || window.location.origin.includes(':5500')
  ? 'http://localhost:3000' 
  : window.location.origin;

// Authentication state listener and guards
document.addEventListener('DOMContentLoaded', () => {
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  const token = localStorage.getItem('auth_token');
  
  if (!token) {
    // User is not logged in
    if (currentPage !== 'login.html') {
      window.location.href = 'login.html';
    }
  } else {
    // User is logged in
    if (currentPage === 'login.html') {
      window.location.href = 'index.html';
    }
  }
});

// Authentication functions calling local REST endpoints
const authManager = {
  async login(email, password) {
    const finalEmail = email.includes('@') ? email : `${email}@attendance.com`;
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: finalEmail, password })
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Login failed.');
    }
    localStorage.setItem('auth_token', data.token);
    localStorage.setItem('auth_uid', data.uid);
    localStorage.setItem('auth_email', data.email);
    return data;
  },

  async register(email, password) {
    const finalEmail = email.includes('@') ? email : `${email}@attendance.com`;
    const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: finalEmail, password })
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Registration failed.');
    }
    return data;
  },

  logout() {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_uid');
    localStorage.removeItem('auth_email');
    window.location.href = 'login.html';
  }
};
