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
            } else if (authManager.user.role === 'faculty') {
                classesSnap = await db.collection('classes').where('facultyUid', '==', authManager.user.uid).get();
            } else if (authManager.user.role === 'student' && authManager.user.year && authManager.user.section) {
                const classId = `${authManager.user.year}_${authManager.user.section}`;
                const classDoc = await db.collection('classes').doc(classId).get();
                classesSnap = classDoc.exists ? [classDoc] : [];
            } else {
                classesSnap = [];
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

        roster.forEach((student, index) => {
            const stats = studentStats[student.rollNo];
            let percent = 0;
            
            if (workingDays > 0) {
                percent = Math.round((stats.present / workingDays) * 100);
            }
            
            totalClassPercentSum += percent;

            const isGood = percent >= 75;

            html += `
                <tr>
                    <td>${index + 1}</td>
                    <td style="font-family: monospace; font-weight: 600;">${student.rollNo}</td>
                    <td>${student.name}</td>
                    <td>${workingDays}</td>
                    <td>${stats.present}</td>
                    <td>${stats.absent}</td>
                    <td style="font-weight: 700; color: ${isGood ? 'var(--success)' : 'var(--danger)'};">${percent}%</td>
                </tr>
            `;
        });

        tableBody.innerHTML = html || '<tr><td colspan="7" style="text-align: center;">No data found.</td></tr>';

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
        csvContent += "S.No,Roll Number,Student Name,Total Classes,Present,Absent,Percentage\r\n";

        roster.forEach((student, index) => {
            const stats = studentStats[student.rollNo];
            const percent = workingDays > 0 ? Math.round((stats.present / workingDays) * 100) : 0;
            
            csvContent += `${index + 1},"${student.rollNo}","${student.name}",${workingDays},${stats.present},${stats.absent},${percent}%\r\n`;
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
        // Landscape orientation to fit the table better
        const doc = new jsPDF('landscape');
        
        const { roster, studentStats, workingDays, classInfo, start, end } = currentReportData;
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();

        // ------------------ HEADER SECTION ------------------
        
        // 1. College Name (Dark Red/Burgundy)
        doc.setFontSize(20);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(128, 0, 32); // Burgundy
        let text = "MALLA REDDY COLLEGE OF ENGINEERING & TECHNOLOGY";
        let textWidth = doc.getTextWidth(text);
        doc.text(text, (pageWidth - textWidth) / 2, 20);

        // 2. Autonomous Text (Red)
        doc.setFontSize(12);
        doc.setTextColor(200, 0, 0); // Red
        text = "(Autonomous Institution - UGC, Govt. of India)";
        textWidth = doc.getTextWidth(text);
        doc.text(text, (pageWidth - textWidth) / 2, 28);

        // 3. Sponsored By (Black)
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(0, 0, 0); // Black
        text = "Sponsored by Malla Reddy Educational Society. Affiliated to JNTUH, Hyderabad. Approved by AICTE, New Delhi.";
        textWidth = doc.getTextWidth(text);
        doc.text(text, (pageWidth - textWidth) / 2, 35);
        
        text = "Maisammaguda, Dhulapally, Secunderabad - 500100, Telangana, India.";
        textWidth = doc.getTextWidth(text);
        doc.text(text, (pageWidth - textWidth) / 2, 41);

        // Header Line Separator
        doc.setLineWidth(0.5);
        doc.line(14, 46, pageWidth - 14, 46);

        // 4. Department Name
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        text = "DEPARTMENT OF COMPUTER SCIENCE AND ENGINEERING (DATA SCIENCE)";
        textWidth = doc.getTextWidth(text);
        doc.text(text, (pageWidth - textWidth) / 2, 54);

        // 5. Report Title
        doc.setFontSize(12);
        const [year, sec, dept] = classInfo.split('_');
        text = `SEMESTER ATTENDANCE REPORT - ${start} to ${end} (SECTION: ${year}-${sec.replace('Sec','')})`;
        textWidth = doc.getTextWidth(text);
        doc.text(text, (pageWidth - textWidth) / 2, 62);

        // Box around report title
        doc.rect((pageWidth - textWidth) / 2 - 5, 56, textWidth + 10, 9);

        // ------------------ TABLE SECTION ------------------
        const tableColumn = ["S.No", "Roll Number", "Student Name", "Total Classes", "Present", "Absent", "% of Attendance"];
        const tableRows = [];

        roster.forEach((student, index) => {
            const stats = studentStats[student.rollNo];
            const percent = workingDays > 0 ? ((stats.present / workingDays) * 100).toFixed(2) : 0;
            
            tableRows.push([
                (index + 1).toString(),
                student.rollNo,
                student.name,
                workingDays.toString(),
                stats.present.toString(),
                stats.absent.toString(),
                percent + "%"
            ]);
        });

        doc.autoTable({
            startY: 68,
            head: [tableColumn],
            body: tableRows,
            theme: 'grid', // Standard grid like the PDF
            styles: { 
                fontSize: 9,
                cellPadding: 2,
                halign: 'center',
                valign: 'middle',
                lineColor: [0, 0, 0],
                lineWidth: 0.1
            },
            headStyles: { 
                fillColor: [240, 240, 240], // Light grey header
                textColor: [0, 0, 0],
                fontStyle: 'bold',
                halign: 'center'
            },
            columnStyles: {
                0: { cellWidth: 15 }, // S.No
                1: { cellWidth: 35, fontStyle: 'bold' }, // Roll Number
                2: { halign: 'left' }, // Student Name
                3: { cellWidth: 25 }, // Total Classes
                4: { cellWidth: 20 }, // Present
                5: { cellWidth: 20 }, // Absent
                6: { cellWidth: 30, fontStyle: 'bold' } // % Attendance
            },
            didParseCell: function(data) {
                // Color percentage column based on value
                if (data.section === 'body' && data.column.index === 6) {
                    const val = parseFloat(data.cell.raw);
                    if (val < 75) {
                        data.cell.styles.textColor = [200, 0, 0]; // Red text for shortage
                    }
                }
            }
        });

        // ------------------ FOOTER SECTION ------------------
        const finalY = doc.lastAutoTable.finalY || 68;
        
        // Add footer if it fits, else add a new page
        if (finalY + 30 > pageHeight) {
            doc.addPage();
        }

        doc.setFontSize(11);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(0, 0, 0);

        const footerY = (doc.lastAutoTable.finalY || 68) + 25;
        
        // 3 Signatories spaced out evenly
        doc.text("CLASS INCHARGE", 30, footerY);
        text = "ATTENDANCE COORDINATOR";
        textWidth = doc.getTextWidth(text);
        doc.text(text, (pageWidth - textWidth) / 2, footerY);
        text = "HEAD OF DEPARTMENT";
        textWidth = doc.getTextWidth(text);
        doc.text(text, pageWidth - 30 - textWidth, footerY);

        doc.save(`Semester_Report_${classInfo}_${start}_${end}.pdf`);
    }

    generateBtn.addEventListener('click', generateReport);
    exportCsvBtn.addEventListener('click', exportToCSV);
    exportPdfBtn.addEventListener('click', exportToPDF);

    init();
});
