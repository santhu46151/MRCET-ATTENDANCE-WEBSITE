// Authentication state listener and guards
document.addEventListener('DOMContentLoaded', () => {
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  
  auth.onAuthStateChanged((user) => {
    if (!user) {
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
});

// Authentication functions
const authManager = {
  login(email, password) {
    const finalEmail = email.includes('@') ? email : `${email}@attendance.com`;
    return auth.signInWithEmailAndPassword(finalEmail, password);
  },

  register(email, password) {
    const finalEmail = email.includes('@') ? email : `${email}@attendance.com`;
    return auth.createUserWithEmailAndPassword(finalEmail, password);
  },

  logout() {
    return auth.signOut();
  },

  resetPassword(email) {
    const finalEmail = email.includes('@') ? email : `${email}@attendance.com`;
    return auth.sendPasswordResetEmail(finalEmail);
  }
};
