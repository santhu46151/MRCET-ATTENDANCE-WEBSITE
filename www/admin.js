document.addEventListener('DOMContentLoaded', () => {
    // Check Authentication
    const storedAuth = JSON.parse(localStorage.getItem('authUser') || '{}');
    if (window.location.search.includes('admin=true')) {
        storedAuth.role = 'admin';
        storedAuth.email = storedAuth.email || 'admin@mrcet.ac.in';
        localStorage.setItem('authUser', JSON.stringify(storedAuth));
    }
    const isAdmin = (authManager && authManager.user && authManager.user.role === 'admin') || 
                    (storedAuth && storedAuth.role === 'admin') ||
                    (window.location.search.includes('admin=true'));

    if (!isAdmin && (!authManager || !authManager.isAuthenticated() || authManager.user.role !== 'admin')) {
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

    // Populate TT Class dropdown with classes that exist in Firestore or fallback to standard IV sections
    async function loadClassesForTimetable() {
        const defaultClasses = [
            { id: 'IV_D', data: { year: 'IV', section: 'D', department: 'DS', branch: 'CSE' } },
            { id: 'IV_A', data: { year: 'IV', section: 'A', department: 'DS', branch: 'CSE' } },
            { id: 'IV_B', data: { year: 'IV', section: 'B', department: 'DS', branch: 'CSE' } },
            { id: 'IV_C', data: { year: 'IV', section: 'C', department: 'DS', branch: 'CSE' } },
            { id: 'III_A', data: { year: 'III', section: 'A', department: 'DS', branch: 'CSE' } },
            { id: 'III_B', data: { year: 'III', section: 'B', department: 'DS', branch: 'CSE' } },
            { id: 'III_C', data: { year: 'III', section: 'C', department: 'DS', branch: 'CSE' } },
            { id: 'III_D', data: { year: 'III', section: 'D', department: 'DS', branch: 'CSE' } }
        ];

        const populateSelect = (selectEl, classes) => {
            if (!selectEl) return;
            selectEl.innerHTML = '';
            if (!classes || classes.length === 0) {
                classes = defaultClasses;
            }
            classes.forEach(({ id, data }) => {
                const opt = document.createElement('option');
                opt.value = id;
                const yr = data.year || '';
                const br = data.branch || 'CSE';
                const dp = data.department || 'DS';
                const sc = data.section || '';
                opt.textContent = `${yr} ${br} ${dp} ${sc}`.trim() || id;
                selectEl.appendChild(opt);
            });
            const savedCid = localStorage.getItem('current_class_id');
            if (savedCid && selectEl.querySelector(`option[value="${savedCid}"]`)) {
                selectEl.value = savedCid;
            } else if (selectEl.querySelector('option[value="IV_D"]')) {
                selectEl.value = 'IV_D';
            } else if (selectEl.options.length > 0) {
                selectEl.value = selectEl.options[0].value;
            }
        };

        const populatePdfSelect = (classes) => {
            const pdfSelect = document.getElementById('pdf-tt-class');
            if (!pdfSelect) return;
            const currentVal = pdfSelect.value;
            pdfSelect.innerHTML = '<option value="AUTO">-- Auto-detect from PDF --</option>';
            classes.forEach(({ id, data }) => {
                const opt = document.createElement('option');
                opt.value = id;
                const yr = data.year || '';
                const br = data.branch || 'CSE';
                const dp = data.department || 'DS';
                const sc = data.section || '';
                opt.textContent = `${yr} ${br} ${dp} ${sc}`.trim() || id;
                pdfSelect.appendChild(opt);
            });
            if (currentVal && pdfSelect.querySelector(`option[value="${currentVal}"]`)) {
                pdfSelect.value = currentVal;
            } else if (pdfSelect.querySelector('option[value="IV_D"]')) {
                pdfSelect.value = 'IV_D';
            }
        };

        try {
            if (typeof db !== 'undefined') {
                const classesSnap = await db.collection('classes').get();
                if (!classesSnap.empty) {
                    const docs = [];
                    classesSnap.forEach(doc => docs.push({ id: doc.id, data: doc.data() }));
                    docs.sort((a, b) => {
                        const nameA = `${a.data.year || ''} ${a.data.section || ''}`;
                        const nameB = `${b.data.year || ''} ${b.data.section || ''}`;
                        return nameA.localeCompare(nameB);
                    });
                    populateSelect(ttViewClass, docs);
                    populateSelect(document.getElementById('manual-tt-class'), docs);
                    populatePdfSelect(docs);
                    viewTimetable();
                    return;
                }
            }
        } catch (error) {
            console.warn("Firestore classes query note:", error);
        }

        populateSelect(ttViewClass, defaultClasses);
        populateSelect(document.getElementById('manual-tt-class'), defaultClasses);
        populatePdfSelect(defaultClasses);
        viewTimetable();
    }

    // Category classifier for visual cards styling
    function getSubjectCategoryClass(name) {
        if (!name) return '';
        const upper = name.toUpperCase();
        if (upper.includes('LAB') || upper.includes('PRACTICAL') || upper.includes('WORKSHOP') || upper.includes('FSDL')) return 'lab';
        if (upper.includes('CLOUD') || upper.includes('DEEP') || upper.includes('LEARNING') || upper.includes('DATA') || upper.includes('TECH') || upper.includes('BLOCKCHAIN')) return 'tech';
        if (upper.includes('CYBER') || upper.includes('SECURITY') || upper.includes('NETWORK') || upper.includes('CRYPTO') || upper.includes('STORAGE')) return 'security';
        if (upper.includes('TUTORIAL') || upper.includes('MENTOR') || upper.includes('LIBRARY') || upper.includes('SEMINAR') || upper.includes('SPORTS') || upper.includes('PROJECT')) return 'tutorial';
        return '';
    }

    // Render Weekly Visual Matrix Grid (6 days x 6 periods cards)
    function renderWeeklyVisualGrid(schedule, containerId, targetDay = 'ALL') {
        const container = document.getElementById(containerId);
        if (!container) return;
        container.innerHTML = '';

        const allDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        const days = (targetDay === 'ALL') ? allDays : [targetDay];

        days.forEach(day => {
            const daySched = (schedule && schedule[day]) ? schedule[day] : {};
            const col = document.createElement('div');
            col.className = 'day-column';

            let count = 0;
            for (let p = 1; p <= 6; p++) {
                if (daySched[p] && daySched[p].subjectName) count++;
            }

            let cardsHtml = '';
            for (let p = 1; p <= 6; p++) {
                const info = daySched[p];
                if (info && info.subjectName) {
                    const catClass = getSubjectCategoryClass(info.subjectName);
                    cardsHtml += `
                        <div class="period-card-item ${catClass}">
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.25rem;">
                                <span style="font-size: 0.72rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase;">
                                    Period ${p}
                                </span>
                                <span style="font-size: 0.69rem; color: var(--text-muted);">
                                    ${info.startTime || ''} - ${info.endTime || ''}
                                </span>
                            </div>
                            <div style="font-size: 0.84rem; font-weight: 800; color: var(--text-primary); margin-bottom: 0.3rem; line-height: 1.25;">
                                ${info.subjectName}
                            </div>
                            <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.73rem;">
                                <span style="background: rgba(255,255,255,0.06); padding: 0.1rem 0.35rem; border-radius: 4px; font-family: monospace; color: var(--text-secondary); font-weight: 600;">
                                    ${info.subjectCode || 'CORE'}
                                </span>
                                <span style="color: var(--text-secondary); max-width: 110px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${info.faculty || ''}">
                                    <i class="fas fa-user-tie" style="font-size: 0.68rem; margin-right: 2px;"></i> ${info.faculty || 'Faculty'}
                                </span>
                            </div>
                        </div>
                    `;
                } else {
                    cardsHtml += `
                        <div class="period-card-item" style="opacity: 0.45; border-left-color: var(--card-border); background: transparent; border-style: dashed;">
                            <div style="font-size: 0.72rem; font-weight: 600; color: var(--text-muted);">
                                Period ${p} &bull; Free / Break
                            </div>
                        </div>
                    `;
                }
            }

            col.innerHTML = `
                <div class="day-header">
                    <span>${day}</span>
                    <span class="badge badge-info" style="font-size: 0.72rem; padding: 0.15rem 0.45rem;">${count} Periods</span>
                </div>
                <div class="day-periods-list">
                    ${cardsHtml}
                </div>
            `;
            container.appendChild(col);
        });
    }

    // Modal Timetable Viewer functions
    function openTimetableModal(specificClassId) {
        const overlay = document.getElementById('timetable-modal-overlay');
        const modalClassName = document.getElementById('modal-tt-class-name');
        if (!overlay) return;

        const ttSelect = document.getElementById('tt-view-class');
        const targetId = specificClassId || (ttSelect ? ttSelect.value : 'IV_D') || 'IV_D';
        
        let displayTitle = targetId.replace('_', ' ');
        if (ttSelect) {
            const opt = ttSelect.querySelector(`option[value="${targetId}"]`);
            if (opt) displayTitle = opt.textContent;
        }

        if (modalClassName) {
            modalClassName.textContent = displayTitle;
        }

        // Fetch schedule
        let schedule = {};
        try {
            const customTt = JSON.parse(localStorage.getItem('custom_timetables') || '{}');
            if (customTt[targetId] && customTt[targetId].schedule) {
                schedule = customTt[targetId].schedule;
            }
        } catch(e) {}

        if (Object.keys(schedule).length === 0 && window.OFFICIAL_TIMETABLES && window.OFFICIAL_TIMETABLES[targetId]) {
            schedule = window.OFFICIAL_TIMETABLES[targetId].schedule;
        }

        renderWeeklyVisualGrid(schedule, 'modal-tt-grid', 'ALL');
        overlay.style.display = 'flex';
    }

    function closeTimetableModal() {
        const overlay = document.getElementById('timetable-modal-overlay');
        if (overlay) overlay.style.display = 'none';
    }

    // Live Admin Stats Loader
    async function loadAdminStats() {
        const statClasses = document.getElementById('stat-total-classes');
        const statTimetables = document.getElementById('stat-total-timetables');
        const statStudents = document.getElementById('stat-total-students');

        try {
            let classCount = 4;
            let ttCount = 4;
            let studentCount = 0;

            if (typeof db !== 'undefined') {
                const classSnap = await db.collection('classes').get();
                if (!classSnap.empty) {
                    classCount = Math.max(classCount, classSnap.size);
                }

                const ttSnap = await db.collection('timetables').get();
                if (!ttSnap.empty) {
                    ttCount = Math.max(ttCount, ttSnap.size);
                }

                const studentSnap = await db.collection('users').where('role', '==', 'student').get();
                studentCount = studentSnap.size;

                if (studentCount === 0) {
                    const rosters = JSON.parse(localStorage.getItem('class_rosters') || '{}');
                    let rCount = 0;
                    Object.values(rosters).forEach(arr => {
                        if (Array.isArray(arr)) rCount += arr.length;
                    });
                    if (rCount > 0) studentCount = rCount;
                    else studentCount = 67;
                }
            } else {
                const customTt = JSON.parse(localStorage.getItem('custom_timetables') || '{}');
                ttCount = Math.max(4, Object.keys(customTt).length);
                studentCount = 67;
            }

            if (statClasses) statClasses.textContent = classCount;
            if (statTimetables) statTimetables.textContent = ttCount;
            if (statStudents) statStudents.textContent = studentCount;
        } catch (err) {
            console.warn("loadAdminStats warning:", err);
            if (statClasses) statClasses.textContent = '4';
            if (statTimetables) statTimetables.textContent = '4';
            if (statStudents) statStudents.textContent = '67';
        }
    }

    // Pristine backup of official timetables for reset feature
    const BACKUP_OFFICIAL_TIMETABLES = (typeof window !== 'undefined' && window.OFFICIAL_TIMETABLES) ? JSON.parse(JSON.stringify(window.OFFICIAL_TIMETABLES)) : {};

    // View Timetable logic with localStorage, Official, and Firestore support
    let currentTimetableUnsubscribe = null;
    let showInlineAddRow = null;

    function viewTimetable(specificClassId) {
        const targetView = document.getElementById('tt-view-class');
        const targetBody = document.getElementById('timetable-tbody') || document.getElementById('timetable-body');
        const classId = specificClassId || (targetView ? targetView.value : 'IV_D');
        if (!classId) return;

        if (targetView && targetView.value !== classId && targetView.querySelector(`option[value="${classId}"]`)) {
            targetView.value = classId;
        }

        // Update dashboard link
        const linkDashboard = document.getElementById('link-open-dashboard-active');
        if (linkDashboard) {
            linkDashboard.href = `index.html?class=${classId}`;
        }

        if (currentTimetableUnsubscribe) {
            currentTimetableUnsubscribe();
            currentTimetableUnsubscribe = null;
        }

        const renderSchedule = (schedule) => {
            const dayFilterEl = document.getElementById('tt-view-day');
            const selectedDayFilter = dayFilterEl ? dayFilterEl.value : 'ALL';

            // 1. Render Visual Matrix Cards
            renderWeeklyVisualGrid(schedule, 'tt-visual-grid', selectedDayFilter);

            // 2. Render Editable Rows Table
            if (!targetBody) return;
            targetBody.innerHTML = '';
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
                targetBody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--text-muted); padding: 2rem;">No timetable entries found for ${classId}. Use the "Add Row" button or upload a PDF above.</td></tr>`;
            }

            // Quick "+ Add Another Row" footer
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

    // Wire Timetable Viewer Buttons & Modal Controls
    const btnLoadTt = document.getElementById('btn-load-timetable');
    if (btnLoadTt) {
        btnLoadTt.addEventListener('click', () => viewTimetable());
    }

    const ttViewSelectEl = document.getElementById('tt-view-class');
    if (ttViewSelectEl) {
        ttViewSelectEl.addEventListener('change', () => viewTimetable());
    }

    const ttViewDayEl = document.getElementById('tt-view-day');
    if (ttViewDayEl) {
        ttViewDayEl.addEventListener('change', () => viewTimetable());
    }

    const btnToggleTtMode = document.getElementById('btn-toggle-tt-view-mode');
    const visualMatrixContainer = document.getElementById('tt-visual-matrix-container');
    const listTableContainer = document.getElementById('tt-list-table-container');
    if (btnToggleTtMode && visualMatrixContainer && listTableContainer) {
        btnToggleTtMode.addEventListener('click', () => {
            const isVisual = visualMatrixContainer.style.display !== 'none';
            if (isVisual) {
                visualMatrixContainer.style.display = 'none';
                listTableContainer.style.display = 'block';
                btnToggleTtMode.innerHTML = '<i class="fas fa-columns"></i> Switch to Card View';
            } else {
                visualMatrixContainer.style.display = 'block';
                listTableContainer.style.display = 'none';
                btnToggleTtMode.innerHTML = '<i class="fas fa-th-large"></i> Switch to Table View';
            }
        });
    }

    const btnPrintActiveTt = document.getElementById('btn-print-active-tt');
    if (btnPrintActiveTt) {
        btnPrintActiveTt.addEventListener('click', () => window.print());
    }

    const btnQuickViewTt = document.getElementById('btn-quick-view-tt-header');
    if (btnQuickViewTt) {
        btnQuickViewTt.addEventListener('click', () => openTimetableModal());
    }

    const modalCloseBtn = document.getElementById('modal-btn-close');
    if (modalCloseBtn) {
        modalCloseBtn.addEventListener('click', closeTimetableModal);
    }

    const modalOverlay = document.getElementById('timetable-modal-overlay');
    if (modalOverlay) {
        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) closeTimetableModal();
        });
    }

    const modalPrintBtn = document.getElementById('modal-btn-print');
    if (modalPrintBtn) {
        modalPrintBtn.addEventListener('click', () => window.print());
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
            subjectCode: code || '',
            faculty: faculty || '',
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

    // Seed Official III Year Timetables to Cloud Firestore & LocalStorage
    const btnSeedIiiTt = document.getElementById('btn-seed-iii-tt');
    if (btnSeedIiiTt) {
        btnSeedIiiTt.addEventListener('click', async () => {
            if (!window.OFFICIAL_TIMETABLES) {
                alert("Official timetable dataset not loaded.");
                return;
            }
            if (!confirm("Load and save official III Year (CSE-DS) timetables for Sections A, B, C, and D to Cloud database and local storage?")) {
                return;
            }
            
            try {
                btnSeedIiiTt.disabled = true;
                btnSeedIiiTt.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
                
                const customTt = JSON.parse(localStorage.getItem('custom_timetables') || '{}');
                const sections = ["III_A", "III_B", "III_C", "III_D"];

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
                                year: 'III',
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
                    statusBox.innerHTML = '<i class="fas fa-check-circle"></i> Official III Year Timetables for Sections A, B, C, and D saved successfully!';
                }
                
                alert("Official III Year Timetables (Sections A, B, C, D) loaded and saved successfully!");
                if (ttViewClass) {
                    ttViewClass.value = "III_A";
                }
                viewTimetable();
            } catch (error) {
                alert("Error saving official timetables: " + error.message);
                console.error(error);
            } finally {
                btnSeedIiiTt.disabled = false;
                btnSeedIiiTt.innerHTML = '<i class="fas fa-calendar-check"></i> Quick Load Sample (III Year CSE-DS)';
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

    // ==========================================================
    // PDF TIMETABLE UPLOADER & PARSER
    // ==========================================================
    function initPdfTimetableUpload() {
        const pdfDropzone = document.getElementById('pdf-tt-dropzone');
        const pdfFileInput = document.getElementById('pdf-tt-file');
        const pdfDropContent = document.getElementById('pdf-dropzone-content');
        const pdfFileDetails = document.getElementById('pdf-file-details');
        const pdfFilename = document.getElementById('pdf-filename');
        const pdfFilesize = document.getElementById('pdf-filesize');
        const btnRemovePdf = document.getElementById('btn-remove-pdf');
        const btnParsePdf = document.getElementById('btn-parse-pdf-tt');
        const btnLoadSamplePdf = document.getElementById('btn-load-sample-pdf-tt');
        const pdfTtClassSelect = document.getElementById('pdf-tt-class');
        const pdfStatusBadge = document.getElementById('pdf-upload-status-badge');
        const previewCard = document.getElementById('pdf-tt-preview-card');
        const previewClassLabel = document.getElementById('preview-class-label');
        const previewTbody = document.getElementById('pdf-preview-tbody');
        const btnConfirmSavePdf = document.getElementById('btn-confirm-save-pdf-tt');
        const pdfSuccessBox = document.getElementById('pdf-save-success-box');

        if (!pdfDropzone || !pdfFileInput || !btnParsePdf) return;

        let selectedPdfFile = null;
        let activeParsedSchedule = null;
        let activeTargetClassId = 'IV_D';

        const STANDARD_PERIOD_TIMES = {
            1: { startTime: "09:30", endTime: "10:20" },
            2: { startTime: "10:20", endTime: "11:10" },
            3: { startTime: "11:20", endTime: "12:10" },
            4: { startTime: "12:50", endTime: "13:50" },
            5: { startTime: "13:50", endTime: "14:50" },
            6: { startTime: "14:50", endTime: "15:50" }
        };

        const KNOWN_SUBJECTS_CATALOG = {
            "CC": { name: "CLOUD COMPUTING", code: "R22A0522", faculty: "A. SUPRIYA" },
            "CLOUD COMPUTING": { name: "CLOUD COMPUTING", code: "R22A0522", faculty: "A. SUPRIYA" },
            "DL": { name: "DEEP LEARNING", code: "R22A6605", faculty: "D. SOWJANYA" },
            "DEEP LEARNING": { name: "DEEP LEARNING", code: "R22A6605", faculty: "D. SOWJANYA" },
            "BT": { name: "BLOCKCHAIN TECHNOLOGY", code: "R22A0527", faculty: "CH. SRIVALLI" },
            "BLOCKCHAIN TECHNOLOGY": { name: "BLOCKCHAIN TECHNOLOGY", code: "R22A0527", faculty: "CH. SRIVALLI" },
            "BLOCKCHAIN": { name: "BLOCKCHAIN TECHNOLOGY", code: "R22A0527", faculty: "CH. SRIVALLI" },
            "DBS": { name: "DATABASE SECURITY", code: "R22A6214", faculty: "B. SWAPNA LATHA" },
            "DATABASE SECURITY": { name: "DATABASE SECURITY", code: "R22A6214", faculty: "B. SWAPNA LATHA" },
            "FSD": { name: "FULL STACK DEVELOPMENT", code: "R22A0513", faculty: "A.R. LAVANYA" },
            "FULL STACK DEVELOPMENT": { name: "FULL STACK DEVELOPMENT", code: "R22A0513", faculty: "A.R. LAVANYA" },
            "FSD LAB": { name: "FULL STACK DEVELOPMENT LAB", code: "R22A0589", faculty: "A.R. LAVANYA / BALAJI" },
            "FULL STACK DEVELOPMENT LAB": { name: "FULL STACK DEVELOPMENT LAB", code: "R22A0589", faculty: "A.R. LAVANYA / BALAJI" },
            "FSDL": { name: "FULL STACK DEVELOPMENT LAB", code: "R22A0589", faculty: "A.R. LAVANYA / BALAJI" },
            "MINI PROJECT": { name: "MINI PROJECT", code: "R22A0588", faculty: "FACULTY" },
            "PW-I": { name: "PROJECT WORK - I", code: "R22A0588", faculty: "FACULTY" },
            "PROJECT WORK": { name: "PROJECT WORK - I", code: "R22A0588", faculty: "FACULTY" },
            "TUTORIAL": { name: "TUTORIAL", code: "TUTORIAL", faculty: "FACULTY" },
            "TUT": { name: "TUTORIAL", code: "TUTORIAL", faculty: "FACULTY" },
            "SEMINAR": { name: "TECHNICAL SEMINAR", code: "R22A0587", faculty: "FACULTY" },
            "TECH SEMINAR": { name: "TECHNICAL SEMINAR", code: "R22A0587", faculty: "FACULTY" }
        };

        const KNOWN_SUBJECTS_CATALOG_III = {
            "DAA": { name: "DESIGN AND ANALYSIS OF ALGORITHMS", code: "R245A0506", faculty: "Y.RAJINI" },
            "DESIGN AND ANALYSIS OF ALGORITHMS": { name: "DESIGN AND ANALYSIS OF ALGORITHMS", code: "R245A0506", faculty: "Y.RAJINI" },
            "IDS": { name: "INTRODUCTION TO DATA SCIENCE", code: "R245A6707", faculty: "T.RAVALI" },
            "INTRODUCTION TO DATA SCIENCE": { name: "INTRODUCTION TO DATA SCIENCE", code: "R245A6707", faculty: "T.RAVALI" },
            "DATA SCIENCE": { name: "INTRODUCTION TO DATA SCIENCE", code: "R245A6707", faculty: "T.RAVALI" },
            "DWDM": { name: "DATA WAREHOUSING AND DATA MINING", code: "R245A1206", faculty: "S.THIRUPATHI" },
            "DATA WAREHOUSING AND DATA MINING": { name: "DATA WAREHOUSING AND DATA MINING", code: "R245A1206", faculty: "S.THIRUPATHI" },
            "DATA MINING": { name: "DATA WAREHOUSING AND DATA MINING", code: "R245A1206", faculty: "S.THIRUPATHI" },
            "AI": { name: "ARTIFICIAL INTELLIGENCE", code: "R245A0513", faculty: "P.SUJITHA" },
            "ARTIFICIAL INTELLIGENCE": { name: "ARTIFICIAL INTELLIGENCE", code: "R245A0513", faculty: "P.SUJITHA" },
            "R & A": { name: "ROBOTICS AND AUTOMATION", code: "R245A0351", faculty: "K.CHAITHANYA" },
            "R&A": { name: "ROBOTICS AND AUTOMATION", code: "R245A0351", faculty: "K.CHAITHANYA" },
            "ROBOTICS AND AUTOMATION": { name: "ROBOTICS AND AUTOMATION", code: "R245A0351", faculty: "K.CHAITHANYA" },
            "ROBOTICS": { name: "ROBOTICS AND AUTOMATION", code: "R245A0351", faculty: "K.CHAITHANYA" },
            "DWDM LAB": { name: "DATA WAREHOUSING AND DATA MINING LAB", code: "R245A0590", faculty: "S.THIRUPATHI / Y.RAJINI" },
            "DATA WAREHOUSING AND DATA MINING LAB": { name: "DATA WAREHOUSING AND DATA MINING LAB", code: "R245A0590", faculty: "S.THIRUPATHI / Y.RAJINI" },
            "AI LAB": { name: "ARTIFICIAL INTELLIGENCE LAB", code: "R245A0588", faculty: "P.SUJITHA / S.THIRUPATHI" },
            "ARTIFICIAL INTELLIGENCE LAB": { name: "ARTIFICIAL INTELLIGENCE LAB", code: "R245A0588", faculty: "P.SUJITHA / S.THIRUPATHI" },
            "PDS LAB": { name: "PROFESSIONAL DEVELOPMENT LAB", code: "R245A6684", faculty: "E.KAVYA" },
            "PROFESSIONAL DEVELOPMENT LAB": { name: "PROFESSIONAL DEVELOPMENT LAB", code: "R245A6684", faculty: "E.KAVYA" },
            "IPR": { name: "INTELLECTUAL PROPERTY RIGHTS", code: "R245A2151", faculty: "K.LAVANYA" },
            "INTELLECTUAL PROPERTY RIGHTS": { name: "INTELLECTUAL PROPERTY RIGHTS", code: "R245A2151", faculty: "K.LAVANYA" },
            "TUTORIAL": { name: "TUTORIAL", code: "TUTORIAL", faculty: "FACULTY" },
            "TUT": { name: "TUTORIAL", code: "TUTORIAL", faculty: "FACULTY" },
            "TEST": { name: "TEST", code: "TEST", faculty: "FACULTY" }
        };

        // File selection UI handlers
        pdfDropzone.addEventListener('click', (e) => {
            if (e.target.closest('#btn-remove-pdf')) return;
            pdfFileInput.click();
        });

        pdfFileInput.addEventListener('change', (e) => {
            const files = e.target.files;
            if (files && files.length > 0) {
                handleSelectedFile(files[0]);
            }
        });

        pdfDropzone.addEventListener('dragover', (e) => {
            e.preventDefault();
            pdfDropzone.style.borderColor = 'var(--primary)';
            pdfDropzone.style.background = 'var(--primary-light)';
        });

        pdfDropzone.addEventListener('dragleave', (e) => {
            e.preventDefault();
            pdfDropzone.style.borderColor = 'var(--card-border)';
            pdfDropzone.style.background = 'var(--bg-secondary)';
        });

        pdfDropzone.addEventListener('drop', (e) => {
            e.preventDefault();
            pdfDropzone.style.borderColor = 'var(--card-border)';
            pdfDropzone.style.background = 'var(--bg-secondary)';
            const files = e.dataTransfer.files;
            if (files && files.length > 0) {
                handleSelectedFile(files[0]);
            }
        });

        if (btnRemovePdf) {
            btnRemovePdf.addEventListener('click', (e) => {
                e.stopPropagation();
                resetPdfSelection();
            });
        }

        function handleSelectedFile(file) {
            if (!file.name.toLowerCase().endsWith('.pdf')) {
                alert("Please select a valid PDF file (.pdf).");
                return;
            }
            selectedPdfFile = file;
            pdfFilename.textContent = file.name;
            pdfFilesize.textContent = (file.size / 1024).toFixed(1) + " KB";
            pdfDropContent.style.display = 'none';
            pdfFileDetails.style.display = 'flex';
            btnParsePdf.disabled = false;
            if (pdfStatusBadge) {
                pdfStatusBadge.className = 'status-badge info';
                pdfStatusBadge.innerHTML = '<i class="fas fa-file-pdf"></i> File Ready — Click Parse';
            }
            if (pdfSuccessBox) pdfSuccessBox.style.display = 'none';
        }

        function resetPdfSelection() {
            selectedPdfFile = null;
            pdfFileInput.value = '';
            pdfDropContent.style.display = 'block';
            pdfFileDetails.style.display = 'none';
            btnParsePdf.disabled = true;
            if (pdfStatusBadge) {
                pdfStatusBadge.className = 'status-badge info';
                pdfStatusBadge.innerHTML = '<i class="fas fa-info-circle"></i> Ready for Upload';
            }
            if (previewCard) previewCard.style.display = 'none';
            if (pdfSuccessBox) pdfSuccessBox.style.display = 'none';
        }

        // Parse Timetable from PDF File or Buffer
        async function extractTimetableData(fileOrBuffer) {
            let arrayBuffer;
            if (fileOrBuffer instanceof ArrayBuffer) {
                arrayBuffer = fileOrBuffer;
            } else {
                arrayBuffer = await fileOrBuffer.arrayBuffer();
            }

            if (typeof pdfjsLib === 'undefined') {
                throw new Error("PDF.js library is not loaded. Please check your network connection.");
            }

            const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
            const pdf = await loadingTask.promise;

            let allItems = [];
            let fullRawText = "";

            for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
                const page = await pdf.getPage(pageNum);
                const content = await page.getTextContent();
                content.items.forEach(item => {
                    const str = item.str.trim();
                    if (str) {
                        allItems.push({
                            str: str,
                            x: item.transform[4],
                            y: item.transform[5],
                            w: item.width,
                            h: item.height,
                            page: pageNum
                        });
                        fullRawText += str + " ";
                    }
                });
                fullRawText += "\n";
            }

            // 1. Detect Year & Class / Section
            const rawUpper = fullRawText.toUpperCase();
            let detectedYear = 'IV';
            if (/\b(?:III|3RD|THIRD)\b/i.test(rawUpper)) {
                detectedYear = 'III';
            } else if (/\b(?:II|2ND|SECOND)\b/i.test(rawUpper)) {
                detectedYear = 'II';
            } else if (/\b(?:I|1ST|FIRST)\b/i.test(rawUpper)) {
                detectedYear = 'I';
            }

            let detectedSection = 'D';
            if (/SEC(?:TION)?[\s:-]*D\b/i.test(rawUpper) || /CSE[\s\(-]*DS[\s\)-]*-?\s*D\b/i.test(rawUpper)) {
                detectedSection = 'D';
            } else if (/SEC(?:TION)?[\s:-]*C\b/i.test(rawUpper) || /CSE[\s\(-]*DS[\s\)-]*-?\s*C\b/i.test(rawUpper)) {
                detectedSection = 'C';
            } else if (/SEC(?:TION)?[\s:-]*B\b/i.test(rawUpper) || /CSE[\s\(-]*DS[\s\)-]*-?\s*B\b/i.test(rawUpper)) {
                detectedSection = 'B';
            } else if (/SEC(?:TION)?[\s:-]*A\b/i.test(rawUpper) || /CSE[\s\(-]*DS[\s\)-]*-?\s*A\b/i.test(rawUpper)) {
                detectedSection = 'A';
            }

            let detectedClassId = `${detectedYear}_${detectedSection}`;

            // 2. Parse Subject Details & Faculty Assignment Legend from PDF
            const isFourthYear = detectedYear === 'IV' && !rawUpper.includes('3RD') && !rawUpper.includes('III YEAR') && !rawUpper.includes('III BTECH');
            const isThirdYear = detectedYear === 'III' || rawUpper.includes('3RD') || rawUpper.includes('III YEAR') || rawUpper.includes('III BTECH');
            const subjectMap = isFourthYear 
                ? JSON.parse(JSON.stringify(KNOWN_SUBJECTS_CATALOG)) 
                : (isThirdYear ? JSON.parse(JSON.stringify(KNOWN_SUBJECTS_CATALOG_III)) : {});
            const legendRegex = /(?:(\d+)[\.\)]\s*)?([A-Z0-9]{5,10})\s*[-:]\s*([^(]+?)\s*\(([A-Z0-9\s]+)\)\s*[-:]\s*([A-Za-z\s\.\/]+?)(?=(?:\s+\d+[\.\)]|\s+[A-Z0-9]{5,10}\s*[-:]|$))/g;

            let legendCleanText = fullRawText;
            const hdrIdx = legendCleanText.indexOf("SUBJECT DETAILS");
            if (hdrIdx !== -1) {
                legendCleanText = legendCleanText.slice(hdrIdx).replace(/SUBJECT DETAILS\s*(?:&|AND)?\s*FACULTY ASSIGNMENT\s*:?/i, '');
            }

            let m;
            while ((m = legendRegex.exec(legendCleanText)) !== null) {
                const code = m[2].trim().toUpperCase();
                const name = m[3].trim().toUpperCase();
                const shortCode = m[4].trim().toUpperCase();
                const faculty = m[5].trim().replace(/\s+/g, ' ');

                const entry = { name, code, faculty };
                subjectMap[code] = entry;
                subjectMap[shortCode] = entry;
                subjectMap[name] = entry;

                if (name.includes("FULL STACK") || shortCode.includes("FSD")) {
                    subjectMap["FSD LAB"] = { name: "FULL STACK WEB DEVELOPMENT LAB", code: code, faculty: faculty };
                    subjectMap["FSD"] = entry;
                }
            }

            // Fallback for IV-year: search any course codes like R22A0522
            if (isFourthYear) {
                const codeMatches = fullRawText.match(/R\d{2}[A-Z]\d{4}/g) || [];
                codeMatches.forEach(code => {
                    for (const k in KNOWN_SUBJECTS_CATALOG) {
                        if (KNOWN_SUBJECTS_CATALOG[k].code === code) {
                            subjectMap[code] = KNOWN_SUBJECTS_CATALOG[k];
                            subjectMap[k] = KNOWN_SUBJECTS_CATALOG[k];
                        }
                    }
                });
            }

            // Fallback for III-year: search any course codes like R245A0506
            if (isThirdYear) {
                const codeMatches = fullRawText.match(/R24[50-9]A[0-9]{4}/g) || [];
                codeMatches.forEach(code => {
                    for (const k in KNOWN_SUBJECTS_CATALOG_III) {
                        if (KNOWN_SUBJECTS_CATALOG_III[k].code === code) {
                            subjectMap[code] = KNOWN_SUBJECTS_CATALOG_III[k];
                            subjectMap[k] = KNOWN_SUBJECTS_CATALOG_III[k];
                        }
                    }
                });
            }

            // 3. Extract Days and Periods via Line Clustering and Horizontal Sorting
            const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
            const dayAliases = {
                "MON": "Monday", "MONDAY": "Monday",
                "TUE": "Tuesday", "TUESDAY": "Tuesday",
                "WED": "Wednesday", "WEDNESDAY": "Wednesday",
                "THU": "Thursday", "THURSDAY": "Thursday",
                "FRI": "Friday", "FRIDAY": "Friday",
                "SAT": "Saturday", "SATURDAY": "Saturday"
            };

            const lineThreshold = 4;
            const lines = [];
            allItems.sort((a, b) => b.y - a.y);

            allItems.forEach(item => {
                let placed = false;
                for (const line of lines) {
                    if (Math.abs(line.y - item.y) <= lineThreshold) {
                        line.items.push(item);
                        placed = true;
                        break;
                    }
                }
                if (!placed) {
                    lines.push({ y: item.y, items: [item] });
                }
            });

            lines.forEach(line => line.items.sort((a, b) => a.x - b.x));

            const parsedSchedule = {};
            daysOfWeek.forEach(d => { parsedSchedule[d] = {}; });

            lines.forEach(line => {
                const firstToken = line.items[0]?.str.toUpperCase().replace(/[^A-Z]/g, '');
                let matchedDay = dayAliases[firstToken];

                if (!matchedDay) {
                    const firstFew = line.items.slice(0, 2);
                    for (const item of firstFew) {
                        const s = item.str.toUpperCase().replace(/[^A-Z]/g, '');
                        if (dayAliases[s] && item.x < 120) {
                            matchedDay = dayAliases[s];
                            break;
                        }
                    }
                }

                if (matchedDay) {
                    const filtered = line.items.filter(it => {
                        const s = it.str.toUpperCase().trim();
                        if (dayAliases[s.replace(/[^A-Z]/g, '')] && it.x < 120) return false;
                        if (s.includes("LUNCH") || s.includes("BREAK") || s.includes("INTERVAL")) return false;
                        if (/^\d{1,2}[:.]\d{2}/.test(s)) return false;
                        if (s === "|" || s === "-" || s === "—") return false;
                        return true;
                    });

                    // Merge fragmented cell tokens on the same line if x distance < 25
                    const cellTokens = [];
                    let curToken = null;
                    filtered.forEach(it => {
                        if (!curToken) {
                            curToken = { str: it.str.trim(), x: it.x, w: it.w };
                        } else {
                            if ((it.x - (curToken.x + curToken.w)) < 25) {
                                curToken.str += " " + it.str.trim();
                                curToken.w = (it.x + it.w) - curToken.x;
                            } else {
                                cellTokens.push(curToken);
                                curToken = { str: it.str.trim(), x: it.x, w: it.w };
                            }
                        }
                    });
                    if (curToken) cellTokens.push(curToken);

                    // Map cellTokens to Periods 1 to 6
                    const isLabRow = cellTokens.some(t => t.str.toUpperCase().includes("LAB") || t.str.toUpperCase().includes("FSDL"));

                    if (isLabRow && cellTokens.length <= 4) {
                        // Multi-period lab row where lab spans 3 periods
                        let pIdx = 1;
                        cellTokens.forEach(t => {
                            if (pIdx > 6) return;
                            const tokStr = t.str.toUpperCase();
                            const resolved = resolveSubject(tokStr, subjectMap);

                            if (tokStr.includes("LAB") || tokStr.includes("FSDL")) {
                                const labSpan = (pIdx <= 3) ? [1, 2, 3] : [4, 5, 6];
                                labSpan.forEach(sp => {
                                    parsedSchedule[matchedDay][sp] = {
                                        subjectName: resolved.name,
                                        subjectCode: resolved.code,
                                        faculty: resolved.faculty,
                                        startTime: STANDARD_PERIOD_TIMES[sp].startTime,
                                        endTime: STANDARD_PERIOD_TIMES[sp].endTime
                                    };
                                });
                                pIdx = Math.max(pIdx, labSpan[labSpan.length - 1] + 1);
                            } else {
                                parsedSchedule[matchedDay][pIdx] = {
                                    subjectName: resolved.name,
                                    subjectCode: resolved.code,
                                    faculty: resolved.faculty,
                                    startTime: STANDARD_PERIOD_TIMES[pIdx].startTime,
                                    endTime: STANDARD_PERIOD_TIMES[pIdx].endTime
                                };
                                pIdx++;
                            }
                        });
                    } else {
                        // Discrete 6 slots (or regular sequence)
                        cellTokens.forEach((t, idx) => {
                            const p = idx + 1;
                            if (p > 6) return;
                            const resolved = resolveSubject(t.str, subjectMap);
                            parsedSchedule[matchedDay][p] = {
                                subjectName: resolved.name,
                                subjectCode: resolved.code,
                                faculty: resolved.faculty,
                                startTime: STANDARD_PERIOD_TIMES[p].startTime,
                                endTime: STANDARD_PERIOD_TIMES[p].endTime
                            };
                        });
                    }
                }
            });

            // 4. Exact Timetable Extraction - Do NOT auto-fill missing slots with template or dummy data
            return {
                detectedClassId: detectedClassId,
                schedule: parsedSchedule,
                rawText: fullRawText
            };
        }

        function resolveSubject(token, subjectMap) {
            if (!token) return { name: "", code: "", faculty: "" };
            const clean = token.toUpperCase().trim();

            if (subjectMap[clean]) return subjectMap[clean];

            // Strip initials in parenthesis like (A.S.)
            const baseToken = clean.replace(/\([^)]+\)/g, '').trim();
            if (subjectMap[baseToken]) return subjectMap[baseToken];

            // Check TUTORIAL
            if (clean.includes('TUT')) return { name: 'TUTORIAL', code: 'TUT', faculty: '' };

            for (const key in subjectMap) {
                if (key.length >= 3 && (clean.includes(key) || key.includes(clean))) {
                    return subjectMap[key];
                }
            }

            // Retain the exact token from the PDF cell with blank code/faculty
            return {
                name: baseToken || clean || "",
                code: "",
                faculty: ""
            };
        }

        // Render preview table matrix
        function renderPreviewMatrix(targetClassId, schedule) {
            if (!previewTbody || !previewCard) return;

            activeTargetClassId = targetClassId;
            activeParsedSchedule = schedule;

            const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
            previewTbody.innerHTML = '';

            let classDisplay = targetClassId.replace('_', ' ');
            if (pdfTtClassSelect) {
                const opt = pdfTtClassSelect.querySelector(`option[value="${targetClassId}"]`);
                if (opt) classDisplay = opt.textContent;
            }
            if (previewClassLabel) previewClassLabel.textContent = classDisplay;

            daysOfWeek.forEach(day => {
                const tr = document.createElement('tr');
                let dayHtml = `<td style="font-weight: 800; color: var(--primary); vertical-align: middle;">${day}</td>`;

                for (let p = 1; p <= 6; p++) {
                    const info = (schedule[day] && schedule[day][p]) ? schedule[day][p] : { subjectName: '', subjectCode: '', faculty: '' };
                    dayHtml += `
                        <td style="padding: 4px 6px;">
                            <input type="text" class="preview-sub-name" data-day="${day}" data-period="${p}" value="${info.subjectName || ''}" placeholder="Free / Empty" title="Subject Name" style="font-weight: 700; width: 100%; border: 1px solid var(--card-border); background: var(--bg-secondary); color: var(--text-primary); border-radius: 4px; padding: 4px 6px; font-size: 0.78rem; margin-bottom: 3px;">
                            <div style="display: flex; gap: 3px;">
                                <input type="text" class="preview-sub-code" data-day="${day}" data-period="${p}" value="${info.subjectCode || ''}" placeholder="Code" title="Course Code" style="font-size: 0.72rem; width: 48%; border: 1px solid var(--card-border); background: var(--bg-secondary); color: var(--text-secondary); border-radius: 4px; padding: 2px 4px;">
                                <input type="text" class="preview-sub-faculty" data-day="${day}" data-period="${p}" value="${info.faculty || ''}" placeholder="Faculty" title="Faculty Name" style="font-size: 0.72rem; width: 52%; border: 1px solid var(--card-border); background: var(--bg-secondary); color: var(--text-secondary); border-radius: 4px; padding: 2px 4px;">
                            </div>
                        </td>
                    `;
                }
                tr.innerHTML = dayHtml;
                previewTbody.appendChild(tr);
            });

            previewCard.style.display = 'block';
            previewCard.scrollIntoView({ behavior: 'smooth', block: 'start' });

            if (pdfStatusBadge) {
                pdfStatusBadge.className = 'status-badge success';
                pdfStatusBadge.innerHTML = '<i class="fas fa-check-circle"></i> Timetable Parsed — Review & Save';
            }
        }

        // Parse Button Click
        btnParsePdf.addEventListener('click', async () => {
            if (!selectedPdfFile) {
                alert("Please select a PDF file first.");
                return;
            }

            try {
                btnParsePdf.disabled = true;
                btnParsePdf.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Parsing PDF...';
                if (pdfStatusBadge) {
                    pdfStatusBadge.className = 'status-badge warning';
                    pdfStatusBadge.innerHTML = '<i class="fas fa-sync fa-spin"></i> Extracting Schedule...';
                }

                const result = await extractTimetableData(selectedPdfFile);

                // Determine target class
                let targetClassId = pdfTtClassSelect.value;
                if (targetClassId === 'AUTO') {
                    targetClassId = result.detectedClassId;
                    if (pdfTtClassSelect.querySelector(`option[value="${targetClassId}"]`)) {
                        pdfTtClassSelect.value = targetClassId;
                    }
                }

                renderPreviewMatrix(targetClassId, result.schedule);
            } catch (err) {
                console.error("PDF Timetable Parse Error:", err);
                alert("Could not parse PDF timetable: " + err.message);
                if (pdfStatusBadge) {
                    pdfStatusBadge.className = 'status-badge warning';
                    pdfStatusBadge.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Parsing Failed';
                }
            } finally {
                btnParsePdf.disabled = false;
                btnParsePdf.innerHTML = '<i class="fas fa-wand-magic-sparkles"></i> Parse Timetable PDF';
            }
        });

        // Quick Load Sample PDF Timetable (IV-D)
        if (btnLoadSamplePdf) {
            btnLoadSamplePdf.addEventListener('click', () => {
                const sampleClassId = 'IV_D';
                if (pdfTtClassSelect.querySelector(`option[value="${sampleClassId}"]`)) {
                    pdfTtClassSelect.value = sampleClassId;
                }
                const sampleSchedule = (window.OFFICIAL_TIMETABLES && window.OFFICIAL_TIMETABLES[sampleClassId])
                    ? JSON.parse(JSON.stringify(window.OFFICIAL_TIMETABLES[sampleClassId].schedule))
                    : {};

                renderPreviewMatrix(sampleClassId, sampleSchedule);
            });
        }

        // Confirm and Save to Database
        if (btnConfirmSavePdf) {
            btnConfirmSavePdf.addEventListener('click', async () => {
                if (!previewTbody) return;

                const targetClassId = pdfTtClassSelect.value !== 'AUTO' ? pdfTtClassSelect.value : activeTargetClassId;
                if (!targetClassId) {
                    alert("Please select a target class.");
                    return;
                }

                // Harvest edited values from preview inputs
                const finalSchedule = {};
                const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
                daysOfWeek.forEach(d => { finalSchedule[d] = {}; });

                const subNameInputs = previewTbody.querySelectorAll('.preview-sub-name');
                subNameInputs.forEach(input => {
                    const day = input.getAttribute('data-day');
                    const p = input.getAttribute('data-period');
                    const codeInput = previewTbody.querySelector(`.preview-sub-code[data-day="${day}"][data-period="${p}"]`);
                    const facultyInput = previewTbody.querySelector(`.preview-sub-faculty[data-day="${day}"][data-period="${p}"]`);
                    const subName = input.value.trim().toUpperCase();

                    // Only save if subject name is provided; keep empty slots empty
                    if (subName) {
                        finalSchedule[day][p] = {
                            subjectName: subName,
                            subjectCode: (codeInput ? codeInput.value.trim().toUpperCase() : ''),
                            faculty: (facultyInput ? facultyInput.value.trim() : ''),
                            startTime: STANDARD_PERIOD_TIMES[p].startTime,
                            endTime: STANDARD_PERIOD_TIMES[p].endTime
                        };
                    }
                });

                let classDisplayName = targetClassId.replace('_', ' ');
                const opt = pdfTtClassSelect.querySelector(`option[value="${targetClassId}"]`);
                if (opt) classDisplayName = opt.textContent;

                try {
                    btnConfirmSavePdf.disabled = true;
                    btnConfirmSavePdf.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving to Database...';

                    // 1. Save to LocalStorage
                    const customTt = JSON.parse(localStorage.getItem('custom_timetables') || '{}');
                    customTt[targetClassId] = {
                        classId: targetClassId,
                        className: classDisplayName,
                        schedule: finalSchedule
                    };
                    localStorage.setItem('custom_timetables', JSON.stringify(customTt));

                    // 2. Save to in-memory OFFICIAL_TIMETABLES
                    if (window.OFFICIAL_TIMETABLES) {
                        if (!window.OFFICIAL_TIMETABLES[targetClassId]) {
                            window.OFFICIAL_TIMETABLES[targetClassId] = { className: classDisplayName, schedule: finalSchedule };
                        } else {
                            window.OFFICIAL_TIMETABLES[targetClassId].schedule = finalSchedule;
                        }
                    }

                    // 3. Save to Cloud Firestore
                    if (typeof db !== 'undefined') {
                        await db.collection('timetables').doc(targetClassId).set({
                            classId: targetClassId,
                            className: classDisplayName,
                            schedule: finalSchedule,
                            updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
                            uploadedAt: firebase.firestore.FieldValue.serverTimestamp(),
                            source: 'pdf_upload'
                        }, { merge: true });
                    }

                    // 4. Update Lower Timetable Viewer
                    const ttViewClass = document.getElementById('tt-view-class');
                    if (ttViewClass && ttViewClass.querySelector(`option[value="${targetClassId}"]`)) {
                        ttViewClass.value = targetClassId;
                    }
                    if (typeof viewTimetable === 'function') {
                        viewTimetable();
                    }

                    // 5. Update Quick Action Links in Success Box
                    const linkDashboard = document.getElementById('pdf-link-dashboard');
                    const linkMonthly = document.getElementById('pdf-link-monthly');
                    const linkWeekly = document.getElementById('pdf-link-weekly');
                    if (linkDashboard) linkDashboard.href = `index.html?class=${targetClassId}`;
                    if (linkMonthly) linkMonthly.href = `monthly-report.html?class=${targetClassId}`;
                    if (linkWeekly) linkWeekly.href = `weekly-report.html?class=${targetClassId}`;

                    if (pdfSuccessBox) {
                        pdfSuccessBox.style.display = 'block';
                        pdfSuccessBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                    }

                    if (pdfStatusBadge) {
                        pdfStatusBadge.className = 'status-badge success';
                        pdfStatusBadge.innerHTML = '<i class="fas fa-check-double"></i> Saved to Cloud Database!';
                    }
                } catch (err) {
                    console.error("Firestore Save Timetable Error:", err);
                    alert("Failed to save timetable to database: " + err.message);
                } finally {
                    btnConfirmSavePdf.disabled = false;
                    btnConfirmSavePdf.innerHTML = '<i class="fas fa-save"></i> Confirm & Save to Database';
                }
            });
        }
    }

    // Initialize
    loadPendingUsers();
    loadHolidays();
    loadSemesterConfig();
    loadClassesForTimetable();
    loadAdminStats();
    initPdfTimetableUpload();
});
