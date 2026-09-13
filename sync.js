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

        // Fetch and listen for available classes directly from Firestore
        let unsubscribeClasses = null;

        const populateClassesFromSnapshot = (classesSnapshot) => {
            if (!classDropdown) return;
            classDropdown.innerHTML = '';

            const isRestricted = authUser.role === 'student';
            const userClassId = (authUser.year && authUser.section) ? `${authUser.year}_${authUser.section}` : null;

            const validDocs = [];
            classesSnapshot.forEach(doc => {
                const classId = doc.id;
                if (isRestricted && userClassId && classId !== userClassId) return;
                validDocs.push({ id: classId, data: doc.data() });
            });

            if (validDocs.length === 0) {
                const opt = document.createElement('option');
                opt.value = '';
                opt.disabled = true;
                opt.selected = true;
                opt.textContent = 'No classes available';
                classDropdown.appendChild(opt);
                window.currentClassId = null;
                localStorage.removeItem('current_class_id');
                if (typeof window.applyRemoteState === 'function') {
                    window.applyRemoteState([], {}, '');
                }
                return;
            }

            // Sort classes cleanly by year and section
            validDocs.sort((a, b) => a.id.localeCompare(b.id));

            validDocs.forEach(({ id, data }) => {
                const opt = document.createElement('option');
                opt.value = id;
                const yr = data.year || '';
                const br = data.branch || 'CSE';
                const dp = data.department || 'DS';
                const sec = data.section || '';
                opt.textContent = `${yr} ${br} ${dp} ${sec}`.trim() || id;
                classDropdown.appendChild(opt);
            });

            // Select query param, previous or default class
            let selectedClassId = null;
            const urlParams = new URLSearchParams(window.location.search);
            const queryClassId = urlParams.get('class');
            const prevClassId = localStorage.getItem('current_class_id') || window.currentClassId;

            if (queryClassId && classDropdown.querySelector(`option[value="${queryClassId}"]`)) {
                selectedClassId = queryClassId;
            } else if (prevClassId && classDropdown.querySelector(`option[value="${prevClassId}"]`)) {
                selectedClassId = prevClassId;
            } else if (userClassId && classDropdown.querySelector(`option[value="${userClassId}"]`)) {
                selectedClassId = userClassId;
            } else if (classDropdown.options.length > 0) {
                selectedClassId = classDropdown.options[0].value;
            }

            if (selectedClassId) {
                classDropdown.value = selectedClassId;
                classDropdown.style.display = 'inline-block';
                window.currentClassId = selectedClassId;
                if (typeof window.switchClass === 'function') {
                    window.switchClass(selectedClassId);
                } else {
                    bindSnapshot(selectedClassId);
                }
            }
        };

        // Live classes listener from Firestore
        unsubscribeClasses = db.collection('classes').onSnapshot((snapshot) => {
            populateClassesFromSnapshot(snapshot);
        }, (error) => {
            console.error("Firestore classes query error:", error);
            if (classDropdown) {
                classDropdown.innerHTML = '<option value="" disabled selected>No classes available</option>';
            }
        });

        // Function to bind snapshot listener for a specific classId
        const bindSnapshot = (classId) => {
            if (unsubscribeSnapshot) unsubscribeSnapshot();
            if (unsubscribeTimetable) unsubscribeTimetable();
            
            if (!classId) {
                if (typeof window.applyRemoteState === 'function') {
                    window.applyRemoteState([], {}, '', '');
                }
                return;
            }
            localStorage.setItem('current_class_id', classId);
            
            if (syncDot) {
                syncDot.style.backgroundColor = '#f59e0b';
                syncDot.title = 'Syncing timetable & class data...';
            }

            function resolveClassId(rawId) {
                if (!rawId) return '';
                if (window.OFFICIAL_TIMETABLES && window.OFFICIAL_TIMETABLES[rawId]) return rawId;
                const parts = rawId.split('_');
                if (parts.length >= 2) {
                    const yr = parts[0];
                    const sec = parts[parts.length - 1];
                    const shortId = `${yr}_${sec}`;
                    if (window.OFFICIAL_TIMETABLES && window.OFFICIAL_TIMETABLES[shortId]) return shortId;
                    return shortId;
                }
                return rawId;
            }

            const resolvedClassId = resolveClassId(classId);

            // 1. Live Timetable Sync for this classId with LocalStorage fallback
            const ttRef = db.collection('timetables').doc(classId);
            unsubscribeTimetable = ttRef.onSnapshot((ttDoc) => {
                let sched = (ttDoc.exists && ttDoc.data().schedule && Object.keys(ttDoc.data().schedule).length > 0) ? ttDoc.data().schedule : null;

                if (!sched) {
                    try {
                        const customTt = JSON.parse(localStorage.getItem('custom_timetables') || '{}');
                        const cTt = customTt[classId] || customTt[resolvedClassId];
                        if (cTt && cTt.schedule && Object.keys(cTt.schedule).length > 0) {
                            sched = cTt.schedule;
                        }
                    } catch (e) {}
                }

                if (!sched && window.OFFICIAL_TIMETABLES) {
                    const off = window.OFFICIAL_TIMETABLES[classId] || window.OFFICIAL_TIMETABLES[resolvedClassId];
                    if (off && off.schedule) {
                        sched = off.schedule;
                        // Auto-seed to Firestore if missing so it is permanently stored in Cloud
                        if (!ttDoc.exists && typeof db !== 'undefined') {
                            db.collection('timetables').doc(classId).set({
                                classId: classId,
                                className: off.className || classId,
                                classIncharge: off.classIncharge || '',
                                mentors: off.mentors || [],
                                schedule: off.schedule,
                                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                            }, { merge: true }).catch(() => {});
                        }
                    }
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
                    const cTt = customTt[classId] || customTt[resolvedClassId];
                    if (cTt && cTt.schedule && Object.keys(cTt.schedule).length > 0) {
                        sched = cTt.schedule;
                    }
                } catch (e) {}
                if (!sched && window.OFFICIAL_TIMETABLES) {
                    const off = window.OFFICIAL_TIMETABLES[classId] || window.OFFICIAL_TIMETABLES[resolvedClassId];
                    if (off && off.schedule) {
                        sched = off.schedule;
                    }
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
                // Guard: Discard snapshot if user has switched to a different class
                if (doc.id !== window.currentClassId) return;

                if (doc.exists) {
                    const data = doc.data();
                    const branchStr = data.branch || 'CSE';
                    const deptStr = data.department || 'DS';
                    const fullClassName = (data.year && data.section) ? `${data.year}/${branchStr}/${deptStr}/${data.section}` : doc.id;
                    localStorage.setItem('current_class_name', fullClassName);
                    localStorage.setItem('current_class_year', data.year || '');
                    localStorage.setItem('current_class_section', data.section || '');
                    localStorage.setItem('current_class_dept', deptStr);
                    localStorage.setItem('current_class_branch', branchStr);

                    if (typeof window.applyRemoteState === 'function') {
                        window.applyRemoteState(data.roster || [], data.history || {}, fullClassName, classId);
                    }
                    if (syncDot) {
                        syncDot.style.backgroundColor = '#10b981';
                        syncDot.title = 'Cloud Sync Active (Live)';
                    }
                } else {
                    // Class document does not exist yet or was deleted
                    if (typeof window.applyRemoteState === 'function') {
                        window.applyRemoteState([], {}, classId, classId);
                    }
                    if (syncDot) {
                        syncDot.style.backgroundColor = '#10b981';
                        syncDot.title = 'Cloud Sync Active (New Class)';
                    }
                }
            }, (error) => {
                console.error("Error listening to class data:", error);
            });
        };

        window.bindClassSnapshot = bindSnapshot;

        // Listen for dropdown changes
        if (classDropdown) {
            classDropdown.addEventListener('change', (e) => {
                const newClassId = e.target.value;
                if (typeof window.switchClass === 'function') {
                    window.switchClass(newClassId);
                } else {
                    window.currentClassId = newClassId;
                    bindSnapshot(newClassId);
                }
            });
        }

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
        if (typeof unsubscribeClasses === 'function') {
            unsubscribeClasses();
            unsubscribeClasses = null;
        }
    }
  });

  // Function to upload data to Cloud Firestore, called from app.js
  window.uploadStateToCloud = async (roster, history) => {
    if (!window.currentClassId || window.isLoadingRoster) return;
    if (!Array.isArray(roster)) return;

    if (syncDot) syncDot.style.backgroundColor = '#f59e0b'; // syncing

    try {
      if (typeof db !== 'undefined') {
        await db.collection('classes').doc(window.currentClassId).set({
          roster: roster,
          history: history,
          updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        }, { merge: true });
      }
    } catch (error) {
      console.error("Error uploading to Firestore:", error);
      if (syncDot) syncDot.style.backgroundColor = '#ef4444'; // error
    }
  };
});

