let currentUserId = null;
let isMigrating = false;

auth.onAuthStateChanged((user) => {
  if (user) {
    currentUserId = user.uid;
    initializeSync(user.uid);
  } else {
    currentUserId = null;
  }
});

async function initializeSync(uid) {
  if (isMigrating) return;
  const userDocRef = db.collection('users').doc(uid);

  try {
    const docSnap = await userDocRef.get();
    
    // Check if cloud document exists. If not, import legacy LocalStorage records
    if (!docSnap.exists) {
      isMigrating = true;
      console.log("Seeding Cloud Firestore with existing local database...");
      
      const localRoster = localStorage.getItem('attendance_roster');
      const localHistory = localStorage.getItem('attendance_history');
      
      const rosterData = localRoster ? JSON.parse(localRoster) : [];
      const historyData = localHistory ? JSON.parse(localHistory) : {};

      await userDocRef.set({
        roster: rosterData,
        history: historyData,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      
      console.log("Migration complete!");
      isMigrating = false;
    }
  } catch (err) {
    console.error("Error during database initialization:", err);
  }

  // Setup real-time listener using onSnapshot
  userDocRef.onSnapshot((docSnap) => {
    if (docSnap.exists) {
      const data = docSnap.data();
      if (data.roster) {
        window.roster = data.roster;
      }
      if (data.history) {
        window.attendanceHistory = data.history;
      }

      // Automatically refresh the DOM
      if (typeof window.updateUI === 'function') {
        window.updateUI();
      }
    }
  }, (err) => {
    console.error("onSnapshot error:", err);
  });
}

// Global upload helper called whenever client state is modified
window.uploadStateToCloud = function(updatedRoster, updatedHistory) {
  if (!currentUserId) return;

  db.collection('users').doc(currentUserId).set({
    roster: updatedRoster,
    history: updatedHistory,
    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
  }, { merge: true }).catch((err) => {
    console.error("Sync to Cloud failed:", err);
  });
};
