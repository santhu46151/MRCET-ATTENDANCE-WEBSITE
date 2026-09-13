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

    let globalHolidays = [];

    // Initialize
    async function init() {
        try {
            if (typeof db !== 'undefined') {
                const holidaysSnap = await db.collection('holidays').get();
                globalHolidays = [];
                holidaysSnap.forEach(doc => globalHolidays.push(doc.data().date));

                let currentUser = null;
                try {
                    if (typeof authManager !== 'undefined' && authManager.user) {
                        currentUser = authManager.user;
                    } else {
                        const raw = localStorage.getItem('authUser');
                        if (raw) currentUser = JSON.parse(raw);
                    }
                } catch (e) {}

                if (typeof auth !== 'undefined' && auth.currentUser && typeof db !== 'undefined') {
                    if (!currentUser || !currentUser.role || (currentUser.role === 'student' && (!currentUser.year || !currentUser.section))) {
                        try {
                            const userDoc = await db.collection('users').doc(auth.currentUser.uid).get();
                            if (userDoc.exists) {
                                const d = userDoc.data();
                                currentUser = Object.assign({}, currentUser || {}, d, { uid: auth.currentUser.uid, email: auth.currentUser.email });
                                localStorage.setItem('authUser', JSON.stringify(currentUser));
                                if (typeof authManager !== 'undefined') authManager.user = currentUser;
                            }
                        } catch (err) {}
                    }
                }

                const isStudentUser = currentUser && (currentUser.role === 'student' || currentUser.role === 'Student');

                const classesSnap = await db.collection('classes').get();
                classSelect.innerHTML = '';
                if (classesSnap.empty) {
                    classSelect.innerHTML = '<option value="">No classes available</option>';
                } else {
                    const rawDocs = [];
                    classesSnap.forEach(d => rawDocs.push({ id: d.id, data: d.data() }));

                    rawDocs.sort((a, b) => {
                        const nameA = `${a.data.year || ''} ${a.data.section || ''}`;
                        const nameB = `${b.data.year || ''} ${b.data.section || ''}`;
                        return nameA.localeCompare(nameB);
                    });

                    rawDocs.forEach(({ id, data }) => {
                        const opt = document.createElement('option');
                        opt.value = id;
                        const yr = data.year || '';
                        const br = data.branch || 'CSE';
                        const dp = data.department || 'DS';
                        const sc = data.section || '';
                        opt.textContent = `${yr} ${br} ${dp} ${sc}`.trim() || id;
                        classSelect.appendChild(opt);
                    });

                    // Always unlocked
                    classSelect.disabled = false;
                    classSelect.style.cursor = 'pointer';
                    classSelect.style.opacity = '1';
                    const labelEl = document.querySelector('label[for="class-select"]');
                    if (labelEl) labelEl.innerHTML = '<i class="fas fa-graduation-cap" style="color: var(--primary);"></i> Class:';

                    const urlParams = new URLSearchParams(window.location.search);
                    const queryClassId = urlParams.get('class');
                    const savedClassId = localStorage.getItem('current_class_id');
                    if (queryClassId && classSelect.querySelector(`option[value="${queryClassId}"]`)) {
                        classSelect.value = queryClassId;
                    } else if (savedClassId && classSelect.querySelector(`option[value="${savedClassId}"]`)) {
                        classSelect.value = savedClassId;
                    } else if (classSelect.options.length > 0) {
                        classSelect.value = classSelect.options[0].value;
                    }
                }
            }
        } catch (e) {
            console.warn("Could not load init data:", e);
        }

        await populateSubjects();
        generateReport();
    }

    // ==========================================
    // Canonical Master Subjects & Normalization
    // ==========================================
    const OFFICIAL_III_YEAR_SUBJECTS = [
        { name: "DESIGN AND ANALYSIS OF ALGORITHMS", code: "R245A0506", isLab: false },
        { name: "INTRODUCTION TO DATA SCIENCE", code: "R245A6707", isLab: false },
        { name: "DATA WAREHOUSING AND DATA MINING", code: "R245A1206", isLab: false },
        { name: "ARTIFICIAL INTELLIGENCE", code: "R245A0513", isLab: false },
        { name: "ROBOTICS AND AUTOMATION", code: "R245A0351", isLab: false },
        { name: "INTELLECTUAL PROPERTY RIGHTS", code: "R245A2151", isLab: false },
        { name: "ARTIFICIAL INTELLIGENCE LAB", code: "R245A0588", isLab: true },
        { name: "DATA WAREHOUSING AND DATA MINING LAB", code: "R245A0590", isLab: true },
        { name: "PROFESSIONAL DEVELOPMENT LAB", code: "R245A6684", isLab: true }
    ];

    const OFFICIAL_IV_YEAR_SUBJECTS = [
        { name: "CLOUD COMPUTING", code: "R22A0522", isLab: false },
        { name: "DEEP LEARNING", code: "R22A6605", isLab: false },
        { name: "BLOCKCHAIN TECHNOLOGY", code: "R22A0527", isLab: false },
        { name: "DATABASE SECURITY", code: "R22A6214", isLab: false },
        { name: "FULL STACK DEVELOPMENT", code: "R22A0513", isLab: false },
        { name: "FULL STACK DEVELOPMENT LAB", code: "R22A0589", isLab: true }
    ];

    function resolveClassId(rawId) {
        if (!rawId) return "";
        const clean = String(rawId).trim().toUpperCase();
        if (clean.includes("III") || clean.startsWith("3")) {
            if (clean.endsWith("_D") || clean.endsWith(" D") || clean.endsWith("-D") || clean.includes("_D_") || clean.includes("SEC D") || clean.includes("SECTION D") || clean.includes("(DS)-D") || clean.includes("DS-D")) return "III_D";
            if (clean.endsWith("_C") || clean.endsWith(" C") || clean.endsWith("-C") || clean.includes("_C_") || clean.includes("SEC C") || clean.includes("SECTION C") || clean.includes("(DS)-C") || clean.includes("DS-C")) return "III_C";
            if (clean.endsWith("_B") || clean.endsWith(" B") || clean.endsWith("-B") || clean.includes("_B_") || clean.includes("SEC B") || clean.includes("SECTION B") || clean.includes("(DS)-B") || clean.includes("DS-B")) return "III_B";
            if (clean.endsWith("_A") || clean.endsWith(" A") || clean.endsWith("-A") || clean.includes("_A_") || clean.includes("SEC A") || clean.includes("SECTION A") || clean.includes("(DS)-A") || clean.includes("DS-A")) return "III_A";
        }
        if (clean.includes("IV") || clean.startsWith("4")) {
            if (clean.endsWith("_D") || clean.endsWith(" D") || clean.endsWith("-D") || clean.includes("_D_") || clean.includes("SEC D") || clean.includes("SECTION D") || clean.includes("(DS)-D") || clean.includes("DS-D")) return "IV_D";
            if (clean.endsWith("_C") || clean.endsWith(" C") || clean.endsWith("-C") || clean.includes("_C_") || clean.includes("SEC C") || clean.includes("SECTION C") || clean.includes("(DS)-C") || clean.includes("DS-C")) return "IV_C";
            if (clean.endsWith("_B") || clean.endsWith(" B") || clean.endsWith("-B") || clean.includes("_B_") || clean.includes("SEC B") || clean.includes("SECTION B") || clean.includes("(DS)-B") || clean.includes("DS-B")) return "IV_B";
            if (clean.endsWith("_A") || clean.endsWith(" A") || clean.endsWith("-A") || clean.includes("_A_") || clean.includes("SEC A") || clean.includes("SECTION A") || clean.includes("(DS)-A") || clean.includes("DS-A")) return "IV_A";
        }
        return clean;
    }

    function isThirdYearClass(id) {
        if (!id) return false;
        const c = String(id).toUpperCase();
        if (c.includes("III") || c.startsWith("3") || c.includes("YEAR 3") || c.includes("3RD") || c.includes("_3_") || c.includes("-3-")) {
            return true;
        }
        const sel = document.querySelector(`#class-select option[value="${id}"]`);
        if (sel && sel.textContent) {
            const t = sel.textContent.toUpperCase();
            if (t.includes("III") || t.includes("3RD") || t.includes("3 YEAR") || t.includes("YEAR 3") || t.startsWith("3 ")) return true;
        }
        return false;
    }

    function isFourthYearClass(id) {
        if (!id) return false;
        if (isThirdYearClass(id)) return false;
        const c = String(id).toUpperCase();
        if (c.includes("IV") || c.startsWith("4") || c.includes("YEAR 4") || c.includes("4TH") || c.includes("_4_") || c.includes("-4-")) {
            return true;
        }
        const sel = document.querySelector(`#class-select option[value="${id}"]`);
        if (sel && sel.textContent) {
            const t = sel.textContent.toUpperCase();
            if (t.includes("IV") || t.includes("4TH") || t.includes("4 YEAR") || t.includes("YEAR 4") || t.startsWith("4 ")) return true;
        }
        return false;
    }

    function isIgnoredSubject(raw) {
        if (!raw) return true;
        const clean = String(raw).trim().toUpperCase();
        if (clean === "TUTORIAL" || clean === "TUT" || clean === "TEST") return true;
        if (/^PERIOD\s*\d+$/i.test(clean)) return true;
        if (clean === "MENTORING" || clean === "SPORTS" || clean === "LIBRARY" || clean === "COUNSELING" || clean === "CRT" || clean === "APTITUDE") return true;
        return false;
    }

    function normalizeSubjectName(raw) {
        if (!raw) return "";
        const clean = String(raw).trim().toUpperCase();

        // Check official codes
        if (clean === "R245A0506") return "DESIGN AND ANALYSIS OF ALGORITHMS";
        if (clean === "R245A6707") return "INTRODUCTION TO DATA SCIENCE";
        if (clean === "R245A1206") return "DATA WAREHOUSING AND DATA MINING";
        if (clean === "R245A0513") return "ARTIFICIAL INTELLIGENCE";
        if (clean === "R245A0351") return "ROBOTICS AND AUTOMATION";
        if (clean === "R245A2151") return "INTELLECTUAL PROPERTY RIGHTS";
        if (clean === "R245A0588") return "ARTIFICIAL INTELLIGENCE LAB";
        if (clean === "R245A0590") return "DATA WAREHOUSING AND DATA MINING LAB";
        if (clean === "R245A6684") return "PROFESSIONAL DEVELOPMENT LAB";

        if (clean === "R22A0522") return "CLOUD COMPUTING";
        if (clean === "R22A6605") return "DEEP LEARNING";
        if (clean === "R22A0527") return "BLOCKCHAIN TECHNOLOGY";
        if (clean === "R22A6214") return "DATABASE SECURITY";
        if (clean === "R22A0513") return "FULL STACK DEVELOPMENT";
        if (clean === "R22A0589") return "FULL STACK DEVELOPMENT LAB";

        // III Year Subject Normalizations
        if (clean.includes("ALGORITHM") || clean === "DAA" || clean.startsWith("DAA ") || clean.startsWith("DAA-") || clean.startsWith("DAA_")) {
            return "DESIGN AND ANALYSIS OF ALGORITHMS";
        }
        if (clean.includes("DATA SCIENCE") || clean === "IDS" || clean.startsWith("IDS ") || clean.startsWith("IDS-") || clean === "INTRO TO DATA SCIENCE") {
            return "INTRODUCTION TO DATA SCIENCE";
        }
        if ((clean.includes("DATA WAREHOUS") || clean.includes("DATA MINING") || clean === "DWDM" || clean.startsWith("DWDM ") || clean.startsWith("DWDM-")) && !clean.includes("LAB")) {
            return "DATA WAREHOUSING AND DATA MINING";
        }
        if ((clean === "AI" || clean.startsWith("AI ") || clean.startsWith("AI-") || clean.includes("ARTIFICIAL INTELLIGENCE")) && !clean.includes("LAB")) {
            return "ARTIFICIAL INTELLIGENCE";
        }
        if (clean.includes("ROBOTIC") || clean === "R&A" || clean === "R & A" || clean === "RA" || clean.startsWith("R&A ") || clean.startsWith("R & A ")) {
            return "ROBOTICS AND AUTOMATION";
        }
        if (clean.includes("INTELLECTUAL") || clean.includes("PROPERTY RIGHTS") || clean === "IPR" || clean.startsWith("IPR ") || clean.startsWith("IPR-")) {
            return "INTELLECTUAL PROPERTY RIGHTS";
        }
        if (clean.includes("AI LAB") || clean.includes("ARTIFICIAL INTELLIGENCE LAB")) {
            return "ARTIFICIAL INTELLIGENCE LAB";
        }
        if (clean.includes("DWDM LAB") || (clean.includes("DATA MINING") && clean.includes("LAB")) || (clean.includes("DATA WAREHOUS") && clean.includes("LAB"))) {
            return "DATA WAREHOUSING AND DATA MINING LAB";
        }
        if (clean.includes("PROFESSIONAL DEVELOPMENT") || clean.includes("PD LAB") || clean.includes("PDS LAB") || clean === "PDS" || clean === "PD" || clean.startsWith("PDS LAB") || clean.startsWith("PD LAB")) {
            return "PROFESSIONAL DEVELOPMENT LAB";
        }

        // IV Year Subject Normalizations
        if (clean.includes("CLOUD COMPUTING") || clean === "CC" || clean.startsWith("CC ") || clean.startsWith("CC-")) {
            return "CLOUD COMPUTING";
        }
        if (clean.includes("DEEP LEARNING") || clean === "DL" || clean.startsWith("DL ") || clean.startsWith("DL-")) {
            return "DEEP LEARNING";
        }
        if (clean.includes("BLOCKCHAIN") || clean === "BT" || clean.startsWith("BT ") || clean.startsWith("BT-")) {
            return "BLOCKCHAIN TECHNOLOGY";
        }
        if (clean.includes("DATABASE SECURITY") || clean === "DBS" || clean.startsWith("DBS ") || clean.startsWith("DBS-")) {
            return "DATABASE SECURITY";
        }
        if ((clean.includes("FULL STACK") || clean === "FSD" || clean.startsWith("FSD ") || clean.startsWith("FSD-")) && !clean.includes("LAB")) {
            return "FULL STACK DEVELOPMENT";
        }
        if ((clean.includes("FULL STACK") && clean.includes("LAB")) || clean.includes("FSD LAB") || clean.startsWith("FSD LAB")) {
            return "FULL STACK DEVELOPMENT LAB";
        }

        return clean;
    }

    function getFacultyForSubject(classId, subjectName, schedule) {
        const canonical = normalizeSubjectName(subjectName);
        const resolvedId = resolveClassId(classId);

        // 1. Search in current schedule
        if (schedule) {
            for (const d in schedule) {
                for (const p in schedule[d]) {
                    const itm = schedule[d][p];
                    if (itm && normalizeSubjectName(itm.subjectName) === canonical && itm.faculty) {
                        return itm.faculty;
                    }
                }
            }
        }

        // 2. Search in official timetable for classId / resolvedId
        if (window.OFFICIAL_TIMETABLES) {
            const off = window.OFFICIAL_TIMETABLES[classId] || window.OFFICIAL_TIMETABLES[resolvedId];
            if (off && off.schedule) {
                for (const d in off.schedule) {
                    for (const p in off.schedule[d]) {
                        const itm = off.schedule[d][p];
                        if (itm && normalizeSubjectName(itm.subjectName) === canonical && itm.faculty) {
                            return itm.faculty;
                        }
                    }
                }
            }
        }

        // 3. Fallback standard master faculty map
        const DEFAULT_FACULTY = {
            "III_A": {
                "DESIGN AND ANALYSIS OF ALGORITHMS": "Y.RAJINI",
                "INTRODUCTION TO DATA SCIENCE": "T.RAVALI",
                "DATA WAREHOUSING AND DATA MINING": "S.THIRUPATHI",
                "ARTIFICIAL INTELLIGENCE": "P.SUJITHA",
                "ROBOTICS AND AUTOMATION": "K.CHAITHANYA",
                "INTELLECTUAL PROPERTY RIGHTS": "K.LAVANYA",
                "ARTIFICIAL INTELLIGENCE LAB": "P.SUJITHA / S.THIRUPATHI",
                "DATA WAREHOUSING AND DATA MINING LAB": "S.THIRUPATHI / Y.RAJINI",
                "PROFESSIONAL DEVELOPMENT LAB": "E.KAVYA"
            },
            "III_B": {
                "DESIGN AND ANALYSIS OF ALGORITHMS": "Y.RAJINI",
                "INTRODUCTION TO DATA SCIENCE": "T.RAVALI",
                "DATA WAREHOUSING AND DATA MINING": "CH.SREE VIDYA",
                "ARTIFICIAL INTELLIGENCE": "A.SUSHMITHA",
                "ROBOTICS AND AUTOMATION": "D.KAVITHA",
                "INTELLECTUAL PROPERTY RIGHTS": "K.LAVANYA",
                "ARTIFICIAL INTELLIGENCE LAB": "A.SUSHMITHA / CH.SREE VIDYA",
                "DATA WAREHOUSING AND DATA MINING LAB": "CH.SREE VIDYA / E.KAVYA",
                "PROFESSIONAL DEVELOPMENT LAB": "E.KAVYA"
            },
            "III_C": {
                "DESIGN AND ANALYSIS OF ALGORITHMS": "P. SUJITHA",
                "INTRODUCTION TO DATA SCIENCE": "T. RAVALI",
                "DATA WAREHOUSING AND DATA MINING": "S. THIRUPATHI",
                "ARTIFICIAL INTELLIGENCE": "A. SUSHMITHA",
                "ROBOTICS AND AUTOMATION": "K CHAITHANYA",
                "INTELLECTUAL PROPERTY RIGHTS": "K.LAVANYA",
                "ARTIFICIAL INTELLIGENCE LAB": "A. SUSHMITHA / T.RAVALI",
                "DATA WAREHOUSING AND DATA MINING LAB": "S. THIRUPATHI / BALAJI",
                "PROFESSIONAL DEVELOPMENT LAB": "U.KETHANA"
            },
            "III_D": {
                "DESIGN AND ANALYSIS OF ALGORITHMS": "Y. RAJINI",
                "INTRODUCTION TO DATA SCIENCE": "T. RAVALI",
                "DATA WAREHOUSING AND DATA MINING": "CH. SREE VIDYA",
                "ARTIFICIAL INTELLIGENCE": "P. SUJITHA",
                "ROBOTICS AND AUTOMATION": "K CHAITHANYA",
                "INTELLECTUAL PROPERTY RIGHTS": "K.LAVANYA",
                "ARTIFICIAL INTELLIGENCE LAB": "P. SUJITHA / K.AJITH",
                "DATA WAREHOUSING AND DATA MINING LAB": "CH. SREE VIDYA / K. AJITH",
                "PROFESSIONAL DEVELOPMENT LAB": "U.KETHANA"
            },
            "IV_A": {
                "CLOUD COMPUTING": "A. SUPRIYA",
                "DEEP LEARNING": "D. SOWJANYA",
                "BLOCKCHAIN TECHNOLOGY": "CH. SRIVALLI",
                "DATABASE SECURITY": "B. SWAPNA LATHA",
                "FULL STACK DEVELOPMENT": "A.R. LAVANYA",
                "FULL STACK DEVELOPMENT LAB": "A.R. LAVANYA / BALAJI"
            },
            "IV_B": {
                "CLOUD COMPUTING": "R GURUNADAM",
                "DEEP LEARNING": "D SOWJANYA",
                "BLOCKCHAIN TECHNOLOGY": "CH SRIVALLI",
                "DATABASE SECURITY": "B SWAPNA LATHA",
                "FULL STACK DEVELOPMENT": "A.R. LAVANYA",
                "FULL STACK DEVELOPMENT LAB": "A.R. LAVANYA / BALAJI"
            },
            "IV_C": {
                "CLOUD COMPUTING": "R GURUNADAM",
                "DEEP LEARNING": "D SOWJANYA",
                "BLOCKCHAIN TECHNOLOGY": "E SOWJANYA",
                "DATABASE SECURITY": "B SWAPNA LATHA",
                "FULL STACK DEVELOPMENT": "K MAHESH BABU",
                "FULL STACK DEVELOPMENT LAB": "K MAHESH BABU / BALAJI"
            },
            "IV_D": {
                "CLOUD COMPUTING": "A SUPRIYA",
                "DEEP LEARNING": "T SIVA RATNA SAI",
                "BLOCKCHAIN TECHNOLOGY": "CH SRIVALLI",
                "DATABASE SECURITY": "K.BALAJI",
                "FULL STACK DEVELOPMENT": "K MAHESH BABU",
                "FULL STACK DEVELOPMENT LAB": "K MAHESH BABU / BALAJI"
            }
        };

        if (DEFAULT_FACULTY[resolvedId] && DEFAULT_FACULTY[resolvedId][canonical]) {
            return DEFAULT_FACULTY[resolvedId][canonical];
        }

        return "Department Faculty";
    }

    // Populate subjects based on selected class timetable and recorded history
    async function populateSubjects() {
        const classId = classSelect.value;
        const previousSubject = subjectSelect.value;
        subjectSelect.innerHTML = '';
        if (!classId) {
            subjectSelect.innerHTML = '<option value="">-- No Class Selected --</option>';
            return;
        }

        const resolvedId = resolveClassId(classId);
        let schedule = {};

        if (typeof db !== 'undefined') {
            try {
                let ttDoc = await db.collection('timetables').doc(classId).get();
                if (!ttDoc.exists && resolvedId !== classId) {
                    ttDoc = await db.collection('timetables').doc(resolvedId).get();
                }
                if (ttDoc.exists && ttDoc.data().schedule) {
                    schedule = ttDoc.data().schedule;
                }
            } catch(e) {}
        }
        if (Object.keys(schedule).length === 0) {
            try {
                const customTt = JSON.parse(localStorage.getItem('custom_timetables') || '{}');
                const target = customTt[classId] || customTt[resolvedId];
                if (target && target.schedule) {
                    schedule = target.schedule;
                }
            } catch(e) {}
        }
        if (Object.keys(schedule).length === 0 && window.OFFICIAL_TIMETABLES) {
            const off = window.OFFICIAL_TIMETABLES[classId] || window.OFFICIAL_TIMETABLES[resolvedId];
            if (off && off.schedule) {
                schedule = off.schedule;
            }
        }

        const subjectsMap = {};
        const isIII = isThirdYearClass(classId) || isThirdYearClass(resolvedId);
        const isIV = isFourthYearClass(classId) || isFourthYearClass(resolvedId);

        let subjectNames = [];

        if (isIII) {
            // 1. For ALL Third Year sections (A, B, C, D), STRICTLY guarantee the EXACT SAME 9 curriculum subjects in identical order!
            OFFICIAL_III_YEAR_SUBJECTS.forEach(sub => {
                const faculty = getFacultyForSubject(classId, sub.name, schedule);
                subjectsMap[sub.name] = {
                    name: sub.name,
                    code: sub.code,
                    faculty: faculty,
                    isLab: sub.isLab
                };
            });
            subjectNames = OFFICIAL_III_YEAR_SUBJECTS.map(s => s.name);
        } else if (isIV) {
            // 2. For ALL Fourth Year sections (A, B, C, D), STRICTLY guarantee the EXACT SAME 6 curriculum subjects in identical order!
            OFFICIAL_IV_YEAR_SUBJECTS.forEach(sub => {
                const faculty = getFacultyForSubject(classId, sub.name, schedule);
                subjectsMap[sub.name] = {
                    name: sub.name,
                    code: sub.code,
                    faculty: faculty,
                    isLab: sub.isLab
                };
            });
            subjectNames = OFFICIAL_IV_YEAR_SUBJECTS.map(s => s.name);
        } else {
            // 3. Fallback for non-standard classes: scrape schedule and recorded history
            for (const day in schedule) {
                for (const p in schedule[day]) {
                    const item = schedule[day][p];
                    if (item && item.subjectName && !isIgnoredSubject(item.subjectName)) {
                        const canonical = normalizeSubjectName(item.subjectName);
                        if (!subjectsMap[canonical]) {
                            subjectsMap[canonical] = {
                                name: canonical,
                                code: item.subjectCode || 'Core',
                                faculty: item.faculty || 'Faculty',
                                isLab: canonical.includes('LAB')
                            };
                        }
                    }
                }
            }

            try {
                if (typeof db !== 'undefined') {
                    let classDoc = await db.collection('classes').doc(classId).get();
                    if (!classDoc.exists && resolvedId !== classId) {
                        classDoc = await db.collection('classes').doc(resolvedId).get();
                    }
                    if (classDoc.exists) {
                        const hist = classDoc.data().history || {};
                        for (const k in hist) {
                            const rec = hist[k];
                            if (rec && rec.subjectName && !isIgnoredSubject(rec.subjectName)) {
                                const canonical = normalizeSubjectName(rec.subjectName);
                                if (!subjectsMap[canonical]) {
                                    subjectsMap[canonical] = {
                                        name: canonical,
                                        code: rec.subjectCode || 'Core',
                                        faculty: rec.faculty || 'Faculty',
                                        isLab: canonical.includes('LAB')
                                    };
                                }
                            }
                        }
                    }
                }
            } catch(e) {}

            subjectNames = Object.keys(subjectsMap);
            subjectNames.sort((a, b) => {
                const aIsLab = a.toUpperCase().includes('LAB');
                const bIsLab = b.toUpperCase().includes('LAB');
                if (aIsLab && !bIsLab) return 1;
                if (!aIsLab && bIsLab) return -1;
                return a.localeCompare(b);
            });
        }

        if (subjectNames.length === 0) {
            subjectSelect.innerHTML = '<option value="">No subjects found for this class</option>';
            return;
        }

        let hasSelectedMatch = false;
        subjectNames.forEach((name, idx) => {
            const info = subjectsMap[name];
            const isLab = info.isLab || name.toUpperCase().includes('LAB');
            const opt = document.createElement('option');
            opt.value = name;
            opt.textContent = `${name} (${info.code})${isLab ? ' [Lab - 3 Periods / Single Session]' : ''} - ${info.faculty}`;
            if (previousSubject && name === previousSubject) {
                opt.selected = true;
                hasSelectedMatch = true;
            } else if (!previousSubject && idx === 0) {
                opt.selected = true;
            }
            subjectSelect.appendChild(opt);
        });

        const allOpt = document.createElement('option');
        allOpt.value = '';
        allOpt.textContent = '-- All Subjects (Consolidated) --';
        if (previousSubject === '') {
            allOpt.selected = true;
            hasSelectedMatch = true;
        }
        subjectSelect.appendChild(allOpt);

        if (!hasSelectedMatch && subjectSelect.options.length > 0) {
            subjectSelect.selectedIndex = 0;
        }
    }

    classSelect.addEventListener('change', async () => {
        const selectedId = classSelect.value;
        if (selectedId) localStorage.setItem('current_class_id', selectedId);
        await populateSubjects();
        generateReport();
    });

    subjectSelect.addEventListener('change', generateReport);
    generateBtn.addEventListener('click', generateReport);

    // Fetch roster and history cleanly without IV-D fallback
    async function loadClassData(classId) {
        let roster = [];
        let history = {};
        const resolvedId = resolveClassId(classId);

        if (typeof db !== 'undefined' && classId) {
            try {
                let doc = await db.collection('classes').doc(classId).get();
                if (!doc.exists && resolvedId !== classId) {
                    doc = await db.collection('classes').doc(resolvedId).get();
                }
                if (doc.exists) {
                    const d = doc.data();
                    if (d.roster && Array.isArray(d.roster)) roster = d.roster;
                    if (d.history && typeof d.history === 'object') history = d.history;
                }
            } catch (err) {
                console.warn("Firestore load error:", err);
            }
        }

        if ((!roster || roster.length === 0) && classId) {
            try {
                let localRoster = JSON.parse(localStorage.getItem('attendance_roster_' + classId) || 'null');
                if (!localRoster && resolvedId !== classId) {
                    localRoster = JSON.parse(localStorage.getItem('attendance_roster_' + resolvedId) || 'null');
                }
                if (localRoster && Array.isArray(localRoster)) roster = localRoster;

                let localHistory = JSON.parse(localStorage.getItem('attendance_history_' + classId) || 'null');
                if (!localHistory && resolvedId !== classId) {
                    localHistory = JSON.parse(localStorage.getItem('attendance_history_' + resolvedId) || 'null');
                }
                if (localHistory && typeof localHistory === 'object') history = localHistory;
            } catch (e) {}
        }

        return { roster: roster || [], history: history || {} };
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

            if (!roster || roster.length === 0) {
                reportsContainer.innerHTML = `
                    <div style="text-align: center; padding: 3rem; background: white; border-radius: 8px; border: 1px solid #ccc;">
                        <i class="fas fa-users-slash fa-3x" style="color: #94a3b8; margin-bottom: 1rem;"></i>
                        <h3 style="color: #334155;">No students in roster for this class</h3>
                        <p style="color: #64748b;">Please select another class or add students in the admin panel.</p>
                    </div>
                `;
                loading.style.display = 'none';
                return;
            }

            const resolvedId = resolveClassId(classId);
            let schedule = {};
            let classInfo = {};
            try {
                const customTt = JSON.parse(localStorage.getItem('custom_timetables') || '{}');
                const target = customTt[classId] || customTt[resolvedId];
                if (target) {
                    classInfo = target;
                    if (target.schedule) schedule = target.schedule;
                }
            } catch (e) {}
            if (Object.keys(schedule).length === 0 && window.OFFICIAL_TIMETABLES) {
                classInfo = window.OFFICIAL_TIMETABLES[classId] || window.OFFICIAL_TIMETABLES[resolvedId] || {};
                schedule = classInfo.schedule || {};
            }

            const targetCanonical = normalizeSubjectName(selectedSubject);
            const isLabSubject = selectedSubject ? (selectedSubject.toUpperCase().includes('LAB') || targetCanonical.includes('LAB')) : false;

            // Find subject metadata
            let subjectCode = '';
            let facultyName = '';
            for (const d in schedule) {
                for (const p in schedule[d]) {
                    const itm = schedule[d][p];
                    if (itm && itm.subjectName && normalizeSubjectName(itm.subjectName) === targetCanonical) {
                        subjectCode = itm.subjectCode || '';
                        facultyName = itm.faculty || '';
                        break;
                    }
                }
                if (subjectCode) break;
            }

            // Fallback code and faculty
            if (!facultyName) {
                facultyName = getFacultyForSubject(classId, targetCanonical, schedule);
            }
            if (!subjectCode) {
                const foundMaster = [...OFFICIAL_III_YEAR_SUBJECTS, ...OFFICIAL_IV_YEAR_SUBJECTS].find(s => s.name === targetCanonical);
                if (foundMaster) subjectCode = foundMaster.code;
            }

            const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

            // 1. Detect Timetable Days for the Selected Subject
            const scheduledDaysSet = new Set();
            if (selectedSubject) {
                for (const dayName in schedule) {
                    for (const p in schedule[dayName]) {
                        const itm = schedule[dayName][p];
                        if (itm && itm.subjectName) {
                            const itmCanonical = normalizeSubjectName(itm.subjectName);
                            // Match canonical subject name
                            if (itmCanonical === targetCanonical) {
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
                    const pKey3 = `${resolvedId}_${key}_P${p}`;
                    const rec = history[pKey1] || history[pKey2] || history[pKey3];
                    if (rec && rec.attendance && Object.keys(rec.attendance).length > 0) {
                        const subName = normalizeSubjectName(rec.subjectName || '');
                        // Match canonical subject name
                        if (!selectedSubject || subName === targetCanonical) {
                            hasRecordedAttendance = true;
                            break;
                        }
                    }
                }

                // Check if this date is Sunday or Holiday
                const record = history[key] || history[`${classId}_${key}`] || history[`${resolvedId}_${key}`];
                const globalHol = globalHolidays.find(h => (typeof h === 'string' ? h === key : h.date === key));
                const isHoliday = (record && record.isHoliday) || globalHol;

                // Every Sunday and declared holiday is excluded from subject-wise report
                if (isSunday || isHoliday) {
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
                        const pKey3 = `${resolvedId}_${colKey}_P${p}`;
                        const rec = history[pKey1] || history[pKey2] || history[pKey3];
                        if (rec && rec.attendance) {
                            const subName = normalizeSubjectName(rec.subjectName || '');
                            // Only match this specific lab — not all labs
                            if (subName === targetCanonical) {
                                hasLabRecord = true;
                                const val = String(rec.attendance[studentRoll] || '').trim().toLowerCase();
                                if (val === 'absent' || val === 'ab' || val === 'a') {
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
                        const pKey3 = `${resolvedId}_${colKey}_P${p}`;
                        const rec = history[pKey1] || history[pKey2] || history[pKey3];
                        if (rec && rec.attendance) {
                            const subName = normalizeSubjectName(rec.subjectName || '');
                            if (subName === targetCanonical) {
                                const val = String(rec.attendance[studentRoll] || '').trim().toLowerCase();
                                return (val === 'absent' || val === 'ab' || val === 'a') ? 'absent' : 'present';
                            }
                        }
                    }
                }

                // 3. Fallback to direct date record
                const dateRec = history[colKey] || history[`${classId}_${colKey}`] || history[`${resolvedId}_${colKey}`];
                if (dateRec && dateRec.attendance && dateRec.attendance[studentRoll]) {
                    const val = String(dateRec.attendance[studentRoll] || '').trim().toLowerCase();
                    return (val === 'absent' || val === 'ab' || val === 'a') ? 'absent' : 'present';
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
