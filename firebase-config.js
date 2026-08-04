const firebaseConfig = {
  apiKey: "AIzaSyChtJ1nQwheRULgTagF-YSKeVGNqPltYdY",
  authDomain: "mrcet-attendance-project.firebaseapp.com",
  projectId: "mrcet-attendance-project",
  storageBucket: "mrcet-attendance-project.firebasestorage.app",
  messagingSenderId: "892244706396",
  appId: "1:892244706396:web:d1ca51d29d0c98925f1299",
  measurementId: "G-E1YLKQQ092"
};

// Initialize Firebase
if (firebase.apps.length === 0) {
  firebase.initializeApp(firebaseConfig);
}
const auth = firebase.auth();
const db = firebase.firestore();
