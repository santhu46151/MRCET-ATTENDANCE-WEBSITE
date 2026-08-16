document.addEventListener('DOMContentLoaded', () => {
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
    roster = JSON.parse(localStorage.getItem('attendance_roster'));
    const isStudent = authManager && authManager.user && authManager.user.role === 'student';
    if (!roster || roster.length === 0 || !roster[0] || typeof roster[0].rollNo === 'number' || !roster[0].hasOwnProperty('phone')) {
        roster = isStudent ? [] : defaultStudents;
        localStorage.setItem('attendance_roster', JSON.stringify(roster));
    }

    attendanceHistory = JSON.parse(localStorage.getItem('attendance_history')) || {};
    // Migrate legacy attendanceHistory entries
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
    
    // Get local date in YYYY-MM-DD format
    const todayObj = new Date();
    const localYYYY = todayObj.getFullYear();
    const localMM = String(todayObj.getMonth() + 1).padStart(2, '0');
    const localDD = String(todayObj.getDate()).padStart(2, '0');
    let selectedDate = `${localYYYY}-${localMM}-${localDD}`;

    // Helper to check if current date is holiday
    function isHolidayActive() {
        const entry = attendanceHistory[selectedDate];
        return entry && entry.isHoliday;
    }

    // Helper to get roster with state for selected date
    function getStudents() {
        const entry = attendanceHistory[selectedDate] || {};
        const attendanceMap = entry.attendance || {};
        return roster.map(student => ({
            ...student,
            status: entry.isHoliday ? 'present' : (attendanceMap[student.rollNo] || 'present')
        }));
    }

    // Helper to save a student status
    function setStudentStatus(rollNo, status) {
        if (!attendanceHistory[selectedDate]) {
            attendanceHistory[selectedDate] = { isHoliday: false, attendance: {} };
        } else if (!attendanceHistory[selectedDate].attendance) {
            const legacyMap = { ...attendanceHistory[selectedDate] };
            attendanceHistory[selectedDate] = {
                isHoliday: false,
                attendance: legacyMap
            };
        }
        attendanceHistory[selectedDate].attendance[rollNo] = status;
        saveState();
    }

    // DOM Elements
    const gridContainer = document.getElementById('students-grid-container');
    const absentMessageBox = document.getElementById('absent-message-box');
    const copyMessageBtn = document.getElementById('copy-message-btn');
    const absentMessageFormat = document.getElementById('absent-message-format');
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
    const markHolidayBtn = document.getElementById('mark-holiday-btn');
    const holidayBanner = document.getElementById('holiday-banner');
    const holidayReasonText = document.getElementById('holiday-reason-text');
    const removeHolidayBtn = document.getElementById('remove-holiday-btn');
    const searchFilterRow = document.getElementById('search-filter-row');

    // Set initial date picker value
    datePicker.value = selectedDate;

    // Actions & Modal Elements
    const themeToggleBtn = document.getElementById('theme-toggle');
    const exportBtn = document.getElementById('export-btn');
    const addStudentBtn = document.getElementById('add-student-btn');
    const markAllPresentBtn = document.getElementById('mark-all-present');
    const markAllAbsentBtn = document.getElementById('mark-all-absent');
    
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
        localStorage.setItem('attendance_history', JSON.stringify(attendanceHistory));
        localStorage.setItem('attendance_roster', JSON.stringify(roster));
        
        // Push state changes to Cloud Firestore in the background
        if (typeof window.uploadStateToCloud === 'function') {
            window.uploadStateToCloud(roster, attendanceHistory);
        }
    }

    let currentClassName = 'IV/CSE/DS/D';
    window.isRosterEmptyError = false;
    window.emptyRosterMessage = '';
    
    // Apply remote state from Firestore
    window.applyRemoteState = (remoteRoster, remoteHistory, className) => {
        window.isRosterEmptyError = false;
        window.emptyRosterMessage = '';
        if (remoteRoster) {
            roster = remoteRoster;
            localStorage.setItem('attendance_roster', JSON.stringify(roster));
        }
        if (remoteHistory) {
            attendanceHistory = remoteHistory;
            localStorage.setItem('attendance_history', JSON.stringify(attendanceHistory));
        }
        if (className) {
            currentClassName = className;
        }
        
        // Re-render UI
        updateStats();
        renderRoster();
        renderAbsenteesList();
        renderHistoryLogs();
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
        const percentage = total > 0 ? Math.round((present / total) * 100) : 0;

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
            holidayReasonText.innerText = `Reason: ${attendanceHistory[selectedDate].holidayReason || 'School Holiday'}`;
            markAllPresentBtn.disabled = true;
            markAllAbsentBtn.disabled = true;
            markHolidayBtn.innerHTML = '<i class="fas fa-edit"></i> Edit Holiday';
            return;
        }

        gridContainer.style.display = 'grid';
        searchFilterRow.style.display = 'flex';
        holidayBanner.style.display = 'none';
        markAllPresentBtn.disabled = false;
        markAllAbsentBtn.disabled = false;
        markHolidayBtn.innerHTML = '<i class="fas fa-umbrella-beach"></i> Mark Holiday';

        const activeStudents = getStudents();
        const filtered = activeStudents.filter(student => {
            const query = searchQuery.toLowerCase();
            return student.name.toLowerCase().includes(query) || 
                   student.rollNo.toLowerCase().includes(query);
        });

        // Sort students by roll number
        filtered.sort((a, b) => a.rollNo.localeCompare(b.rollNo));

        if (filtered.length === 0) {
            gridContainer.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 2rem; color: var(--text-muted);">
                    <i class="fas fa-search" style="font-size: 2rem; margin-bottom: 0.5rem; display: block;"></i>
                    No students found matching your search.
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
                const nextStatus = student.status === 'present' ? 'absent' : 'present';
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
            absentMessageBox.value = "Holiday Mode Active";
            copyMessageBtn.disabled = true;
            return;
        }

        // Build the message block
        const total = activeStudents.length;
        const absentCount = absentees.length;
        const presentCount = total - absentCount;
        const sessionVal = absentMessageFormat.value.toUpperCase();
        
        const rollSuffixes = absentees.map(s => {
            const suffix = s.rollNo.slice(-2);
            // If it starts with letter (e.g. K9, L0), keep it. If it is lateral entries like 15, 16, keep them.
            return suffix;
        }).join(', ');

        const messageText = `${currentClassName}\n${formattedDate} ${sessionVal} Absentees :\n\n${rollSuffixes || 'None'}\n\nAbsent - ${absentCount}\nPresent - ${presentCount}\nTotal - ${total}`;
        absentMessageBox.value = messageText;
        copyMessageBtn.disabled = false;
    }

    // Format selection trigger re-generation
    absentMessageFormat.addEventListener('change', () => {
        renderAbsenteesList();
    });

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

    // Mark All Actions
    markAllPresentBtn.addEventListener('click', () => {
        attendanceHistory[selectedDate] = {};
        saveState();
        updateStats();
        renderRoster();
        renderAbsenteesList();
        renderHistoryLogs();
    });

    markAllAbsentBtn.addEventListener('click', () => {
        if (!attendanceHistory[selectedDate]) {
            attendanceHistory[selectedDate] = {};
        }
        roster.forEach(s => {
            attendanceHistory[selectedDate][s.rollNo] = 'absent';
        });
        saveState();
        updateStats();
        renderRoster();
        renderAbsenteesList();
        renderHistoryLogs();
    });

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

        dates.forEach(dateStr => {
            const dateRecord = attendanceHistory[dateStr] || {};
            const isHoliday = dateRecord.isHoliday;
            
            // Format YYYY-MM-DD to DD/MM/YYYY
            const [y, m, d] = dateStr.split('-');
            const displayDate = `${d}/${m}/${y}`;

            // Get absentees list
            const attendanceMap = dateRecord.attendance || {};
            const absentees = roster.filter(student => !isHoliday && attendanceMap[student.rollNo] === 'absent');
            absentees.sort((a, b) => a.rollNo.localeCompare(b.rollNo));
            
            let absentListStr = "";
            let percentageHTML = "";
            let statsText = "";

            if (isHoliday) {
                absentListStr = `<span style="color: var(--primary); font-weight: 700;">🌴 Holiday: ${dateRecord.holidayReason || 'School Holiday'}</span>`;
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
            card.style.border = dateStr === selectedDate ? '1px solid var(--primary)' : '1px solid var(--card-border)';
            card.style.background = dateStr === selectedDate ? 'var(--primary-light)' : 'var(--card-bg)';
            
            card.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span style="font-weight: 700; font-size: 1rem; color: var(--text-primary);"><i class="far fa-calendar-check" style="color: var(--primary); margin-right: 0.35rem;"></i>${displayDate}</span>
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
                updateStats();
                renderRoster();
                renderAbsenteesList();
                renderHistoryLogs();
            });

            // Delete Date Log
            card.querySelector('.delete-log-btn').addEventListener('click', (e) => {
                e.stopPropagation();
                if (confirm(`Are you sure you want to delete the attendance log for ${displayDate}?`)) {
                    delete attendanceHistory[dateStr];
                    saveState();
                    if (dateStr === selectedDate) {
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

    // Mark Holiday button click handler
    markHolidayBtn.addEventListener('click', () => {
        const defaultReason = attendanceHistory[selectedDate]?.holidayReason || "School Holiday";
        const reason = prompt("Enter the reason for the holiday:", defaultReason);
        if (reason === null) return; // user cancelled prompt
        
        attendanceHistory[selectedDate] = {
            isHoliday: true,
            holidayReason: reason.trim() || "School Holiday",
            attendance: {}
        };
        saveState();
        updateStats();
        renderRoster();
        renderAbsenteesList();
        renderHistoryLogs();
    });

    // Remove Holiday Mode button click handler
    removeHolidayBtn.addEventListener('click', () => {
        if (confirm("Resume class attendance for this date? This will cancel Holiday Mode.")) {
            attendanceHistory[selectedDate] = {
                isHoliday: false,
                attendance: {}
            };
            saveState();
            updateStats();
            renderRoster();
            renderAbsenteesList();
            renderHistoryLogs();
        }
    });

    // Date picker change event
    datePicker.addEventListener('change', (e) => {
        selectedDate = e.target.value;
        updateStats();
        renderRoster();
        renderAbsenteesList();
        renderHistoryLogs();
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

    // Initialize App Render
    window.updateUI();
});
