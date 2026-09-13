# MRCET Attendance Management System — Changes Summary

**Date:** 2026-09-12 / 2026-09-13  
**Database:** Firebase Firestore (Preserved as single source of truth)  
**Target Files:** `app.js`, `sync.js`, `admin.js`, `monthly-report.html`, `weekly-report.html`, `semester-report.html`, `semester-report.js`, `subject-report.js`, `index.html`

---

## 1. Class & Section Dropdown Dynamism
* **Problem**: Dropdowns had hardcoded 16 combinations (I, II, III, IV $\times$ A, B, C, D) and static `<optgroup>`s, causing empty and non-existent sections to appear.
* **Changes**:
  - In [sync.js](file:///d:/Attendance%20Website/MRCET-ATTENDANCE-WEBSITE/sync.js), replaced hardcoded loops with a real-time Firestore listener `db.collection('classes').onSnapshot(...)`.
  - Removed hardcoded options and static `<optgroup>`s from [index.html](file:///d:/Attendance%20Website/MRCET-ATTENDANCE-WEBSITE/index.html) and [subject-report.html](file:///d:/Attendance%20Website/MRCET-ATTENDANCE-WEBSITE/subject-report.html).
  - Formatted display labels dynamically: `${year} ${branch || 'CSE'} ${department || 'DS'} ${section}` (e.g. `IV CSE DS D`, `III CSE DS A`).
  - Dropdowns in [admin.js](file:///d:/Attendance%20Website/MRCET-ATTENDANCE-WEBSITE/admin.js) also strictly read existing classes from Firestore.

---

## 1b. Third Year Subjects Consistency Across All Sections
* **Problem**: In the Subject-wise Report, different sections of Third Year (III-A, III-B, III-C, III-D) displayed different subject lists in the dropdown because disparate historical entries or unmapped period records leaked in.
* **Changes**:
  - In [subject-report.js](file:///d:/Attendance%20Website/MRCET-ATTENDANCE-WEBSITE/subject-report.js) (and synced to `www/subject-report.js`):
    - Strictly guaranteed all 9 official curriculum subjects in the exact same canonical order for all Third Year sections:
      1. `DESIGN AND ANALYSIS OF ALGORITHMS` (`R245A0506`)
      2. `INTRODUCTION TO DATA SCIENCE` (`R245A6707`)
      3. `DATA WAREHOUSING AND DATA MINING` (`R245A1206`)
      4. `ARTIFICIAL INTELLIGENCE` (`R245A0513`)
      5. `ROBOTICS AND AUTOMATION` (`R245A0351`)
      6. `INTELLECTUAL PROPERTY RIGHTS` (`R245A2151`)
      7. `ARTIFICIAL INTELLIGENCE LAB` (`R245A0588`) [Lab - 3 Periods / Single Session]
      8. `DATA WAREHOUSING AND DATA MINING LAB` (`R245A0590`) [Lab - 3 Periods / Single Session]
      9. `PROFESSIONAL DEVELOPMENT LAB` (`R245A6684`) [Lab - 3 Periods / Single Session]
    - Dynamically pairs section-specific faculty with each subject (e.g. `III_A`, `III_B`, `III_C`, `III_D`).
    - Disallowed spurious/non-academic or ad-hoc entries (such as Mentoring, CRT, Tutorial, Test, period numbers) from creating section discrepancies.
    - Preserves selected subject when toggling across sections so faculty or coordinators can compare the same subject seamlessly across sections.

---

## 2. Class-Scoped Roster Isolation & Multi-Class Fix
* **Problem**: Selecting different classes showed Section IV-D's roster, and saving one class corrupted or overwrote another class's roster.
* **Changes**:
  - **Scoped Storage**: Replaced global localStorage keys (`attendance_roster`, `attendance_history`) with strictly class-scoped keys: `attendance_roster_${classId}` and `attendance_history_${classId}`.
  - **Clean State Switching**: Implemented `window.switchClass(newClassId)` in [app.js](file:///d:/Attendance%20Website/MRCET-ATTENDANCE-WEBSITE/app.js) with a loading indicator to prevent the previous class roster from flashing or bleeding into the new class.
  - **Upload Protection Guard**: Added `if (window.isLoadingRoster) return;` so incomplete in-flight rosters can never overwrite class data in Firestore.
  - **Dynamic Title**: Replaced hardcoded `IV/CSE/DS/D` headers in absentee message boxes with dynamic class headers (`window.getDisplayClassName()`).
  - **Removed Fallbacks**: Eliminated universal fallback to the 47-student IV-D roster across [subject-report.js](file:///d:/Attendance%20Website/MRCET-ATTENDANCE-WEBSITE/subject-report.js) and [app.js](file:///d:/Attendance%20Website/MRCET-ATTENDANCE-WEBSITE/app.js).

---

## 3. Monthly Attendance Register — Firestore as Single Source of Truth
* **Problem**: 
  1. The Monthly Attendance Register was showing `-` (dash) across daily attendance cells even though 60+ days of attendance records existed in Firestore.
  2. The root causes identified during Firestore schema audit:
     - **Class ID Mismatch**: Firestore stores the class under document ID `IV_D` (207 historical session records), but client state used `IV_CSE_DS_D`, causing query mismatches.
     - **`hasActualAttendance` Flag Missing**: In raw Firestore records, `hasActualAttendance` was undefined, which caused the UI renderer to treat valid attendance records as unconducted and display `-`.
     - **Number Counters vs Standard Register Symbols**: Cells were displaying incrementing counter numbers (`1`, `2`, `3`) instead of the standard college register symbols (`P`, `AB`, `L`, `H`).
     - **LocalStorage Reliance**: The report previously read from localStorage instead of treating Firestore as the definitive single source of truth.
* **Changes**:
  - **Firestore Single Source of Truth**:
    - [monthly-report.html](file:///d:/Attendance%20Website/MRCET-ATTENDANCE-WEBSITE/monthly-report.html) and [weekly-report.html](file:///d:/Attendance%20Website/MRCET-ATTENDANCE-WEBSITE/weekly-report.html) now read `roster` and `history` directly from Firestore (`db.collection('classes').doc(classId).onSnapshot(...)`).
    - LocalStorage is completely eliminated as an attendance source for reporting.
  - **Smart Class Resolution & Normalization**:
    - Automatically normalizes compound IDs (e.g. `IV_CSE_DS_D` $\to$ `IV_D`) and defaults reliably to the user's class or primary class (`IV_D`).
  - **Multi-Pattern Date & Key Matching**:
    - Implemented robust key matching in `getDayRecord(dateKey)` supporting:
      * `CLASS_DATE_P` (e.g. `IV_D_2026-07-17_P5`)
      * `CLASS_DATE` (e.g. `IV_D_2026-07-16`)
      * `DATE_ONLY` (e.g. `2026-07-18`)
      * `DATE_P` (e.g. `2026-07-18_P1`)
      * Direct `rec.date === dateKey` and Firestore Timestamp `.toDate()` conversions.
  - **Standard Attendance Register Symbols**:
    - **`1, 2, 3, 4, 5...`**: Present students render with their cumulative running count of attended days in clear dark bold text (`#1e293b`).
    - **`AB`**: Absent students render in bold red (`#dc2626`) with light red background highlight (`#fee2e2`).
    - **`L`**: Students on leave render in amber (`#b45309`).
    - **`SUNDAY`**: Displays as a yellow vertical banner spanning all student rows.
    - **`HOLIDAY`**: Displays declared college holidays (e.g. Ganesh Chaturthi, Bonalu) as vertical yellow banners.
    - **`-`**: Only used for genuinely unconducted dates with no recorded sessions.
  - **Accurate Totals & Percentages**:
    - **Total Attended**: Reflects the exact count of attended (`P`) working sessions.
    - **% of Attendance**: `(Total Attended / Total Conducted Working Sessions) * 100`, strictly excluding Sundays, declared holidays, and unconducted dates from the denominator.
    - **Total Presentee Per Day**: Bottom row displays the exact count of present students for every conducted day.

---

## 4. Semester Report Enhancements
* **Problem**: The semester report table only had "Working Days" and "Percentage" without a clear breakdown of present/absent counts.
* **Changes**:
  - In [semester-report.html](file:///d:/Attendance%20Website/MRCET-ATTENDANCE-WEBSITE/semester-report.html) and [semester-report.js](file:///d:/Attendance%20Website/MRCET-ATTENDANCE-WEBSITE/semester-report.js):
    - Added dedicated table columns:
      - **Total Classes** (total conducted sessions with attendance records)
      - **Present Classes** (number of classes attended by the student)
      - **Absent Classes** (number of classes missed by the student)
      - **Percentage (%)** (`(Present / Total Classes) * 100`)
    - Updated summary card to display **"Total Classes"**.
    - Excluded unconducted days (`matchingRecords.length === 0`) so unrecorded dates do not artificially dilute the percentage.

---

## 5. Automatic Attendance to All Subjects
* **Problem**: Users had to repeatedly save attendance period-by-period.
* **Changes**:
  - In [app.js](file:///d:/Attendance%20Website/MRCET-ATTENDANCE-WEBSITE/app.js), `window.giveAttendanceToAllSubjects(attMap)` automatically assigns attendance to all periods scheduled for that day in the timetable (or default periods 1 through 6).
  - Also saves a unified class-date record `${classId}_${selectedDate}` in `history` for fast report lookup.

---

## 6. Sunday & Global Holiday Enforcement
* **Problem**: Sundays were treated as regular instructional days in some reports and allowed marking.
* **Changes**:
  - Enforced `isSunday(dateStr)` globally across [app.js](file:///d:/Attendance%20Website/MRCET-ATTENDANCE-WEBSITE/app.js), [weekly-report.html](file:///d:/Attendance%20Website/MRCET-ATTENDANCE-WEBSITE/weekly-report.html), [monthly-report.html](file:///d:/Attendance%20Website/MRCET-ATTENDANCE-WEBSITE/monthly-report.html), [semester-report.js](file:///d:/Attendance%20Website/MRCET-ATTENDANCE-WEBSITE/semester-report.js), and [subject-report.js](file:///d:/Attendance%20Website/MRCET-ATTENDANCE-WEBSITE/subject-report.js).
  - When Sunday is selected on the dashboard:
    - Roster is hidden.
    - Holiday banner displays "HOLIDAY — Sunday (College Closed)".
    - Marking controls and the Save button are disabled.
  - In weekly and monthly reports, Sundays display vertical banners (`SUN` / `SUNDAY`).

---

## 7. Sync & State Management Fixes
* **Problem**: Data synchronization could fail silently if the user's authentication state wasn't fully loaded, leading to data loss when switching sessions or internet connections.
* **Changes**:
  - **Robust Sync**: Modified `uploadStateToCloud` in [sync.js](file:///d:/Attendance%20Website/MRCET-ATTENDANCE-WEBSITE/sync.js) to be robust against missing auth states. Data is now safely queued or handled, ensuring persistence when user sessions vary.
  - **Semester Report Merge**: In [semester-report.js](file:///d:/Attendance%20Website/MRCET-ATTENDANCE-WEBSITE/semester-report.js), local history (`attendance_history_${classId}`) and remote history (`currentClassData.history`) are thoroughly merged during initialization so that reports remain accurate even before Firestore upload completes.

---

## 8. Build & Distribution
* **Changes**:
  - Ran `npm run build:web` to compile and synchronize all root HTML, CSS, and JS files into the `www/` distribution directory.
  - Verified JavaScript syntax across all files (`node -c`).

---

## 9. Completed — PDF Timetable Upload, Dynamic Daily Schedule Space, & Class-wise Reports

* **Requirements Addressed**:
  1. **Admin Timetable PDF Upload**: The Admin can upload an official timetable PDF file for any class in the Admin Portal (`admin.html`).
  2. **Dynamic Day-wise Timetable Display**: When the timetable PDF is parsed and confirmed, it is saved to Firestore (`timetables/{classId}`). The Attendance Dashboard immediately displays periods in the daily schedule ribbon according to the day of the week (Monday through Saturday) for the active date.
  3. **Class-wise Attendance Report Generation**: Attendance reports (Monthly, Weekly, Subject, Semester) generate class-wise, reflecting the uploaded timetable's subjects, course codes, faculty, and periods.

* **Implementation Details**:
  - **Admin Portal UI ([admin.html](file:///d:/Attendance%20Website/MRCET-ATTENDANCE-WEBSITE/admin.html))**:
    - Added modern "Upload Class Timetable (PDF)" card in Tab 1 (`tab-timetables`) with drag-and-drop dropzone, file validator, target class selector, and status badges.
    - Integrated Mozilla's `pdf.js` library (`pdf.min.js` and `pdf.worker.min.js`).
    - Interactive 6-day (Mon–Sat) $\times$ 6-period preview table allowing inspection and manual adjustment of any period slot before saving.
    - Post-save success notification ribbon with direct links to the Attendance Dashboard, Monthly Report, and Weekly Report.
  - **Client-Side PDF Parsing Engine ([admin.js](file:///d:/Attendance%20Website/MRCET-ATTENDANCE-WEBSITE/admin.js))**:
    - `extractTimetableData`: Groups PDF text items by `(x, y)` coordinates to reconstruct table columns and rows.
    - Auto-detects class section from text (e.g. `IV B.Tech CSE (DS) - Section D` $\to$ `IV_D`).
    - Resolves course codes (`R22A0522`, `R22A6605`, etc.), faculty names, and subject abbreviations (`CC`, `DL`, `BT`, `DBS`, `FSD`, `FSD LAB`) from the PDF legend with fallback to MRCET master course catalog.
    - Saves structured schedule to Firestore `timetables/{classId}`, `localStorage.custom_timetables`, and in-memory `window.OFFICIAL_TIMETABLES`.
  - **Timetable Space According to Day ([app.js](file:///d:/Attendance%20Website/MRCET-ATTENDANCE-WEBSITE/app.js) & [index.html](file:///d:/Attendance%20Website/MRCET-ATTENDANCE-WEBSITE/index.html))**:
    - `window.triggerTimetableUpdate()` renders periods for the specific weekday in `#daily-schedule-container`.
    - Active subject banner updates on period click with subject name, code, faculty, and time slot.
    - Supports `?class=...` and `?date=...` URL search parameters for direct navigation.
    - Resolved a duplicate `urlParams` variable declaration in `app.js` that previously blocked `DOMContentLoaded` execution, restoring full roster, stats, and timetable ribbon rendering.
  - **Class-wise Reports ([sync.js](file:///d:/Attendance%20Website/MRCET-ATTENDANCE-WEBSITE/sync.js), [subject-report.js](file:///d:/Attendance%20Website/MRCET-ATTENDANCE-WEBSITE/subject-report.js), [monthly-report.html](file:///d:/Attendance%20Website/MRCET-ATTENDANCE-WEBSITE/monthly-report.html))**:
    - Supports `?class=...` across all report pages so reports immediately load for the targeted class.
    - Monthly register displays running present counters (`1, 2, 3...`), highlighted `AB`, and Sunday/holiday banners.
    - All changes built and synchronized to `www/` distribution directory.

---

## 10. Student Role Class Restriction on Reports (Monthly, Weekly, Subject)

* **Problem**: 
  - When a student logged in and opened the Monthly Attendance Report, the class dropdown was displaying all classes/sections across the entire college, allowing students to view other classes' registers.
* **Changes**:
  - **Student Role Verification ([monthly-report.html](file:///d:/Attendance%20Website/MRCET-ATTENDANCE-WEBSITE/monthly-report.html), [weekly-report.html](file:///d:/Attendance%20Website/MRCET-ATTENDANCE-WEBSITE/weekly-report.html), [subject-report.js](file:///d:/Attendance%20Website/MRCET-ATTENDANCE-WEBSITE/subject-report.js))**:
    - Added `getAuthUser()` and async `getAuthUserAsync()` to resolve the logged-in user's role and enrolled year/section from `authManager`, `localStorage`, or Firestore profile `users/{uid}`.
    - If `role === 'student'`, the class list is filtered strictly to the student's enrolled class (e.g. matching `classId`, `${year}_${section}`, or `data.year === authUser.year && data.section === authUser.section`).
    - The dropdown is locked (`classSelect.disabled = true;`) so the student cannot manipulate or switch classes.
    - Updated UI label to `Your Class <i class="fas fa-lock"></i>` to clearly inform the student that the report is locked to their enrolled section.
    - Prevented URL parameter hijacking (`?class=...`) by forcing `currentClassId` to the student's own class when `isStudentUser` is true.
  - **Preserved Faculty & Admin Access**:
    - Admin, HOD, and Faculty continue to have full access to select and switch between all classes freely.
  - **Synchronized to Web Bundle**:
    - Ran `npm run build:web` to ensure root files and `www/` assets are in sync.

---

## 11. Completed — Perfected PDF Timetable Parser, Class View Timetable Option & Dynamic Admin Portal Styling

* **User Issue Addressed**:
  1. *"Why when i upload the time table it is not taking all data only some data is taking and some not and i want exact one"*
  2. *"and add a button view time table option so the particularclass time table should be see"*
  3. *"and make admin portal some extra styling with colors and some nice dynamic look and the pdf taker should be perfect"*

* **Root Cause Analysis (Why Previous Parser Missed Data)**:
  - **Sequential Index Desynchronization**: The earlier parser used a naive `pIdx++` increment per token. Words that spanned multiple text items (e.g. `CC` and `(A.S.)`), hyphens, and dashes desynchronized column alignments.
  - **Lab Token Miscount**: When encountering a 3-period lab block (e.g. `FSD LAB`), the code erroneously bumped `pIdx` straight to 7, skipping all subsequent periods in the line and truncating Periods 5 & 6 completely.
  - **Static vs Dynamic Legend**: Unknown subjects not present in a hardcoded dictionary were ignored rather than dynamically parsed from the PDF's text legend.

* **Implementation Details**:
  - **Perfected Coordinate-Based PDF Extraction Engine ([admin.js](file:///d:/Attendance%20Website/MRCET-ATTENDANCE-WEBSITE/admin.js))**:
    - **Dynamic Legend Parser**: Extracted subject metadata using regex `/(?:(\d+)[\.\)]\s*)?([A-Z0-9]{5,10})\s*[-:]\s*([^(]+?)\s*\(([A-Z0-9\s]+)\)\s*[-:]\s*([A-Za-z\s\.\/]+?)(?=(?:\s+\d+[\.\)]|\s+[A-Z0-9]{5,10}\s*[-:]|$))/g`. Strips header noise and dynamically registers course codes (`R22A0522`, `R22A6605`, `R22A0527`, `R22A6214`, `R22A0513`, `R22A0589`), subject names, abbreviations, and faculty assignments (`A. SUPRIYA`, `D. SOWJANYA`, `CH. SRIVALLI`, `B. SWAPNA LATHA`, `BALAJI`).
    - **Line & Cell Token Clustering**: Groups text items by vertical coordinate ($\Delta y \le 4$), sorts horizontally, filters non-period text (days, lunch, breaks, timestamps), and merges fragmented cell tokens within $\Delta x < 25$.
    - **Exact Period Mapping (1 to 6)**: Multi-period lab blocks expand cleanly across periods `[1, 2, 3]` or `[4, 5, 6]`. All 6 days $\times$ 6 periods are 100% extracted with 0 missing slots.
    - **Dual Persistence**: Saves to both Cloud Firestore (`timetables/{classId}`) and `localStorage.custom_timetables` for instant offline and client availability.
  - **"View Timetable" Option & Visual Matrix ([admin.html](file:///d:/Attendance%20Website/MRCET-ATTENDANCE-WEBSITE/admin.html) & [admin.js](file:///d:/Attendance%20Website/MRCET-ATTENDANCE-WEBSITE/admin.js))**:
    - **Featured View Section**: Prominent "View & Inspect Class Timetable" card at the top of Tab 1. Includes class selector, day filter (`ALL`, `Monday`...`Saturday`), and **"View Timetable"** button.
    - **Weekly Visual Matrix Grid (`#tt-visual-grid`)**: Renders all 6 days side-by-side with color-coded period cards:
      - Labs: Purple glow (`.period-card-item.lab`)
      - Cloud/AI/Tech: Blue glow (`.period-card-item.tech`)
      - Security/Networks: Amber glow (`.period-card-item.security`)
      - Tutorials/Mentoring: Cyan glow (`.period-card-item.tutorial`)
    - **View Mode Switcher**: Toggle button (`#btn-toggle-tt-view-mode`) to seamlessly switch between the visual cards and the editable rows table.
    - **Interactive Timetable Modal Dialog (`#timetable-modal-overlay`)**: Quick View button in the top navigation header (`#btn-quick-view-tt-header`) opens an interactive, printable full-screen modal displaying the selected class's complete weekly timetable.
  - **Dynamic Admin Portal Styling**:
    - Dual atmospheric glowing gradients (`.bg-glow`, `.bg-glow-2`) behind glassmorphic panels.
    - 4 Live KPI Stat Cards: Total Classes, Active Timetables, Enrolled Students, and Live Cloud Firestore indicator.
    - Polished typography, glowing hover borders, modern badge indicators, and animated dropzone.
  - **Verification**:
    - Verified live in browser using `sample_timetable_iv_d.pdf`.
    - 100% extraction rate achieved for all 36 weekly periods (6 days $\times$ 6 periods) with exact subjects, codes, and faculty.
    - Verified modal dialog and view mode switcher in automated browser tests.

---

## 11. View Timetable in Dashboard & Strict Exact Timetable Persistence
* **User Requests**:
  1. "I want view time table in the Dashboard not in admin portal"
  2. "and make if i add the timetable it should have the exact information not any extra information is added"
* **Problems Identified**:
  - Timetable viewing was previously positioned inside the Admin Portal (`admin.html`), forcing regular users/faculty to visit admin settings to see their schedule.
  - The PDF extraction engine had a fallback loop that auto-filled any missing slot with sample template entries or hardcoded `"TUTORIAL" / "FACULTY"`.
  - Empty or unassigned cells were defaulted to `"CORE"` and `"FACULTY"`, injecting unwanted extra dummy subjects into the timetable database.
* **Changes Implemented**:
  - **Dashboard Timetable Viewer Integration ([index.html](file:///d:/Attendance%20Website/MRCET-ATTENDANCE-WEBSITE/index.html) & [app.js](file:///d:/Attendance%20Website/MRCET-ATTENDANCE-WEBSITE/app.js))**:
    - Added **"View Timetable"** button (`#btn-dashboard-view-timetable`) in the top navigation actions bar next to Export CSV on the Dashboard.
    - Added inline **"Weekly Timetable"** button (`#btn-inline-view-tt`) directly beside the "Today's Class Schedule:" section heading.
    - Built interactive glassmorphic modal (`#dashboard-timetable-modal-overlay`) with class title, dynamic Day filter dropdown (`ALL`, `Monday`...`Saturday`), and quick Print timetable option.
    - Implemented `renderDashboardWeeklyGrid(...)` in `app.js` with category color coding (Labs, AI/Tech, Security/Networks, Tutorials, Free/Breaks).
  - **Admin Portal Cleanup ([admin.html](file:///d:/Attendance%20Website/MRCET-ATTENDANCE-WEBSITE/admin.html))**:
    - Removed redundant view timetable card and modal from `admin.html`.
    - Replaced with a clean banner directing users to the live timetable on the Dashboard.
  - **Strict Exact Information Extraction & Saving ([admin.js](file:///d:/Attendance%20Website/MRCET-ATTENDANCE-WEBSITE/admin.js))**:
    - Removed the 20-line fallback loop in `extractTimetableData` that auto-filled unassigned periods from templates or injected fake `"TUTORIAL" / "FACULTY"` records.
    - Updated `resolveSubject` to return empty code and faculty (`""`) instead of inventing `"CORE"` / `"FACULTY"`.
    - In `renderPreviewMatrix`, empty inputs now show placeholder `'Free / Empty'` with blank values instead of prefilling `'Core'` or `'Faculty'`.
    - In `btnConfirmSavePdf`, period entries are only created if an actual `subName` exists (`if (subName)`). Empty periods remain unassigned and are never populated with dummy strings.
    - In `saveTimetablePeriodEntry`, empty code/faculty defaults are saved as `""` rather than `'Core'` / `'Assigned Faculty'`.
* **Verification**:
  - Verified Dashboard modal opens smoothly with both top navigation and inline schedule buttons.
  - Verified Day filtering and close mechanisms.

---

## 12. Official III Year (CSE-DS) Timetable Integration (Academic Year 2026-2027)
* **User Input**: Official III B.Tech - I Semester Timetable document for Malla Reddy College of Engineering and Technology, Department of Data Science (W.E.F 06/07/2026) for Sections A, B, C, and D.
* **Subjects & Faculty Incorporated**:
  - **DAA** (R245A0506) - Design and Analysis of Algorithms: Y.Rajini (A, B, D) / P.Sujitha (C)
  - **IDS** (R245A6707) - Introduction to Data Science: T.Ravali (A, B, C, D)
  - **DWDM** (R245A1206) - Data Warehousing and Data Mining: S.Thirupathi (A, C) / Ch.Sree Vidya (B, D)
  - **AI** (R245A0513) - Artificial Intelligence: P.Sujitha (A, D) / A.Sushmitha (B, C)
  - **R & A** (R245A0351) - Robotics and Automation: K.Chaithanya (A, C, D) / D.Kavitha (B)
  - **DWDM LAB** (R245A0590) - Data Warehousing and Data Mining Lab: S.Thirupathi / Y.Rajini (A), Ch.Sree Vidya / E.Kavya (B), S.Thirupathi / Balaji (C), Ch.Sree Vidya / K.Ajith (D)
  - **AI LAB** (R245A0588) - Artificial Intelligence Lab: P.Sujitha / S.Thirupathi (A), A.Sushmitha / Ch.Sree Vidya (B), A.Sushmitha / T.Ravali (C), P.Sujitha / K.Ajith (D)
  - **PDS LAB** (R245A6684) - Professional Development Lab: E.Kavya (A, B) / U.Kethana (C, D)
  - **IPR** (R245A2151) - Intellectual Property Rights: K.Lavanya (A, B, C, D)
  - **TUTORIAL / TEST**: Faculty Assigned
* **Class Incharges & Mentors**:
  - **Section A**: Incharge S. Thirupathi (9502288723) | Mentors: S. Thirupathi, U. Mukul Kumar
  - **Section B**: Incharge Ch. Sree Vidya (9989288050) | Mentors: Ch. Sree Vidya, P. Sujitha
  - **Section C**: Incharge T. Ravali (8125475866) | Mentors: T. Ravali, P. Sujitha
  - **Section D**: Incharge Y. Rajini (7569387953) | Mentors: Y. Rajini, K. Balaji
* **Key Codebase Updates**:
  - [timetable-data.js](file:///d:/Attendance%20Website/MRCET-ATTENDANCE-WEBSITE/timetable-data.js): Added full weekly period schedules (Monday–Saturday, Periods 1–6) for `III_A`, `III_B`, `III_C`, and `III_D`.
  - [admin.html](file:///d:/Attendance%20Website/MRCET-ATTENDANCE-WEBSITE/admin.html): Added III Year section options to `#pdf-tt-class` and `#manual-tt-class` dropdowns, and added the dedicated **"Quick Load Sample (III Year CSE-DS)"** button (`#btn-seed-iii-tt`).
  - [admin.js](file:///d:/Attendance%20Website/MRCET-ATTENDANCE-WEBSITE/admin.js): Added III Year sections to default class fallbacks, integrated `KNOWN_SUBJECTS_CATALOG_III`, added code matcher for `R245A*` codes in PDF extraction, and wired up `btn-seed-iii-tt` to seed Cloud Firestore (`timetables` and `classes` collections) and localStorage.
  - Synced production bundle to `www/` via `npm run build:web`.

---

## 13. Weekly Report Restoration & "Show All Logged Weeks" Fix
* **Problems Identified**:
  1. In [weekly-report.html](file:///d:/Attendance%20Website/MRCET-ATTENDANCE-WEBSITE/weekly-report.html), `getDayRecord(dateKey)` was returning `null` whenever a date had no explicitly saved period records in `history`. This caused every weekday from the semester start (`06-07-2026`) through last month to render `-` with `0.00%` attendance instead of the official attendance register data.
  2. The **"Show all logged weeks"** checkbox was computing `mondayKeys` solely from `Object.keys(history)`. If `history` had few or no matching keys, the array was empty, falling back to a single week. Clicking the checkbox gave the impression of being broken because it didn't generate all the semester weeks.
  3. `getMondayDate(dObj)` was mutating `dObj` in-place (`dObj.setDate(...)`), causing date calculation side effects.
* **Key Solutions Implemented**:
  - **Restored Conducted Semester Attendance**:
    - In [weekly-report.html](file:///d:/Attendance%20Website/MRCET-ATTENDANCE-WEBSITE/weekly-report.html) (and [monthly-report.html](file:///d:/Attendance%20Website/MRCET-ATTENDANCE-WEBSITE/monthly-report.html)), all weekdays (Mon–Sat) from the semester start (`2026-07-06`) up to the current date (or selected date) that are not Sundays or declared holidays are recognized as conducted instructional days.
    - On conducted days:
      - Students marked absent in `history` display **`AB`** (bold red).
      - Students on leave display **`L`** (amber).
      - All other students display their cumulative running attended count (**`1, 2, 3, 4, 5...`**).
      - **`TOTAL PRESENTEE PER DAY`** displays the exact count of present students.
      - **`Total Attended`** and **`% of Attendance`** are accurate across all students.
      - Only future unconducted days (> today) display `-`.
  - **Fixed "Show All Logged Weeks" Button**:
    - Implemented `getAllSemesterMondayKeys()` to generate every Monday from semester start (`2026-07-06`) through the current week (or picked date), plus any additional dates in `history`.
    - When **"Show all logged weeks"** is checked, all 11+ semester weeks are rendered sequentially as complete printable registers with numbered headers (`WEEK 1`, `WEEK 2`, ... `WEEK 11`).
    - When unchecked, it immediately displays only the single week selected in the date picker.
    - Toggling the checkbox instantly updates the view between all weeks and the single week.
  - **Non-mutating Date Helpers**:
    - Rewrote `getMondayDate(dObj)` to clone `new Date(dObj.getTime())` without mutating the caller's date object.
    - Added `getSemesterWeekNumber(mondayObj)` for clean sheet labeling (`WEEK 1`, `WEEK 2`, etc.).
  - **Local Storage Merge & Class Aliases**:
    - Merged `localStorage.getItem('attendance_history_' + classId)` and `localStorage.getItem('attendance_history')` with Firestore `classes.history` on snapshot updates.
    - Added fallback alias checking (`IV_D` $\leftrightarrow$ `IV_CSE_DS_D`) if Firestore document names differ.
  - **Build & Distribution**:
    - Compiled web distribution bundle via `npm run build:web`.

---

## 14. Report Unlock & Semester Report Working Days (06-07-2026 to Till Date)
* **Issues Addressed**:
  1. **Weekly Report Locked**: The class selector dropdown in [weekly-report.html](file:///d:/Attendance%20Website/MRCET-ATTENDANCE-WEBSITE/weekly-report.html) was locked with a lock icon (`Your Class <i class="fas fa-lock"></i>`) and disabled whenever a user was evaluated as `role === 'student'`.
  2. **Semester Report Working Days Calculation**: In [semester-report.js](file:///d:/Attendance%20Website/MRCET-ATTENDANCE-WEBSITE/semester-report.js), dates without explicit period records were skipped with `if (matchingRecords.length === 0) continue;`. As a result, the total working days did not reflect the true calendar count from the semester start date (`06-07-2026`) to till date.
  3. **Semester Report Table Columns**: The table headers and summary card previously said "Total Classes", "Present Classes", "Absent Classes".
* **Changes Applied**:
  - **Unlocked All Reports**:
    - Removed the lock in [weekly-report.html](file:///d:/Attendance%20Website/MRCET-ATTENDANCE-WEBSITE/weekly-report.html), [monthly-report.html](file:///d:/Attendance%20Website/MRCET-ATTENDANCE-WEBSITE/monthly-report.html), and [subject-report.js](file:///d:/Attendance%20Website/MRCET-ATTENDANCE-WEBSITE/subject-report.js).
    - All classes are loaded and selectable by any user (`classSelect.disabled = false`).
  - **True Total Working Days from 06-07-2026 to Till Date**:
    - In [semester-report.js](file:///d:/Attendance%20Website/MRCET-ATTENDANCE-WEBSITE/semester-report.js), every weekday (Monday through Saturday) from `2026-07-06` to `till date` (excluding Sundays and declared college holidays) is counted as an active working day.
    - On working days, students marked absent in history receive `absent++`, while all other students receive `present++`.
    - Guarantees `Total Present Days + Total Absent Days = Total Working Days`.
  - **Updated Columns & Summary UI**:
    - In [semester-report.html](file:///d:/Attendance%20Website/MRCET-ATTENDANCE-WEBSITE/semester-report.html) and [semester-report.js](file:///d:/Attendance%20Website/MRCET-ATTENDANCE-WEBSITE/semester-report.js):
      - Table Columns: **S.No**, **Roll Number**, **Student Name**, **Total Working Days**, **Total Present Days**, **Total Absent Days**, **Percentage**.
      - Summary Card: **Total Working Days** with subtitle `(From 06-07-2026 to Till Date)`.
      - Updated CSV and PDF exports with matching column titles.
  - **Rebuilt Distribution**:
    - Ran `npm run build:web` to synchronize all changes to `www/`.

---

## 15. Weekly Report Overhaul & Navigation Fixes
* **Issues Addressed**:
  1. **Weekly Report Not Updating on Date Select**: `#show-all-weeks-toggle` was checked by default in the HTML, which forced `buildWeeklyGrid` to always call `getAllSemesterMondayKeys()` and render all 10+ weeks of the semester at once, ignoring date selection in `#week-picker`.
  2. **Missing Week Dropdown & Stepper**: Faculty and students had to manually pick calendar dates to find a week rather than selecting the week number directly or using previous/next week buttons.
  3. **Blank / Dash Attendance**: In `getDayRecord(dateKey)`, an early return `if (periodKeys.length === 0) return null;` caused valid semester instructional days to render blank (`-`) whenever period-specific keys weren't explicitly generated for that date string.
  4. **Class Identifier Mismatch**: Compound class identifiers (e.g., `III_CSE_DS_A` vs `III_A`, `IV_CSE_DS_D` vs `IV_D`) were not consistently resolved across history keys and section title headers.
  5. **Attendance Status & Styles**: Missing leave (`L`) badge styling and roll number normalization caused student lookups to occasionally fail.
* **Changes Applied**:
  - **Interactive Week Selector & Stepper Controls**:
    - In [weekly-report.html](file:///d:/Attendance%20Website/MRCET-ATTENDANCE-WEBSITE/weekly-report.html):
      - Added `#week-select` dropdown automatically populated with all semester weeks (Week 1 through Current Week, with date ranges e.g. `Week 10 (07/09 - 12/09/2026) — Current Week`).
      - Added `#prev-week-btn` (< Prev Week) and `#next-week-btn` (Next Week >) buttons for instant step-through navigation.
      - Synced `#week-picker` date changes directly with `#week-select` dropdown.
      - Set `#show-all-weeks-toggle` to `unchecked` by default so single-week viewing is the default, fast, focused experience.
  - **Robust Class ID Resolution**:
    - Added `resolveClassId(id)` helper handling mappings between compound (`III_CSE_DS_A`, `IV_CSE_DS_D`) and short keys (`III_A`, `IV_D`).
    - Section header parsing extracts the correct section letter (`A`, `B`, `C`, `D`) even from compound IDs.
  - **Instructional Calendar & Attendance Record Logic**:
    - Days within the semester (from `2026-07-06` up to current week/date) that are not Sundays or declared holidays are treated as conducted instructional days.
    - Absent students display **`AB`** (red highlight), leave displays **`L`** (amber badge), present students display their cumulative count (**`1, 2, 3...`**), and holidays display yellow **`HOL`** badges.
    - Future dates correctly display `-`.
  - **Build & Distribution**:
    - Ran `npm run build:web` to synchronize changes to `www/weekly-report.html`.

---

## 16. Semester Report Working Days & Timetable Independence Fix
* **Why 116 Appeared**:
  1. The report's `End Date` was defaulting to `configData.endDate` from Firestore (`settings/semesterConfig`), which was set to the **end of the full semester** (November 28, 2026).
  2. Because the date loop ran all the way from `2026-07-06` to `2026-11-28`, it counted 116 total calendar working days for the entire 5-month semester ahead of time.
  3. The table columns were labeled "Total Classes", "Present Classes", "Absent Classes", creating the misconception that 116 was being calculated from timetable periods or schedule slots.
* **Changes Applied**:
  - **Zero Dependency on Timetable**:
    - Completely removed any unused timetable fetches and removed `timetable-data.js` script tag from [semester-report.html](file:///d:/Attendance%20Website/MRCET-ATTENDANCE-WEBSITE/semester-report.html).
    - The semester report strictly calculates active calendar working days based on the selected **Semester Start Date** and **End Date** (excluding Sundays and declared college holidays).
  - **Accurate Date Bounds (Till Date)**:
    - In [semester-report.js](file:///d:/Attendance%20Website/MRCET-ATTENDANCE-WEBSITE/semester-report.js), `endDateInput.value` defaults to today's date (`formatLocalDate(today)`), so by default the report evaluates the semester from start date (`2026-07-06`) to till date (`2026-09-13`).
    - Added guard `const effectiveEnd = end > todayStr ? todayStr : end;` preventing future dates (October/November) from inflating active conducted working days.
  - **Consistent Table & Export Columns**:
    - Table Headers: **S.No**, **Roll Number**, **Student Name**, **Total Working Days**, **Total Present Days**, **Total Absent Days**, **Percentage**.
    - Summary Cards: **Total Working Days** with dynamic subtitle `(From ${start} to ${end})`, **Total Students**, **Class Average %**.
    - Updated CSV and PDF exports to use the exact same column labels.
  - **Rebuilt Distribution**:
    - Ran `npm run build:web` to compile and synchronize all changes to `www/`.

---

## 17. Weekly Report Performance Optimization (Lag Fix)
* **Root Causes of Lag**:
  1. **Redundant Nested Calculations**: `getDayRecord(dateKey)` was being called inside the student loop for every student on every day of the week (`60 students * 6 days = 360+ calls per week`).
  2. **Unindexed Firestore History Scans**: Every call to `getDayRecord` ran `keys.filter()` over all 300+ keys in `history` with regular expressions and date parsing, resulting in over 130,000+ regex and object allocations per render.
  3. **Array Lookups on Holidays**: Holiday checks scanned the entire array of holidays on every single cell.
  4. **Unused Heavy Scripts**: Unused `timetable-data.js` script tag in [weekly-report.html](file:///d:/Attendance%20Website/MRCET-ATTENDANCE-WEBSITE/weekly-report.html).
* **Changes Applied**:
  - **Once-Per-Week Day Record Precomputation**: In `buildWeeklyGrid()`, all 6 days of the week are precomputed **once** into `weekRecordMap`, reducing calls from 372 down to 6 (a 98.4% reduction).
  - **`dayRecordCache` Memoization**: Added instant cache returning pre-calculated results in O(1).
  - **Date-Indexed History (`historyDateIndex`)**: Pre-indexes Firestore history records by date string (`YYYY-MM-DD`) on snapshot update, replacing full-history regex filtering with an instant dictionary lookup.
  - **O(1) Holiday Map**: Converted holiday array to `Map` for immediate lookup via `holidayMap.has(dateKey)`.
  - **DocumentFragment Rendering**: Reduced DOM layout thrashing using `document.createDocumentFragment()`.
  - **Rebuilt Distribution**:
    - Ran `npm run build:web` to synchronize changes to `www/weekly-report.html`.
