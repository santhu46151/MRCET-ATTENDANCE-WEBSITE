document.addEventListener('DOMContentLoaded', () => {
    // Show back to admin button if admin
    if (typeof authManager !== 'undefined' && authManager.user && authManager.user.role === 'admin') {
        const backBtn = document.getElementById('back-to-admin-btn');
        if (backBtn) backBtn.style.display = 'inline-block';
    }

    // Handle Android Back Gesture from Admin Portal
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('from') === 'admin') {
        // Remove the query param so refresh doesn't trigger it again
        const cleanUrl = window.location.protocol + "//" + window.location.host + window.location.pathname;
        window.history.replaceState({ path: cleanUrl }, '', cleanUrl);
        // Push a new state to catch the back button
        window.history.pushState({ page: 'dashboard' }, '', cleanUrl);
        
        window.addEventListener('popstate', (e) => {
            window.location.replace('admin.html');
        });
    }

    // Initial Student Roster Data
    const defaultStudents = [
        { rollNo: "23N31A67K9", name: "SHAIK HASEENA", phone: "7780108900", fatherName: "SHAIK NAGOOR", fatherPhone: "6309668456", status: "present" },
        { rollNo: "23N31A67L0", name: "SHAIK NOORUDDIN", phone: "7780272518", fatherName: "SHAIK TAHSEEN", fatherPhone: "9849812302", status: "present" },
        { rollNo: "23N31A67L1", name: "SHAIK SADIYA HUSSAIN", phone: "9030517991", fatherName: "SHAIK IQBAL HUSSAIN", fatherPhone: "9032521697", status: "present" },
        { rollNo: "23N31A67L2", name: "SHAIK SHAHID ANWAR", phone: "9603192733", fatherName: "SHAIK NAGULMEERA", fatherPhone: "8498098711", status: "present" },
        { rollNo: "23N31A67L3", name: "SHAMAGARI SUMEDH SOHAN", phone: "7416209447", fatherName: "SHAMAGARI NIRANJAN", fatherPhone: "9642779996", status: "present" },
        { rollNo: "23N31A67L4", name: "SHIVANATHRI PRASANNA", phone: "8121132307", fatherName: "SHIVANATHRI SATHISH", fatherPhone: "9390953166", status: "present" },
        { rollNo: "23N31A67L5", name: "SHIVAYOGI AKSHAYA", phone: "6305616714", fatherName: "SHIVAYOGI PRAVEEN KUMAR", fatherPhone: "9000389635", status: "present" },
        { rollNo: "23N31A67L6", name: "SIRI SHERI", phone: "9398452054", fatherName: "S SRINIVAS REDDY", fatherPhone: "9581150617", status: "present" },
        { rollNo: "23N31A67L7", name: "SHAIK SOHEL", phone: "9381580617", fatherName: "SHAIK AHMED HUSSAIN", fatherPhone: "9440150867", status: "present" },
        { rollNo: "23N31A67L8", name: "SONAL KUMAR", phone: "9693078586", fatherName: "LAL BAHADUR SINGH", fatherPhone: "6204157460", status: "present" },
        { rollNo: "23N31A67L9", name: "SONTENA DINESH", phone: "7989472487", fatherName: "SONTENA LAKSHMU NAIDU", fatherPhone: "7671040104", status: "present" },
        { rollNo: "23N31A67M0", name: "SOUDANI VINAY KUMAR", phone: "8106760283", fatherName: "SOUDANI RAMBABU", fatherPhone: "8106560283", status: "present" },
        { rollNo: "23N31A67M1", name: "SUDULA MOHAN SAI TEJ", phone: "9391614424", fatherName: "SUDULA VEERA SEAMY", fatherPhone: "6281400433", status: "present" },
        { rollNo: "23N31A67M2", name: "SURA ARUNKUMAR", phone: "9381889931", fatherName: "SURA VENKATASWAMI", fatherPhone: "7993578527", status: "present" },
        { rollNo: "23N31A67M3", name: "SYED SHA SHARAAZ HUSSAINI", phone: "7989974436", fatherName: "SYED HAMEDULLA HUSSAINI", fatherPhone: "8466072861", status: "present" },
        { rollNo: "23N31A67M4", name: "TADAVARTHI B N V H SANKARA RAO", phone: "9642240218", fatherName: "TADAVARTHI SRINIVAS RAO", fatherPhone: "9959939295", status: "present" },
        { rollNo: "23N31A67M5", name: "TALARI AKSHAYALATHA", phone: "7995254176", fatherName: "TALARI ANANTHAIAH", fatherPhone: "9502912795", status: "present" },
        { rollNo: "23N31A67M6", name: "TANNIRU SANNITHA", phone: "8121931862", fatherName: "TANNIRU PEDDA VENKATESWARAO", fatherPhone: "9010163025", status: "present" },
        { rollNo: "23N31A67M7", name: "TENTU ROHIT SAI VENKAT", phone: "8340028757", fatherName: "TENTU CHANDRA SEKHAR", fatherPhone: "9553118757", status: "present" },
        { rollNo: "23N31A67M8", name: "THATI ROHITH", phone: "8919418384", fatherName: "THATI MALLESH", fatherPhone: "7671831203", status: "present" },
        { rollNo: "23N31A67M9", name: "THODE KOUSHIK", phone: "7093621364", fatherName: "THODE BALAIAH", fatherPhone: "9505965808", status: "present" },
        { rollNo: "23N31A67N0", name: "THOKALA GOPI", phone: "8897286042", fatherName: "THOKALA SUNDARAIAH", fatherPhone: "9550237813", status: "present" },
        { rollNo: "23N31A67N1", name: "THOTA LIKITHA", phone: "7893422701", fatherName: "JANAKI RAMA RAO", fatherPhone: "7893422701", status: "present" },
        { rollNo: "23N31A67N2", name: "THOTA PAVAN KALYAN", phone: "9392093191", fatherName: "THOTA PULLAIAH", fatherPhone: "9182393948", status: "present" },
        { rollNo: "23N31A67N3", name: "THOTA SAI PRAKASH", phone: "9381267635", fatherName: "THOTA HARI", fatherPhone: "9392770266", status: "present" },
        { rollNo: "23N31A67N4", name: "TALLARI PRANAVI", phone: "9347618807", fatherName: "TALLARI MAHENDRA", fatherPhone: "9849665160", status: "present" },
        { rollNo: "23N31A67N5", name: "NANAVATH NITHIN", phone: "6304896683", fatherName: "NANAVATH SEVYA", fatherPhone: "9848551462", status: "present" },
        { rollNo: "23N31A67N6", name: "TULIMILLI AKHIL RAMESH", phone: "6303813229", fatherName: "TULIMILLI RAMA KRISHNA", fatherPhone: "8688848699", status: "present" },
        { rollNo: "23N31A67N7", name: "V VINAY KUMAR", phone: "9014239584", fatherName: "V RAVI KUMAR", fatherPhone: "9573737169", status: "present" },
        { rollNo: "23N31A67N8", name: "VADLAKONDA NITHISH KUMAR", phone: "9618078744", fatherName: "VADLAKONDA KRISHNA HARI", fatherPhone: "9502284750", status: "present" },
        { rollNo: "23N31A67N9", name: "VAKADANI ANIL", phone: "7680906238", fatherName: "VAKADANI NAGESWARA RAO", fatherPhone: "9963665677", status: "present" },
        { rollNo: "23N31A67P0", name: "VALLALA DIKSHITHA", phone: "6281876092", fatherName: "SRINIVAS", fatherPhone: "9440392786", status: "present" },
        { rollNo: "23N31A67P1", name: "V.SAI SREEVALLI", phone: "9121511877", fatherName: "V.NARASIMHULU", fatherPhone: "7993088098", status: "present" },
        { rollNo: "23N31A67P2", name: "VANGALA MANASWINI", phone: "9703048993", fatherName: "VANGALA SRINIVAS", fatherPhone: "8499871131", status: "present" },
        { rollNo: "23N31A67P3", name: "SHAIK MOHD ROSHAN", phone: "7386948550", fatherName: "SHAIK SHAFEEK SATTAR", fatherPhone: "7386948550", status: "present" },
        { rollNo: "23N31A67P4", name: "VARAGALA MANIDEEP", phone: "7680953036", fatherName: "VARAGALA SRINIVAS", fatherPhone: "9849516615", status: "present" },
        { rollNo: "23N31A67P5", name: "VEMIREDDY ASHOK REDDY", phone: "9640541592", fatherName: "VEMIREDDY NARAYANA REDDY", fatherPhone: "9603802803", status: "present" },
        { rollNo: "23N31A67P6", name: "SHAIK SHAREEF", phone: "9182799758", fatherName: "SHAIK NIZAM SAHEB", fatherPhone: "9849774863", status: "present" },
        { rollNo: "23N31A67P7", name: "VEMULA RAHUL", phone: "7993260697", fatherName: "VEMULA RAJAMALLU", fatherPhone: "9502450087", status: "present" },
        { rollNo: "23N31A67P8", name: "VEMUNDLA VARSHITHA", phone: "9705353344", fatherName: "VEMUNDLA MALLESHAM", fatherPhone: "9492195389", status: "present" },
        { rollNo: "23N31A67P9", name: "ELASARAPU NAGA SRIRAM", phone: "7036605649", fatherName: "ELASARAPU SURYA NARAYANA", fatherPhone: "9951694931", status: "present" },
        { rollNo: "23N31A67Q0", name: "YADAMAKANTI KRISHNA KOUSHIK", phone: "8555927254", fatherName: "YADAMAKANTI RAMA RAO", fatherPhone: "9246907665", status: "present" },
        { rollNo: "23N31A67Q1", name: "YADAPALLY NAGESWARI", phone: "9949956339", fatherName: "YADAPALLY RAMA RAO", fatherPhone: "9550016339", status: "present" },
        { rollNo: "23N31A67Q2", name: "YARAM VENKATESWARA REDDY", phone: "9908347841", fatherName: "LAXMA REDDY", fatherPhone: "9866217841", status: "present" },
        { rollNo: "23N31A67Q3", name: "CHOTAKURI SANJANA", phone: "8309132806", fatherName: "CHOTAKURI MOHAN REDDY", fatherPhone: "9949621998", status: "present" },
        { rollNo: "23N31A67Q4", name: "T RAVI CHARAN REDDY", phone: "9908367514", fatherName: "THOOMKUNTA SUDHAKAR REDDY", fatherPhone: "9963667514", status: "present" },
        { rollNo: "23N31A67Q5", name: "GUNTRU GOPALA KRISHNA", phone: "9392828574", fatherName: "NAGARAJU", fatherPhone: "9989317573", status: "present" },
        { rollNo: "23N31A67Q6", name: "SANTHOSH KUMAR KALLA", phone: "9392626664", fatherName: "CHAKRARAO KALLA", fatherPhone: "9490537720", status: "present" },
        { rollNo: "23N31A67Q7", name: "UGGE DIKSHITHA", phone: "6303740851", fatherName: "UGGE PRASAD", fatherPhone: "7385093866", status: "present" },
        { rollNo: "23N31A67Q8", name: "PARVATHAM SRUTHI", phone: "9398811287", fatherName: "PARVATHAM SRIKANTH", fatherPhone: "9505528799", status: "present" },
        { rollNo: "23N31A67Q9", name: "PARIKIPANDLA SHARATH CHANDRA", phone: "8125542365", fatherName: "PRAKASH", fatherPhone: "9440542365", status: "present" },
        { rollNo: "23N31A67R0", name: "DODDARAPU TANUSH VENKAT", phone: "7981527927", fatherName: "JAYADEV", fatherPhone: "9247141451", status: "present" },
        { rollNo: "23N31A67R1", name: "DONTHU HANUMAN GANGA DINESH GUPTA", phone: "9948221656", fatherName: "D SURESH", fatherPhone: "9948221656", status: "present" },
        { rollNo: "23N31A67R2", name: "THIKKA ANIL KUMAR", phone: "6303632721", fatherName: "T.NAGESH", fatherPhone: "8106100721", status: "present" },
        { rollNo: "23N31A67R3", name: "KARTHIK BIRRU", phone: "7672027970", fatherName: "RAGHUPATHI BIRRU", fatherPhone: "9392866103", status: "present" },
        { rollNo: "23N31A67R4", name: "KURMA NAGARAJU", phone: "9676631450", fatherName: "KURMA SANGAIAH", fatherPhone: "9959069576", status: "present" },
        { rollNo: "23N31A67R5", name: "THOTA HEMANTH", phone: "9652644016", fatherName: "THOTA NAGESWARAO", fatherPhone: "6281775439", status: "present" },
        { rollNo: "23N31A67R6", name: "YASA YASHWINI", phone: "9063401220", fatherName: "YASA THILAK", fatherPhone: "7013552657", status: "present" },
        { rollNo: "24N35A6715", name: "NALAMASA NAGAVARDHAN", phone: "8074137473", fatherName: "NALAMASA SURESH BABU", fatherPhone: "9959508860", status: "present" },
        { rollNo: "24N35A6716", name: "ORUGANTI SHYAM SAI", phone: "9398522523", fatherName: "ORUGANTI MAHENDER", fatherPhone: "9618228760", status: "present" },
        { rollNo: "24N35A6717", name: "P NAZEER", phone: "9182234836", fatherName: "P KATHAL", fatherPhone: "9182165358", status: "present" },
        { rollNo: "24N35A6718", name: "PILLI MEGHANA", phone: "9347794784", fatherName: "PILLI RAVINDHAR", fatherPhone: "9490719830", status: "present" },
        { rollNo: "24N35A6719", name: "RAPOL ASHWANTH GOUD", phone: "7842121362", fatherName: "RAPOL RAMANJANEYULU", fatherPhone: "9912777683", status: "present" },
        { rollNo: "24N35A6720", name: "SAI KIRAN BANDI", phone: "7981166281", fatherName: "BANDI SADAIAH", fatherPhone: "9573737169", status: "present" },
        { rollNo: "24N35A6721", name: "SAJJAPURAM VENKATESHAM", phone: "9390589160", fatherName: "SAJJAPURAM MALLESHAM", fatherPhone: "6305268497", status: "present" },
        { rollNo: "24N35A6722", name: "TALLURI PREMSON", phone: "7780671415", fatherName: "TALLURI GOPAIAH", fatherPhone: "9951134040", status: "present" },
        { rollNo: "24N35A6723", name: "THIRUNAGARI VARSHITH", phone: "7661979055", fatherName: "THIRUNAGARI SRINIVAS", fatherPhone: "9666690066", status: "present" },
        { rollNo: "24N35A6724", name: "Y SHAHID", phone: "8118911868", fatherName: "Y SIDDAIAH", fatherPhone: "6301888304", status: "present" }
    ];

    // State Variables (Declared globally so sync.js can synchronize Firestore data in real-time)
    const isStudent = authManager && authManager.user && authManager.user.role === 'student';
    const userClassId = (authManager && authManager.user && authManager.user.year && authManager.user.section) ? `${authManager.user.year}_${authManager.user.section}` : null;
    let initialClassId = localStorage.getItem('current_class_id');
    if (isStudent && userClassId) {
        initialClassId = userClassId;
    }
    if (!initialClassId) {
        initialClassId = 'IV_D';
    }
    window.currentClassId = initialClassId;

    // Check class-scoped cache
    const scopedRoster = JSON.parse(localStorage.getItem('attendance_roster_' + initialClassId) || 'null');
    const scopedHistory = JSON.parse(localStorage.getItem('attendance_history_' + initialClassId) || 'null');

    if (scopedRoster && Array.isArray(scopedRoster) && scopedRoster.length > 0) {
        roster = scopedRoster;
        window.isLoadingRoster = false;
    } else if (initialClassId === 'IV_D' && !isStudent) {
        roster = defaultStudents;
        window.isLoadingRoster = false;
    } else {
        roster = [];
        window.isLoadingRoster = true;
    }

    attendanceHistory = scopedHistory || JSON.parse(localStorage.getItem('attendance_history')) || {};
    // Migrate legacy attendanceHistory entries
    let needsSave = false;
    Object.keys(attendanceHistory).forEach(dateKey => {
        if (dateKey.endsWith('_AM') || dateKey.endsWith('_PM')) {
            const baseDate = dateKey.split('_')[0];
            if (!attendanceHistory[baseDate]) {
                attendanceHistory[baseDate] = attendanceHistory[dateKey];
            }
            delete attendanceHistory[dateKey];
            needsSave = true;
        }
    });
    if (needsSave) localStorage.setItem('attendance_history', JSON.stringify(attendanceHistory));

    Object.keys(attendanceHistory).forEach(dateKey => {
        const entry = attendanceHistory[dateKey];
        if (entry && !entry.hasOwnProperty('isHoliday')) {
            attendanceHistory[dateKey] = {
                isHoliday: false,
                attendance: entry
            };
        }
    });

    let searchQuery = '';
    
    // Local timezone safe date helpers
    function parseLocalDate(dateStr) {
        if (!dateStr) return new Date();
        if (dateStr instanceof Date) return dateStr;
        const parts = String(dateStr).split('T')[0].split('-');
        if (parts.length === 3) {
            return new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
        }
        return new Date(dateStr);
    }

    function formatLocalDate(d) {
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${y}-${m}-${day}`;
    }

    function isSunday(dateStr) {
        const d = parseLocalDate(dateStr);
        return d.getDay() === 0;
    }

    // Get initial local date in YYYY-MM-DD format
    let selectedDate = urlParams.get('date') || formatLocalDate(new Date());
    let selectedPeriod = urlParams.get('period') || "1";
    
    window.getCurrentClassId = function() {
        const classDropdown = document.getElementById('class-dropdown');
        if (classDropdown && classDropdown.value) {
            return classDropdown.value;
        }
        if (window.currentClassId) return window.currentClassId;
        return localStorage.getItem('current_class_id') || "";
    };

    function resolveClassId(rawId) {
        if (!rawId) return "";
        const clean = String(rawId).trim();
        if (clean.includes("III") || clean.startsWith("3")) {
            if (clean.includes("_D") || clean.endsWith(" D") || clean.endsWith("-D")) return "III_D";
            if (clean.includes("_C") || clean.endsWith(" C") || clean.endsWith("-C")) return "III_C";
            if (clean.includes("_B") || clean.endsWith(" B") || clean.endsWith("-B")) return "III_B";
            if (clean.includes("_A") || clean.endsWith(" A") || clean.endsWith("-A")) return "III_A";
        }
        if (clean.includes("IV") || clean.startsWith("4")) {
            if (clean.includes("_D") || clean.endsWith(" D") || clean.endsWith("-D")) return "IV_D";
            if (clean.includes("_C") || clean.endsWith(" C") || clean.endsWith("-C")) return "IV_C";
            if (clean.includes("_B") || clean.endsWith(" B") || clean.endsWith("-B")) return "IV_B";
            if (clean.includes("_A") || clean.endsWith(" A") || clean.endsWith("-A")) return "IV_A";
        }
        return clean;
    }

    window.getCurrentTimetable = function() {
        const rawClassId = window.getCurrentClassId();
        if (!rawClassId) return {};
        const classId = resolveClassId(rawClassId);

        // 1. In-memory currentTimetable (from Firestore snapshot or live update)
        if (window.currentTimetable && Object.keys(window.currentTimetable).length > 0 && (!window.currentTimetableClassId || window.currentTimetableClassId === rawClassId || window.currentTimetableClassId === classId)) {
            return window.currentTimetable;
        }

        // 2. LocalStorage custom_timetables
        try {
            const customTt = JSON.parse(localStorage.getItem('custom_timetables') || '{}');
            const targetEntry = customTt[rawClassId] || customTt[classId];
            if (targetEntry && targetEntry.schedule && Object.keys(targetEntry.schedule).length > 0) {
                window.currentTimetable = targetEntry.schedule;
                window.currentTimetableClassId = rawClassId;
                return targetEntry.schedule;
            }
        } catch (e) {}

        // 3. Official Timetables dataset
        if (window.OFFICIAL_TIMETABLES) {
            const official = window.OFFICIAL_TIMETABLES[rawClassId] || window.OFFICIAL_TIMETABLES[classId];
            if (official && official.schedule) {
                return official.schedule;
            }
        }

        return {};
    };

    function getHistoryKey() {
        const classId = window.getCurrentClassId();
        return `${classId}_${selectedDate}_P${selectedPeriod}`;
    }

    // Helper to find any marked attendance record for this date
    function findAnyAttendanceForDate(date, classId) {
        if (!date) return null;
        const targetClass = classId || window.getCurrentClassId();

        // 1. Check current period key
        const curKey = `${targetClass}_${date}_P${selectedPeriod}`;
        if (attendanceHistory[curKey] && attendanceHistory[curKey].attendance && Object.keys(attendanceHistory[curKey].attendance).length > 0) {
            return attendanceHistory[curKey];
        }

        // 2. Check any other period P1 to P10 for this class
        for (let p = 1; p <= 10; p++) {
            const k = `${targetClass}_${date}_P${p}`;
            if (attendanceHistory[k] && attendanceHistory[k].attendance && Object.keys(attendanceHistory[k].attendance).length > 0) {
                return attendanceHistory[k];
            }
        }

        // 3. Check legacy period keys
        for (let p = 1; p <= 10; p++) {
            const k = `${date}_P${p}`;
            if (attendanceHistory[k] && attendanceHistory[k].attendance && Object.keys(attendanceHistory[k].attendance).length > 0) {
                return attendanceHistory[k];
            }
        }

        // 4. Check class-date whole day key
        const classDateKey = `${targetClass}_${date}`;
        if (attendanceHistory[classDateKey] && attendanceHistory[classDateKey].attendance && Object.keys(attendanceHistory[classDateKey].attendance).length > 0) {
            return attendanceHistory[classDateKey];
        }

        // 5. Check pure date key
        if (attendanceHistory[date] && attendanceHistory[date].attendance && Object.keys(attendanceHistory[date].attendance).length > 0) {
            return attendanceHistory[date];
        }

        // 6. Fuzzy check across all keys
        for (const k in attendanceHistory) {
            if (k.includes(date) && (!targetClass || k.startsWith(targetClass))) {
                const rec = attendanceHistory[k];
                if (rec && rec.attendance && Object.keys(rec.attendance).length > 0) {
                    return rec;
                }
            }
        }

        return null;
    }

    // Automatically give attendance to all subjects/periods for today
    window.giveAttendanceToAllSubjects = function(attendanceMap, showToast = false) {
        if (!attendanceMap || typeof attendanceMap !== 'object') return;
        const classId = window.getCurrentClassId();
        if (!classId) return;

        const dateObj = parseLocalDate(selectedDate);
        const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        const dayName = daysOfWeek[dateObj.getDay()];
        const currentSchedule = window.getCurrentTimetable();
        const dayKey = Object.keys(currentSchedule || {}).find(
            k => k.toLowerCase() === dayName.toLowerCase()
        );
        const daySchedule = dayKey ? currentSchedule[dayKey] : null;

        if (daySchedule && Object.keys(daySchedule).length > 0) {
            Object.keys(daySchedule).forEach(p => {
                const pKey = `${classId}_${selectedDate}_P${p}`;
                const pInfo = daySchedule[p] || {};
                attendanceHistory[pKey] = {
                    date: selectedDate,
                    classId: classId,
                    period: String(p),
                    isHoliday: false,
                    attendance: { ...attendanceMap },
                    subjectName: pInfo.subjectName || (attendanceHistory[pKey] ? attendanceHistory[pKey].subjectName : `Period ${p}`),
                    subjectCode: pInfo.subjectCode || (attendanceHistory[pKey] ? attendanceHistory[pKey].subjectCode : 'Core'),
                    faculty: pInfo.faculty || (attendanceHistory[pKey] ? attendanceHistory[pKey].faculty : 'Not Assigned')
                };
            });
        } else {
            // Default 1..6 periods if timetable schedule not configured
            for (let p = 1; p <= 6; p++) {
                const pKey = `${classId}_${selectedDate}_P${p}`;
                attendanceHistory[pKey] = {
                    date: selectedDate,
                    classId: classId,
                    period: String(p),
                    isHoliday: false,
                    attendance: { ...attendanceMap },
                    subjectName: attendanceHistory[pKey] && attendanceHistory[pKey].subjectName ? attendanceHistory[pKey].subjectName : `Period ${p}`,
                    subjectCode: attendanceHistory[pKey] && attendanceHistory[pKey].subjectCode ? attendanceHistory[pKey].subjectCode : 'Core',
                    faculty: attendanceHistory[pKey] && attendanceHistory[pKey].faculty ? attendanceHistory[pKey].faculty : 'Not Assigned'
                };
            }
        }

        // Also save class-date key for reports
        const classDateKey = `${classId}_${selectedDate}`;
        attendanceHistory[classDateKey] = {
            date: selectedDate,
            classId: classId,
            isHoliday: false,
            attendance: { ...attendanceMap }
        };

        saveState();

        if (showToast && typeof window.showNotificationToast === 'function') {
            window.showNotificationToast("Attendance given to all subjects for today!", "success");
        }
    };

    function getHistoryEntry() {
        const classId = window.getCurrentClassId();
        const fullKey = `${classId}_${selectedDate}_P${selectedPeriod}`;
        if (attendanceHistory[fullKey]) return attendanceHistory[fullKey];

        const legacyKey = `${selectedDate}_P${selectedPeriod}`;
        if (attendanceHistory[legacyKey]) return attendanceHistory[legacyKey];

        const classDateKey = `${classId}_${selectedDate}`;
        if (attendanceHistory[classDateKey]) return attendanceHistory[classDateKey];

        if (attendanceHistory[selectedDate]) return attendanceHistory[selectedDate];

        // Search by subject name if period match not found
        if (window.currentSubjectInfo && window.currentSubjectInfo.subjectName) {
            const targetSub = window.currentSubjectInfo.subjectName.trim().toUpperCase();
            for (const k in attendanceHistory) {
                if (k.includes(selectedDate) && (!classId || k.startsWith(classId))) {
                    const rec = attendanceHistory[k];
                    if (rec && rec.subjectName && rec.subjectName.trim().toUpperCase() === targetSub) {
                        return rec;
                    }
                }
            }
        }

        // Fallback to any previous attendance record for today (gives previous attendance to all subjects)
        const prevDayRec = findAnyAttendanceForDate(selectedDate, classId);
        if (prevDayRec && prevDayRec.attendance && Object.keys(prevDayRec.attendance).length > 0) {
            return prevDayRec;
        }

        return null;
    }

    function hasAttendanceForCurrentSession() {
        return true;
    }

    // Helper to get active holiday object if any (Sunday is a global holiday for ALL classes)
    function getActiveHoliday() {
        if (isSunday(selectedDate)) {
            const d = parseLocalDate(selectedDate);
            const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
            const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
            const formattedLong = `${daysOfWeek[d.getDay()]}, ${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
            return {
                date: selectedDate,
                formattedDate: formattedLong,
                reason: "Sunday - College Holiday (Closed for all classes)"
            };
        }
        if (window.globalHolidays) {
            return window.globalHolidays.find(h => (typeof h === 'string' ? h === selectedDate : h.date === selectedDate)) || null;
        }
        return null;
    }

    // Helper to check if current date is holiday
    function isHolidayActive() {
        return isSunday(selectedDate) || getActiveHoliday() !== null;
    }

    // Helper to get roster with saved state for selected date (defaults all students to present)
    function getStudents() {
        const entry = getHistoryEntry();
        const attendanceMap = (entry && entry.attendance) ? entry.attendance : (entry && !entry.isHoliday ? entry : {});

        return roster.map(student => {
            let status = 'present';
            if (entry && entry.isHoliday) {
                status = 'present';
            } else if (attendanceMap && attendanceMap.hasOwnProperty(student.rollNo)) {
                status = attendanceMap[student.rollNo];
            } else {
                status = 'present';
            }
            return {
                ...student,
                status: status
            };
        });
    }

    // Helper to save a student status (auto-saves and gives to all subjects)
    function setStudentStatus(rollNo, status) {
        if (isHolidayActive()) return;
        const classId = window.getCurrentClassId();

        // Determine base attendance map
        let attendanceMap = {};
        const curEntry = getHistoryEntry();
        if (curEntry && curEntry.attendance && Object.keys(curEntry.attendance).length > 0) {
            attendanceMap = { ...curEntry.attendance };
        } else {
            const prevRec = findAnyAttendanceForDate(selectedDate, classId);
            if (prevRec && prevRec.attendance && Object.keys(prevRec.attendance).length > 0) {
                attendanceMap = { ...prevRec.attendance };
            } else {
                roster.forEach(s => {
                    attendanceMap[s.rollNo] = 'present';
                });
            }
        }

        attendanceMap[rollNo] = status;

        // Auto-save & give to all subjects for today
        window.giveAttendanceToAllSubjects(attendanceMap, false);
    }

    // DOM Elements
    const gridContainer = document.getElementById('students-grid-container');
    const absentMessageBox = document.getElementById('absent-message-box');
    const copyMessageBtn = document.getElementById('copy-message-btn');
    const totalCountEl = document.getElementById('total-count');
    const presentCountEl = document.getElementById('present-count');
    const absentCountEl = document.getElementById('absent-count');
    const absentBadgeCountEl = document.getElementById('absent-badge-count');
    const percentageValueEl = document.getElementById('percentage-value');
    const percentageRing = document.getElementById('percentage-ring');
    const datePicker = document.getElementById('attendance-date-picker');
    const searchInput = document.getElementById('search-input');
    const absentHeaderDateEl = document.getElementById('absent-header-date');
    const historyLogList = document.getElementById('history-log-list');
    const emptyHistoryState = document.getElementById('empty-history-state');
    const clearHistoryBtn = document.getElementById('clear-history-btn');
    
    // Holiday DOM Elements
    const holidayBanner = document.getElementById('holiday-banner');
    const holidayReasonText = document.getElementById('holiday-reason-text');
    const searchFilterRow = document.getElementById('search-filter-row');

    // Set initial date picker value
    datePicker.value = selectedDate;

    // Actions & Modal Elements
    const themeToggleBtn = document.getElementById('theme-toggle');
    const exportBtn = document.getElementById('export-btn');
    const addStudentBtn = document.getElementById('add-student-btn');
    const markAllPresentBtn = document.getElementById('mark-all-present');
    const markAllAbsentBtn = document.getElementById('mark-all-absent');
    const saveAttendanceBtn = document.getElementById('save-attendance-btn');
    
    const addStudentModal = document.getElementById('add-student-modal');
    const modalCloseBtn = document.getElementById('modal-close-btn');
    const modalCancelBtn = document.getElementById('modal-cancel-btn');
    const addStudentForm = document.getElementById('add-student-form');
    const newRollNoInput = document.getElementById('new-roll-no');
    const newNameInput = document.getElementById('new-name');
    const newPhoneInput = document.getElementById('new-phone');
    const newFatherNameInput = document.getElementById('new-father-name');
    const newFatherPhoneInput = document.getElementById('new-father-phone');

    // Initial SVG Ring setup
    const ringRadius = percentageRing.r.baseVal.value;
    const ringCircumference = 2 * Math.PI * ringRadius;
    percentageRing.style.strokeDasharray = `${ringCircumference} ${ringCircumference}`;

    // Initialize Theme
    const isDarkMode = localStorage.getItem('theme') === 'dark' || 
        (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
    
    if (isDarkMode) {
        document.body.classList.add('dark-mode');
        themeToggleBtn.innerHTML = '<i class="fas fa-sun"></i>';
    } else {
        document.body.classList.remove('dark-mode');
        themeToggleBtn.innerHTML = '<i class="fas fa-moon"></i>';
    }

    // Toggle Theme Handler
    themeToggleBtn.addEventListener('click', () => {
        if (document.body.classList.contains('dark-mode')) {
            document.body.classList.remove('dark-mode');
            localStorage.setItem('theme', 'light');
            themeToggleBtn.innerHTML = '<i class="fas fa-moon"></i>';
        } else {
            document.body.classList.add('dark-mode');
            localStorage.setItem('theme', 'dark');
            themeToggleBtn.innerHTML = '<i class="fas fa-sun"></i>';
        }
    });

    // Save state helper
    function saveState() {
        const classId = window.getCurrentClassId();
        if (!classId) return;

        // Never save to cloud or storage if currently loading a new class roster
        if (window.isLoadingRoster) return;

        localStorage.setItem('attendance_history_' + classId, JSON.stringify(attendanceHistory));
        localStorage.setItem('attendance_roster_' + classId, JSON.stringify(roster));
        localStorage.setItem('attendance_history', JSON.stringify(attendanceHistory));
        localStorage.setItem('attendance_roster', JSON.stringify(roster));
        
        const autoSaveStatus = document.getElementById('auto-save-status');
        if (autoSaveStatus) {
            autoSaveStatus.innerHTML = '<i class="fas fa-sync fa-spin"></i> Saving...';
            autoSaveStatus.style.color = 'var(--primary)';
        }

        // Push state changes to Cloud Firestore in the background
        if (typeof window.uploadStateToCloud === 'function') {
            window.uploadStateToCloud(roster, attendanceHistory).then(() => {
                if (autoSaveStatus) {
                    autoSaveStatus.innerHTML = '<i class="fas fa-check-circle"></i> Auto-Saved';
                    autoSaveStatus.style.color = 'var(--success)';
                }
            }).catch(() => {
                if (autoSaveStatus) {
                    autoSaveStatus.innerHTML = '<i class="fas fa-check-circle"></i> Saved Locally';
                    autoSaveStatus.style.color = 'var(--warning)';
                }
            });
        } else {
            if (autoSaveStatus) {
                autoSaveStatus.innerHTML = '<i class="fas fa-check-circle"></i> Auto-Saved';
                autoSaveStatus.style.color = 'var(--success)';
            }
        }
    }

    let currentClassName = localStorage.getItem('current_class_name') || 'IV/CSE/DS/D';
    window.isRosterEmptyError = false;
    window.emptyRosterMessage = '';

    window.getDisplayClassName = function() {
        const classDropdown = document.getElementById('class-dropdown');
        if (classDropdown && classDropdown.selectedIndex >= 0 && classDropdown.options[classDropdown.selectedIndex]) {
            const text = classDropdown.options[classDropdown.selectedIndex].textContent.trim();
            if (text && !text.includes('Loading') && !text.includes('No classes')) {
                return text.replace(/\s+/g, '/');
            }
        }
        return currentClassName || window.getCurrentClassId() || '';
    };

    window.switchClass = (newClassId) => {
        if (!newClassId) return;
        window.currentClassId = newClassId;
        localStorage.setItem('current_class_id', newClassId);

        // Update currentClassName immediately from dropdown if present
        const classDropdown = document.getElementById('class-dropdown');
        if (classDropdown && classDropdown.querySelector(`option[value="${newClassId}"]`)) {
            const opt = classDropdown.querySelector(`option[value="${newClassId}"]`);
            currentClassName = opt.textContent.trim().replace(/\s+/g, '/');
            localStorage.setItem('current_class_name', currentClassName);
        }

        // Check if we have class-scoped cached roster
        const cachedRoster = JSON.parse(localStorage.getItem('attendance_roster_' + newClassId) || 'null');
        const cachedHistory = JSON.parse(localStorage.getItem('attendance_history_' + newClassId) || 'null');

        if (cachedRoster && Array.isArray(cachedRoster) && cachedRoster.length > 0) {
            roster = cachedRoster;
            attendanceHistory = cachedHistory || {};
            window.isLoadingRoster = false;
        } else if (newClassId === 'IV_D' && (!authManager || !authManager.user || authManager.user.role !== 'student')) {
            roster = defaultStudents;
            attendanceHistory = cachedHistory || {};
            window.isLoadingRoster = false;
        } else {
            // Put into loading state immediately so old class roster doesn't flash
            roster = [];
            attendanceHistory = {};
            window.isLoadingRoster = true;
        }

        window.currentTimetable = null;
        window.currentTimetableClassId = null;

        updateStats();
        renderRoster();
        renderAbsenteesList();
        renderHistoryLogs();
        if (typeof window.triggerTimetableUpdate === 'function') {
            window.triggerTimetableUpdate();
        }

        // Trigger Firestore bindSnapshot in sync.js
        if (typeof window.bindClassSnapshot === 'function') {
            window.bindClassSnapshot(newClassId);
        }
    };
    
    // Apply remote state from Firestore
    window.applyRemoteState = (remoteRoster, remoteHistory, className, classId) => {
        const activeClassId = classId || window.getCurrentClassId();
        // Guard against race conditions if user rapidly switched to another class
        if (classId && window.getCurrentClassId() && classId !== window.getCurrentClassId()) {
            return;
        }

        window.isLoadingRoster = false;
        window.isRosterEmptyError = false;
        window.emptyRosterMessage = '';

        roster = Array.isArray(remoteRoster) ? remoteRoster : [];
        if (activeClassId) {
            localStorage.setItem('attendance_roster_' + activeClassId, JSON.stringify(roster));
        }
        localStorage.setItem('attendance_roster', JSON.stringify(roster));

        attendanceHistory = (remoteHistory && typeof remoteHistory === 'object') ? remoteHistory : {};
        if (activeClassId) {
            localStorage.setItem('attendance_history_' + activeClassId, JSON.stringify(attendanceHistory));
        }
        localStorage.setItem('attendance_history', JSON.stringify(attendanceHistory));

        if (className) {
            currentClassName = className;
            localStorage.setItem('current_class_name', className);
            const parts = className.split('/');
            if (parts.length >= 4) {
                localStorage.setItem('current_class_year', parts[0]);
                localStorage.setItem('current_class_branch', parts[1]);
                localStorage.setItem('current_class_dept', parts[2]);
                localStorage.setItem('current_class_section', parts[3]);
            }
        }
        
        // Re-render UI
        updateStats();
        renderRoster();
        renderAbsenteesList();
        renderHistoryLogs();
        if (typeof window.triggerTimetableUpdate === 'function') {
            window.triggerTimetableUpdate();
        }
    };

    window.triggerHolidayUpdate = () => {
        updateStats();
        renderRoster();
        renderAbsenteesList();
        renderHistoryLogs();
    };

    // Notification Toast Helper
    window.showNotificationToast = (msg, type = 'info') => {
        const toast = document.getElementById('copy-notification-banner');
        if (!toast) return;
        toast.style.display = 'flex';
        toast.style.alignItems = 'center';
        toast.style.justifyContent = 'space-between';
        toast.style.gap = '0.75rem';
        if (type === 'success') {
            toast.style.background = 'rgba(16, 185, 129, 0.15)';
            toast.style.color = 'var(--success)';
            toast.style.border = '1px solid rgba(16, 185, 129, 0.35)';
            toast.innerHTML = `<span><i class="fas fa-check-circle" style="margin-right: 0.4rem;"></i>${msg}</span><button onclick="this.parentElement.style.display='none'" style="background:none; border:none; color:inherit; cursor:pointer; font-size: 0.9rem;"><i class="fas fa-times"></i></button>`;
        } else {
            toast.style.background = 'rgba(99, 102, 241, 0.15)';
            toast.style.color = 'var(--primary)';
            toast.style.border = '1px solid rgba(99, 102, 241, 0.35)';
            toast.innerHTML = `<span><i class="fas fa-info-circle" style="margin-right: 0.4rem;"></i>${msg}</span><button onclick="this.parentElement.style.display='none'" style="background:none; border:none; color:inherit; cursor:pointer; font-size: 0.9rem;"><i class="fas fa-times"></i></button>`;
        }
        clearTimeout(window.toastTimer);
        window.toastTimer = setTimeout(() => {
            if (toast) toast.style.display = 'none';
        }, 5500);
    };

    window.triggerTimetableUpdate = () => {
        // Find subject based on day and period
        const dateObj = parseLocalDate(selectedDate);
        const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        const dayName = daysOfWeek[dateObj.getDay()];
        
        const scheduleContainer = document.getElementById('daily-schedule-container');
        const scheduleTitle = document.getElementById('daily-schedule-title');
        const scheduleCount = document.getElementById('daily-schedule-count');
        const activeBanner = document.getElementById('active-subject-banner');
        const copyPrevBtn = document.getElementById('copy-prev-attendance');
        
        const classId = window.getCurrentClassId();
        const currentSchedule = window.getCurrentTimetable();
        const resolvedId = resolveClassId(classId);
        let classNameDisplay = classId ? classId.replace(/_/g, ' ') : 'Select a Class';
        try {
            const customTt = JSON.parse(localStorage.getItem('custom_timetables') || '{}');
            const targetEntry = customTt[classId] || customTt[resolvedId];
            if (targetEntry && targetEntry.className) {
                classNameDisplay = targetEntry.className;
            }
        } catch (e) {}
        if (window.OFFICIAL_TIMETABLES) {
            const official = window.OFFICIAL_TIMETABLES[classId] || window.OFFICIAL_TIMETABLES[resolvedId];
            if (official && official.className) {
                classNameDisplay = official.className;
            }
        }

        if (scheduleTitle) {
            scheduleTitle.innerHTML = `<i class="fas fa-calendar-day" style="color: var(--primary); margin-right: 0.35rem;"></i><strong style="color: var(--text-primary);">${classNameDisplay}</strong> • Timetable for ${dayName} (${selectedDate}):`;
        }

        window.currentSubjectInfo = null;

        // Sunday is a global holiday for all classes
        if (isSunday(selectedDate)) {
            if (scheduleCount) scheduleCount.innerHTML = '<span style="color: var(--warning); font-weight: 800;"><i class="fas fa-umbrella-beach"></i> SUNDAY HOLIDAY</span>';
            if (activeBanner) activeBanner.style.display = 'none';
            if (scheduleContainer) {
                scheduleContainer.innerHTML = '<div style="font-size: 0.92rem; font-weight: 700; color: var(--warning); padding: 0.6rem 0;"><i class="fas fa-coffee" style="margin-right: 0.4rem;"></i>Sunday — College Holiday for all classes. No attendance scheduled.</div>';
                scheduleContainer.style.display = 'block';
            }
            if (copyPrevBtn) copyPrevBtn.style.display = 'none';
            updateStats();
            renderRoster();
            renderAbsenteesList();
            renderHistoryLogs();
            return;
        }

        // Case-insensitive day match in currentSchedule
        const dayKey = Object.keys(currentSchedule || {}).find(
            k => k.toLowerCase() === dayName.toLowerCase()
        );
        const daySchedule = dayKey ? currentSchedule[dayKey] : null;

        if (daySchedule && Object.keys(daySchedule).length > 0) {
            const periods = Object.keys(daySchedule).sort((a,b) => parseInt(a) - parseInt(b));
            
            if (periods.length > 0) {
                // If selectedPeriod is not in this day's periods, default to first period
                if (!periods.includes(selectedPeriod)) {
                    selectedPeriod = periods[0];
                }
                
                const info = daySchedule[selectedPeriod];
                window.currentSubjectInfo = info;
                
                const currentIndex = periods.indexOf(selectedPeriod);
                const prevP = currentIndex > 0 ? periods[currentIndex - 1] : null;
                window.previousPeriodToCopy = prevP;

                // If any period has attendance recorded for today, automatically give previous attendance to all scheduled periods for today
                const dayAttendanceRec = findAnyAttendanceForDate(selectedDate, classId);
                if (dayAttendanceRec && dayAttendanceRec.attendance && Object.keys(dayAttendanceRec.attendance).length > 0) {
                    let hasMissing = false;
                    periods.forEach(p => {
                        const pKey = `${classId}_${selectedDate}_P${p}`;
                        const legacyPKey = `${selectedDate}_P${p}`;
                        const rec = attendanceHistory[pKey] || attendanceHistory[legacyPKey];
                        if (!rec || !rec.attendance || Object.keys(rec.attendance).length === 0) {
                            hasMissing = true;
                        }
                    });
                    if (hasMissing) {
                        window.giveAttendanceToAllSubjects(dayAttendanceRec.attendance, false);
                    }
                } else if (!isHolidayActive() && roster && roster.length > 0) {
                    // Automatically come to the roster for the first period (all present by default)
                    const defaultMap = {};
                    roster.forEach(s => { defaultMap[s.rollNo] = 'present'; });
                    window.giveAttendanceToAllSubjects(defaultMap, false);
                }

                // Count how many periods are marked vs pending
                let markedCount = 0;
                periods.forEach(p => {
                    const pKey = `${classId}_${selectedDate}_P${p}`;
                    const legacyPKey = `${selectedDate}_P${p}`;
                    const rec = attendanceHistory[pKey] || attendanceHistory[legacyPKey];
                    if (rec && rec.attendance && Object.keys(rec.attendance).length > 0) {
                        markedCount++;
                    }
                });

                if (scheduleCount) {
                    scheduleCount.innerHTML = `<span style="color: var(--success);"><i class="fas fa-check-circle"></i> ${markedCount} Active</span>`;
                }

                // Active Period Attendance State
                if (activeBanner) {
                    if (info) {
                        activeBanner.style.display = 'block';
                        activeBanner.innerHTML = `
                            <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.75rem;">
                                <div>
                                    <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.25rem;">
                                        <span style="font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 800; color: var(--primary);">
                                            Active Period ${selectedPeriod}
                                        </span>
                                        <span style="font-size: 0.72rem; padding: 2px 8px; border-radius: 999px; background: rgba(16, 185, 129, 0.2); color: var(--success); font-weight: 700;"><i class="fas fa-check"></i> Attendance Active</span>
                                    </div>
                                    <div style="font-size: 1.08rem; font-weight: 800; color: var(--text-primary);">
                                        <i class="fas fa-book-reader" style="color: var(--primary); margin-right: 0.4rem;"></i>${info.subjectName}
                                        <span style="font-size: 0.82rem; font-weight: 600; color: var(--text-muted); margin-left: 0.35rem;">(${info.subjectCode || 'Core'})</span>
                                    </div>
                                    <div style="display: flex; gap: 1rem; align-items: center; font-size: 0.82rem; margin-top: 0.3rem; color: var(--text-secondary); flex-wrap: wrap;">
                                        <div><i class="fas fa-user-tie" style="color: var(--info); margin-right: 0.3rem;"></i><strong>Faculty:</strong> ${info.faculty || 'Not Assigned'}</div>
                                        <div><i class="far fa-clock" style="color: var(--success); margin-right: 0.3rem;"></i><strong>Time:</strong> Period ${selectedPeriod} (${info.startTime} - ${info.endTime})</div>
                                    </div>
                                </div>
                                <div style="display: flex; gap: 0.5rem; align-items: center; flex-wrap: wrap;">
                                    <button class="btn btn-outline" style="font-size: 0.8rem; padding: 0.35rem 0.75rem; color: var(--primary); border-color: var(--primary);" onclick="window.goToNextSubject()" title="Go to next scheduled subject">
                                        <i class="fas fa-arrow-right"></i> Next Subject
                                    </button>
                                </div>
                            </div>
                        `;
                    } else {
                        activeBanner.style.display = 'none';
                    }
                }
                
                if (scheduleContainer) {
                    let html = '';
                    periods.forEach(p => {
                        const isSelected = p === selectedPeriod;
                        const pInfo = daySchedule[p];
                        const pKey = `${classId}_${selectedDate}_P${p}`;
                        const legacyPKey = `${selectedDate}_P${p}`;
                        const rec = attendanceHistory[pKey] || attendanceHistory[legacyPKey];
                        const isMarked = rec && rec.attendance && Object.keys(rec.attendance).length > 0;
                        
                        let statusPill = '';
                        if (isMarked) {
                            const att = rec.attendance;
                            const absCount = Object.values(att).filter(v => v === 'absent').length;
                            statusPill = `<span style="font-size: 0.68rem; font-weight: 700; padding: 2px 7px; border-radius: 999px; background: rgba(16, 185, 129, 0.2); color: var(--success);"><i class="fas fa-check"></i> Marked (${absCount} abs)</span>`;
                        } else {
                            statusPill = `<span style="font-size: 0.68rem; font-weight: 600; padding: 2px 7px; border-radius: 999px; background: rgba(245, 158, 11, 0.15); color: var(--warning);"><i class="far fa-clock"></i> Pending</span>`;
                        }

                        const cardStyle = isSelected 
                            ? 'background: var(--primary); color: #ffffff; border: 2px solid var(--primary); box-shadow: 0 4px 14px rgba(79, 70, 229, 0.45); transform: translateY(-2px);' 
                            : 'background: var(--card-bg); color: var(--text-primary); border: 1px solid var(--card-border);';
                        
                        html += `
                            <button class="btn period-btn" style="min-width: 170px; padding: 0.55rem 0.85rem; border-radius: var(--radius-md); cursor: pointer; transition: var(--transition); display: flex; flex-direction: column; align-items: flex-start; text-align: left; gap: 0.25rem; ${cardStyle}" onclick="selectPeriod('${p}')" title="Period ${p}: ${pInfo.subjectName} (${pInfo.faculty})">
                                <div style="display: flex; width: 100%; justify-content: space-between; align-items: center; gap: 0.4rem;">
                                    <span style="font-weight: 800; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.5px; opacity: ${isSelected ? '0.95' : '0.8'};">Period ${p}</span>
                                    ${statusPill}
                                </div>
                                <span style="font-weight: 800; font-size: 0.9rem; line-height: 1.25; word-break: break-word;">${pInfo.subjectName}</span>
                                <div style="display: flex; width: 100%; justify-content: space-between; align-items: center; font-size: 0.72rem; opacity: ${isSelected ? '0.95' : '0.75'}; margin-top: 0.15rem;">
                                    <span><i class="far fa-clock"></i> ${pInfo.startTime}-${pInfo.endTime}</span>
                                    <span style="font-weight: 600;">${pInfo.subjectCode || 'Core'}</span>
                                </div>
                            </button>
                        `;
                    });
                    scheduleContainer.innerHTML = html;
                    scheduleContainer.style.display = 'flex';
                    scheduleContainer.style.gap = '0.6rem';
                    scheduleContainer.style.overflowX = 'auto';
                    scheduleContainer.style.padding = '4px 2px';
                }
                
                // Toolbar Buttons logic
                if (copyPrevBtn) {
                    copyPrevBtn.style.display = 'none';
                }
            } else {
                if (scheduleCount) scheduleCount.innerHTML = '';
                if (activeBanner) activeBanner.style.display = 'none';
                if (scheduleContainer) {
                    scheduleContainer.innerHTML = '<span style="font-size: 0.85rem; color: var(--text-muted); padding: 0.5rem 0;">No classes scheduled for this day in timetable.</span>';
                    scheduleContainer.style.display = 'block';
                }
                if (copyPrevBtn) copyPrevBtn.style.display = 'none';
            }
        } else {
            if (scheduleCount) scheduleCount.innerHTML = '';
            if (activeBanner) activeBanner.style.display = 'none';
            if (scheduleContainer) {
                scheduleContainer.innerHTML = `<span style="font-size: 0.88rem; color: var(--text-muted); padding: 0.5rem 0;"><i class="fas fa-info-circle" style="color: var(--info); margin-right: 0.4rem;"></i>No timetable uploaded for ${dayName}. Upload timetable in Admin Portal.</span>`;
                scheduleContainer.style.display = 'block';
            }
            if (copyPrevBtn) copyPrevBtn.style.display = 'none';
        }
        
        updateStats();
        renderRoster();
        renderAbsenteesList();
        renderHistoryLogs();
    };
    
    // Select Period (Subject Selection - automatically inherits previous attendance)
    window.selectPeriod = function(p) {
        selectedPeriod = String(p);
        const classId = window.getCurrentClassId();
        const curKey = `${classId}_${selectedDate}_P${selectedPeriod}`;
        if (!attendanceHistory[curKey] || !attendanceHistory[curKey].attendance || Object.keys(attendanceHistory[curKey].attendance).length === 0) {
            const prevRec = findAnyAttendanceForDate(selectedDate, classId);
            if (prevRec && prevRec.attendance && Object.keys(prevRec.attendance).length > 0) {
                window.giveAttendanceToAllSubjects(prevRec.attendance, false);
            }
        }
        window.triggerTimetableUpdate();
    };

    // Go to Next Subject in Timetable
    window.goToNextSubject = function() {
        const dateObj = parseLocalDate(selectedDate);
        const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        const dayName = daysOfWeek[dateObj.getDay()];
        
        const currentSchedule = window.getCurrentTimetable();
        const dayKey = Object.keys(currentSchedule || {}).find(
            k => k.toLowerCase() === dayName.toLowerCase()
        );
        const daySchedule = dayKey ? currentSchedule[dayKey] : null;
        if (!daySchedule) return;

        const periods = Object.keys(daySchedule).sort((a,b) => parseInt(a) - parseInt(b));
        const currentIndex = periods.indexOf(selectedPeriod);
        if (currentIndex < periods.length - 1) {
            const nextPeriod = periods[currentIndex + 1];
            window.selectPeriod(nextPeriod);
        } else {
            if (typeof window.showNotificationToast === 'function') {
                window.showNotificationToast("This is the last scheduled period for today!", "info");
            } else {
                alert("This is the last scheduled period for today!");
            }
        }
    };

    // Manual Copy Attendance from a specific Period
    window.copyAttendanceFromPeriod = function(sourceP) {
        const classId = window.getCurrentClassId();
        const sourceKey = `${classId}_${selectedDate}_P${sourceP}`;
        const legacySourceKey = `${selectedDate}_P${sourceP}`;
        const sourceRecord = attendanceHistory[sourceKey] || attendanceHistory[legacySourceKey];
        if (!sourceRecord || !sourceRecord.attendance || Object.keys(sourceRecord.attendance).length === 0) {
            alert(`No attendance data found in Period ${sourceP} to copy.`);
            return;
        }

        window.giveAttendanceToAllSubjects(sourceRecord.attendance, true);
        updateStats();
        renderRoster();
        renderAbsenteesList();
        renderHistoryLogs();
        window.triggerTimetableUpdate();
    };

    window.setEmptyRosterState = function(message) {
        window.isRosterEmptyError = true;
        window.emptyRosterMessage = message;
        roster = [];
        attendanceHistory = {};
        updateStats();
        renderRoster();
        renderAbsenteesList();
        renderHistoryLogs();
    };

    // Calculate Statistics
    function updateStats() {
        const activeStudents = getStudents();
        const total = activeStudents.length;

        if (isHolidayActive()) {
            totalCountEl.innerText = total;
            presentCountEl.innerText = "0";
            absentCountEl.innerText = "0";
            absentBadgeCountEl.innerText = "Holiday";
            percentageValueEl.innerText = "Holiday";
            percentageRing.style.strokeDashoffset = ringCircumference;
            return;
        }

        const present = activeStudents.filter(s => s.status === 'present').length;
        const absent = total - present;
        const percentage = total > 0 ? Math.round((present / total) * 100) : 100;

        totalCountEl.innerText = total;
        presentCountEl.innerText = present;
        absentCountEl.innerText = absent;
        absentBadgeCountEl.innerText = `${absent} Absent`;
        percentageValueEl.innerText = `${percentage}%`;

        // Update SVG Progress Ring
        const offset = ringCircumference - (percentage / 100) * ringCircumference;
        percentageRing.style.strokeDashoffset = offset;
    }

    // Create Initials for Avatars
    function getInitials(name) {
        return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
    }

    // Render Student Grid
    function renderRoster() {
        gridContainer.innerHTML = '';

        if (window.isLoadingRoster) {
            gridContainer.style.display = 'grid';
            searchFilterRow.style.display = 'none';
            holidayBanner.style.display = 'none';
            const displayTitle = (typeof window.getDisplayClassName === 'function' ? window.getDisplayClassName() : currentClassName) || window.getCurrentClassId() || '';
            gridContainer.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 3rem 1rem; color: var(--text-muted); background: var(--card-bg); border: 1px solid var(--card-border); border-radius: var(--radius-md);">
                    <i class="fas fa-spinner fa-spin" style="font-size: 2.2rem; color: var(--primary); display: block; margin-bottom: 0.75rem;"></i>
                    <p style="font-size: 1rem; font-weight: 600;">Loading roster for ${displayTitle}...</p>
                </div>
            `;
            return;
        }
        
        if (window.isRosterEmptyError) {
            gridContainer.style.display = 'grid';
            searchFilterRow.style.display = 'none';
            holidayBanner.style.display = 'none';
            gridContainer.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 3rem 1rem; color: var(--danger); font-weight: 600; font-size: 1.1rem; background: var(--card-bg); border: 1px solid var(--danger-border); border-radius: var(--radius-md);"><i class="fas fa-exclamation-triangle" style="font-size: 2.5rem; display: block; margin-bottom: 1rem;"></i>${window.emptyRosterMessage}</div>`;
            return;
        }

        if (isHolidayActive()) {
            gridContainer.style.display = 'none';
            searchFilterRow.style.display = 'none';
            holidayBanner.style.display = 'flex';
            const holiday = getActiveHoliday();
            holidayBanner.innerHTML = `
                <div style="font-size: 3.5rem; color: var(--warning);"><i class="fas fa-umbrella-beach"></i></div>
                <h2 style="font-weight: 800; font-size: 1.8rem; letter-spacing: 1px; color: var(--warning); margin: 0;">HOLIDAY</h2>
                <p style="font-size: 1.1rem; color: var(--text-primary); font-weight: 700; margin: 0.25rem 0;">${holiday && holiday.formattedDate ? holiday.formattedDate : selectedDate}</p>
                <p id="holiday-reason-text" style="font-size: 0.95rem; color: var(--text-secondary); font-weight: 600; max-width: 420px; line-height: 1.4; margin-top: 0.25rem;">${holiday ? holiday.reason : 'School Holiday'}</p>
            `;
            markAllPresentBtn.disabled = true;
            markAllAbsentBtn.disabled = true;
            if (saveAttendanceBtn) saveAttendanceBtn.disabled = true;
            return;
        }

        gridContainer.style.display = 'grid';
        searchFilterRow.style.display = 'flex';
        holidayBanner.style.display = 'none';
        markAllPresentBtn.disabled = false;
        markAllAbsentBtn.disabled = false;
        if (saveAttendanceBtn) saveAttendanceBtn.disabled = false;

        const activeStudents = getStudents();

        const filtered = activeStudents.filter(student => {
            const query = searchQuery.toLowerCase();
            return student.name.toLowerCase().includes(query) || 
                   student.rollNo.toLowerCase().includes(query);
        });

        // Sort students by roll number
        filtered.sort((a, b) => a.rollNo.localeCompare(b.rollNo));

        if (filtered.length === 0) {
            gridContainer.innerHTML += `
                <div style="grid-column: 1/-1; text-align: center; padding: 2.5rem 1rem; color: var(--text-muted);">
                    <i class="fas fa-users-slash" style="font-size: 2.2rem; margin-bottom: 0.5rem; display: block;"></i>
                    ${searchQuery ? 'No students found matching your search.' : 'No students found in roster for this class. Upload roster in Admin Portal.'}
                </div>
            `;
            return;
        }

        filtered.forEach(student => {
            const card = document.createElement('article');
            card.className = `student-card ${student.status}`;
            card.setAttribute('tabindex', '0');
            card.setAttribute('aria-label', `Roll Number ${student.rollNo}, ${student.name}, currently marked ${student.status}`);
            
            const rollStr = String(student.rollNo || '').trim();
            const suffix = rollStr ? rollStr.slice(-2).toUpperCase() : '??';
            card.innerHTML = `
                <div class="student-avatar">${suffix}</div>
                <div class="student-info">
                    <span class="student-roll">${student.rollNo}</span>
                    <span class="student-name" title="${student.name}">${student.name}</span>
                </div>
            `;

            // Toggle student status on click
            card.addEventListener('click', () => {
                if (isHolidayActive()) return;
                const nextStatus = student.status === 'absent' ? 'present' : 'absent';
                setStudentStatus(student.rollNo, nextStatus);
                updateStats();
                renderRoster();
                renderAbsenteesList();
                renderHistoryLogs();
            });

            // Enter key accessibility support
            card.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    card.click();
                }
            });

            gridContainer.appendChild(card);
        });
    }

    // Render Absentees List Sidebar (shows comma-separated last 2 digits of Roll Nos)
    function renderAbsenteesList() {
        const activeStudents = getStudents();
        const absentees = activeStudents.filter(s => s.status === 'absent');
        absentees.sort((a, b) => a.rollNo.localeCompare(b.rollNo));

        // Update the date header based on datePicker
        const pickerVal = datePicker.value; // YYYY-MM-DD
        let formattedDate = "";
        if (pickerVal) {
            const [y, m, d] = pickerVal.split('-');
            formattedDate = `${d}/${m}/${y}`;
        } else {
            const dateObj = new Date();
            const day = String(dateObj.getDate()).padStart(2, '0');
            const month = String(dateObj.getMonth() + 1).padStart(2, '0');
            const year = dateObj.getFullYear();
            formattedDate = `${day}/${month}/${year}`;
        }
        absentHeaderDateEl.innerText = `${formattedDate} - Absentees:`;
        
        // Update connected spreadsheet link to carry date context
        const excelBtnLink = document.querySelector('a[href^="absentees-table.html"]');
        if (excelBtnLink) {
            excelBtnLink.href = `absentees-table.html?date=${selectedDate}`;
        }
        
        const weeklyBtnLink = document.getElementById('weekly-report-btn');
        if (weeklyBtnLink) {
            weeklyBtnLink.href = `weekly-report.html?date=${selectedDate}`;
        }

        const monthlyBtnLink = document.getElementById('monthly-report-btn');
        if (monthlyBtnLink) {
            monthlyBtnLink.href = `monthly-report.html?date=${selectedDate}`;
        }

        if (isHolidayActive()) {
            absentMessageBox.value = isSunday(selectedDate) ? "Sunday - College Holiday (Closed)" : "Holiday Mode Active";
            copyMessageBtn.disabled = true;
            return;
        }

        // Build the message block
        const total = activeStudents.length;
        const absentCount = absentees.length;
        const presentCount = total - absentCount;
        
        const rollSuffixes = absentees.map(s => {
            const suffix = s.rollNo.slice(-2);
            return suffix;
        }).join(', ');

        const displayTitle = (typeof window.getDisplayClassName === 'function' ? window.getDisplayClassName() : currentClassName) || window.getCurrentClassId() || '';
        const messageText = `${displayTitle}\n${formattedDate} Absentees :\n\n${rollSuffixes || 'None'}\n\nAbsent - ${absentCount}\nPresent - ${presentCount}\nTotal - ${total}`;
        absentMessageBox.value = messageText;
        copyMessageBtn.disabled = false;
    }

    // Copy to clipboard handler
    copyMessageBtn.addEventListener('click', () => {
        const textToCopy = absentMessageBox.value;
        if (!textToCopy) return;

        navigator.clipboard.writeText(textToCopy).then(() => {
            const originalHTML = copyMessageBtn.innerHTML;
            copyMessageBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
            copyMessageBtn.style.background = '#059669';
            setTimeout(() => {
                copyMessageBtn.innerHTML = originalHTML;
                copyMessageBtn.style.background = '';
            }, 1500);
        });
    });

    // Search input handler
    searchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value;
        renderRoster();
    });

    // Mark All Actions (auto-saves and gives to all subjects for today)
    markAllPresentBtn.addEventListener('click', () => {
        if (isHolidayActive()) return;
        const initialMap = {};
        roster.forEach(s => {
            initialMap[s.rollNo] = 'present';
        });
        window.giveAttendanceToAllSubjects(initialMap, true);
        updateStats();
        renderRoster();
        renderAbsenteesList();
        renderHistoryLogs();
        window.triggerTimetableUpdate();
    });

    const copyPrevBtn = document.getElementById('copy-prev-attendance');
    if (copyPrevBtn) {
        copyPrevBtn.addEventListener('click', () => {
            if (!window.previousPeriodToCopy) return;
            window.copyAttendanceFromPeriod(window.previousPeriodToCopy);
        });
    }

    markAllAbsentBtn.addEventListener('click', () => {
        if (isHolidayActive()) return;
        const initialMap = {};
        roster.forEach(s => {
            initialMap[s.rollNo] = 'absent';
        });
        window.giveAttendanceToAllSubjects(initialMap, true);
        updateStats();
        renderRoster();
        renderAbsenteesList();
        renderHistoryLogs();
        window.triggerTimetableUpdate();
    });

    // Give to All Subjects Button Handler
    const giveAllSubjectsBtn = document.getElementById('give-all-subjects-btn');
    if (giveAllSubjectsBtn) {
        giveAllSubjectsBtn.addEventListener('click', () => {
            if (isHolidayActive()) {
                alert("Attendance cannot be recorded for Sundays or declared holidays.");
                return;
            }
            const curEntry = getHistoryEntry() || findAnyAttendanceForDate(selectedDate, window.getCurrentClassId());
            let attMap = {};
            if (curEntry && curEntry.attendance && Object.keys(curEntry.attendance).length > 0) {
                attMap = { ...curEntry.attendance };
            } else {
                roster.forEach(s => {
                    attMap[s.rollNo] = 'present';
                });
            }
            window.giveAttendanceToAllSubjects(attMap, true);
            updateStats();
            renderRoster();
            renderAbsenteesList();
            renderHistoryLogs();
            window.triggerTimetableUpdate();
        });
    }

    // Save Attendance fallback if clicked anywhere
    if (saveAttendanceBtn) {
        saveAttendanceBtn.addEventListener('click', async () => {
            if (giveAllSubjectsBtn) {
                giveAllSubjectsBtn.click();
            } else {
                saveState();
                if (typeof window.uploadStateToCloud === 'function') {
                    await window.uploadStateToCloud(roster, attendanceHistory);
                }
                window.showNotificationToast("Attendance auto-saved to Firestore!", "success");
            }
        });
    }

    // Modal Interaction
    function toggleModal(show) {
        if (show) {
            addStudentModal.classList.add('active');
            addStudentModal.setAttribute('aria-hidden', 'false');
            
            newRollNoInput.value = '';
            newNameInput.value = '';
            newPhoneInput.value = '';
            newFatherNameInput.value = '';
            newFatherPhoneInput.value = '';
            newRollNoInput.focus();
        } else {
            addStudentModal.classList.remove('active');
            addStudentModal.setAttribute('aria-hidden', 'true');
        }
    }

    addStudentBtn.addEventListener('click', () => toggleModal(true));
    modalCloseBtn.addEventListener('click', () => toggleModal(false));
    modalCancelBtn.addEventListener('click', () => toggleModal(false));
    
    // Close modal if clicking overlay background
    addStudentModal.addEventListener('click', (e) => {
        if (e.target === addStudentModal) toggleModal(false);
    });

    // Delete Student Modal Interaction
    const deleteStudentModal = document.getElementById('delete-student-modal');
    const deleteStudentMenuBtn = document.getElementById('delete-student-menu-btn');
    const deleteModalCloseBtn = document.getElementById('delete-modal-close-btn');
    const deleteModalCancelBtn = document.getElementById('delete-modal-cancel-btn');
    const deleteStudentForm = document.getElementById('delete-student-form');
    const deleteStudentSelect = document.getElementById('delete-student-select');

    function toggleDeleteModal(show) {
        if (show) {
            // Populate select box with current roster options
            deleteStudentSelect.innerHTML = '<option value="" disabled selected>-- Select a Student --</option>';
            // Sort roster alphabetically by rollNo
            const sortedRoster = [...roster].sort((a, b) => a.rollNo.localeCompare(b.rollNo));
            sortedRoster.forEach(student => {
                const opt = document.createElement('option');
                opt.value = student.rollNo;
                opt.innerText = `${student.rollNo} - ${student.name}`;
                deleteStudentSelect.appendChild(opt);
            });

            deleteStudentModal.classList.add('active');
            deleteStudentModal.setAttribute('aria-hidden', 'false');
        } else {
            deleteStudentModal.classList.remove('active');
            deleteStudentModal.setAttribute('aria-hidden', 'true');
        }
    }

    if (deleteStudentMenuBtn) {
        deleteStudentMenuBtn.addEventListener('click', () => toggleDeleteModal(true));
    }
    if (deleteModalCloseBtn) {
        deleteModalCloseBtn.addEventListener('click', () => toggleDeleteModal(false));
    }
    if (deleteModalCancelBtn) {
        deleteModalCancelBtn.addEventListener('click', () => toggleDeleteModal(false));
    }
    if (deleteStudentModal) {
        deleteStudentModal.addEventListener('click', (e) => {
            if (e.target === deleteStudentModal) toggleDeleteModal(false);
        });
    }

    if (deleteStudentForm) {
        deleteStudentForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const rollNoToDelete = deleteStudentSelect.value;
            if (!rollNoToDelete) return;

            const student = roster.find(s => s.rollNo === rollNoToDelete);
            const studentName = student ? student.name : rollNoToDelete;

            if (confirm(`Are you sure you want to delete ${studentName} (${rollNoToDelete}) from the roster?`)) {
                roster = roster.filter(s => s.rollNo !== rollNoToDelete);
                saveState();
                updateStats();
                renderRoster();
                renderAbsenteesList();
                renderHistoryLogs();
                toggleDeleteModal(false);
            }
        });
    }

    // Form Submission: Add Student
    addStudentForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const rollNo = newRollNoInput.value.trim().toUpperCase();
        const name = newNameInput.value.trim().toUpperCase();
        const phone = newPhoneInput.value.trim();
        const fatherName = newFatherNameInput.value.trim().toUpperCase();
        const fatherPhone = newFatherPhoneInput.value.trim();

        // Check if Roll No already exists
        if (roster.some(s => s.rollNo.toUpperCase() === rollNo)) {
            alert(`Roll number ${rollNo} is already assigned to a student.`);
            return;
        }

        roster.push({
            rollNo,
            name,
            phone,
            fatherName,
            fatherPhone
        });

        saveState();
        updateStats();
        renderRoster();
        renderAbsenteesList();
        toggleModal(false);
    });

    // Export Data as CSV (using selected date's students)
    exportBtn.addEventListener('click', () => {
        const activeStudents = getStudents();
        let csvContent = "data:text/csv;charset=utf-8,";
        csvContent += "Roll Number,Name,Status\n";
        
        activeStudents.sort((a,b) => a.rollNo.localeCompare(b.rollNo)).forEach(s => {
            csvContent += `${s.rollNo},"${s.name}",${s.status.toUpperCase()}\n`;
        });

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `Attendance_Report_${selectedDate}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });

    // Render Attendance History Log List
    function renderHistoryLogs() {
        historyLogList.innerHTML = '';
        const dates = Object.keys(attendanceHistory).sort().reverse(); // Show newest date first

        if (dates.length === 0) {
            emptyHistoryState.style.display = 'block';
            historyLogList.style.display = 'none';
            return;
        }

        emptyHistoryState.style.display = 'none';
        historyLogList.style.display = 'grid';
        Object.keys(attendanceHistory).sort().reverse().forEach(keyStr => {
            const entry = attendanceHistory[keyStr];
            let dateStr = keyStr;
            
            // Should no longer hit this after migration, but fallback just in case
            if (keyStr.includes('_') && !keyStr.includes('_P')) {
                const parts = keyStr.split('_');
                dateStr = parts[0];
            } else if (keyStr.includes('_P')) {
                const parts = keyStr.split('_P');
                dateStr = parts[0];
            }
            
            // Support legacy boolean logic for 'isHoliday'
            const isHol = (typeof entry === 'object' && entry !== null && entry.isHoliday) || false;
            const attendanceMap = isHol ? {} : (entry.attendance ? entry.attendance : entry);

            const [year, month, day] = dateStr.split('-');
            const displayDate = `${day}/${month}/${year}`;
            let subjectInfo = '';
            if (entry.subjectName) {
                subjectInfo = ` | P${keyStr.split('_P')[1]} - ${entry.subjectName}`;
            }

            // Get absentees list
            const absentees = roster.filter(student => !isHol && attendanceMap[student.rollNo] === 'absent');
            absentees.sort((a, b) => a.rollNo.localeCompare(b.rollNo));
            
            let absentListStr = "";
            let percentageHTML = "";
            let statsText = "";

            if (isHol) {
                absentListStr = `<span style="color: var(--primary); font-weight: 700;">🌴 Holiday: ${entry.holidayReason || 'School Holiday'}</span>`;
                percentageHTML = `<span style="font-size: 0.85rem; font-weight: 700; color: var(--primary);">Holiday</span>`;
                statsText = `<span>School Holiday Mode</span>`;
            } else {
                const total = roster.length;
                const absentCount = absentees.length;
                const presentCount = total - absentCount;
                const percentage = total > 0 ? Math.round((presentCount / total) * 100) : 100;
                
                const absSuffixes = absentees.map(s => s.rollNo.slice(-2)).join(', ');
                absentListStr = absentees.length > 0 
                    ? `Absentees: <span style="color: var(--danger); font-weight: 600;">${absSuffixes}</span>`
                    : `Absentees: <span style="color: var(--success); font-weight: 600;">100% Present</span>`;
                    
                percentageHTML = `<span style="font-size: 0.85rem; font-weight: 700; color: ${percentage >= 85 ? 'var(--success)' : 'var(--danger)'};">${percentage}%</span>`;
                statsText = `<span>${presentCount} Present / ${absentCount} Absent</span>`;
            }

            const card = document.createElement('div');
            card.className = 'glass-panel';
            card.style.padding = '1rem';
            card.style.cursor = 'pointer';
            card.style.position = 'relative';
            card.style.display = 'flex';
            card.style.flexDirection = 'column';
            card.style.gap = '0.5rem';
            card.style.transition = 'var(--transition)';
            card.style.border = keyStr === getHistoryKey() ? '1px solid var(--primary)' : '1px solid var(--card-border)';
            card.style.background = keyStr === getHistoryKey() ? 'var(--primary-light)' : 'var(--card-bg)';
            
            card.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span style="font-weight: 700; font-size: 1rem; color: var(--text-primary);"><i class="far fa-calendar-check" style="color: var(--primary); margin-right: 0.35rem;"></i>${displayDate}${subjectInfo}</span>
                    ${percentageHTML}
                </div>
                <div style="font-size: 0.85rem; color: var(--text-secondary); word-break: break-all; min-height: 2.2rem; line-height: 1.3;">
                    ${absentListStr}
                </div>
                <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 0.25rem; font-size: 0.75rem; color: var(--text-muted);">
                    ${statsText}
                    <button class="delete-log-btn" title="Delete log" style="background: transparent; border: none; color: var(--text-muted); cursor: pointer; padding: 0.25rem; transition: var(--transition);">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;

            // Load Date on click
            card.addEventListener('click', (e) => {
                // If clicked trash button, don't trigger date load
                if (e.target.closest('.delete-log-btn')) return;
                
                selectedDate = dateStr;
                datePicker.value = selectedDate;
                
                if (keyStr.includes('_P')) {
                    const parts = keyStr.split('_P');
                    selectedPeriod = parts[1];
                }
                
                window.triggerTimetableUpdate();
            });

            // Delete Date Log
            card.querySelector('.delete-log-btn').addEventListener('click', (e) => {
                e.stopPropagation();
                if (confirm(`Are you sure you want to delete the attendance log for ${displayDate}?`)) {
                    delete attendanceHistory[keyStr];
                    saveState();
                    if (keyStr === getHistoryKey()) {
                        updateStats();
                        renderRoster();
                        renderAbsenteesList();
                    }
                    renderHistoryLogs();
                }
            });

            historyLogList.appendChild(card);
        });
    }



    // Date picker change event
    datePicker.addEventListener('change', (e) => {
        selectedDate = e.target.value;
        window.triggerTimetableUpdate();
    });

    // Clear all history
    clearHistoryBtn.addEventListener('click', () => {
        if (confirm("Are you sure you want to clear ALL attendance logs from history? Roster will be kept.")) {
            attendanceHistory = {};
            saveState();
            updateStats();
            renderRoster();
            renderAbsenteesList();
            renderHistoryLogs();
        }
    });

    // Export Backup JSON
    const exportBackupBtn = document.getElementById('export-backup-btn');
    if (exportBackupBtn) {
        exportBackupBtn.addEventListener('click', () => {
            const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({
                roster: roster,
                history: attendanceHistory
            }, null, 2));
            const downloadAnchor = document.createElement('a');
            downloadAnchor.setAttribute("href", dataStr);
            downloadAnchor.setAttribute("download", `attendance_backup_${selectedDate}.json`);
            document.body.appendChild(downloadAnchor);
            downloadAnchor.click();
            downloadAnchor.remove();
        });
    }

    // Import Backup JSON
    const importBackupBtn = document.getElementById('import-backup-btn');
    const importBackupFile = document.getElementById('import-backup-file');
    if (importBackupBtn && importBackupFile) {
        importBackupBtn.addEventListener('click', () => {
            importBackupFile.click();
        });

        importBackupFile.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = function(evt) {
                try {
                    const importedData = JSON.parse(evt.target.result);
                    if (importedData && importedData.roster && importedData.history) {
                        if (confirm("This will overwrite your current laptop data with the backup file. Proceed?")) {
                            roster = importedData.roster;
                            attendanceHistory = importedData.history;
                            saveState();
                            window.updateUI();
                            alert("Import successful! The database has been updated and synced.");
                        }
                    } else {
                        alert("Invalid backup file format. Roster or history keys are missing.");
                    }
                } catch (err) {
                    alert("Error parsing backup JSON: " + err.message);
                }
            };
            reader.readAsText(file);
        });
    }

    // Global update helper to reload UI states on snapshot triggers
    window.updateUI = function() {
        updateStats();
        renderRoster();
        renderAbsenteesList();
        renderHistoryLogs();
    };

    // Update Dashboard Header for Students
    if (authManager && authManager.user && authManager.user.role === 'student') {
        const headerH1 = document.querySelector('.header-info h1');
        const syncDotNode = document.getElementById('sync-dot');
        if (headerH1) {
            headerH1.innerHTML = `Welcome ${authManager.user.name || ''} <br> <span style="font-size: 1.1rem; color: var(--text-secondary); margin-top: 0.25rem; display: inline-block;">${authManager.user.year} Year - Section ${authManager.user.section}</span>`;
            if (syncDotNode) headerH1.appendChild(syncDotNode);
        }
    }

    // Setup class-dropdown change listener
    const classDropdownEl = document.getElementById('class-dropdown');
    if (classDropdownEl) {
        const savedClassId = localStorage.getItem('current_class_id');
        if (savedClassId) {
            classDropdownEl.value = savedClassId;
        }
        classDropdownEl.addEventListener('change', (e) => {
            const newClassId = e.target.value;
            if (typeof window.switchClass === 'function') {
                window.switchClass(newClassId);
            }
        });
    }

    // ==========================================================
    // DASHBOARD TIMETABLE MODAL VIEWER
    // ==========================================================
    function getDashboardSubjectCategoryClass(name) {
        if (!name) return 'free';
        const upper = name.toUpperCase();
        if (upper.includes('LAB') || upper.includes('PRACTICAL') || upper.includes('WORKSHOP') || upper.includes('FSDL')) return 'lab';
        if (upper.includes('CLOUD') || upper.includes('DEEP') || upper.includes('LEARNING') || upper.includes('DATA') || upper.includes('TECH') || upper.includes('BLOCKCHAIN')) return 'tech';
        if (upper.includes('CYBER') || upper.includes('SECURITY') || upper.includes('NETWORK') || upper.includes('CRYPTO') || upper.includes('STORAGE')) return 'security';
        if (upper.includes('TUTORIAL') || upper.includes('MENTOR') || upper.includes('LIBRARY') || upper.includes('SEMINAR') || upper.includes('SPORTS') || upper.includes('PROJECT')) return 'tutorial';
        return '';
    }

    function renderDashboardWeeklyGrid(schedule, containerId, targetDay = 'ALL') {
        const container = document.getElementById(containerId);
        if (!container) return;
        container.innerHTML = '';

        const allDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        const days = (targetDay === 'ALL') ? allDays : [targetDay];

        const todayObj = new Date();
        const todayDayName = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][todayObj.getDay()];

        days.forEach(day => {
            const daySched = (schedule && schedule[day]) ? schedule[day] : {};
            const col = document.createElement('div');
            col.className = 'day-column' + (day.toLowerCase() === todayDayName.toLowerCase() ? ' today' : '');

            let count = 0;
            for (let p = 1; p <= 6; p++) {
                if (daySched[p] && daySched[p].subjectName) count++;
            }

            let cardsHtml = '';
            for (let p = 1; p <= 6; p++) {
                const info = daySched[p];
                if (info && info.subjectName) {
                    const catClass = getDashboardSubjectCategoryClass(info.subjectName);
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
                                ${info.faculty ? `
                                <span style="color: var(--text-secondary); max-width: 120px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${info.faculty}">
                                    <i class="fas fa-user-tie" style="font-size: 0.68rem; margin-right: 2px;"></i> ${info.faculty}
                                </span>` : ''}
                            </div>
                        </div>
                    `;
                } else {
                    cardsHtml += `
                        <div class="period-card-item free">
                            <div style="font-size: 0.72rem; font-weight: 600; color: var(--text-muted);">
                                Period ${p} &bull; Free / Break
                            </div>
                        </div>
                    `;
                }
            }

            col.innerHTML = `
                <div class="day-header">
                    <span>${day} ${day.toLowerCase() === todayDayName.toLowerCase() ? '<span style="font-size: 0.7rem; color: var(--primary); font-weight: 800; margin-left: 0.35rem;">(TODAY)</span>' : ''}</span>
                    <span class="badge badge-info" style="font-size: 0.72rem; padding: 0.15rem 0.45rem;">${count} Periods</span>
                </div>
                <div class="day-periods-list">
                    ${cardsHtml}
                </div>
            `;
            container.appendChild(col);
        });
    }

    function openDashboardTimetableModal() {
        const overlay = document.getElementById('dashboard-timetable-modal-overlay');
        const modalClassName = document.getElementById('dashboard-modal-tt-class-name');
        if (!overlay) return;

        const classId = window.getCurrentClassId() || 'IV_D';
        const resolvedId = resolveClassId(classId);
        let classNameDisplay = classId ? classId.replace(/_/g, ' ') : 'Select a Class';
        try {
            const customTt = JSON.parse(localStorage.getItem('custom_timetables') || '{}');
            const targetEntry = customTt[classId] || customTt[resolvedId];
            if (targetEntry && targetEntry.className) {
                classNameDisplay = targetEntry.className;
            }
        } catch (e) {}
        if (window.OFFICIAL_TIMETABLES) {
            const official = window.OFFICIAL_TIMETABLES[classId] || window.OFFICIAL_TIMETABLES[resolvedId];
            if (official && official.className) {
                classNameDisplay = official.className;
            }
        }

        if (modalClassName) {
            modalClassName.textContent = `${classNameDisplay}`;
        }

        const schedule = window.getCurrentTimetable() || {};
        const dayFilterEl = document.getElementById('dashboard-modal-tt-day-filter');
        const selectedDay = dayFilterEl ? dayFilterEl.value : 'ALL';

        renderDashboardWeeklyGrid(schedule, 'dashboard-modal-tt-grid', selectedDay);
        overlay.style.display = 'flex';
    }

    function closeDashboardTimetableModal() {
        const overlay = document.getElementById('dashboard-timetable-modal-overlay');
        if (overlay) overlay.style.display = 'none';
    }

    // Wire Dashboard Timetable Modal events
    const btnDashViewTt = document.getElementById('btn-dashboard-view-timetable');
    if (btnDashViewTt) {
        btnDashViewTt.addEventListener('click', openDashboardTimetableModal);
    }

    const btnInlineViewTt = document.getElementById('btn-inline-view-tt');
    if (btnInlineViewTt) {
        btnInlineViewTt.addEventListener('click', openDashboardTimetableModal);
    }

    const dashModalCloseBtn = document.getElementById('dashboard-modal-btn-close');
    if (dashModalCloseBtn) {
        dashModalCloseBtn.addEventListener('click', closeDashboardTimetableModal);
    }

    const dashModalOverlay = document.getElementById('dashboard-timetable-modal-overlay');
    if (dashModalOverlay) {
        dashModalOverlay.addEventListener('click', (e) => {
            if (e.target === dashModalOverlay) closeDashboardTimetableModal();
        });
    }

    const dashModalPrintBtn = document.getElementById('dashboard-modal-btn-print');
    if (dashModalPrintBtn) {
        dashModalPrintBtn.addEventListener('click', () => window.print());
    }

    const dashModalDayFilter = document.getElementById('dashboard-modal-tt-day-filter');
    if (dashModalDayFilter) {
        dashModalDayFilter.addEventListener('change', () => {
            const schedule = window.getCurrentTimetable() || {};
            renderDashboardWeeklyGrid(schedule, 'dashboard-modal-tt-grid', dashModalDayFilter.value);
        });
    }

    // Initialize App Render
    window.updateUI();
    window.triggerTimetableUpdate();
});
