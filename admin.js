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
    logoutBtn.addEventListener('click', async () => {
        await authManager.logout();
    });

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
                    updatedBy: authManager.user.uid,
                    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                });
                alert("Global semester settings saved successfully!");
            } catch (error) {
                alert(`Error saving config: ${error.message}`);
            }
        });
    }

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
});
