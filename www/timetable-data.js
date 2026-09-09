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
    }
};
