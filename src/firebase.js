import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyANy4cq2ihUNyYpdM5-dK-eziGkAIhFiM0",
  authDomain: "mrcet-attendance.firebaseapp.com",
  projectId: "mrcet-attendance",
  storageBucket: "mrcet-attendance.firebasestorage.app",
  messagingSenderId: "620619379687",
  appId: "1:620619379687:web:9febc462a7ee9fde8c8342",
  measurementId: "G-26X65RKPTP"
};

// Initialize Primary Firebase App
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

// Initialize Secondary App for Admin User Creation (prevents logging out current user)
let secondaryApp;
const apps = firebase.apps;
for (let i = 0; i < apps.length; i++) {
  if (apps[i].name === 'AdminApp') {
    secondaryApp = apps[i];
  }
}
if (!secondaryApp) {
  secondaryApp = firebase.initializeApp(firebaseConfig, 'AdminApp');
}

export const db = firebase.firestore();

try {
  db.enablePersistence().catch((err) => {
    if (err.code === 'failed-precondition') {
      console.warn("Multiple tabs open, offline persistence can only be enabled in one tab at a time.");
    } else if (err.code === 'unimplemented') {
      console.warn("Browser does not support all features required for persistence");
    }
  });
} catch (e) {
  console.warn("Firestore persistence warning:", e);
}

export const auth = firebase.auth();
export const adminAuth = secondaryApp.auth();
export { firebase };
export default firebase;
