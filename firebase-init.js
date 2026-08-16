// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyANy4cq2ihUNyYpdM5-dK-eziGkAIhFiM0",
  authDomain: "mrcet-attendance.firebaseapp.com",
  projectId: "mrcet-attendance",
  storageBucket: "mrcet-attendance.firebasestorage.app",
  messagingSenderId: "620619379687",
  appId: "1:620619379687:web:9febc462a7ee9fde8c8342",
  measurementId: "G-26X65RKPTP"
};

// Initialize Firebase App
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

// Get instances
window.db = firebase.firestore();

// Enable offline persistence
window.db.enablePersistence()
  .catch((err) => {
      if (err.code == 'failed-precondition') {
          console.warn("Multiple tabs open, offline persistence can only be enabled in one tab at a time.");
      } else if (err.code == 'unimplemented') {
          console.warn("The current browser does not support all of the features required to enable persistence");
      }
  });

window.auth = firebase.auth();
