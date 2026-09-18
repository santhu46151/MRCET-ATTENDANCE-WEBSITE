// Official IV B.Tech (Data Science) Semester 1 Timetables (2026-2027)
// Malla Reddy College of Engineering and Technology

export const PERIOD_TIMES = {
  1: { label: "Period I", start: "09:30", end: "10:20", display: "9:30 AM - 10:20 AM" },
  2: { label: "Period II", start: "10:20", end: "11:10", display: "10:20 AM - 11:10 AM" },
  3: { label: "Period III", start: "11:20", end: "12:10", display: "11:20 AM - 12:10 PM" },
  4: { label: "Period IV", start: "12:50", end: "13:50", display: "12:50 PM - 1:50 PM" },
  5: { label: "Period V", start: "13:50", end: "14:50", display: "1:50 PM - 2:50 PM" },
  6: { label: "Period VI", start: "14:50", end: "15:50", display: "2:50 PM - 3:50 PM" }
};

export const OFFICIAL_TIMETABLES = {
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

export const DEFAULT_STUDENTS_IV_D = [
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
