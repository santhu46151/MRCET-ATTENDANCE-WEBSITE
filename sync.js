document.addEventListener('DOMContentLoaded', () => {
  const syncDot = document.getElementById('sync-dot');
  const classDropdown = document.getElementById('class-dropdown');
  let unsubscribeSnapshot = null;

  // Firebase auth listener to load data once logged in
  auth.onAuthStateChanged(async (user) => {
    if (user) {
      if (syncDot) {
        syncDot.style.backgroundColor = '#f59e0b'; // yellow (syncing)
        syncDot.title = 'Syncing data from Cloud...';
      }

      try {
        const authUser = authManager.user;
        if (!authUser) return;

        // Fetch available classes
        const classesSnapshot = await db.collection('classes').get();
        if (!classesSnapshot.empty && classDropdown) {
            classDropdown.innerHTML = '';
            
            // If student, only show their class. If faculty/admin, show all.
            const isRestricted = authUser.role === 'student';
            const userClassId = (authUser.year && authUser.section) ? `${authUser.year}_${authUser.section}` : null;
            
            classesSnapshot.forEach(doc => {
                const data = doc.data();
                const classId = doc.id;
                
                if (isRestricted && classId !== userClassId) return; // Skip if restricted
                
                const option = document.createElement('option');
                option.value = classId;
                option.textContent = `${data.year} ${data.section}`;
                classDropdown.appendChild(option);
            });
            
            // Set initial selected value
            if (userClassId && !classDropdown.querySelector(`option[value="${userClassId}"]`)) {
                // Failsafe if user's class doesn't exist yet
                const opt = document.createElement('option');
                opt.value = userClassId;
                opt.textContent = `${authUser.year} ${authUser.section} (Not Found)`;
                classDropdown.appendChild(opt);
                classDropdown.value = userClassId;
            } else if (userClassId) {
                classDropdown.value = userClassId;
            } else if (classDropdown.options.length > 0) {
                classDropdown.value = classDropdown.options[0].value;
            }

            // Show dropdown for faculty/admin, or if it has options
            if (classDropdown.options.length > 1 || authUser.role !== 'student') {
                classDropdown.style.display = 'inline-block';
            }
        }

        window.currentClassId = classDropdown ? classDropdown.value : null;

        // Function to bind snapshot listener
        const bindSnapshot = (classId) => {
            if (unsubscribeSnapshot) unsubscribeSnapshot();
            
            if (!classId) return;
            
            if (syncDot) {
                syncDot.style.backgroundColor = '#f59e0b';
                syncDot.title = 'Switching class...';
            }

            const docRef = db.collection('classes').doc(classId);
            unsubscribeSnapshot = docRef.onSnapshot((doc) => {
                if (doc.exists) {
                    const data = doc.data();
                    if (typeof window.applyRemoteState === 'function') {
                        // Pass the className to app.js
                        window.applyRemoteState(data.roster, data.history || {}, `${data.year} ${data.section}`);
                    }
                    if (syncDot) {
                        syncDot.style.backgroundColor = '#10b981';
                        syncDot.title = 'Cloud Sync Active (Live)';
                    }
                } else {
                    if (syncDot) {
                        syncDot.style.backgroundColor = '#ef4444';
                        syncDot.title = 'Class data not found in cloud';
                    }
                }
            }, (error) => {
                console.error("Error listening to class data:", error);
                if (syncDot) syncDot.style.backgroundColor = '#ef4444';
            });
        };

        // Listen for dropdown changes
        if (classDropdown) {
            classDropdown.addEventListener('change', (e) => {
                window.currentClassId = e.target.value;
                bindSnapshot(window.currentClassId);
            });
        }

        // Initial bind
        bindSnapshot(window.currentClassId);

      } catch (error) {
        console.error("Error setting up Firestore listener:", error);
      }
    } else {
        if (unsubscribeSnapshot) {
            unsubscribeSnapshot();
            unsubscribeSnapshot = null;
        }
    }
  });

  // Function to upload data to Cloud Firestore, called from app.js
  window.uploadStateToCloud = async (roster, history) => {
    const user = auth.currentUser;
    if (!user || !window.currentClassId) return;

    if (syncDot) syncDot.style.backgroundColor = '#f59e0b'; // syncing

    try {
      await db.collection('classes').doc(window.currentClassId).set({
        roster: roster,
        history: history,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      }, { merge: true });

      // Note: syncDot turns green again via onSnapshot listener automatically
    } catch (error) {
      console.error("Error uploading to Firestore:", error);
      if (syncDot) syncDot.style.backgroundColor = '#ef4444'; // error
    }
  };
});
