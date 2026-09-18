import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, db, firebase } from '../firebase';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const cached = localStorage.getItem('authUser');
      if (cached) return JSON.parse(cached);
    } catch {}
    // Default to active Faculty session so dashboard and previous data show immediately
    return {
      uid: 'faculty-default',
      name: 'Faculty Member',
      email: 'faculty@mrcet.ac.in',
      role: 'faculty',
      isApproved: true,
      isClassIncharge: false
    };
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const docSnap = await db.collection('users').doc(firebaseUser.uid).get();
          const data = docSnap.exists ? docSnap.data() : {};
          const role = (data.role || 'student').toLowerCase();
          const isAdmin = role === 'admin' || firebaseUser.email?.toLowerCase() === 'admin@mrcet.edu';
          const isApproved = data.hasOwnProperty('isApproved') ? data.isApproved : isAdmin;

          const updatedUser = {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            name: data.name || firebaseUser.displayName || 'User',
            role: isAdmin ? 'admin' : role,
            year: data.year || null,
            section: data.section || null,
            isApproved: isApproved,
            isClassIncharge: !!data.isClassIncharge || role === 'incharge'
          };

          setUser(updatedUser);
          localStorage.setItem('authUser', JSON.stringify(updatedUser));
        } catch (err) {
          console.error("Error fetching user profile:", err);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const login = async (email, password) => {
    const credential = await auth.signInWithEmailAndPassword(email, password);
    const docSnap = await db.collection('users').doc(credential.user.uid).get();
    const data = docSnap.exists ? docSnap.data() : {};
    const role = (data.role || 'student').toLowerCase();
    const isAdmin = role === 'admin' || credential.user.email?.toLowerCase() === 'admin@mrcet.edu';
    const isApproved = data.hasOwnProperty('isApproved') ? data.isApproved : isAdmin;

    const loggedUser = {
      uid: credential.user.uid,
      email: credential.user.email,
      name: data.name || 'User',
      role: isAdmin ? 'admin' : role,
      year: data.year || null,
      section: data.section || null,
      isApproved: isApproved,
      isClassIncharge: !!data.isClassIncharge || role === 'incharge'
    };

    setUser(loggedUser);
    localStorage.setItem('authUser', JSON.stringify(loggedUser));
    return loggedUser;
  };

  const register = async (name, email, password, role, year, section) => {
    const credential = await auth.createUserWithEmailAndPassword(email, password);
    const newUser = credential.user;
    const isAdmin = email.toLowerCase() === 'admin@mrcet.edu';
    const finalRole = isAdmin ? 'admin' : role;
    const isApproved = isAdmin; // Auto-approve admin, others need approval

    const userRecord = {
      name,
      email,
      role: finalRole,
      year: (isAdmin || finalRole === 'faculty') ? null : year,
      section: (isAdmin || finalRole === 'faculty') ? null : section,
      isApproved,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    };

    await db.collection('users').doc(newUser.uid).set(userRecord);

    const createdUser = {
      uid: newUser.uid,
      ...userRecord
    };

    setUser(createdUser);
    localStorage.setItem('authUser', JSON.stringify(createdUser));
    return createdUser;
  };

  const logout = async () => {
    await auth.signOut();
    setUser(null);
    localStorage.removeItem('authUser');
  };

  const resetPassword = async (email) => {
    await auth.sendPasswordResetEmail(email);
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    resetPassword,
    isAdmin: user?.role === 'admin',
    isHod: user?.role === 'hod' || user?.role === 'admin',
    isFaculty: user?.role === 'faculty' || user?.role === 'admin',
    isIncharge: user?.isClassIncharge || user?.role === 'incharge' || user?.role === 'admin',
    isStudent: user?.role === 'student'
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
