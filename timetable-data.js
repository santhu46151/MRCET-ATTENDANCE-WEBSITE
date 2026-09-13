// Official IV B.Tech (Data Science) Semester 1 Timetables (2026-2027)
// Malla Reddy College of Engineering and Technology

window.PERIOD_TIMES = {
    1: { label: "Period I", start: "09:30", end: "10:20", display: "9:30 AM - 10:20 AM" },
    2: { label: "Period II", start: "10:20", end: "11:10", display: "10:20 AM - 11:10 AM" },
    3: { label: "Period III", start: "11:20", end: "12:10", display: "11:20 AM - 12:10 PM" },
    4: { label: "Period IV", start: "12:50", end: "13:50", display: "12:50 PM - 1:50 PM" },
    5: { label: "Period V", start: "13:50", end: "14:50", display: "1:50 PM - 2:50 PM" },
    6: { label: "Period VI", start: "14:50", end: "15:50", display: "2:50 PM - 3:50 PM" }
};

window.OFFICIAL_TIMETABLES = {
    // ==========================================
    // SECTION A : CSE(DS)-A
    // ==========================================
    "IV_A": {
        classId: "IV_A",
        className: "IV BTECH CSE(DS)-A",
        classIncharge: "B. SWAPNA LATHA - 9603534447",
        mentors: ["B. SWAPNA LATHA (9603534447)", "A SUPRIYA (8498877035)"],
        schedule: {
            "Monday": {
                1: { subjectName: "CLOUD COMPUTING", subjectCode: "R22A0522", faculty: "A. SUPRIYA", startTime: "09:30", endTime: "10:20" },
                2: { subjectName: "DEEP LEARNING", subjectCode: "R22A6605", faculty: "D. SOWJANYA", startTime: "10:20", endTime: "11:10" },
                3: { subjectName: "BLOCKCHAIN TECHNOLOGY", subjectCode: "R22A0527", faculty: "CH. SRIVALLI", startTime: "11:20", endTime: "12:10" },
                4: { subjectName: "FULL STACK DEVELOPMENT LAB", subjectCode: "R22A0589", faculty: "A.R. LAVANYA / BALAJI", startTime: "12:50", endTime: "13:50" },
                5: { subjectName: "FULL STACK DEVELOPMENT LAB", subjectCode: "R22A0589", faculty: "A.R. LAVANYA / BALAJI", startTime: "13:50", endTime: "14:50" },
                6: { subjectName: "FULL STACK DEVELOPMENT LAB", subjectCode: "R22A0589", faculty: "A.R. LAVANYA / BALAJI", startTime: "14:50", endTime: "15:50" }
            },
            "Tuesday": {
                1: { subjectName: "BLOCKCHAIN TECHNOLOGY", subjectCode: "R22A0527", faculty: "CH. SRIVALLI", startTime: "09:30", endTime: "10:20" },
                2: { subjectName: "FULL STACK DEVELOPMENT", subjectCode: "R22A0513", faculty: "A.R. LAVANYA", startTime: "10:20", endTime: "11:10" },
                3: { subjectName: "DATABASE SECURITY", subjectCode: "R22A6214", faculty: "B. SWAPNA LATHA", startTime: "11:20", endTime: "12:10" },
                4: { subjectName: "CLOUD COMPUTING", subjectCode: "R22A0522", faculty: "A. SUPRIYA", startTime: "12:50", endTime: "13:50" },
                5: { subjectName: "DEEP LEARNING", subjectCode: "R22A6605", faculty: "D. SOWJANYA", startTime: "13:50", endTime: "14:50" },
                6: { subjectName: "DATABASE SECURITY", subjectCode: "R22A6214", faculty: "B. SWAPNA LATHA", startTime: "14:50", endTime: "15:50" }
            },
            "Wednesday": {
                1: { subjectName: "FULL STACK DEVELOPMENT", subjectCode: "R22A0513", faculty: "A.R. LAVANYA", startTime: "09:30", endTime: "10:20" },
                2: { subjectName: "BLOCKCHAIN TECHNOLOGY", subjectCode: "R22A0527", faculty: "CH. SRIVALLI", startTime: "10:20", endTime: "11:10" },
                3: { subjectName: "CLOUD COMPUTING", subjectCode: "R22A0522", faculty: "A. SUPRIYA", startTime: "11:20", endTime: "12:10" },
                4: { subjectName: "DATABASE SECURITY", subjectCode: "R22A6214", faculty: "B. SWAPNA LATHA", startTime: "12:50", endTime: "13:50" },
                5: { subjectName: "CLOUD COMPUTING", subjectCode: "R22A0522", faculty: "A. SUPRIYA", startTime: "13:50", endTime: "14:50" },
                6: { subjectName: "DEEP LEARNING", subjectCode: "R22A6605", faculty: "D. SOWJANYA", startTime: "14:50", endTime: "15:50" }
            },
            "Thursday": {
                1: { subjectName: "DATABASE SECURITY", subjectCode: "R22A6214", faculty: "B. SWAPNA LATHA", startTime: "09:30", endTime: "10:20" },
                2: { subjectName: "CLOUD COMPUTING", subjectCode: "R22A0522", faculty: "A. SUPRIYA", startTime: "10:20", endTime: "11:10" },
                3: { subjectName: "BLOCKCHAIN TECHNOLOGY", subjectCode: "R22A0527", faculty: "CH. SRIVALLI", startTime: "11:20", endTime: "12:10" },
                4: { subjectName: "DEEP LEARNING", subjectCode: "R22A6605", faculty: "D. SOWJANYA", startTime: "12:50", endTime: "13:50" },
                5: { subjectName: "FULL STACK DEVELOPMENT", subjectCode: "R22A0513", faculty: "A.R. LAVANYA", startTime: "13:50", endTime: "14:50" },
                6: { subjectName: "TUTORIAL", subjectCode: "TUTORIAL", faculty: "FACULTY", startTime: "14:50", endTime: "15:50" }
            },
            "Friday": {
                1: { subjectName: "BLOCKCHAIN TECHNOLOGY", subjectCode: "R22A0527", faculty: "CH. SRIVALLI", startTime: "09:30", endTime: "10:20" },
                2: { subjectName: "FULL STACK DEVELOPMENT", subjectCode: "R22A0513", faculty: "A.R. LAVANYA", startTime: "10:20", endTime: "11:10" },
                3: { subjectName: "DEEP LEARNING", subjectCode: "R22A6605", faculty: "D. SOWJANYA", startTime: "11:20", endTime: "12:10" },
                4: { subjectName: "DATABASE SECURITY", subjectCode: "R22A6214", faculty: "B. SWAPNA LATHA", startTime: "12:50", endTime: "13:50" },
                5: { subjectName: "FULL STACK DEVELOPMENT", subjectCode: "R22A0513", faculty: "A.R. LAVANYA", startTime: "13:50", endTime: "14:50" },
                6: { subjectName: "CLOUD COMPUTING", subjectCode: "R22A0522", faculty: "A. SUPRIYA", startTime: "14:50", endTime: "15:50" }
            },
            "Saturday": {
                1: { subjectName: "DATABASE SECURITY", subjectCode: "R22A6214", faculty: "B. SWAPNA LATHA", startTime: "09:30", endTime: "10:20" },
                2: { subjectName: "BLOCKCHAIN TECHNOLOGY", subjectCode: "R22A0527", faculty: "CH. SRIVALLI", startTime: "10:20", endTime: "11:10" },
                3: { subjectName: "DEEP LEARNING", subjectCode: "R22A6605", faculty: "D. SOWJANYA", startTime: "11:20", endTime: "12:10" },
                4: { subjectName: "CLOUD COMPUTING", subjectCode: "R22A0522", faculty: "A. SUPRIYA", startTime: "12:50", endTime: "13:50" },
                5: { subjectName: "FULL STACK DEVELOPMENT", subjectCode: "R22A0513", faculty: "A.R. LAVANYA", startTime: "13:50", endTime: "14:50" },
                6: { subjectName: "TUTORIAL", subjectCode: "TUTORIAL", faculty: "FACULTY", startTime: "14:50", endTime: "15:50" }
            }
        }
    },

    // ==========================================
    // SECTION B : CSE(DS)-B
    // ==========================================
    "IV_B": {
        classId: "IV_B",
        className: "IV BTECH CSE(DS)-B",
        classIncharge: "CH SRIVALLI - 7993355514",
        mentors: ["CH. SRIVALLI (7993355514)", "U MUKUL KUMAR (7799118580)"],
        schedule: {
            "Monday": {
                1: { subjectName: "BLOCKCHAIN TECHNOLOGY", subjectCode: "R22A0527", faculty: "CH SRIVALLI", startTime: "09:30", endTime: "10:20" },
                2: { subjectName: "FULL STACK DEVELOPMENT", subjectCode: "R22A0513", faculty: "A.R. LAVANYA", startTime: "10:20", endTime: "11:10" },
                3: { subjectName: "DEEP LEARNING", subjectCode: "R22A6605", faculty: "D SOWJANYA", startTime: "11:20", endTime: "12:10" },
                4: { subjectName: "CLOUD COMPUTING", subjectCode: "R22A0522", faculty: "R GURUNADAM", startTime: "12:50", endTime: "13:50" },
                5: { subjectName: "DEEP LEARNING", subjectCode: "R22A6605", faculty: "D SOWJANYA", startTime: "13:50", endTime: "14:50" },
                6: { subjectName: "DATABASE SECURITY", subjectCode: "R22A6214", faculty: "B SWAPNA LATHA", startTime: "14:50", endTime: "15:50" }
            },
            "Tuesday": {
                1: { subjectName: "FULL STACK DEVELOPMENT", subjectCode: "R22A0513", faculty: "A.R. LAVANYA", startTime: "09:30", endTime: "10:20" },
                2: { subjectName: "CLOUD COMPUTING", subjectCode: "R22A0522", faculty: "R GURUNADAM", startTime: "10:20", endTime: "11:10" },
                3: { subjectName: "BLOCKCHAIN TECHNOLOGY", subjectCode: "R22A0527", faculty: "CH SRIVALLI", startTime: "11:20", endTime: "12:10" },
                4: { subjectName: "FULL STACK DEVELOPMENT LAB", subjectCode: "R22A0589", faculty: "A.R. LAVANYA / BALAJI", startTime: "12:50", endTime: "13:50" },
                5: { subjectName: "FULL STACK DEVELOPMENT LAB", subjectCode: "R22A0589", faculty: "A.R. LAVANYA / BALAJI", startTime: "13:50", endTime: "14:50" },
                6: { subjectName: "FULL STACK DEVELOPMENT LAB", subjectCode: "R22A0589", faculty: "A.R. LAVANYA / BALAJI", startTime: "14:50", endTime: "15:50" }
            },
            "Wednesday": {
                1: { subjectName: "DATABASE SECURITY", subjectCode: "R22A6214", faculty: "B SWAPNA LATHA", startTime: "09:30", endTime: "10:20" },
                2: { subjectName: "DEEP LEARNING", subjectCode: "R22A6605", faculty: "D SOWJANYA", startTime: "10:20", endTime: "11:10" },
                3: { subjectName: "BLOCKCHAIN TECHNOLOGY", subjectCode: "R22A0527", faculty: "CH SRIVALLI", startTime: "11:20", endTime: "12:10" },
                4: { subjectName: "CLOUD COMPUTING", subjectCode: "R22A0522", faculty: "R GURUNADAM", startTime: "12:50", endTime: "13:50" },
                5: { subjectName: "FULL STACK DEVELOPMENT", subjectCode: "R22A0513", faculty: "A.R. LAVANYA", startTime: "13:50", endTime: "14:50" },
                6: { subjectName: "TUTORIAL", subjectCode: "TUTORIAL", faculty: "FACULTY", startTime: "14:50", endTime: "15:50" }
            },
            "Thursday": {
                1: { subjectName: "BLOCKCHAIN TECHNOLOGY", subjectCode: "R22A0527", faculty: "CH SRIVALLI", startTime: "09:30", endTime: "10:20" },
                2: { subjectName: "FULL STACK DEVELOPMENT", subjectCode: "R22A0513", faculty: "A.R. LAVANYA", startTime: "10:20", endTime: "11:10" },
                3: { subjectName: "DATABASE SECURITY", subjectCode: "R22A6214", faculty: "B SWAPNA LATHA", startTime: "11:20", endTime: "12:10" },
                4: { subjectName: "CLOUD COMPUTING", subjectCode: "R22A0522", faculty: "R GURUNADAM", startTime: "12:50", endTime: "13:50" },
                5: { subjectName: "DEEP LEARNING", subjectCode: "R22A6605", faculty: "D SOWJANYA", startTime: "13:50", endTime: "14:50" },
                6: { subjectName: "TUTORIAL", subjectCode: "TUTORIAL", faculty: "FACULTY", startTime: "14:50", endTime: "15:50" }
            },
            "Friday": {
                1: { subjectName: "CLOUD COMPUTING", subjectCode: "R22A0522", faculty: "R GURUNADAM", startTime: "09:30", endTime: "10:20" },
                2: { subjectName: "BLOCKCHAIN TECHNOLOGY", subjectCode: "R22A0527", faculty: "CH SRIVALLI", startTime: "10:20", endTime: "11:10" },
                3: { subjectName: "CLOUD COMPUTING", subjectCode: "R22A0522", faculty: "R GURUNADAM", startTime: "11:20", endTime: "12:10" },
                4: { subjectName: "FULL STACK DEVELOPMENT", subjectCode: "R22A0513", faculty: "A.R. LAVANYA", startTime: "12:50", endTime: "13:50" },
                5: { subjectName: "DATABASE SECURITY", subjectCode: "R22A6214", faculty: "B SWAPNA LATHA", startTime: "13:50", endTime: "14:50" },
                6: { subjectName: "DEEP LEARNING", subjectCode: "R22A6605", faculty: "D SOWJANYA", startTime: "14:50", endTime: "15:50" }
            },
            "Saturday": {
                1: { subjectName: "BLOCKCHAIN TECHNOLOGY", subjectCode: "R22A0527", faculty: "CH SRIVALLI", startTime: "09:30", endTime: "10:20" },
                2: { subjectName: "FULL STACK DEVELOPMENT", subjectCode: "R22A0513", faculty: "A.R. LAVANYA", startTime: "10:20", endTime: "11:10" },
                3: { subjectName: "DATABASE SECURITY", subjectCode: "R22A6214", faculty: "B SWAPNA LATHA", startTime: "11:20", endTime: "12:10" },
                4: { subjectName: "CLOUD COMPUTING", subjectCode: "R22A0522", faculty: "R GURUNADAM", startTime: "12:50", endTime: "13:50" },
                5: { subjectName: "DEEP LEARNING", subjectCode: "R22A6605", faculty: "D SOWJANYA", startTime: "13:50", endTime: "14:50" },
                6: { subjectName: "DATABASE SECURITY", subjectCode: "R22A6214", faculty: "B SWAPNA LATHA", startTime: "14:50", endTime: "15:50" }
            }
        }
    },

    // ==========================================
    // SECTION C : CSE(DS)-C
    // ==========================================
    "IV_C": {
        classId: "IV_C",
        className: "IV BTECH CSE(DS)-C",
        classIncharge: "D SOWJANYA - 9581702907",
        mentors: ["D SOWJANYA (9581702907)", "R GURUNADAM (8247878349)"],
        schedule: {
            "Monday": {
                1: { subjectName: "DEEP LEARNING", subjectCode: "R22A6605", faculty: "D SOWJANYA", startTime: "09:30", endTime: "10:20" },
                2: { subjectName: "BLOCKCHAIN TECHNOLOGY", subjectCode: "R22A0527", faculty: "E SOWJANYA", startTime: "10:20", endTime: "11:10" },
                3: { subjectName: "DATABASE SECURITY", subjectCode: "R22A6214", faculty: "B SWAPNA LATHA", startTime: "11:20", endTime: "12:10" },
                4: { subjectName: "FULL STACK DEVELOPMENT LAB", subjectCode: "R22A0589", faculty: "K MAHESH BABU / BALAJI", startTime: "12:50", endTime: "13:50" },
                5: { subjectName: "FULL STACK DEVELOPMENT LAB", subjectCode: "R22A0589", faculty: "K MAHESH BABU / BALAJI", startTime: "13:50", endTime: "14:50" },
                6: { subjectName: "FULL STACK DEVELOPMENT LAB", subjectCode: "R22A0589", faculty: "K MAHESH BABU / BALAJI", startTime: "14:50", endTime: "15:50" }
            },
            "Tuesday": {
                1: { subjectName: "BLOCKCHAIN TECHNOLOGY", subjectCode: "R22A0527", faculty: "E SOWJANYA", startTime: "09:30", endTime: "10:20" },
                2: { subjectName: "DATABASE SECURITY", subjectCode: "R22A6214", faculty: "B SWAPNA LATHA", startTime: "10:20", endTime: "11:10" },
                3: { subjectName: "CLOUD COMPUTING", subjectCode: "R22A0522", faculty: "R GURUNADAM", startTime: "11:20", endTime: "12:10" },
                4: { subjectName: "FULL STACK DEVELOPMENT", subjectCode: "R22A0513", faculty: "K MAHESH BABU", startTime: "12:50", endTime: "13:50" },
                5: { subjectName: "CLOUD COMPUTING", subjectCode: "R22A0522", faculty: "R GURUNADAM", startTime: "13:50", endTime: "14:50" },
                6: { subjectName: "DEEP LEARNING", subjectCode: "R22A6605", faculty: "D SOWJANYA", startTime: "14:50", endTime: "15:50" }
            },
            "Wednesday": {
                1: { subjectName: "BLOCKCHAIN TECHNOLOGY", subjectCode: "R22A0527", faculty: "E SOWJANYA", startTime: "09:30", endTime: "10:20" },
                2: { subjectName: "CLOUD COMPUTING", subjectCode: "R22A0522", faculty: "R GURUNADAM", startTime: "10:20", endTime: "11:10" },
                3: { subjectName: "DEEP LEARNING", subjectCode: "R22A6605", faculty: "D SOWJANYA", startTime: "11:20", endTime: "12:10" },
                4: { subjectName: "FULL STACK DEVELOPMENT", subjectCode: "R22A0513", faculty: "K MAHESH BABU", startTime: "12:50", endTime: "13:50" },
                5: { subjectName: "DEEP LEARNING", subjectCode: "R22A6605", faculty: "D SOWJANYA", startTime: "13:50", endTime: "14:50" },
                6: { subjectName: "DATABASE SECURITY", subjectCode: "R22A6214", faculty: "B SWAPNA LATHA", startTime: "14:50", endTime: "15:50" }
            },
            "Thursday": {
                1: { subjectName: "FULL STACK DEVELOPMENT", subjectCode: "R22A0513", faculty: "K MAHESH BABU", startTime: "09:30", endTime: "10:20" },
                2: { subjectName: "DEEP LEARNING", subjectCode: "R22A6605", faculty: "D SOWJANYA", startTime: "10:20", endTime: "11:10" },
                3: { subjectName: "CLOUD COMPUTING", subjectCode: "R22A0522", faculty: "R GURUNADAM", startTime: "11:20", endTime: "12:10" },
                4: { subjectName: "DATABASE SECURITY", subjectCode: "R22A6214", faculty: "B SWAPNA LATHA", startTime: "12:50", endTime: "13:50" },
                5: { subjectName: "FULL STACK DEVELOPMENT", subjectCode: "R22A0513", faculty: "K MAHESH BABU", startTime: "13:50", endTime: "14:50" },
                6: { subjectName: "BLOCKCHAIN TECHNOLOGY", subjectCode: "R22A0527", faculty: "E SOWJANYA", startTime: "14:50", endTime: "15:50" }
            },
            "Friday": {
                1: { subjectName: "CLOUD COMPUTING", subjectCode: "R22A0522", faculty: "R GURUNADAM", startTime: "09:30", endTime: "10:20" },
                2: { subjectName: "DATABASE SECURITY", subjectCode: "R22A6214", faculty: "B SWAPNA LATHA", startTime: "10:20", endTime: "11:10" },
                3: { subjectName: "FULL STACK DEVELOPMENT", subjectCode: "R22A0513", faculty: "K MAHESH BABU", startTime: "11:20", endTime: "12:10" },
                4: { subjectName: "DEEP LEARNING", subjectCode: "R22A6605", faculty: "D SOWJANYA", startTime: "12:50", endTime: "13:50" },
                5: { subjectName: "BLOCKCHAIN TECHNOLOGY", subjectCode: "R22A0527", faculty: "E SOWJANYA", startTime: "13:50", endTime: "14:50" },
                6: { subjectName: "TUTORIAL", subjectCode: "TUTORIAL", faculty: "FACULTY", startTime: "14:50", endTime: "15:50" }
            },
            "Saturday": {
                1: { subjectName: "DEEP LEARNING", subjectCode: "R22A6605", faculty: "D SOWJANYA", startTime: "09:30", endTime: "10:20" },
                2: { subjectName: "FULL STACK DEVELOPMENT", subjectCode: "R22A0513", faculty: "K MAHESH BABU", startTime: "10:20", endTime: "11:10" },
                3: { subjectName: "BLOCKCHAIN TECHNOLOGY", subjectCode: "R22A0527", faculty: "E SOWJANYA", startTime: "11:20", endTime: "12:10" },
                4: { subjectName: "DATABASE SECURITY", subjectCode: "R22A6214", faculty: "B SWAPNA LATHA", startTime: "12:50", endTime: "13:50" },
                5: { subjectName: "CLOUD COMPUTING", subjectCode: "R22A0522", faculty: "R GURUNADAM", startTime: "13:50", endTime: "14:50" },
                6: { subjectName: "TUTORIAL", subjectCode: "TUTORIAL", faculty: "FACULTY", startTime: "14:50", endTime: "15:50" }
            }
        }
    },

    // ==========================================
    // SECTION D : CSE(DS)-D
    // ==========================================
    "IV_D": {
        classId: "IV_D",
        className: "IV BTECH CSE(DS)-D",
        classIncharge: "A SUSHMITA - 9030995622",
        mentors: ["A SUSHMITA (9030995622)", "A.R. LAVANYA (9912924476)"],
        schedule: {
            "Monday": {
                1: { subjectName: "FULL STACK DEVELOPMENT", subjectCode: "R22A0513", faculty: "K MAHESH BABU", startTime: "09:30", endTime: "10:20" },
                2: { subjectName: "BLOCKCHAIN TECHNOLOGY", subjectCode: "R22A0527", faculty: "CH SRIVALLI", startTime: "10:20", endTime: "11:10" },
                3: { subjectName: "CLOUD COMPUTING", subjectCode: "R22A0522", faculty: "A SUPRIYA", startTime: "11:20", endTime: "12:10" },
                4: { subjectName: "DATABASE SECURITY", subjectCode: "R22A6214", faculty: "K.BALAJI", startTime: "12:50", endTime: "13:50" },
                5: { subjectName: "DEEP LEARNING", subjectCode: "R22A6605", faculty: "T SIVA RATNA SAI", startTime: "13:50", endTime: "14:50" },
                6: { subjectName: "CLOUD COMPUTING", subjectCode: "R22A0522", faculty: "A SUPRIYA", startTime: "14:50", endTime: "15:50" }
            },
            "Tuesday": {
                1: { subjectName: "FULL STACK DEVELOPMENT", subjectCode: "R22A0513", faculty: "K MAHESH BABU", startTime: "09:30", endTime: "10:20" },
                2: { subjectName: "BLOCKCHAIN TECHNOLOGY", subjectCode: "R22A0527", faculty: "CH SRIVALLI", startTime: "10:20", endTime: "11:10" },
                3: { subjectName: "DEEP LEARNING", subjectCode: "R22A6605", faculty: "T SIVA RATNA SAI", startTime: "11:20", endTime: "12:10" },
                4: { subjectName: "DATABASE SECURITY", subjectCode: "R22A6214", faculty: "K.BALAJI", startTime: "12:50", endTime: "13:50" },
                5: { subjectName: "CLOUD COMPUTING", subjectCode: "R22A0522", faculty: "A SUPRIYA", startTime: "13:50", endTime: "14:50" },
                6: { subjectName: "TUTORIAL", subjectCode: "TUTORIAL", faculty: "FACULTY", startTime: "14:50", endTime: "15:50" }
            },
            "Wednesday": {
                1: { subjectName: "BLOCKCHAIN TECHNOLOGY", subjectCode: "R22A0527", faculty: "CH SRIVALLI", startTime: "09:30", endTime: "10:20" },
                2: { subjectName: "DATABASE SECURITY", subjectCode: "R22A6214", faculty: "K.BALAJI", startTime: "10:20", endTime: "11:10" },
                3: { subjectName: "FULL STACK DEVELOPMENT", subjectCode: "R22A0513", faculty: "K MAHESH BABU", startTime: "11:20", endTime: "12:10" },
                4: { subjectName: "DATABASE SECURITY", subjectCode: "R22A6214", faculty: "K.BALAJI", startTime: "12:50", endTime: "13:50" },
                5: { subjectName: "DEEP LEARNING", subjectCode: "R22A6605", faculty: "T SIVA RATNA SAI", startTime: "13:50", endTime: "14:50" },
                6: { subjectName: "CLOUD COMPUTING", subjectCode: "R22A0522", faculty: "A SUPRIYA", startTime: "14:50", endTime: "15:50" }
            },
            "Thursday": {
                1: { subjectName: "CLOUD COMPUTING", subjectCode: "R22A0522", faculty: "A SUPRIYA", startTime: "09:30", endTime: "10:20" },
                2: { subjectName: "BLOCKCHAIN TECHNOLOGY", subjectCode: "R22A0527", faculty: "CH SRIVALLI", startTime: "10:20", endTime: "11:10" },
                3: { subjectName: "DEEP LEARNING", subjectCode: "R22A6605", faculty: "T SIVA RATNA SAI", startTime: "11:20", endTime: "12:10" },
                4: { subjectName: "FULL STACK DEVELOPMENT LAB", subjectCode: "R22A0589", faculty: "K MAHESH BABU / BALAJI", startTime: "12:50", endTime: "13:50" },
                5: { subjectName: "FULL STACK DEVELOPMENT LAB", subjectCode: "R22A0589", faculty: "K MAHESH BABU / BALAJI", startTime: "13:50", endTime: "14:50" },
                6: { subjectName: "FULL STACK DEVELOPMENT LAB", subjectCode: "R22A0589", faculty: "K MAHESH BABU / BALAJI", startTime: "14:50", endTime: "15:50" }
            },
            "Friday": {
                1: { subjectName: "FULL STACK DEVELOPMENT", subjectCode: "R22A0513", faculty: "K MAHESH BABU", startTime: "09:30", endTime: "10:20" },
                2: { subjectName: "CLOUD COMPUTING", subjectCode: "R22A0522", faculty: "A SUPRIYA", startTime: "10:20", endTime: "11:10" },
                3: { subjectName: "BLOCKCHAIN TECHNOLOGY", subjectCode: "R22A0527", faculty: "CH SRIVALLI", startTime: "11:20", endTime: "12:10" },
                4: { subjectName: "FULL STACK DEVELOPMENT", subjectCode: "R22A0513", faculty: "K MAHESH BABU", startTime: "12:50", endTime: "13:50" },
                5: { subjectName: "DEEP LEARNING", subjectCode: "R22A6605", faculty: "T SIVA RATNA SAI", startTime: "13:50", endTime: "14:50" },
                6: { subjectName: "DATABASE SECURITY", subjectCode: "R22A6214", faculty: "K.BALAJI", startTime: "14:50", endTime: "15:50" }
            },
            "Saturday": {
                1: { subjectName: "CLOUD COMPUTING", subjectCode: "R22A0522", faculty: "A SUPRIYA", startTime: "09:30", endTime: "10:20" },
                2: { subjectName: "DEEP LEARNING", subjectCode: "R22A6605", faculty: "T SIVA RATNA SAI", startTime: "10:20", endTime: "11:10" },
                3: { subjectName: "BLOCKCHAIN TECHNOLOGY", subjectCode: "R22A0527", faculty: "CH SRIVALLI", startTime: "11:20", endTime: "12:10" },
                4: { subjectName: "FULL STACK DEVELOPMENT", subjectCode: "R22A0513", faculty: "K MAHESH BABU", startTime: "12:50", endTime: "13:50" },
                5: { subjectName: "DATABASE SECURITY", subjectCode: "R22A6214", faculty: "K.BALAJI", startTime: "13:50", endTime: "14:50" },
                6: { subjectName: "TUTORIAL", subjectCode: "TUTORIAL", faculty: "FACULTY", startTime: "14:50", endTime: "15:50" }
            }
        }
    },

    // =========================================================================
    // III BTECH - I SEMESTER OFFICIAL TIMETABLES (2026-2027)
    // =========================================================================

    // ==========================================
    // SECTION A : CSE(DS)-A (III Year)
    // ==========================================
    "III_A": {
        classId: "III_A",
        className: "III BTECH CSE(DS)-A",
        classIncharge: "S THIRUPATHI - 9502288723",
        mentors: ["S THIRUPATHI (9502288723)", "U MUKUL KUMAR (7799118580)"],
        schedule: {
            "Monday": {
                1: { subjectName: "ARTIFICIAL INTELLIGENCE LAB", subjectCode: "R245A0588", faculty: "P.SUJITHA / S.THIRUPATHI", startTime: "09:30", endTime: "10:20" },
                2: { subjectName: "ARTIFICIAL INTELLIGENCE LAB", subjectCode: "R245A0588", faculty: "P.SUJITHA / S.THIRUPATHI", startTime: "10:20", endTime: "11:10" },
                3: { subjectName: "ARTIFICIAL INTELLIGENCE LAB", subjectCode: "R245A0588", faculty: "P.SUJITHA / S.THIRUPATHI", startTime: "11:20", endTime: "12:10" },
                4: { subjectName: "ROBOTICS AND AUTOMATION", subjectCode: "R245A0351", faculty: "K.CHAITHANYA", startTime: "12:50", endTime: "13:50" },
                5: { subjectName: "DESIGN AND ANALYSIS OF ALGORITHMS", subjectCode: "R245A0506", faculty: "Y.RAJINI", startTime: "13:50", endTime: "14:50" },
                6: { subjectName: "DATA WAREHOUSING AND DATA MINING", subjectCode: "R245A1206", faculty: "S.THIRUPATHI", startTime: "14:50", endTime: "15:50" }
            },
            "Tuesday": {
                1: { subjectName: "DATA WAREHOUSING AND DATA MINING", subjectCode: "R245A1206", faculty: "S.THIRUPATHI", startTime: "09:30", endTime: "10:20" },
                2: { subjectName: "ARTIFICIAL INTELLIGENCE", subjectCode: "R245A0513", faculty: "P.SUJITHA", startTime: "10:20", endTime: "11:10" },
                3: { subjectName: "INTELLECTUAL PROPERTY RIGHTS", subjectCode: "R245A2151", faculty: "K.LAVANYA", startTime: "11:20", endTime: "12:10" },
                4: { subjectName: "INTRODUCTION TO DATA SCIENCE", subjectCode: "R245A6707", faculty: "T.RAVALI", startTime: "12:50", endTime: "13:50" },
                5: { subjectName: "DESIGN AND ANALYSIS OF ALGORITHMS", subjectCode: "R245A0506", faculty: "Y.RAJINI", startTime: "13:50", endTime: "14:50" },
                6: { subjectName: "DATA WAREHOUSING AND DATA MINING", subjectCode: "R245A1206", faculty: "S.THIRUPATHI", startTime: "14:50", endTime: "15:50" }
            },
            "Wednesday": {
                1: { subjectName: "DATA WAREHOUSING AND DATA MINING LAB", subjectCode: "R245A0590", faculty: "S.THIRUPATHI / Y.RAJINI", startTime: "09:30", endTime: "10:20" },
                2: { subjectName: "DATA WAREHOUSING AND DATA MINING LAB", subjectCode: "R245A0590", faculty: "S.THIRUPATHI / Y.RAJINI", startTime: "10:20", endTime: "11:10" },
                3: { subjectName: "DATA WAREHOUSING AND DATA MINING LAB", subjectCode: "R245A0590", faculty: "S.THIRUPATHI / Y.RAJINI", startTime: "11:20", endTime: "12:10" },
                4: { subjectName: "INTRODUCTION TO DATA SCIENCE", subjectCode: "R245A6707", faculty: "T.RAVALI", startTime: "12:50", endTime: "13:50" },
                5: { subjectName: "DESIGN AND ANALYSIS OF ALGORITHMS", subjectCode: "R245A0506", faculty: "Y.RAJINI", startTime: "13:50", endTime: "14:50" },
                6: { subjectName: "ROBOTICS AND AUTOMATION", subjectCode: "R245A0351", faculty: "K.CHAITHANYA", startTime: "14:50", endTime: "15:50" }
            },
            "Thursday": {
                1: { subjectName: "ARTIFICIAL INTELLIGENCE", subjectCode: "R245A0513", faculty: "P.SUJITHA", startTime: "09:30", endTime: "10:20" },
                2: { subjectName: "DESIGN AND ANALYSIS OF ALGORITHMS", subjectCode: "R245A0506", faculty: "Y.RAJINI", startTime: "10:20", endTime: "11:10" },
                3: { subjectName: "TUTORIAL", subjectCode: "TUTORIAL", faculty: "FACULTY", startTime: "11:20", endTime: "12:10" },
                4: { subjectName: "INTRODUCTION TO DATA SCIENCE", subjectCode: "R245A6707", faculty: "T.RAVALI", startTime: "12:50", endTime: "13:50" },
                5: { subjectName: "ROBOTICS AND AUTOMATION", subjectCode: "R245A0351", faculty: "K.CHAITHANYA", startTime: "13:50", endTime: "14:50" },
                6: { subjectName: "TEST", subjectCode: "TEST", faculty: "FACULTY", startTime: "14:50", endTime: "15:50" }
            },
            "Friday": {
                1: { subjectName: "INTRODUCTION TO DATA SCIENCE", subjectCode: "R245A6707", faculty: "T.RAVALI", startTime: "09:30", endTime: "10:20" },
                2: { subjectName: "DATA WAREHOUSING AND DATA MINING", subjectCode: "R245A1206", faculty: "S.THIRUPATHI", startTime: "10:20", endTime: "11:10" },
                3: { subjectName: "DESIGN AND ANALYSIS OF ALGORITHMS", subjectCode: "R245A0506", faculty: "Y.RAJINI", startTime: "11:20", endTime: "12:10" },
                4: { subjectName: "INTELLECTUAL PROPERTY RIGHTS", subjectCode: "R245A2151", faculty: "K.LAVANYA", startTime: "12:50", endTime: "13:50" },
                5: { subjectName: "ARTIFICIAL INTELLIGENCE", subjectCode: "R245A0513", faculty: "P.SUJITHA", startTime: "13:50", endTime: "14:50" },
                6: { subjectName: "TUTORIAL", subjectCode: "TUTORIAL", faculty: "FACULTY", startTime: "14:50", endTime: "15:50" }
            },
            "Saturday": {
                1: { subjectName: "ROBOTICS AND AUTOMATION", subjectCode: "R245A0351", faculty: "K.CHAITHANYA", startTime: "09:30", endTime: "10:20" },
                2: { subjectName: "DATA WAREHOUSING AND DATA MINING", subjectCode: "R245A1206", faculty: "S.THIRUPATHI", startTime: "10:20", endTime: "11:10" },
                3: { subjectName: "ARTIFICIAL INTELLIGENCE", subjectCode: "R245A0513", faculty: "P.SUJITHA", startTime: "11:20", endTime: "12:10" },
                4: { subjectName: "PROFESSIONAL DEVELOPMENT LAB", subjectCode: "R245A6684", faculty: "E.KAVYA", startTime: "12:50", endTime: "13:50" },
                5: { subjectName: "PROFESSIONAL DEVELOPMENT LAB", subjectCode: "R245A6684", faculty: "E.KAVYA", startTime: "13:50", endTime: "14:50" },
                6: { subjectName: "PROFESSIONAL DEVELOPMENT LAB", subjectCode: "R245A6684", faculty: "E.KAVYA", startTime: "14:50", endTime: "15:50" }
            }
        }
    },

    // ==========================================
    // SECTION B : CSE(DS)-B (III Year)
    // ==========================================
    "III_B": {
        classId: "III_B",
        className: "III BTECH CSE(DS)-B",
        classIncharge: "CH. SREE VIDYA - 9989288050",
        mentors: ["CH. SREE VIDYA (9989288050)", "P.SUJITHA (9871848155)"],
        schedule: {
            "Monday": {
                1: { subjectName: "DATA WAREHOUSING AND DATA MINING LAB", subjectCode: "R245A0590", faculty: "CH.SREE VIDYA / E.KAVYA", startTime: "09:30", endTime: "10:20" },
                2: { subjectName: "DATA WAREHOUSING AND DATA MINING LAB", subjectCode: "R245A0590", faculty: "CH.SREE VIDYA / E.KAVYA", startTime: "10:20", endTime: "11:10" },
                3: { subjectName: "DATA WAREHOUSING AND DATA MINING LAB", subjectCode: "R245A0590", faculty: "CH.SREE VIDYA / E.KAVYA", startTime: "11:20", endTime: "12:10" },
                4: { subjectName: "INTRODUCTION TO DATA SCIENCE", subjectCode: "R245A6707", faculty: "T.RAVALI", startTime: "12:50", endTime: "13:50" },
                5: { subjectName: "ARTIFICIAL INTELLIGENCE", subjectCode: "R245A0513", faculty: "A.SUSHMITHA", startTime: "13:50", endTime: "14:50" },
                6: { subjectName: "DESIGN AND ANALYSIS OF ALGORITHMS", subjectCode: "R245A0506", faculty: "Y.RAJINI", startTime: "14:50", endTime: "15:50" }
            },
            "Tuesday": {
                1: { subjectName: "DATA WAREHOUSING AND DATA MINING", subjectCode: "R245A1206", faculty: "CH.SREE VIDYA", startTime: "09:30", endTime: "10:20" },
                2: { subjectName: "ARTIFICIAL INTELLIGENCE", subjectCode: "R245A0513", faculty: "A.SUSHMITHA", startTime: "10:20", endTime: "11:10" },
                3: { subjectName: "ROBOTICS AND AUTOMATION", subjectCode: "R245A0351", faculty: "D.KAVITHA", startTime: "11:20", endTime: "12:10" },
                4: { subjectName: "DESIGN AND ANALYSIS OF ALGORITHMS", subjectCode: "R245A0506", faculty: "Y.RAJINI", startTime: "12:50", endTime: "13:50" },
                5: { subjectName: "INTRODUCTION TO DATA SCIENCE", subjectCode: "R245A6707", faculty: "T.RAVALI", startTime: "13:50", endTime: "14:50" },
                6: { subjectName: "TUTORIAL", subjectCode: "TUTORIAL", faculty: "FACULTY", startTime: "14:50", endTime: "15:50" }
            },
            "Wednesday": {
                1: { subjectName: "ARTIFICIAL INTELLIGENCE", subjectCode: "R245A0513", faculty: "A.SUSHMITHA", startTime: "09:30", endTime: "10:20" },
                2: { subjectName: "ROBOTICS AND AUTOMATION", subjectCode: "R245A0351", faculty: "D.KAVITHA", startTime: "10:20", endTime: "11:10" },
                3: { subjectName: "DATA WAREHOUSING AND DATA MINING", subjectCode: "R245A1206", faculty: "CH.SREE VIDYA", startTime: "11:20", endTime: "12:10" },
                4: { subjectName: "DESIGN AND ANALYSIS OF ALGORITHMS", subjectCode: "R245A0506", faculty: "Y.RAJINI", startTime: "12:50", endTime: "13:50" },
                5: { subjectName: "TEST", subjectCode: "TEST", faculty: "FACULTY", startTime: "13:50", endTime: "14:50" },
                6: { subjectName: "TUTORIAL", subjectCode: "TUTORIAL", faculty: "FACULTY", startTime: "14:50", endTime: "15:50" }
            },
            "Thursday": {
                1: { subjectName: "ARTIFICIAL INTELLIGENCE LAB", subjectCode: "R245A0588", faculty: "A.SUSHMITHA / CH.SREE VIDYA", startTime: "09:30", endTime: "10:20" },
                2: { subjectName: "ARTIFICIAL INTELLIGENCE LAB", subjectCode: "R245A0588", faculty: "A.SUSHMITHA / CH.SREE VIDYA", startTime: "10:20", endTime: "11:10" },
                3: { subjectName: "ARTIFICIAL INTELLIGENCE LAB", subjectCode: "R245A0588", faculty: "A.SUSHMITHA / CH.SREE VIDYA", startTime: "11:20", endTime: "12:10" },
                4: { subjectName: "DATA WAREHOUSING AND DATA MINING", subjectCode: "R245A1206", faculty: "CH.SREE VIDYA", startTime: "12:50", endTime: "13:50" },
                5: { subjectName: "INTELLECTUAL PROPERTY RIGHTS", subjectCode: "R245A2151", faculty: "K.LAVANYA", startTime: "13:50", endTime: "14:50" },
                6: { subjectName: "DESIGN AND ANALYSIS OF ALGORITHMS", subjectCode: "R245A0506", faculty: "Y.RAJINI", startTime: "14:50", endTime: "15:50" }
            },
            "Friday": {
                1: { subjectName: "ROBOTICS AND AUTOMATION", subjectCode: "R245A0351", faculty: "D.KAVITHA", startTime: "09:30", endTime: "10:20" },
                2: { subjectName: "DATA WAREHOUSING AND DATA MINING", subjectCode: "R245A1206", faculty: "CH.SREE VIDYA", startTime: "10:20", endTime: "11:10" },
                3: { subjectName: "INTRODUCTION TO DATA SCIENCE", subjectCode: "R245A6707", faculty: "T.RAVALI", startTime: "11:20", endTime: "12:10" },
                4: { subjectName: "PROFESSIONAL DEVELOPMENT LAB", subjectCode: "R245A6684", faculty: "E.KAVYA", startTime: "12:50", endTime: "13:50" },
                5: { subjectName: "PROFESSIONAL DEVELOPMENT LAB", subjectCode: "R245A6684", faculty: "E.KAVYA", startTime: "13:50", endTime: "14:50" },
                6: { subjectName: "PROFESSIONAL DEVELOPMENT LAB", subjectCode: "R245A6684", faculty: "E.KAVYA", startTime: "14:50", endTime: "15:50" }
            },
            "Saturday": {
                1: { subjectName: "DATA WAREHOUSING AND DATA MINING", subjectCode: "R245A1206", faculty: "CH.SREE VIDYA", startTime: "09:30", endTime: "10:20" },
                2: { subjectName: "DESIGN AND ANALYSIS OF ALGORITHMS", subjectCode: "R245A0506", faculty: "Y.RAJINI", startTime: "10:20", endTime: "11:10" },
                3: { subjectName: "ARTIFICIAL INTELLIGENCE", subjectCode: "R245A0513", faculty: "A.SUSHMITHA", startTime: "11:20", endTime: "12:10" },
                4: { subjectName: "INTRODUCTION TO DATA SCIENCE", subjectCode: "R245A6707", faculty: "T.RAVALI", startTime: "12:50", endTime: "13:50" },
                5: { subjectName: "ROBOTICS AND AUTOMATION", subjectCode: "R245A0351", faculty: "D.KAVITHA", startTime: "13:50", endTime: "14:50" },
                6: { subjectName: "INTELLECTUAL PROPERTY RIGHTS", subjectCode: "R245A2151", faculty: "K.LAVANYA", startTime: "14:50", endTime: "15:50" }
            }
        }
    },

    // ==========================================
    // SECTION C : CSE(DS)-C (III Year)
    // ==========================================
    "III_C": {
        classId: "III_C",
        className: "III BTECH CSE(DS)-C",
        classIncharge: "T. RAVALI - 8125475866",
        mentors: ["T. RAVALI (8125475866)", "P.SUJITHA (9871848155)"],
        schedule: {
            "Monday": {
                1: { subjectName: "ARTIFICIAL INTELLIGENCE LAB", subjectCode: "R245A0588", faculty: "A. SUSHMITHA / T.RAVALI", startTime: "09:30", endTime: "10:20" },
                2: { subjectName: "ARTIFICIAL INTELLIGENCE LAB", subjectCode: "R245A0588", faculty: "A. SUSHMITHA / T.RAVALI", startTime: "10:20", endTime: "11:10" },
                3: { subjectName: "ARTIFICIAL INTELLIGENCE LAB", subjectCode: "R245A0588", faculty: "A. SUSHMITHA / T.RAVALI", startTime: "11:20", endTime: "12:10" },
                4: { subjectName: "DATA WAREHOUSING AND DATA MINING", subjectCode: "R245A1206", faculty: "S. THIRUPATHI", startTime: "12:50", endTime: "13:50" },
                5: { subjectName: "DESIGN AND ANALYSIS OF ALGORITHMS", subjectCode: "R245A0506", faculty: "P. SUJITHA", startTime: "13:50", endTime: "14:50" },
                6: { subjectName: "ROBOTICS AND AUTOMATION", subjectCode: "R245A0351", faculty: "K CHAITHANYA", startTime: "14:50", endTime: "15:50" }
            },
            "Tuesday": {
                1: { subjectName: "INTRODUCTION TO DATA SCIENCE", subjectCode: "R245A6707", faculty: "T. RAVALI", startTime: "09:30", endTime: "10:20" },
                2: { subjectName: "ROBOTICS AND AUTOMATION", subjectCode: "R245A0351", faculty: "K CHAITHANYA", startTime: "10:20", endTime: "11:10" },
                3: { subjectName: "DESIGN AND ANALYSIS OF ALGORITHMS", subjectCode: "R245A0506", faculty: "P. SUJITHA", startTime: "11:20", endTime: "12:10" },
                4: { subjectName: "DATA WAREHOUSING AND DATA MINING", subjectCode: "R245A1206", faculty: "S. THIRUPATHI", startTime: "12:50", endTime: "13:50" },
                5: { subjectName: "ARTIFICIAL INTELLIGENCE", subjectCode: "R245A0513", faculty: "A. SUSHMITHA", startTime: "13:50", endTime: "14:50" },
                6: { subjectName: "TUTORIAL", subjectCode: "TUTORIAL", faculty: "FACULTY", startTime: "14:50", endTime: "15:50" }
            },
            "Wednesday": {
                1: { subjectName: "ROBOTICS AND AUTOMATION", subjectCode: "R245A0351", faculty: "K CHAITHANYA", startTime: "09:30", endTime: "10:20" },
                2: { subjectName: "ARTIFICIAL INTELLIGENCE", subjectCode: "R245A0513", faculty: "A. SUSHMITHA", startTime: "10:20", endTime: "11:10" },
                3: { subjectName: "DESIGN AND ANALYSIS OF ALGORITHMS", subjectCode: "R245A0506", faculty: "P. SUJITHA", startTime: "11:20", endTime: "12:10" },
                4: { subjectName: "DATA WAREHOUSING AND DATA MINING", subjectCode: "R245A1206", faculty: "S. THIRUPATHI", startTime: "12:50", endTime: "13:50" },
                5: { subjectName: "INTRODUCTION TO DATA SCIENCE", subjectCode: "R245A6707", faculty: "T. RAVALI", startTime: "13:50", endTime: "14:50" },
                6: { subjectName: "INTELLECTUAL PROPERTY RIGHTS", subjectCode: "R245A2151", faculty: "K.LAVANYA", startTime: "14:50", endTime: "15:50" }
            },
            "Thursday": {
                1: { subjectName: "INTRODUCTION TO DATA SCIENCE", subjectCode: "R245A6707", faculty: "T. RAVALI", startTime: "09:30", endTime: "10:20" },
                2: { subjectName: "DATA WAREHOUSING AND DATA MINING", subjectCode: "R245A1206", faculty: "S. THIRUPATHI", startTime: "10:20", endTime: "11:10" },
                3: { subjectName: "ARTIFICIAL INTELLIGENCE", subjectCode: "R245A0513", faculty: "A. SUSHMITHA", startTime: "11:20", endTime: "12:10" },
                4: { subjectName: "DATA WAREHOUSING AND DATA MINING LAB", subjectCode: "R245A0590", faculty: "S. THIRUPATHI / BALAJI", startTime: "12:50", endTime: "13:50" },
                5: { subjectName: "DATA WAREHOUSING AND DATA MINING LAB", subjectCode: "R245A0590", faculty: "S. THIRUPATHI / BALAJI", startTime: "13:50", endTime: "14:50" },
                6: { subjectName: "DATA WAREHOUSING AND DATA MINING LAB", subjectCode: "R245A0590", faculty: "S. THIRUPATHI / BALAJI", startTime: "14:50", endTime: "15:50" }
            },
            "Friday": {
                1: { subjectName: "DATA WAREHOUSING AND DATA MINING", subjectCode: "R245A1206", faculty: "S. THIRUPATHI", startTime: "09:30", endTime: "10:20" },
                2: { subjectName: "DESIGN AND ANALYSIS OF ALGORITHMS", subjectCode: "R245A0506", faculty: "P. SUJITHA", startTime: "10:20", endTime: "11:10" },
                3: { subjectName: "INTELLECTUAL PROPERTY RIGHTS", subjectCode: "R245A2151", faculty: "K.LAVANYA", startTime: "11:20", endTime: "12:10" },
                4: { subjectName: "ARTIFICIAL INTELLIGENCE", subjectCode: "R245A0513", faculty: "A. SUSHMITHA", startTime: "12:50", endTime: "13:50" },
                5: { subjectName: "INTRODUCTION TO DATA SCIENCE", subjectCode: "R245A6707", faculty: "T. RAVALI", startTime: "13:50", endTime: "14:50" },
                6: { subjectName: "TUTORIAL", subjectCode: "TUTORIAL", faculty: "FACULTY", startTime: "14:50", endTime: "15:50" }
            },
            "Saturday": {
                1: { subjectName: "PROFESSIONAL DEVELOPMENT LAB", subjectCode: "R245A6684", faculty: "U.KETHANA", startTime: "09:30", endTime: "10:20" },
                2: { subjectName: "PROFESSIONAL DEVELOPMENT LAB", subjectCode: "R245A6684", faculty: "U.KETHANA", startTime: "10:20", endTime: "11:10" },
                3: { subjectName: "PROFESSIONAL DEVELOPMENT LAB", subjectCode: "R245A6684", faculty: "U.KETHANA", startTime: "11:20", endTime: "12:10" },
                4: { subjectName: "DESIGN AND ANALYSIS OF ALGORITHMS", subjectCode: "R245A0506", faculty: "P. SUJITHA", startTime: "12:50", endTime: "13:50" },
                5: { subjectName: "TEST", subjectCode: "TEST", faculty: "FACULTY", startTime: "13:50", endTime: "14:50" },
                6: { subjectName: "ROBOTICS AND AUTOMATION", subjectCode: "R245A0351", faculty: "K CHAITHANYA", startTime: "14:50", endTime: "15:50" }
            }
        }
    },

    // ==========================================
    // SECTION D : CSE(DS)-D (III Year)
    // ==========================================
    "III_D": {
        classId: "III_D",
        className: "III BTECH CSE(DS)-D",
        classIncharge: "Y. RAJINI - 7569387953",
        mentors: ["Y. RAJINI (7569387953)", "K.BALAJI (9347664521)"],
        schedule: {
            "Monday": {
                1: { subjectName: "INTELLECTUAL PROPERTY RIGHTS", subjectCode: "R245A2151", faculty: "K.LAVANYA", startTime: "09:30", endTime: "10:20" },
                2: { subjectName: "DESIGN AND ANALYSIS OF ALGORITHMS", subjectCode: "R245A0506", faculty: "Y. RAJINI", startTime: "10:20", endTime: "11:10" },
                3: { subjectName: "ROBOTICS AND AUTOMATION", subjectCode: "R245A0351", faculty: "K CHAITHANYA", startTime: "11:20", endTime: "12:10" },
                4: { subjectName: "ARTIFICIAL INTELLIGENCE", subjectCode: "R245A0513", faculty: "P. SUJITHA", startTime: "12:50", endTime: "13:50" },
                5: { subjectName: "DATA WAREHOUSING AND DATA MINING", subjectCode: "R245A1206", faculty: "CH. SREE VIDYA", startTime: "13:50", endTime: "14:50" },
                6: { subjectName: "INTRODUCTION TO DATA SCIENCE", subjectCode: "R245A6707", faculty: "T. RAVALI", startTime: "14:50", endTime: "15:50" }
            },
            "Tuesday": {
                1: { subjectName: "DESIGN AND ANALYSIS OF ALGORITHMS", subjectCode: "R245A0506", faculty: "Y. RAJINI", startTime: "09:30", endTime: "10:20" },
                2: { subjectName: "INTRODUCTION TO DATA SCIENCE", subjectCode: "R245A6707", faculty: "T. RAVALI", startTime: "10:20", endTime: "11:10" },
                3: { subjectName: "ROBOTICS AND AUTOMATION", subjectCode: "R245A0351", faculty: "K CHAITHANYA", startTime: "11:20", endTime: "12:10" },
                4: { subjectName: "ARTIFICIAL INTELLIGENCE", subjectCode: "R245A0513", faculty: "P. SUJITHA", startTime: "12:50", endTime: "13:50" },
                5: { subjectName: "DATA WAREHOUSING AND DATA MINING", subjectCode: "R245A1206", faculty: "CH. SREE VIDYA", startTime: "13:50", endTime: "14:50" },
                6: { subjectName: "TUTORIAL", subjectCode: "TUTORIAL", faculty: "FACULTY", startTime: "14:50", endTime: "15:50" }
            },
            "Wednesday": {
                1: { subjectName: "ARTIFICIAL INTELLIGENCE", subjectCode: "R245A0513", faculty: "P. SUJITHA", startTime: "09:30", endTime: "10:20" },
                2: { subjectName: "ROBOTICS AND AUTOMATION", subjectCode: "R245A0351", faculty: "K CHAITHANYA", startTime: "10:20", endTime: "11:10" },
                3: { subjectName: "INTRODUCTION TO DATA SCIENCE", subjectCode: "R245A6707", faculty: "T. RAVALI", startTime: "11:20", endTime: "12:10" },
                4: { subjectName: "DATA WAREHOUSING AND DATA MINING LAB", subjectCode: "R245A0590", faculty: "CH. SREE VIDYA / K. AJITH", startTime: "12:50", endTime: "13:50" },
                5: { subjectName: "DATA WAREHOUSING AND DATA MINING LAB", subjectCode: "R245A0590", faculty: "CH. SREE VIDYA / K. AJITH", startTime: "13:50", endTime: "14:50" },
                6: { subjectName: "DATA WAREHOUSING AND DATA MINING LAB", subjectCode: "R245A0590", faculty: "CH. SREE VIDYA / K. AJITH", startTime: "14:50", endTime: "15:50" }
            },
            "Thursday": {
                1: { subjectName: "DESIGN AND ANALYSIS OF ALGORITHMS", subjectCode: "R245A0506", faculty: "Y. RAJINI", startTime: "09:30", endTime: "10:20" },
                2: { subjectName: "ARTIFICIAL INTELLIGENCE", subjectCode: "R245A0513", faculty: "P. SUJITHA", startTime: "10:20", endTime: "11:10" },
                3: { subjectName: "INTRODUCTION TO DATA SCIENCE", subjectCode: "R245A6707", faculty: "T. RAVALI", startTime: "11:20", endTime: "12:10" },
                4: { subjectName: "INTELLECTUAL PROPERTY RIGHTS", subjectCode: "R245A2151", faculty: "K.LAVANYA", startTime: "12:50", endTime: "13:50" },
                5: { subjectName: "DATA WAREHOUSING AND DATA MINING", subjectCode: "R245A1206", faculty: "CH. SREE VIDYA", startTime: "13:50", endTime: "14:50" },
                6: { subjectName: "TUTORIAL", subjectCode: "TUTORIAL", faculty: "FACULTY", startTime: "14:50", endTime: "15:50" }
            },
            "Friday": {
                1: { subjectName: "ARTIFICIAL INTELLIGENCE LAB", subjectCode: "R245A0588", faculty: "P. SUJITHA / K.AJITH", startTime: "09:30", endTime: "10:20" },
                2: { subjectName: "ARTIFICIAL INTELLIGENCE LAB", subjectCode: "R245A0588", faculty: "P. SUJITHA / K.AJITH", startTime: "10:20", endTime: "11:10" },
                3: { subjectName: "ARTIFICIAL INTELLIGENCE LAB", subjectCode: "R245A0588", faculty: "P. SUJITHA / K.AJITH", startTime: "11:20", endTime: "12:10" },
                4: { subjectName: "DATA WAREHOUSING AND DATA MINING", subjectCode: "R245A1206", faculty: "CH. SREE VIDYA", startTime: "12:50", endTime: "13:50" },
                5: { subjectName: "DESIGN AND ANALYSIS OF ALGORITHMS", subjectCode: "R245A0506", faculty: "Y. RAJINI", startTime: "13:50", endTime: "14:50" },
                6: { subjectName: "TEST", subjectCode: "TEST", faculty: "FACULTY", startTime: "14:50", endTime: "15:50" }
            },
            "Saturday": {
                1: { subjectName: "DESIGN AND ANALYSIS OF ALGORITHMS", subjectCode: "R245A0506", faculty: "Y. RAJINI", startTime: "09:30", endTime: "10:20" },
                2: { subjectName: "DATA WAREHOUSING AND DATA MINING", subjectCode: "R245A1206", faculty: "CH. SREE VIDYA", startTime: "10:20", endTime: "11:10" },
                3: { subjectName: "ROBOTICS AND AUTOMATION", subjectCode: "R245A0351", faculty: "K CHAITHANYA", startTime: "11:20", endTime: "12:10" },
                4: { subjectName: "PROFESSIONAL DEVELOPMENT LAB", subjectCode: "R245A6684", faculty: "U.KETHANA", startTime: "12:50", endTime: "13:50" },
                5: { subjectName: "PROFESSIONAL DEVELOPMENT LAB", subjectCode: "R245A6684", faculty: "U.KETHANA", startTime: "13:50", endTime: "14:50" },
                6: { subjectName: "PROFESSIONAL DEVELOPMENT LAB", subjectCode: "R245A6684", faculty: "U.KETHANA", startTime: "14:50", endTime: "15:50" }
            }
        }
    }
};

// Aliases for compound class IDs like III_CSE_DS_A, III_DS_A, etc.
(function registerTimetableAliases() {
    if (!window.OFFICIAL_TIMETABLES) return;
    ["A", "B", "C", "D"].forEach(sec => {
        if (window.OFFICIAL_TIMETABLES[`III_${sec}`]) {
            const data = window.OFFICIAL_TIMETABLES[`III_${sec}`];
            window.OFFICIAL_TIMETABLES[`III_CSE_DS_${sec}`] = data;
            window.OFFICIAL_TIMETABLES[`III_DS_${sec}`] = data;
            window.OFFICIAL_TIMETABLES[`III_CSE_${sec}`] = data;
        }
        if (window.OFFICIAL_TIMETABLES[`IV_${sec}`]) {
            const data = window.OFFICIAL_TIMETABLES[`IV_${sec}`];
            window.OFFICIAL_TIMETABLES[`IV_CSE_DS_${sec}`] = data;
            window.OFFICIAL_TIMETABLES[`IV_DS_${sec}`] = data;
            window.OFFICIAL_TIMETABLES[`IV_CSE_${sec}`] = data;
        }
    });
})();

