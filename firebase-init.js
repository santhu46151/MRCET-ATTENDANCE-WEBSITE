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
window.auth = firebase.auth();
