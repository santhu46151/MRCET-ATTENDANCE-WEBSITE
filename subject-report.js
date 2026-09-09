document.addEventListener('DOMContentLoaded', () => {
    // Theme setup
    const isDarkMode = localStorage.getItem('theme') === 'dark';
    if (isDarkMode) {
        document.body.classList.add('dark-mode');
    }

    const classSelect = document.getElementById('class-select');
    const subjectSelect = document.getElementById('subject-select');
    const startDateInput = document.getElementById('start-date');
    const endDateInput = document.getElementById('end-date');
    const generateBtn = document.getElementById('generate-btn');
    const exportExcelBtn = document.getElementById('export-excel-btn');
    const exportPdfBtn = document.getElementById('export-pdf-btn');
    const printBtn = document.getElementById('print-btn');
    const loading = document.getElementById('loading');
    const reportsContainer = document.getElementById('reports-container');

    // Default dates setup
    const today = new Date();
    const todayYYYY = today.getFullYear();
    const todayMM = String(today.getMonth() + 1).padStart(2, '0');
    const todayDD = String(today.getDate()).padStart(2, '0');
    const todayStr = `${todayYYYY}-${todayMM}-${todayDD}`;

    if (!endDateInput.value) {
        endDateInput.value = todayStr;
    }
    if (!startDateInput.value) {
        startDateInput.value = '2026-07-06';
    }

    // Set saved class if exists
    const savedClassId = localStorage.getItem('current_class_id');
    if (savedClassId && classSelect.querySelector(`option[value="${savedClassId}"]`)) {
        classSelect.value = savedClassId;
    }

    let globalHolidays = [];

    // Initialize
    async function init() {
        try {
            if (typeof db !== 'undefined') {
                const holidaysSnap = await db.collection('holidays').get();
                holidaysSnap.forEach(doc => globalHolidays.push(doc.data().date));
            }
        } catch (e) {
            console.warn("Could not load holidays:", e);
        }

        populateSubjects();
        generateReport();
    }

    // Populate subjects based on class timetable
    function populateSubjects() {
        const classId = classSelect.value || "IV_D";
        subjectSelect.innerHTML = '';

        let schedule = {};
        try {
            const customTt = JSON.parse(localStorage.getItem('custom_timetables') || '{}');
            if (customTt[classId] && customTt[classId].schedule) {
                schedule = customTt[classId].schedule;
            }
        } catch(e) {}
        if (Object.keys(schedule).length === 0 && window.OFFICIAL_TIMETABLES && window.OFFICIAL_TIMETABLES[classId]) {
            schedule = window.OFFICIAL_TIMETABLES[classId].schedule || {};
        }

        const subjectsMap = {};
        for (const day in schedule) {
            for (const p in schedule[day]) {
                const item = schedule[day][p];
                if (item && item.subjectName && item.subjectName !== 'TUTORIAL') {
                    if (!subjectsMap[item.subjectName]) {
                        subjectsMap[item.subjectName] = {
                            name: item.subjectName,
                            code: item.subjectCode || 'Core',
                            faculty: item.faculty || 'Faculty'
                        };
                    }
                }
            }
        }

        const subjectNames = Object.keys(subjectsMap);

        if (subjectNames.length === 0) {
            subjectSelect.innerHTML = `
                <option value="FULL STACK DEVELOPMENT LAB">FULL STACK DEVELOPMENT LAB (R22A0589) [Lab - 3 Periods]</option>
                <option value="CLOUD COMPUTING">CLOUD COMPUTING (R22A0522)</option>
                <option value="DEEP LEARNING">DEEP LEARNING (R22A6605)</option>
                <option value="FULL STACK DEVELOPMENT">FULL STACK DEVELOPMENT (R22A0513)</option>
                <option value="DATABASE SECURITY">DATABASE SECURITY (R22A6214)</option>
                <option value="BLOCKCHAIN TECHNOLOGY">BLOCKCHAIN TECHNOLOGY (R22A0527)</option>
            `;
            return;
        }

        // Put Lab first or sort cleanly
        subjectNames.sort((a, b) => {
            const aIsLab = a.toUpperCase().includes('LAB');
            const bIsLab = b.toUpperCase().includes('LAB');
            if (aIsLab && !bIsLab) return -1;
            if (!aIsLab && bIsLab) return 1;
            return a.localeCompare(b);
        });

        subjectNames.forEach((name, idx) => {
            const info = subjectsMap[name];
            const isLab = name.toUpperCase().includes('LAB') || info.code.toUpperCase().includes('LAB') || info.code === 'R22A0589';
            const opt = document.createElement('option');
            opt.value = name;
            opt.textContent = `${name} (${info.code})${isLab ? ' [Lab - 3 Periods / Single Session]' : ''} - ${info.faculty}`;
            if (idx === 0) opt.selected = true;
            subjectSelect.appendChild(opt);
        });

        const allOpt = document.createElement('option');
        allOpt.value = '';
        allOpt.textContent = '-- All Subjects (Consolidated) --';
        subjectSelect.appendChild(allOpt);
    }

    classSelect.addEventListener('change', () => {
        populateSubjects();
        generateReport();
    });

    subjectSelect.addEventListener('change', generateReport);
    generateBtn.addEventListener('click', generateReport);

    // Fetch roster and history
    async function loadClassData(classId) {
        let roster = [];
        let history = {};

        // Local storage first
        try {
            const localRoster = JSON.parse(localStorage.getItem('attendance_roster'));
            const localHistory = JSON.parse(localStorage.getItem('attendance_history'));
            if (localRoster && Array.isArray(localRoster) && localRoster.length > 0) {
                roster = localRoster;
            }
            if (localHistory && typeof localHistory === 'object') {
                history = localHistory;
            }
        } catch (e) {}

        // Firestore sync
        if (typeof db !== 'undefined') {
            try {
                const doc = await db.collection('classes').doc(classId).get();
                if (doc.exists) {
                    const d = doc.data();
                    if (d.roster && d.roster.length > 0) roster = d.roster;
                    if (d.history) history = { ...history, ...d.history };
                }
            } catch (err) {
                console.warn("Firestore load error:", err);
            }
        }

        // Fallback roster if empty
        if (!roster || roster.length === 0) {
            roster = [
                { rollNo: "23N31A67K9", name: "SHAIK HASEENA" },
                { rollNo: "23N31A67L0", name: "SHAIK NOORUDDIN" },
                { rollNo: "23N31A67L1", name: "SHAIK SADIYA HUSSAIN" },
                { rollNo: "23N31A67L2", name: "SHAIK SHAHID ANWAR" },
                { rollNo: "23N31A67L3", name: "SHAMAGARI SUMEDH SOHAN" },
                { rollNo: "23N31A67L4", name: "SHIVANATHRI PRASANNA" },
                { rollNo: "23N31A67L5", name: "SHIVAYOGI AKSHAYA" },
                { rollNo: "23N31A67L6", name: "SIRI SHERI" },
                { rollNo: "23N31A67L7", name: "SHAIK SOHEL" },
                { rollNo: "23N31A67L8", name: "SONAL KUMAR" },
                { rollNo: "23N31A67L9", name: "SONTENA DINESH" },
                { rollNo: "23N31A67M0", name: "SOUDANI VINAY KUMAR" },
                { rollNo: "23N31A67M1", name: "SUDULA MOHAN SAI TEJ" },
                { rollNo: "23N31A67M2", name: "SURA ARUNKUMAR" },
                { rollNo: "23N31A67M3", name: "SYED SHA SHARAAZ HUSSAINI" },
                { rollNo: "23N31A67M4", name: "TADAVARTHI B N V H SANKARA RAO" },
                { rollNo: "23N31A67M5", name: "TALARI AKSHAYALATHA" },
                { rollNo: "23N31A67M6", name: "TANNIRU SANNITHA" },
                { rollNo: "23N31A67M7", name: "TENTU ROHIT SAI VENKAT" },
                { rollNo: "23N31A67M8", name: "THATI ROHITH" },
                { rollNo: "23N31A67M9", name: "THODE KOUSHIK" },
                { rollNo: "23N31A67N0", name: "THOKALA GOPI" },
                { rollNo: "23N31A67N1", name: "THOTA LIKITHA" },
                { rollNo: "23N31A67N2", name: "THOTA PAVAN KALYAN" },
                { rollNo: "23N31A67N3", name: "THOTA SAI PRAKASH" },
                { rollNo: "23N31A67N4", name: "TALLARI PRANAVI" },
                { rollNo: "23N31A67N5", name: "NANAVATH NITHIN" },
                { rollNo: "23N31A67N6", name: "TULIMILLI AKHIL RAMESH" },
                { rollNo: "23N31A67N7", name: "V VINAY KUMAR" },
                { rollNo: "23N31A67N8", name: "VADLAKONDA NITHISH KUMAR" },
                { rollNo: "23N31A67N9", name: "VAKADANI ANIL" },
                { rollNo: "23N31A67P0", name: "VALLALA DIKSHITHA" },
                { rollNo: "23N31A67P1", name: "V.SAI SREEVALLI" },
                { rollNo: "23N31A67P2", name: "VANGALA MANASWINI" },
                { rollNo: "23N31A67P3", name: "SHAIK MOHD ROSHAN" },
                { rollNo: "23N31A67P4", name: "VARAGALA MANIDEEP" },
                { rollNo: "23N31A67P5", name: "VEMIREDDY ASHOK REDDY" },
                { rollNo: "23N31A67P6", name: "SHAIK SHAREEF" },
                { rollNo: "23N31A67P7", name: "VEMULA RAHUL" },
                { rollNo: "23N31A67P8", name: "VEMUNDLA VARSHITHA" },
                { rollNo: "23N31A67P9", name: "ELASARAPU NAGA SRIRAM" },
                { rollNo: "23N31A67Q0", name: "YADAMAKANTI KRISHNA KOUSHIK" },
                { rollNo: "23N31A67Q1", name: "YADAPALLY NAGESWARI" },
                { rollNo: "23N31A67Q2", name: "YARAM VENKATESWARA REDDY" },
                { rollNo: "23N31A67Q3", name: "CHOTAKURI SANJANA" },
                { rollNo: "23N31A67Q4", name: "T RAVI CHARAN REDDY" },
                { rollNo: "23N31A67Q5", name: "GUNTRU GOPALA KRISHNA" }
            ];
        }

        return { roster, history };
    }

    // Main Report Generation - True Date-wise Monthly Format across picked range
    async function generateReport() {
        const classId = classSelect.value || "IV_D";
        const selectedSubject = subjectSelect.value;
        const startDate = startDateInput.value;
        const endDate = endDateInput.value;

        if (!startDate || !endDate) {
            alert("Please select both Start Date and End Date.");
            return;
        }

        if (startDate > endDate) {
            alert("Start Date cannot be greater than End Date.");
            return;
        }

        loading.style.display = 'block';
        reportsContainer.innerHTML = '';

        try {
            const { roster, history } = await loadClassData(classId);
            let schedule = {};
            let classInfo = {};
            try {
                const customTt = JSON.parse(localStorage.getItem('custom_timetables') || '{}');
                if (customTt[classId]) {
                    classInfo = customTt[classId];
                    if (customTt[classId].schedule) schedule = customTt[classId].schedule;
                }
            } catch (e) {}
            if (Object.keys(schedule).length === 0 && window.OFFICIAL_TIMETABLES && window.OFFICIAL_TIMETABLES[classId]) {
                classInfo = window.OFFICIAL_TIMETABLES[classId] || {};
                schedule = classInfo.schedule || {};
            }

            const isLabSubject = selectedSubject ? selectedSubject.toUpperCase().includes('LAB') : false;

            // Find subject metadata
            let subjectCode = '';
            let facultyName = '';
            for (const d in schedule) {
                for (const p in schedule[d]) {
                    const itm = schedule[d][p];
                    if (itm && itm.subjectName === selectedSubject) {
                        subjectCode = itm.subjectCode || '';
                        facultyName = itm.faculty || '';
                        break;
                    }
                }
                if (subjectCode) break;
            }

            const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

            // 1. Detect Timetable Days for the Selected Subject
            const scheduledDaysSet = new Set();
            if (selectedSubject) {
                for (const dayName in schedule) {
                    for (const p in schedule[dayName]) {
                        const itm = schedule[dayName][p];
                        if (itm && itm.subjectName) {
                            const itmSub = itm.subjectName.trim().toUpperCase();
                            const targetSub = selectedSubject.trim().toUpperCase();
                            const isLab = isLabSubject && itmSub.includes('LAB');
                            if (itmSub === targetSub || isLab) {
                                scheduledDaysSet.add(dayName);
                            }
                        }
                    }
                }
            }

            // 2. Generate DATES in the picked range that match the Timetable Days (or have recorded attendance)
            const [sy, sm, sd] = startDate.split('-').map(Number);
            const [ey, em, ed] = endDate.split('-').map(Number);
            let curr = new Date(sy, sm - 1, sd);
            const end = new Date(ey, em - 1, ed);

            const reportDates = [];
            while (curr <= end) {
                const y = curr.getFullYear();
                const m = String(curr.getMonth() + 1).padStart(2, '0');
                const d = String(curr.getDate()).padStart(2, '0');
                const key = `${y}-${m}-${d}`;
                const dayOfWeekIndex = curr.getDay();
                const dayName = daysOfWeek[dayOfWeekIndex];
                const isSunday = dayOfWeekIndex === 0;

                // Check if attendance was explicitly recorded for this subject on this date
                let hasRecordedAttendance = false;
                for (let p = 1; p <= 7; p++) {
                    const pKey1 = `${classId}_${key}_P${p}`;
                    const pKey2 = `${key}_P${p}`;
                    const rec = history[pKey1] || history[pKey2];
                    if (rec && rec.attendance && Object.keys(rec.attendance).length > 0) {
                        const subName = (rec.subjectName || '').trim().toUpperCase();
                        if (!selectedSubject || subName === selectedSubject.trim().toUpperCase() || (isLabSubject && subName.includes('LAB'))) {
                            hasRecordedAttendance = true;
                            break;
                        }
                    }
                }

                // Check if this date is Sunday or Holiday
                const record = history[key];
                const globalHol = globalHolidays.find(h => (typeof h === 'string' ? h === key : h.date === key));
                const isHoliday = (record && record.isHoliday) || globalHol;

                // Remove Sundays and Holidays completely from subject-wise report
                if (isSunday && !hasRecordedAttendance) {
                    curr.setDate(curr.getDate() + 1);
                    continue;
                }
                if (isHoliday && !hasRecordedAttendance) {
                    curr.setDate(curr.getDate() + 1);
                    continue;
                }

                // Filter according to Timetable Days:
                let shouldInclude = false;
                if (!selectedSubject) {
                    shouldInclude = true;
                } else if (scheduledDaysSet.size > 0) {
                    shouldInclude = scheduledDaysSet.has(dayName) || hasRecordedAttendance;
                } else {
                    shouldInclude = true;
                }

                if (shouldInclude) {
                    reportDates.push({
                        key,
                        label: `${d}/${m}`,
                        dayNum: d,
                        dayName: dayName.substring(0, 3), // Mon, Tue, Wed, Thu, Fri, Sat
                        fullDayName: dayName,
                        hasRecordedAttendance
                    });
                }
                curr.setDate(curr.getDate() + 1);
            }

            // Calculate active instructional days in this range (each column is an actual session)
            const schoolDaysCount = reportDates.length;

            // Build wrapper HTML
            const wrapper = document.createElement('main');
            wrapper.className = 'report-wrapper';

            // Headers HTML: Each date has its own header column with Date & Day in SOLID BLACK
            let dateHeadersHTML = '';
            reportDates.forEach(col => {
                dateHeadersHTML += `
                    <th style="min-width: 38px; width: 44px; text-align: center; padding: 4px 2px; font-size: 0.72rem; line-height: 1.25; background-color: #f2f2f2 !important; color: #000000 !important; border: 1px solid #000000 !important;" title="${col.key} (${col.fullDayName})">
                        <span style="display: block; font-weight: 800; color: #000000 !important; font-size: 0.76rem;">${col.label}</span>
                        <span style="display: block; font-size: 0.65rem; color: #374151 !important; font-weight: 700;">${col.dayName}</span>
                    </th>
                `;
            });

            // Counters per day
            const presenteesPerDay = Array(reportDates.length).fill(0);
            const absenteesPerDay = Array(reportDates.length).fill(0);
            let tbodyHTML = '';

            const sortedRoster = [...roster].sort((a, b) => a.rollNo.localeCompare(b.rollNo));

            // Helper to get attendance status for a student on a given date
            function getStudentStatus(studentRoll, colKey) {
                // Check all possible history keys for this date
                // 1. Lab check: 3 periods count as 1 single session
                if (isLabSubject) {
                    let hasLabRecord = false;
                    let isAbsentInLab = false;
                    for (let p = 1; p <= 7; p++) {
                        const pKey1 = `${classId}_${colKey}_P${p}`;
                        const pKey2 = `${colKey}_P${p}`;
                        const rec = history[pKey1] || history[pKey2];
                        if (rec && rec.attendance) {
                            const subName = (rec.subjectName || '').toUpperCase();
                            if (subName.includes('LAB') || !rec.subjectName) {
                                hasLabRecord = true;
                                if (rec.attendance[studentRoll] === 'absent') {
                                    isAbsentInLab = true;
                                }
                            }
                        }
                    }
                    if (hasLabRecord) {
                        return isAbsentInLab ? 'absent' : 'present';
                    }
                }

                // 2. Specific Subject check across periods
                if (selectedSubject) {
                    for (let p = 1; p <= 7; p++) {
                        const pKey1 = `${classId}_${colKey}_P${p}`;
                        const pKey2 = `${colKey}_P${p}`;
                        const rec = history[pKey1] || history[pKey2];
                        if (rec && rec.attendance) {
                            const subName = (rec.subjectName || '').trim().toUpperCase();
                            if (subName === selectedSubject.toUpperCase()) {
                                return rec.attendance[studentRoll] || 'present';
                            }
                        }
                    }
                }

                // 3. Fallback to direct date record history[colKey]
                const dateRec = history[colKey];
                if (dateRec && dateRec.attendance && dateRec.attendance[studentRoll]) {
                    return dateRec.attendance[studentRoll];
                }

                // 4. Default to present
                return 'present';
            }

            // Build student rows
            sortedRoster.forEach((student, index) => {
                let rowHTML = `
                    <tr>
                        <td style="background-color: #f2f2f2; font-weight: 700; text-align: center; color: #000000 !important; border: 1px solid #000000 !important;">${index + 1}</td>
                        <td style="font-weight: 700; text-align: center; font-family: monospace; font-size: 0.82rem; white-space: nowrap; color: #000000 !important; border: 1px solid #000000 !important;">${student.rollNo}</td>
                        <td class="student-name-cell" style="color: #000000 !important; border: 1px solid #000000 !important; text-align: left; padding-left: 8px; font-weight: 600; white-space: nowrap;">${student.name}</td>
                `;

                let presentCount = 0;

                reportDates.forEach((col, colIdx) => {
                    const status = getStudentStatus(student.rollNo, col.key);

                    if (status === 'present') {
                        presentCount++;
                        presenteesPerDay[colIdx]++;
                        rowHTML += `<td style="text-align: center; font-weight: 700; color: #000000 !important; border: 1px solid #000000 !important;">${presentCount}</td>`;
                    } else {
                        absenteesPerDay[colIdx]++;
                        rowHTML += `<td class="absent-cell" style="text-align: center; font-weight: 800; color: red !important; background-color: #fee2e2 !important; border: 1px solid #000000 !important;">AB</td>`;
                    }
                });

                const percentage = schoolDaysCount > 0
                    ? ((presentCount / schoolDaysCount) * 100).toFixed(2)
                    : "0.00";
                const isGood = parseFloat(percentage) >= 75;

                rowHTML += `
                    <td style="font-weight: 700; background-color: #f2f2f2; text-align: center; color: #000000 !important; border: 1px solid #000000 !important;">${presentCount}</td>
                    <td style="font-weight: 700; background-color: #f2f2f2; text-align: center; color: ${isGood ? '#10b981' : 'red'} !important; border: 1px solid #000000 !important;">${percentage}%</td>
                    </tr>
                `;

                tbodyHTML += rowHTML;
            });

            // Totals Rows
            let totalPresentHTML = `
                <tr class="totals-row">
                    <td colspan="3" style="text-align: right; padding-right: 12px; font-weight: 800; color: #000000 !important; border: 1px solid #000000 !important;">TOTAL PRESENTEE PER DAY</td>
            `;
            reportDates.forEach((col, colIdx) => {
                totalPresentHTML += `<td style="text-align: center; font-weight: 800; color: #10b981 !important; border: 1px solid #000000 !important;">${presenteesPerDay[colIdx]}</td>`;
            });
            totalPresentHTML += `<td colspan="2" style="background-color: #e2e8f0; border: 1px solid #000000 !important;"></td></tr>`;

            let totalAbsentHTML = `
                <tr class="totals-row">
                    <td colspan="3" style="text-align: right; padding-right: 12px; font-weight: 800; color: red !important; border: 1px solid #000000 !important;">TOTAL ABSENT (AB)</td>
            `;
            reportDates.forEach((col, colIdx) => {
                totalAbsentHTML += `<td style="text-align: center; font-weight: 800; color: red !important; border: 1px solid #000000 !important;">${absenteesPerDay[colIdx]}</td>`;
            });
            totalAbsentHTML += `<td colspan="2" style="background-color: #e2e8f0; border: 1px solid #000000 !important;"></td></tr>`;

            let sessionPercentHTML = `
                <tr class="totals-row" style="background-color: #e0e7ff;">
                    <td colspan="3" style="text-align: right; padding-right: 12px; font-weight: 800; color: #4338ca !important; border: 1px solid #000000 !important;">SESSION ATTENDANCE %</td>
            `;
            reportDates.forEach((col, colIdx) => {
                const totalStud = sortedRoster.length;
                const pct = totalStud > 0 ? Math.round((presenteesPerDay[colIdx] / totalStud) * 100) : 0;
                sessionPercentHTML += `<td style="text-align: center; font-weight: 800; font-size: 0.72rem; color: #4338ca !important; border: 1px solid #000000 !important;">${pct}%</td>`;
            });
            sessionPercentHTML += `<td colspan="2" style="background-color: #e2e8f0; border: 1px solid #000000 !important;"></td></tr>`;

            // Metadata info
            const classText = classSelect.options[classSelect.selectedIndex].text;
            const [sy2, sm2, sd2] = startDate.split('-');
            const [ey2, em2, ed2] = endDate.split('-');
            const dateRangeDisplay = `${sd2}/${sm2}/${sy2} TO ${ed2}/${em2}/${ey2}`;

            const labNoticeHTML = isLabSubject
                ? `<div style="font-size: 0.78rem; font-weight: 800; color: #4338ca; text-align: center; margin-top: 0.25rem;">
                        <i class="fas fa-flask"></i> PRACTICAL LAB REGISTER: 3 LAB PERIODS COMBINED AS 1 SINGLE CLASS SESSION
                   </div>`
                : '';

            // Assemble Full Monthly Time Format Document
            wrapper.innerHTML = `
                <!-- College Header Info -->
                <div style="width: 100%; border-bottom: 2px solid #000; padding-bottom: 0.5rem; margin-bottom: 1rem; text-align: center;">
                    <img src="logo.png" alt="College Logo" style="height: 70px; margin-bottom: 0.5rem; display: block; margin-left: auto; margin-right: auto; content: url(logo.png); filter: none;" onerror="this.style.display='none'">
                    <div class="college-info">
                        <h2>MALLA REDDY COLLEGE OF ENGINEERING & TECHNOLOGY</h2>
                        <h3>(Autonomous Institution - UGC, Govt. of India)</h3>
                        <p>Sponsored by Malla Reddy Educational Society. Affiliated to JNTUH, Hyderabad. Approved by AICTE, New Delhi.</p>
                        <p style="margin-top: 0.15rem;">Maisammaguda, Dhulapally, Secunderabad - 500100, Telangana, India.</p>
                    </div>
                </div>

                <div class="report-subtitle">
                    DEPARTMENT OF COMPUTER SCIENCE AND ENGINEERING (DATA SCIENCE)
                </div>

                <div class="section-badge">
                    SUBJECT ATTENDANCE REGISTER - ${selectedSubject || 'ALL SUBJECTS'} (${subjectCode || 'Consolidated'})<br>
                    <span><strong>CLASS:</strong> ${classText}</span> &nbsp;|&nbsp; 
                    <span><strong>FACULTY:</strong> ${facultyName || 'Department Faculty'}</span><br>
                    <span><strong>TIMETABLE DAYS:</strong> ${scheduledDaysSet.size > 0 ? Array.from(scheduledDaysSet).join(', ') : 'All Working Days'}</span> &nbsp;|&nbsp;
                    <span><strong>DATE RANGE:</strong> ${dateRangeDisplay}</span> &nbsp;|&nbsp; 
                    <span><strong>SESSIONS CONDUCTED:</strong> ${schoolDaysCount}</span>
                    ${labNoticeHTML}
                </div>

                <div style="width: 100%; overflow-x: auto; overscroll-behavior-x: none; touch-action: pan-x pan-y; -webkit-overflow-scrolling: touch; margin-top: 1rem;">
                    <table class="excel-grid-table">
                        <thead>
                            <tr>
                                <th rowspan="2" style="width: 35px; border: 1px solid #000000 !important; background-color: #f2f2f2 !important; color: #000000 !important;">S.No</th>
                                <th rowspan="2" style="width: 100px; border: 1px solid #000000 !important; background-color: #f2f2f2 !important; color: #000000 !important;">Roll Number</th>
                                <th rowspan="2" style="text-align: left; padding-left: 8px; border: 1px solid #000000 !important; background-color: #f2f2f2 !important; color: #000000 !important;">Student Name</th>
                                <th colspan="${reportDates.length}" style="text-align: center; border: 1px solid #000000 !important; background-color: #f2f2f2 !important; color: #000000 !important;">Days of Register (${dateRangeDisplay})</th>
                                <th rowspan="2" style="width: 60px; border: 1px solid #000000 !important; background-color: #f2f2f2 !important; color: #000000 !important;">Total Attended</th>
                                <th rowspan="2" style="width: 70px; border: 1px solid #000000 !important; background-color: #f2f2f2 !important; color: #000000 !important;">% of Attendance</th>
                            </tr>
                            <tr>
                                ${dateHeadersHTML}
                            </tr>
                        </thead>
                        <tbody>
                            ${tbodyHTML}
                            ${totalPresentHTML}
                            ${totalAbsentHTML}
                            ${sessionPercentHTML}
                        </tbody>
                    </table>
                </div>

                <div style="margin-top: 3.5rem; display: flex; justify-content: space-between; font-weight: 800; font-size: 0.85rem; padding: 0 1.5rem;">
                    <span>CLASS INCHARGE</span>
                    <span>ATTENDANCE COORDINATOR</span>
                    <span>HEAD OF DEPARTMENT</span>
                </div>
            `;

            reportsContainer.appendChild(wrapper);
            loading.style.display = 'none';

        } catch (error) {
            console.error("Error generating monthly format register:", error);
            loading.style.display = 'none';
            alert("Error: " + error.message);
        }
    }

    // Export to Excel logic
    exportExcelBtn.addEventListener('click', () => {
        const table = document.querySelector(".excel-grid-table");
        if (!table) {
            alert("Please generate a report first.");
            return;
        }

        const classId = classSelect.value || "IV_D";
        const selectedSubject = (subjectSelect.value || "Subject").replace(/\s+/g, '_');
        const startDate = startDateInput.value || "start";
        const endDate = endDateInput.value || "end";

        const wb = XLSX.utils.table_to_book(table, { raw: true });
        XLSX.writeFile(wb, `Subject_Register_${classId}_${selectedSubject}_${startDate}_to_${endDate}.xlsx`);
    });

    // Toggle Print/PDF buttons based on Native App presence
    if (window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform()) {
        if (printBtn) printBtn.style.display = 'none';
        if (exportPdfBtn) exportPdfBtn.style.display = 'inline-flex';
    }

    // Export PDF via html2pdf
    exportPdfBtn.addEventListener('click', () => {
        const element = document.querySelector('.report-wrapper');
        if (!element) return;

        const classId = classSelect.value || "IV_D";
        const selectedSubject = (subjectSelect.value || "Subject").replace(/\s+/g, '_');

        const opt = {
            margin:       0.3,
            filename:     `Subject_Register_${classId}_${selectedSubject}.pdf`,
            image:        { type: 'jpeg', quality: 0.98 },
            html2canvas:  { scale: 2 },
            jsPDF:        { unit: 'in', format: 'a4', orientation: 'landscape' }
        };

        html2pdf().set(opt).from(element).save();
    });

    // Initialize
    init();
});
