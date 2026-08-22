document.addEventListener('DOMContentLoaded', () => {
    if (!authManager.isAuthenticated()) {
        alert("Please login to view this page.");
        window.location.href = 'login.html';
        return;
    }

    // UI Elements
    const classSelect = document.getElementById('class-select');
    const startDateInput = document.getElementById('start-date');
    const endDateInput = document.getElementById('end-date');
    const generateBtn = document.getElementById('generate-btn');
    const exportCsvBtn = document.getElementById('export-csv-btn');
    const exportPdfBtn = document.getElementById('export-pdf-btn');
    const loading = document.getElementById('loading');
    const reportContent = document.getElementById('report-content');
    const tableBody = document.getElementById('report-table-body');
    
    // Summary UI
    const summaryWorkingDays = document.getElementById('summary-working-days');
    const summaryTotalStudents = document.getElementById('summary-total-students');
    const summaryAveragePercent = document.getElementById('summary-average-percent');

    let globalHolidays = [];
    let currentReportData = null; // store for export

    // Default Dates Fallback (if no config)
    const today = new Date();
    const defaultStartStr = '2026-07-06';
    
    // Parse URL params
    const urlParams = new URLSearchParams(window.location.search);
    const urlClassId = urlParams.get('class');
    const urlStart = urlParams.get('start');
    const urlEnd = urlParams.get('end');

    async function init() {
        // Load Semester Config
        try {
            const configDoc = await db.collection('settings').doc('semesterConfig').get();
            if (configDoc.exists) {
                const configData = configDoc.data();
                startDateInput.value = urlStart || configData.startDate || defaultStartStr;
                endDateInput.value = urlEnd || configData.endDate || today.toISOString().split('T')[0];
            } else {
                startDateInput.value = urlStart || defaultStartStr;
                endDateInput.value = urlEnd || today.toISOString().split('T')[0];
            }
        } catch (e) {
            console.error("Error loading config", e);
            startDateInput.value = urlStart || defaultStartStr;
            endDateInput.value = urlEnd || today.toISOString().split('T')[0];
        }
        // Load Classes
        try {
            let classesSnap;
            if (authManager.user.role === 'admin' || authManager.user.role === 'hod') {
                classesSnap = await db.collection('classes').get();
            } else {
                classesSnap = await db.collection('classes').where('facultyUid', '==', authManager.user.uid).get();
            }

            classSelect.innerHTML = '<option value="">-- Select Class --</option>';
            classesSnap.forEach(doc => {
                const data = doc.data();
                const option = document.createElement('option');
                option.value = doc.id;
                option.textContent = `${data.year} Year / Section ${data.section} (${data.department})`;
                if (urlClassId && doc.id === urlClassId) option.selected = true;
                classSelect.appendChild(option);
            });

            // Load Holidays
            const holidaysSnap = await db.collection('holidays').get();
            holidaysSnap.forEach(doc => globalHolidays.push(doc.data().date));

            // Auto-generate if URL params exist
            if (urlClassId) {
                generateReport();
            }

        } catch (error) {
            console.error("Initialization error:", error);
            classSelect.innerHTML = '<option value="">Error loading classes</option>';
        }
    }

    async function generateReport() {
        const classId = classSelect.value;
        const start = startDateInput.value;
        const end = endDateInput.value;

        if (!classId || !start || !end) {
            alert("Please select a class and specify a date range.");
            return;
        }

        loading.style.display = 'block';
        reportContent.style.display = 'none';

        try {
            const classDoc = await db.collection('classes').doc(classId).get();
            if (!classDoc.exists) throw new Error("Class not found.");

            const data = classDoc.data();
            const roster = data.roster || [];
            const history = data.history || {};

            let workingDays = 0;
            const studentStats = {};

            // Initialize student stats
            roster.forEach(student => {
                studentStats[student.rollNo] = {
                    name: student.name,
                    present: 0,
                    absent: 0
                };
            });

            // Process History
            const todayStr = today.toISOString().split('T')[0];

            Object.keys(history).forEach(dateStr => {
                // Filter bounds
                if (dateStr < start || dateStr > end) return;
                // Exclude future
                if (dateStr > todayStr) return;
                // Exclude holidays
                if (globalHolidays.includes(dateStr)) return;
                if (history[dateStr].isHoliday) return; // Legacy support

                workingDays++;
                
                const attendance = history[dateStr].attendance || {};
                
                roster.forEach(student => {
                    const status = attendance[student.rollNo];
                    if (status === 'absent') {
                        studentStats[student.rollNo].absent++;
                    } else {
                        // Assuming present if not marked absent (default behaviour in old system)
                        studentStats[student.rollNo].present++;
                    }
                });
            });

            // Render Report
            renderReport(roster, studentStats, workingDays);
            
            // Store for export
            currentReportData = {
                roster,
                studentStats,
                workingDays,
                classInfo: `${data.year}_Sec${data.section}_${data.department}`,
                start,
                end
            };

            loading.style.display = 'none';
            reportContent.style.display = 'block';

        } catch (error) {
            console.error("Report generation error:", error);
            alert("An error occurred while generating the report.");
            loading.style.display = 'none';
        }
    }

    function renderReport(roster, studentStats, workingDays) {
        summaryWorkingDays.textContent = workingDays;
        summaryTotalStudents.textContent = roster.length;

        let totalClassPercentSum = 0;
        let html = '';

        roster.forEach(student => {
            const stats = studentStats[student.rollNo];
            let percent = 0;
            
            if (workingDays > 0) {
                percent = Math.round((stats.present / workingDays) * 100);
            }
            
            totalClassPercentSum += percent;

            const isGood = percent >= 75;
            const statusClass = isGood ? 'status-good' : 'status-deficient';
            const statusText = isGood ? 'Good' : 'Deficient';

            html += `
                <tr>
                    <td style="font-family: monospace; font-weight: 600;">${student.rollNo}</td>
                    <td>${student.name}</td>
                    <td>${stats.present}</td>
                    <td>${stats.absent}</td>
                    <td style="font-weight: 700; color: ${isGood ? 'var(--success)' : 'var(--danger)'};">${percent}%</td>
                    <td><span class="status-badge ${statusClass}">${statusText}</span></td>
                </tr>
            `;
        });

        tableBody.innerHTML = html || '<tr><td colspan="6" style="text-align: center;">No data found.</td></tr>';

        const avg = roster.length > 0 ? Math.round(totalClassPercentSum / roster.length) : 0;
        summaryAveragePercent.textContent = `${avg}%`;
        summaryAveragePercent.style.color = avg >= 75 ? 'var(--success)' : 'var(--danger)';
    }

    function exportToCSV() {
        if (!currentReportData) {
            alert("Please generate a report first.");
            return;
        }

        const { roster, studentStats, workingDays, classInfo, start, end } = currentReportData;
        
        let csvContent = "data:text/csv;charset=utf-8,";
        csvContent += `Semester Attendance Report\r\n`;
        csvContent += `Class,${classInfo}\r\n`;
        csvContent += `Date Range,${start} to ${end}\r\n`;
        csvContent += `Total Working Days,${workingDays}\r\n\r\n`;
        csvContent += "Roll Number,Student Name,Present Days,Absent Days,Percentage,Status\r\n";

        roster.forEach(student => {
            const stats = studentStats[student.rollNo];
            const percent = workingDays > 0 ? Math.round((stats.present / workingDays) * 100) : 0;
            const status = percent >= 75 ? "Good" : "Deficient";
            
            csvContent += `"${student.rollNo}","${student.name}",${stats.present},${stats.absent},${percent}%,${status}\r\n`;
        });

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `Semester_Report_${classInfo}_${start}_${end}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    function exportToPDF() {
        if (!currentReportData) {
            alert("Please generate a report first.");
            return;
        }

        const { window } = globalThis;
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        const { roster, studentStats, workingDays, classInfo, start, end } = currentReportData;

        // Title
        doc.setFontSize(18);
        doc.text("Semester Attendance Report", 14, 22);
        
        // Metadata
        doc.setFontSize(11);
        doc.setTextColor(100);
        doc.text(`Class: ${classInfo.replace(/_/g, ' ')}`, 14, 30);
        doc.text(`Date Range: ${start} to ${end}`, 14, 36);
        doc.text(`Total Working Days: ${workingDays}`, 14, 42);

        // Table Data
        const tableColumn = ["Roll No", "Name", "Present", "Absent", "Percentage", "Status"];
        const tableRows = [];

        roster.forEach(student => {
            const stats = studentStats[student.rollNo];
            const percent = workingDays > 0 ? Math.round((stats.present / workingDays) * 100) : 0;
            const status = percent >= 75 ? "Good" : "Deficient";
            
            tableRows.push([
                student.rollNo,
                student.name,
                stats.present.toString(),
                stats.absent.toString(),
                percent + "%",
                status
            ]);
        });

        doc.autoTable({
            startY: 50,
            head: [tableColumn],
            body: tableRows,
            theme: 'striped',
            headStyles: { fillColor: [59, 130, 246] }, // Primary Blue
            styles: { fontSize: 9 },
            didParseCell: function(data) {
                // Color status column based on value
                if (data.section === 'body' && data.column.index === 5) {
                    if (data.cell.raw === 'Good') {
                        data.cell.styles.textColor = [16, 185, 129]; // Success Green
                        data.cell.styles.fontStyle = 'bold';
                    } else if (data.cell.raw === 'Deficient') {
                        data.cell.styles.textColor = [239, 68, 68]; // Danger Red
                        data.cell.styles.fontStyle = 'bold';
                    }
                }
            }
        });

        doc.save(`Semester_Report_${classInfo}_${start}_${end}.pdf`);
    }

    generateBtn.addEventListener('click', generateReport);
    exportCsvBtn.addEventListener('click', exportToCSV);
    exportPdfBtn.addEventListener('click', exportToPDF);

    init();
});
