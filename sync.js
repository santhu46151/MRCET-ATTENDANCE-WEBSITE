document.addEventListener('DOMContentLoaded', () => {
  const syncDot = document.getElementById('sync-dot');

  // Firebase auth listener to load data once logged in
  auth.onAuthStateChanged(async (user) => {
    if (user) {
      if (syncDot) {
        syncDot.style.backgroundColor = '#f59e0b'; // yellow (syncing)
        syncDot.title = 'Syncing data from Cloud...';
      }

      try {
        const docRef = db.collection('attendance').doc(user.uid);
        const docSnap = await docRef.get();

        if (docSnap.exists) {
          const data = docSnap.data();
          
          if (data.roster && data.roster.length > 0) {
            localStorage.setItem('attendance_roster', JSON.stringify(data.roster));
            // Reload page to apply fetched data into app.js state
            if (!sessionStorage.getItem('dataFetched')) {
              sessionStorage.setItem('dataFetched', 'true');
              window.location.reload();
            }
          }
          
          if (data.history) {
            localStorage.setItem('attendance_history', JSON.stringify(data.history));
            if (!sessionStorage.getItem('dataFetched')) {
              sessionStorage.setItem('dataFetched', 'true');
              window.location.reload();
            }
          }
        }
        
        if (syncDot) {
          syncDot.style.backgroundColor = '#10b981'; // green (synced)
          syncDot.title = 'Cloud Sync Active';
        }
      } catch (error) {
        console.error("Error fetching data from Firestore:", error);
        if (syncDot) {
          syncDot.style.backgroundColor = '#ef4444'; // red (error)
          syncDot.title = 'Sync Error';
        }
      }
    }
  });

  // Function to upload data to Cloud Firestore, called from app.js
  window.uploadStateToCloud = async (roster, history) => {
    const user = auth.currentUser;
    if (!user) return;

    if (syncDot) syncDot.style.backgroundColor = '#f59e0b'; // syncing

    try {
      await db.collection('attendance').doc(user.uid).set({
        roster: roster,
        history: history,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      }, { merge: true });

      if (syncDot) syncDot.style.backgroundColor = '#10b981'; // synced
    } catch (error) {
      console.error("Error uploading to Firestore:", error);
      if (syncDot) syncDot.style.backgroundColor = '#ef4444'; // error
    }
  };
});
