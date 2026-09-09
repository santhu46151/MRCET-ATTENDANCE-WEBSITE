document.addEventListener('DOMContentLoaded', () => {
  const syncDot = document.getElementById('sync-dot');
  const classDropdown = document.getElementById('class-dropdown');
  let unsubscribeSnapshot = null;
  let unsubscribeTimetable = null;

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

        // Fetch global holidays
        window.globalHolidays = [];
        db.collection('holidays').onSnapshot(snapshot => {
            window.globalHolidays = [];
            snapshot.forEach(doc => window.globalHolidays.push(doc.data()));
            localStorage.setItem('global_holidays', JSON.stringify(window.globalHolidays));
            // Trigger UI update to show holiday immediately if applicable
            if (typeof window.triggerHolidayUpdate === 'function') {
                window.triggerHolidayUpdate();
            }
        });

        // Standard official classes for all 4 years
        const allYears = ["IV", "III", "II", "I"];
        const allSections = ["A", "B", "C", "D"];
        const standardClasses = [];
        allYears.forEach(y => {
            allSections.forEach(s => {
                standardClasses.push({ id: `${y}_${s}`, label: `${y} Year / Section ${s} (CSE-DS)` });
            });
        });

        // Fetch available classes from Firestore
        const classesSnapshot = await db.collection('classes').get();
        if (classDropdown) {
            classDropdown.innerHTML = '';
            
            const isRestricted = authUser.role === 'student';
            const userClassId = (authUser.year && authUser.section) ? `${authUser.year}_${authUser.section}` : null;
            
            const addedIds = new Set();

            // First add standard classes if not restricted to another class
            standardClasses.forEach(sc => {
                if (isRestricted && sc.id !== userClassId) return;
                const opt = document.createElement('option');
                opt.value = sc.id;
                opt.textContent = sc.label;
                classDropdown.appendChild(opt);
                addedIds.add(sc.id);
            });

            // Also check localStorage custom_timetables for any custom classes
            try {
                const customTt = JSON.parse(localStorage.getItem('custom_timetables') || '{}');
                Object.keys(customTt).forEach(cid => {
                    if (addedIds.has(cid)) return;
                    if (isRestricted && cid !== userClassId) return;
                    const opt = document.createElement('option');
                    opt.value = cid;
                    opt.textContent = customTt[cid].className || `${cid.replace('_', ' ')} (CSE-DS)`;
                    classDropdown.appendChild(opt);
                    addedIds.add(cid);
                });
            } catch(e) {}

            // Then add any custom classes from database
            if (!classesSnapshot.empty) {
                classesSnapshot.forEach(doc => {
                    const data = doc.data();
                    const classId = doc.id;
                    if (addedIds.has(classId)) return;
                    if (isRestricted && classId !== userClassId) return;
                    
                    const option = document.createElement('option');
                    option.value = classId;
                    const branchStr = data.branch || 'CSE';
                    const deptStr = data.department || 'DS';
                    option.textContent = `${data.year}/${branchStr}/${deptStr}/${data.section}`;
                    classDropdown.appendChild(option);
                    addedIds.add(classId);
                });
            }

            // Set initial selected value
            if (userClassId && classDropdown.querySelector(`option[value="${userClassId}"]`)) {
                classDropdown.value = userClassId;
            } else if (localStorage.getItem('current_class_id') && classDropdown.querySelector(`option[value="${localStorage.getItem('current_class_id')}"]`)) {
                classDropdown.value = localStorage.getItem('current_class_id');
            } else if (classDropdown.options.length > 0) {
                classDropdown.value = classDropdown.options[0].value;
            }

            classDropdown.style.display = 'inline-block';
        }

        window.currentClassId = classDropdown ? classDropdown.value : "IV_A";

        // Function to bind snapshot listener
        const bindSnapshot = (classId) => {
            if (unsubscribeSnapshot) unsubscribeSnapshot();
            if (unsubscribeTimetable) unsubscribeTimetable();
            
            if (!classId) return;
            localStorage.setItem('current_class_id', classId);
            
            if (syncDot) {
                syncDot.style.backgroundColor = '#f59e0b';
                syncDot.title = 'Syncing timetable & class data...';
            }

            // 1. Live Timetable Sync for this classId with LocalStorage fallback
            const ttRef = db.collection('timetables').doc(classId);
            unsubscribeTimetable = ttRef.onSnapshot((ttDoc) => {
                let sched = (ttDoc.exists && ttDoc.data().schedule && Object.keys(ttDoc.data().schedule).length > 0) ? ttDoc.data().schedule : null;

                if (!sched) {
                    try {
                        const customTt = JSON.parse(localStorage.getItem('custom_timetables') || '{}');
                        if (customTt[classId] && customTt[classId].schedule && Object.keys(customTt[classId].schedule).length > 0) {
                            sched = customTt[classId].schedule;
                        }
                    } catch (e) {}
                }

                if (!sched && window.OFFICIAL_TIMETABLES && window.OFFICIAL_TIMETABLES[classId]) {
                    sched = window.OFFICIAL_TIMETABLES[classId].schedule;
                }

                window.currentTimetable = sched || {};
                window.currentTimetableClassId = classId;

                if (typeof window.triggerTimetableUpdate === 'function') {
                    window.triggerTimetableUpdate();
                }
            }, (err) => {
                console.warn("Firestore timetable sync error:", err);
                let sched = null;
                try {
                    const customTt = JSON.parse(localStorage.getItem('custom_timetables') || '{}');
                    if (customTt[classId] && customTt[classId].schedule && Object.keys(customTt[classId].schedule).length > 0) {
                        sched = customTt[classId].schedule;
                    }
                } catch (e) {}
                if (!sched && window.OFFICIAL_TIMETABLES && window.OFFICIAL_TIMETABLES[classId]) {
                    sched = window.OFFICIAL_TIMETABLES[classId].schedule;
                }
                window.currentTimetable = sched || {};
                window.currentTimetableClassId = classId;
                if (typeof window.triggerTimetableUpdate === 'function') {
                    window.triggerTimetableUpdate();
                }
            });

            // 2. Class Roster Sync
            const docRef = db.collection('classes').doc(classId);
            unsubscribeSnapshot = docRef.onSnapshot((doc) => {
                if (doc.exists) {
                    const data = doc.data();
                    const branchStr = data.branch || 'CSE';
                    const deptStr = data.department || 'DS';
                    const fullClassName = `${data.year}/${branchStr}/${deptStr}/${data.section}`;
                    localStorage.setItem('current_class_name', fullClassName);
                    localStorage.setItem('current_class_year', data.year || '');
                    localStorage.setItem('current_class_section', data.section || '');
                    localStorage.setItem('current_class_dept', deptStr);
                    localStorage.setItem('current_class_branch', branchStr);

                    if (typeof window.applyRemoteState === 'function') {
                        window.applyRemoteState(data.roster, data.history || {}, fullClassName);
                    }
                    if (syncDot) {
                        syncDot.style.backgroundColor = '#10b981';
                        syncDot.title = 'Cloud Sync Active (Live)';
                    }
                } else {
                    if (syncDot) {
                        syncDot.style.backgroundColor = '#10b981';
                        syncDot.title = 'Timetable Ready (Local Roster)';
                    }
                }
            }, (error) => {
                console.error("Error listening to class data:", error);
            });
        };

        window.switchClass = (classId) => {
            window.currentClassId = classId;
            bindSnapshot(classId);
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
        if (unsubscribeTimetable) {
            unsubscribeTimetable();
            unsubscribeTimetable = null;
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
