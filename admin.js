document.addEventListener('DOMContentLoaded', () => {
    // Check Authentication
    if (!authManager.isAuthenticated() || authManager.user.role !== 'admin') {
        alert("Access Denied: Admin only.");
        window.location.href = 'index.html';
        return;
    }

    const logoutBtn = document.getElementById('logout-btn');
    const pendingUsersBody = document.getElementById('pending-users-body');
    const btnUploadClass = document.getElementById('btn-upload-class');
    const classYearInput = document.getElementById('class-year');
    const classSectionInput = document.getElementById('class-section');
    const classDepartmentInput = document.getElementById('class-department');
    const classCsvInput = document.getElementById('class-csv');

    // Logout
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            await authManager.logout();
        });
    }

    // Fetch Pending Users
    function loadPendingUsers() {
        db.collection('users').where('isApproved', '==', false).onSnapshot((snapshot) => {
            pendingUsersBody.innerHTML = '';
            if (snapshot.empty) {
                pendingUsersBody.innerHTML = '<tr><td colspan="5" style="text-align: center;">No pending users</td></tr>';
                return;
            }

            snapshot.forEach((doc) => {
                const user = doc.data();
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${user.email}</td>
                    <td><span style="text-transform: capitalize;">${user.role}</span></td>
                    <td>${user.year || '-'}</td>
                    <td>${user.section || '-'}</td>
                    <td>
                        <button class="btn btn-primary btn-sm" onclick="approveUser('${doc.id}')">Approve</button>
                        <button class="btn btn-outline btn-sm" style="color: var(--danger); border-color: var(--danger-border);" onclick="deleteUser('${doc.id}')">Reject</button>
                    </td>
                `;
                pendingUsersBody.appendChild(tr);
            });
        });
    }

    // Approve User
    window.approveUser = async (userId) => {
        try {
            await db.collection('users').doc(userId).update({ isApproved: true });
        } catch (error) {
            alert(`Error approving user: ${error.message}`);
        }
    };

    // Reject User (Delete from Firestore users collection)
    window.deleteUser = async (userId) => {
        if (!confirm("Are you sure you want to reject and delete this user request?")) return;
        try {
            await db.collection('users').doc(userId).delete();
        } catch (error) {
            alert(`Error deleting user: ${error.message}`);
        }
    };

    // Parse CSV and Upload Class
    btnUploadClass.addEventListener('click', async () => {
        const year = classYearInput.value.trim();
        const section = classSectionInput.value.trim();
        const department = classDepartmentInput ? classDepartmentInput.value.trim() : "DS";
        const branch = "CSE"; // Hardcoded for this application context
        const file = classCsvInput.files[0];

        if (!year || !section || !file) {
            alert("Please fill in Year, Section, and select a CSV file.");
            return;
        }

        const reader = new FileReader();
        reader.onload = async (e) => {
            const text = e.target.result;
            const lines = text.split('\n');
            const roster = [];
            
            // Start from 1 to skip header (assuming standard header)
            for (let i = 1; i < lines.length; i++) {
                const line = lines[i].trim();
                if (!line) continue;

                // Split by comma (handles basic CSV, doesn't handle commas inside quotes)
                const parts = line.split(',');
                if (parts.length >= 5) {
                    roster.push({
                        rollNo: parts[0].trim(),
                        name: parts[1].trim(),
                        phone: parts[2].trim(),
                        fatherName: parts[3].trim(),
                        fatherPhone: parts[4].trim(),
                        department: department,
                        branch: branch,
                        status: "present"
                    });
                }
            }

            if (roster.length === 0) {
                alert("No valid rows found in CSV. Please ensure it has 5 columns: RollNo, StudentName, StudentPhone, ParentName, ParentPhone");
                return;
            }

            try {
                const classId = `${year}_${section}`;
                await db.collection('classes').doc(classId).set({
                    year: year,
                    section: section,
                    department: department,
                    branch: branch,
                    roster: roster,
                    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                });

                alert(`Class ${year} ${section} created successfully with ${roster.length} students!`);
                classYearInput.value = '';
                classSectionInput.value = '';
                classCsvInput.value = '';
            } catch (error) {
                alert(`Error creating class: ${error.message}`);
            }
        };

        reader.readAsText(file);
    });



    // Save Academic Calendar
    const btnSaveAcad = document.getElementById('btn-save-acad');
    if (btnSaveAcad) {
        btnSaveAcad.addEventListener('click', async () => {
            const term = document.getElementById('acad-term').value.trim();
            const startDate = document.getElementById('acad-start-date').value;
            const endDate = document.getElementById('acad-end-date').value;

            if (!term || !startDate || !endDate) {
                alert("Please fill all fields.");
                return;
            }

            try {
                // Fetch existing holidays if any, or default to empty array
                const docRef = await db.collection('academic_calendar').doc(term).get();
                const existingHolidays = docRef.exists ? docRef.data().holidays || [] : [];
                
                await db.collection('academic_calendar').doc(term).set({
                    term: term,
                    startDate: startDate,
                    endDate: endDate,
                    holidays: existingHolidays,
                    workingDays: { 0: false, 1: true, 2: true, 3: true, 4: true, 5: true, 6: false }, // Mon-Fri true
                    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                }, { merge: true });

                alert(`Academic Calendar for ${term} saved successfully!`);
                document.getElementById('acad-term').value = '';
                document.getElementById('acad-start-date').value = '';
                document.getElementById('acad-end-date').value = '';
            } catch (error) {
                alert(`Error saving Academic Calendar: ${error.message}`);
            }
        });
    }


    const btnDeleteClass = document.getElementById('btn-delete-class');
    const deleteClassYearInput = document.getElementById('delete-class-year');
    const deleteClassSectionInput = document.getElementById('delete-class-section');

    // Delete Class
    if (btnDeleteClass) {
        btnDeleteClass.addEventListener('click', async () => {
            const year = deleteClassYearInput.value;
            const section = deleteClassSectionInput.value;

            if (!year || !section) {
                alert("Please select Year and Section to delete.");
                return;
            }

            if (!confirm(`Are you sure you want to permanently delete Class ${year} - Section ${section}? This action cannot be undone.`)) {
                return;
            }

            try {
                const classId = `${year}_${section}`;
                await db.collection('classes').doc(classId).delete();
                alert(`Class ${year} - Section ${section} deleted successfully!`);
                deleteClassYearInput.value = '';
                deleteClassSectionInput.value = '';
            } catch (error) {
                alert(`Error deleting class: ${error.message}`);
            }
        });
    }

    // Holiday Management
    const holidayDateInput = document.getElementById('holiday-date');
    const holidayReasonInput = document.getElementById('holiday-reason');
    const btnAddHoliday = document.getElementById('btn-add-holiday');
    const holidaysBody = document.getElementById('holidays-body');

    function loadHolidays() {
        if (!holidaysBody) return;
        db.collection('holidays').orderBy('date', 'desc').onSnapshot(snapshot => {
            holidaysBody.innerHTML = '';
            if (snapshot.empty) {
                holidaysBody.innerHTML = '<tr><td colspan="3" style="text-align: center;">No holidays found.</td></tr>';
                return;
            }
            snapshot.forEach(doc => {
                const data = doc.data();
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${data.date}</td>
                    <td>${data.reason}</td>
                    <td>
                        <button class="btn btn-outline btn-sm" style="color: var(--danger); border-color: var(--danger-border);" onclick="deleteHoliday('${doc.id}')">Delete</button>
                    </td>
                `;
                holidaysBody.appendChild(tr);
            });
        });
    }

    if (btnAddHoliday) {
        btnAddHoliday.addEventListener('click', async () => {
            const date = holidayDateInput.value;
            const reason = holidayReasonInput.value.trim();
            if (!date || !reason) {
                alert("Please select a date and enter a reason.");
                return;
            }
            try {
                await db.collection('holidays').doc(date).set({
                    date: date,
                    reason: reason,
                    createdBy: authManager.user.uid,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                });
                alert("Holiday added successfully!");
                holidayDateInput.value = '';
                holidayReasonInput.value = '';
            } catch (error) {
                alert(`Error adding holiday: ${error.message}`);
            }
        });
    }

    window.deleteHoliday = async (date) => {
        if (!confirm(`Are you sure you want to delete the holiday on ${date}?`)) return;
        try {
            await db.collection('holidays').doc(date).delete();
        } catch (error) {
            alert(`Error deleting holiday: ${error.message}`);
        }
    };

    // Semester Date Configuration
    const globalSemStart = document.getElementById('global-sem-start');
    const globalSemEnd = document.getElementById('global-sem-end');
    const btnSaveSemesterConfig = document.getElementById('btn-save-semester-config');

    async function loadSemesterConfig() {
        if (!globalSemStart || !globalSemEnd) return;
        try {
            const doc = await db.collection('settings').doc('semesterConfig').get();
            if (doc.exists) {
                const data = doc.data();
                globalSemStart.value = data.startDate || '';
                globalSemEnd.value = data.endDate || '';
            }
        } catch (error) {
            console.error("Error loading semester config:", error);
        }
    }

    if (btnSaveSemesterConfig) {
        btnSaveSemesterConfig.addEventListener('click', async () => {
            const startDate = globalSemStart.value;
            const endDate = globalSemEnd.value;
            
            if (!startDate || !endDate) {
                alert("Please select both start and end dates.");
                return;
            }
            
            if (startDate > endDate) {
                alert("Start date cannot be after end date.");
                return;
            }

            try {
                await db.collection('settings').doc('semesterConfig').set({
                    startDate: startDate,
                    endDate: endDate,
                    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                }, { merge: true });
                alert("Global semester settings saved successfully!");
            } catch (error) {
                alert(`Error saving config: ${error.message}`);
            }
        });
    }

    // Timetable Management
    const ttYear = document.getElementById('tt-year');
    const ttSection = document.getElementById('tt-section');
    const ttDay = document.getElementById('tt-day');
    const ttPeriod = document.getElementById('tt-period');
    const ttSubjectName = document.getElementById('tt-subject-name');
    const ttSubjectCode = document.getElementById('tt-subject-code');
    const ttFaculty = document.getElementById('tt-faculty');
    const ttStartTime = document.getElementById('tt-start-time');
    const ttEndTime = document.getElementById('tt-end-time');
    const ttViewClass = document.getElementById('tt-view-class');
    const ttTargetYear = document.getElementById('tt-target-year');
    const ttTargetSection = document.getElementById('tt-target-section');
    const timetableBody = document.getElementById('timetable-tbody') || document.getElementById('timetable-body');

    // Populate TT Class dropdown with all 4 Years and all Sections synchronously and immediately
    function populateClassDropdowns() {
        const allYears = ["IV", "III", "II", "I"];
        const allSections = ["A", "B", "C", "D"];

        const populateSelect = (selectEl, defaultVal = "IV_D") => {
            if (!selectEl) return;
            selectEl.innerHTML = '';

            allYears.forEach(yr => {
                const group = document.createElement('optgroup');
                group.label = `${yr} Year (CSE-DS)`;

                allSections.forEach(sec => {
                    const cid = `${yr}_${sec}`;
                    const opt = document.createElement('option');
                    opt.value = cid;
                    opt.textContent = `${yr} Year - Section ${sec}`;
                    group.appendChild(opt);
                });

                selectEl.appendChild(group);
            });

            const savedCid = localStorage.getItem('current_class_id');
            if (savedCid && selectEl.querySelector(`option[value="${savedCid}"]`)) {
                selectEl.value = savedCid;
            } else if (selectEl.querySelector(`option[value="${defaultVal}"]`)) {
                selectEl.value = defaultVal;
            }
        };

        populateSelect(ttViewClass, "IV_D");
        populateSelect(document.getElementById('manual-tt-class'), "IV_D");

        // Immediately display the timetable for the default selected class
        viewTimetable();
    }

    async function loadClassesForTimetable() {
        populateClassDropdowns();

        // Asynchronously check Firestore for any additional custom classes
        try {
            if (typeof db !== 'undefined') {
                const classesSnap = await db.collection('classes').get();
                classesSnap.forEach(doc => {
                    const cid = doc.id;
                    if (ttViewClass && !ttViewClass.querySelector(`option[value="${cid}"]`)) {
                        const opt = document.createElement('option');
                        opt.value = cid;
                        const data = doc.data();
                        opt.textContent = data.name || `${data.year || ''} ${data.section || cid}`;
                        ttViewClass.appendChild(opt);
                    }
                });
            }
        } catch (error) {
            console.warn("Firestore classes query note:", error);
        }
    }

    // Pristine backup of official timetables for reset feature
    const BACKUP_OFFICIAL_TIMETABLES = (typeof window !== 'undefined' && window.OFFICIAL_TIMETABLES) ? JSON.parse(JSON.stringify(window.OFFICIAL_TIMETABLES)) : {};

    // View Timetable logic with localStorage, Official, and Firestore support
    let currentTimetableUnsubscribe = null;
    let showInlineAddRow = null; // Defined inside or exposed

    function viewTimetable() {
        const targetView = document.getElementById('tt-view-class');
        const targetBody = document.getElementById('timetable-tbody') || document.getElementById('timetable-body');
        if (!targetView || !targetBody) return;
        const classId = targetView.value;
        if (!classId) return;

        if (currentTimetableUnsubscribe) {
            currentTimetableUnsubscribe();
            currentTimetableUnsubscribe = null;
        }

        const renderSchedule = (schedule) => {
            targetBody.innerHTML = '';
            const dayFilterEl = document.getElementById('tt-view-day');
            const selectedDayFilter = dayFilterEl ? dayFilterEl.value : 'ALL';
            const allDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
            const days = selectedDayFilter === 'ALL' ? allDays : [selectedDayFilter];
            let totalEntries = 0;

            days.forEach(day => {
                const daySchedule = schedule[day] || {};
                const periods = Object.keys(daySchedule).sort((a,b) => parseInt(a) - parseInt(b));

                periods.forEach(p => {
                    totalEntries++;
                    const info = daySchedule[p];
                    const tr = document.createElement('tr');
                    tr.innerHTML = `
                        <td><strong>${day}</strong></td>
                        <td>Period ${p} <span style="font-size: 0.8rem; color: var(--text-muted);">(${info.startTime || ''} - ${info.endTime || ''})</span></td>
                        <td><strong style="color: var(--primary);">${info.subjectName || ''}</strong></td>
                        <td><code>${info.subjectCode || 'Core'}</code></td>
                        <td>${info.faculty || 'Unassigned'}</td>
                        <td style="text-align: center;">
                            <button class="btn btn-outline btn-sm" style="color: var(--danger); border-color: var(--danger-border); padding: 0.2rem 0.5rem; font-size: 0.75rem;" onclick="deleteTimetableEntry('${classId}', '${day}', '${p}')" title="Delete Period ${p}">
                                <i class="fas fa-trash"></i> Delete
                            </button>
                        </td>
                    `;
                    targetBody.appendChild(tr);
                });
            });

            if (totalEntries === 0) {
                targetBody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--text-muted); padding: 2rem;">No timetable entries found for ${classId}. Use the "Add Row" button or the Add/Edit Period form above to add periods or upload a PDF.</td></tr>`;
            }

            // Append quick "+ Add Another Row" button at the bottom of the table
            const addRowFooter = document.createElement('tr');
            addRowFooter.id = 'tr-add-another-row-btn';
            addRowFooter.innerHTML = `
                <td colspan="6" style="text-align: center; padding: 0.85rem; background: rgba(79, 70, 229, 0.04);">
                    <button class="btn btn-outline btn-sm" id="btn-table-add-row" style="color: var(--primary); border-color: var(--primary); font-weight: 600; display: inline-flex; align-items: center; gap: 0.4rem; padding: 0.35rem 1.1rem; border-radius: 6px;">
                        <i class="fas fa-plus-circle"></i> Add Another Row / Period
                    </button>
                </td>
            `;
            targetBody.appendChild(addRowFooter);

            const btnTableAddRow = document.getElementById('btn-table-add-row');
            if (btnTableAddRow) {
                btnTableAddRow.addEventListener('click', () => {
                    if (typeof showInlineAddRow === 'function') showInlineAddRow();
                });
            }
        };

        // Inline Add Row UI generator
        showInlineAddRow = function() {
            if (document.getElementById('inline-add-row')) {
                document.getElementById('inline-tt-subject')?.focus();
                return;
            }
            const tr = document.createElement('tr');
            tr.id = 'inline-add-row';
            tr.style.background = 'rgba(79, 70, 229, 0.08)';
            tr.style.borderLeft = '4px solid var(--primary)';
            const dayFilterEl = document.getElementById('tt-view-day');
            const defaultDay = (dayFilterEl && dayFilterEl.value !== 'ALL') ? dayFilterEl.value : 'Monday';

            tr.innerHTML = `
                <td>
                    <select id="inline-tt-day" style="padding: 0.35rem; font-size: 0.85rem; border-radius: 4px; border: 1px solid var(--border, #ccc); width: 100%;">
                        <option value="Monday" ${defaultDay === 'Monday' ? 'selected' : ''}>Monday</option>
                        <option value="Tuesday" ${defaultDay === 'Tuesday' ? 'selected' : ''}>Tuesday</option>
                        <option value="Wednesday" ${defaultDay === 'Wednesday' ? 'selected' : ''}>Wednesday</option>
                        <option value="Thursday" ${defaultDay === 'Thursday' ? 'selected' : ''}>Thursday</option>
                        <option value="Friday" ${defaultDay === 'Friday' ? 'selected' : ''}>Friday</option>
                        <option value="Saturday" ${defaultDay === 'Saturday' ? 'selected' : ''}>Saturday</option>
                    </select>
                </td>
                <td>
                    <select id="inline-tt-period" style="padding: 0.35rem; font-size: 0.85rem; border-radius: 4px; border: 1px solid var(--border, #ccc); width: 100%;">
                        <option value="1">Period 1 (09:30 - 10:20)</option>
                        <option value="2">Period 2 (10:20 - 11:10)</option>
                        <option value="3">Period 3 (11:20 - 12:10)</option>
                        <option value="4">Period 4 (12:50 - 13:50)</option>
                        <option value="5">Period 5 (13:50 - 14:50)</option>
                        <option value="6">Period 6 (14:50 - 15:50)</option>
                    </select>
                </td>
                <td>
                    <input type="text" id="inline-tt-subject" placeholder="Subject (e.g. FULL STACK DEV)" style="padding: 0.35rem 0.5rem; font-size: 0.85rem; border-radius: 4px; border: 1px solid var(--border, #ccc); width: 100%;" required>
                </td>
                <td>
                    <input type="text" id="inline-tt-code" placeholder="Code (e.g. R22A0589)" style="padding: 0.35rem 0.5rem; font-size: 0.85rem; border-radius: 4px; border: 1px solid var(--border, #ccc); width: 100%;">
                </td>
                <td>
                    <input type="text" id="inline-tt-faculty" placeholder="Faculty Name" style="padding: 0.35rem 0.5rem; font-size: 0.85rem; border-radius: 4px; border: 1px solid var(--border, #ccc); width: 100%;">
                </td>
                <td style="text-align: center; white-space: nowrap;">
                    <button class="btn btn-primary btn-sm" id="btn-inline-save-row" style="padding: 0.3rem 0.6rem; font-size: 0.8rem; margin-right: 4px;" title="Save new period row">
                        <i class="fas fa-check"></i> Save
                    </button>
                    <button class="btn btn-outline btn-sm" id="btn-inline-cancel-row" style="padding: 0.3rem 0.6rem; font-size: 0.8rem;" title="Cancel">
                        <i class="fas fa-times"></i>
                    </button>
                </td>
            `;

            // If empty message row is present, remove it
            const emptyTr = targetBody.querySelector('tr td[colspan="6"]');
            if (emptyTr && emptyTr.parentElement && emptyTr.parentElement.id !== 'tr-add-another-row-btn') {
                emptyTr.parentElement.remove();
            }

            targetBody.insertBefore(tr, targetBody.firstChild);
            document.getElementById('inline-tt-subject')?.focus();

            document.getElementById('btn-inline-cancel-row')?.addEventListener('click', () => {
                tr.remove();
            });

            document.getElementById('btn-inline-save-row')?.addEventListener('click', async () => {
                const day = document.getElementById('inline-tt-day').value;
                const period = document.getElementById('inline-tt-period').value;
                const subject = document.getElementById('inline-tt-subject').value.trim();
                const code = document.getElementById('inline-tt-code').value.trim();
                const faculty = document.getElementById('inline-tt-faculty').value.trim();

                if (!subject) {
                    alert("Please enter a Subject Name.");
                    document.getElementById('inline-tt-subject')?.focus();
                    return;
                }

                await saveTimetablePeriodEntry(classId, day, period, subject, code, faculty);
            });
        };

        // 1. Check local storage custom_timetables
        let localSchedule = null;
        try {
            const customTt = JSON.parse(localStorage.getItem('custom_timetables') || '{}');
            if (customTt[classId] && customTt[classId].schedule) {
                localSchedule = customTt[classId].schedule;
            }
        } catch (e) {}

        // 2. Fallback to Official Timetables
        if (!localSchedule && window.OFFICIAL_TIMETABLES && window.OFFICIAL_TIMETABLES[classId]) {
            localSchedule = window.OFFICIAL_TIMETABLES[classId].schedule;
        }

        // Render local schedule immediately
        if (localSchedule && Object.keys(localSchedule).length > 0) {
            renderSchedule(localSchedule);
        } else {
            renderSchedule({});
        }

        // 3. Sync from Cloud Firestore if available
        if (typeof db !== 'undefined') {
            try {
                currentTimetableUnsubscribe = db.collection('timetables').doc(classId).onSnapshot(doc => {
                    if (doc.exists && doc.data().schedule) {
                        const sched = doc.data().schedule;
                        // Cache locally
                        try {
                            const customTt = JSON.parse(localStorage.getItem('custom_timetables') || '{}');
                            customTt[classId] = { classId, schedule: sched };
                            localStorage.setItem('custom_timetables', JSON.stringify(customTt));
                        } catch(e) {}
                        renderSchedule(sched);
                    }
                }, err => {
                    console.warn("Firestore timetable listen note:", err);
                });
            } catch (err) {
                console.warn("Could not listen to Firestore timetable:", err);
            }
        }
    }

    // Common period saver used by both Inline Row and Form
    async function saveTimetablePeriodEntry(classId, day, period, subject, code, faculty) {
        const periodTimes = {
            1: { start: '09:30', end: '10:20' },
            2: { start: '10:20', end: '11:10' },
            3: { start: '11:20', end: '12:10' },
            4: { start: '12:50', end: '13:50' },
            5: { start: '13:50', end: '14:50' },
            6: { start: '14:50', end: '15:50' }
        };
        const timing = periodTimes[period] || { start: '09:30', end: '10:20' };

        // 1. Get current schedule
        let schedule = {};
        try {
            const customTt = JSON.parse(localStorage.getItem('custom_timetables') || '{}');
            if (customTt[classId] && customTt[classId].schedule) {
                schedule = customTt[classId].schedule;
            }
        } catch (e) {}

        if (Object.keys(schedule).length === 0 && window.OFFICIAL_TIMETABLES && window.OFFICIAL_TIMETABLES[classId]) {
            schedule = JSON.parse(JSON.stringify(window.OFFICIAL_TIMETABLES[classId].schedule));
        }

        if (!schedule[day]) {
            schedule[day] = {};
        }

        schedule[day][period] = {
            subjectName: subject,
            subjectCode: code || 'Core',
            faculty: faculty || 'Assigned Faculty',
            startTime: timing.start,
            endTime: timing.end
        };

        const parts = classId.split('_');
        const yr = parts[0] || 'IV';
        const sec = parts[1] || 'A';

        // 2. Save to localStorage
        try {
            const customTt = JSON.parse(localStorage.getItem('custom_timetables') || '{}');
            customTt[classId] = { classId, schedule };
            localStorage.setItem('custom_timetables', JSON.stringify(customTt));
        } catch (e) {}

        // 3. Save to memory
        if (window.OFFICIAL_TIMETABLES) {
            if (!window.OFFICIAL_TIMETABLES[classId]) {
                window.OFFICIAL_TIMETABLES[classId] = { className: `${yr} Year / Section ${sec}`, schedule };
            } else {
                window.OFFICIAL_TIMETABLES[classId].schedule = schedule;
            }
        }

        // 4. Save to Firestore
        if (typeof db !== 'undefined') {
            try {
                await db.collection('timetables').doc(classId).set({
                    classId: classId,
                    className: `${yr} Year / Section ${sec} (CSE-DS)`,
                    schedule: schedule,
                    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                }, { merge: true });

                await db.collection('classes').doc(classId).set({
                    year: yr,
                    section: sec,
                    department: 'DS',
                    branch: 'CSE',
                    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                }, { merge: true });
            } catch (e) {
                console.warn("Firestore timetable save warning:", e);
            }
        }

        alert(`Period ${period} on ${day} for ${classId} added successfully!`);
        viewTimetable();
    }

    // Seed Official IV Year Timetables to Cloud Firestore & LocalStorage
    const btnSeedIvTt = document.getElementById('btn-seed-iv-tt');
    if (btnSeedIvTt) {
        btnSeedIvTt.addEventListener('click', async () => {
            if (!window.OFFICIAL_TIMETABLES) {
                alert("Official timetable dataset not loaded.");
                return;
            }
            if (!confirm("Load and save official IV Year (CSE-DS) timetables for Sections A, B, C, and D to Cloud database and local storage?")) {
                return;
            }
            
            try {
                btnSeedIvTt.disabled = true;
                btnSeedIvTt.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
                
                const customTt = JSON.parse(localStorage.getItem('custom_timetables') || '{}');
                const sections = ["IV_A", "IV_B", "IV_C", "IV_D"];

                for (const classId of sections) {
                    const tt = window.OFFICIAL_TIMETABLES[classId];
                    if (tt) {
                        customTt[classId] = {
                            classId: classId,
                            className: tt.className,
                            schedule: tt.schedule
                        };

                        if (typeof db !== 'undefined') {
                            await db.collection('timetables').doc(classId).set({
                                classId: classId,
                                className: tt.className,
                                classIncharge: tt.classIncharge,
                                mentors: tt.mentors,
                                schedule: tt.schedule,
                                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                            }, { merge: true });

                            const sec = classId.split('_')[1];
                            await db.collection('classes').doc(classId).set({
                                year: 'IV',
                                section: sec,
                                department: 'DS',
                                branch: 'CSE',
                                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                            }, { merge: true });
                        }
                    }
                }

                localStorage.setItem('custom_timetables', JSON.stringify(customTt));
                
                const statusBox = document.getElementById('tt-parse-status');
                if (statusBox) {
                    statusBox.style.display = 'block';
                    statusBox.style.background = 'var(--success-bg)';
                    statusBox.style.color = 'var(--success)';
                    statusBox.style.border = '1px solid var(--success-border)';
                    statusBox.innerHTML = '<i class="fas fa-check-circle"></i> Official IV Year Timetables for Sections A, B, C, and D saved successfully!';
                }
                
                alert("Official IV Year Timetables (Sections A, B, C, D) loaded and saved successfully!");
                if (ttViewClass) {
                    ttViewClass.value = "IV_A";
                }
                viewTimetable();
            } catch (error) {
                alert("Error saving official timetables: " + error.message);
                console.error(error);
            } finally {
                btnSeedIvTt.disabled = false;
                btnSeedIvTt.innerHTML = '<i class="fas fa-check-double"></i> Quick Load Sample (IV Year CSE-DS)';
            }
        });
    }

    // Manual Period Entry & Quick Editor for any class
    const btnSaveManualPeriod = document.getElementById('btn-save-manual-period');
    if (btnSaveManualPeriod) {
        btnSaveManualPeriod.addEventListener('click', async () => {
            const manualClassEl = document.getElementById('manual-tt-class');
            const classId = (manualClassEl && manualClassEl.value) || (ttViewClass ? ttViewClass.value : null);
            if (!classId) {
                alert("Please select a Target Class first.");
                return;
            }

            const day = document.getElementById('manual-tt-day').value;
            const period = document.getElementById('manual-tt-period').value;
            const subject = document.getElementById('manual-tt-subject').value.trim();
            const code = document.getElementById('manual-tt-code').value.trim();
            const faculty = document.getElementById('manual-tt-faculty').value.trim();

            if (!subject) {
                alert("Please enter a Subject Name.");
                document.getElementById('manual-tt-subject').focus();
                return;
            }

            try {
                btnSaveManualPeriod.disabled = true;
                await saveTimetablePeriodEntry(classId, day, period, subject, code, faculty);
                
                // Clear input fields
                document.getElementById('manual-tt-subject').value = '';
                document.getElementById('manual-tt-code').value = '';
                document.getElementById('manual-tt-faculty').value = '';

                // Sync viewer class dropdown and view
                if (ttViewClass) {
                    ttViewClass.value = classId;
                }
                viewTimetable();
            } catch (error) {
                alert(`Error saving period: ${error.message}`);
            } finally {
                btnSaveManualPeriod.disabled = false;
            }
        });
    }

    window.deleteTimetableEntry = async (classId, day, period) => {
        if (!confirm(`Delete period ${period} on ${day}?`)) return;
        try {
            // 1. Update localStorage
            const customTt = JSON.parse(localStorage.getItem('custom_timetables') || '{}');
            let schedule = (customTt[classId] && customTt[classId].schedule) ? customTt[classId].schedule : {};
            if (Object.keys(schedule).length === 0 && window.OFFICIAL_TIMETABLES && window.OFFICIAL_TIMETABLES[classId]) {
                schedule = JSON.parse(JSON.stringify(window.OFFICIAL_TIMETABLES[classId].schedule));
            }
            if (schedule[day] && schedule[day][period]) {
                delete schedule[day][period];
            }
            customTt[classId] = { classId, schedule };
            localStorage.setItem('custom_timetables', JSON.stringify(customTt));

            // 2. Update memory
            if (window.OFFICIAL_TIMETABLES && window.OFFICIAL_TIMETABLES[classId]) {
                window.OFFICIAL_TIMETABLES[classId].schedule = schedule;
            }

            // 3. Update Firestore
            if (typeof db !== 'undefined') {
                const ttRef = db.collection('timetables').doc(classId);
                await ttRef.set({ schedule, updatedAt: firebase.firestore.FieldValue.serverTimestamp() }, { merge: true });
            }

            // 4. Immediately refresh view
            viewTimetable();
        } catch (error) {
            alert(`Error deleting entry: ${error.message}`);
        }
    };

    // HOD Account Creation
    const hodNameInput = document.getElementById('hod-name');
    const hodEmailInput = document.getElementById('hod-email');
    const hodPasswordInput = document.getElementById('hod-password');
    const btnCreateHod = document.getElementById('btn-create-hod');

    if (btnCreateHod) {
        btnCreateHod.addEventListener('click', async () => {
            const name = hodNameInput.value.trim();
            const email = hodEmailInput.value.trim().toLowerCase();
            const password = hodPasswordInput.value;
            
            if (!name || !email || password.length < 6) {
                alert("Please fill all fields. Password must be at least 6 characters.");
                return;
            }

            try {
                // Use secondary app to prevent logging out admin
                const userCredential = await window.adminAuth.createUserWithEmailAndPassword(email, password);
                const user = userCredential.user;
                
                await db.collection('users').doc(user.uid).set({
                    name: name,
                    email: email,
                    role: 'hod',
                    isApproved: true,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                });
                
                alert(`HOD Account for ${name} created successfully!`);
                hodNameInput.value = '';
                hodEmailInput.value = '';
                hodPasswordInput.value = '';
                
                // Sign out from the secondary app to prevent lingering sessions
                await window.adminAuth.signOut();
            } catch (error) {
                alert(`Error creating HOD: ${error.message}`);
            }
        });
    }

    // Initialize
    loadPendingUsers();
    loadHolidays();
    loadSemesterConfig();
    loadClassesForTimetable();
});
