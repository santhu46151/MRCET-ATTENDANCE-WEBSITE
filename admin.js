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

    // Initialize
    loadPendingUsers();
});
