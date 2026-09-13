// Node script to generate an authentic MRCET College Timetable PDF
const fs = require('fs');
const path = require('path');

function createTimetablePdf() {
    // MediaBox: Landscape A4: [0 0 842 595]
    const contentLines = [
        "BT",
        "/F1 14 Tf",
        "180 550 Td",
        "(MALLA REDDY COLLEGE OF ENGINEERING AND TECHNOLOGY) Tj",
        "/F1 11 Tf",
        "-40 -20 Td",
        "(DEPARTMENT OF COMPUTER SCIENCE & ENGINEERING - DATA SCIENCE) Tj",
        "/F1 12 Tf",
        "40 -20 Td",
        "(IV B.TECH I SEMESTER - SECTION D - TIME TABLE) Tj",
        "/F1 10 Tf",
        "-130 -35 Td",
        "(DAY        P1(09:30-10:20)   P2(10:20-11:10)   P3(11:20-12:10)   LUNCH   P4(12:50-01:50)   P5(01:50-02:50)   P6(02:50-03:50)) Tj",
        "0 -22 Td",
        "(MON        CC                DL                BT                LUNCH   FSD LAB           FSD LAB           FSD LAB) Tj",
        "0 -22 Td",
        "(TUE        BT                FSD               DBS               LUNCH   CC                DL                DBS) Tj",
        "0 -22 Td",
        "(WED        FSD               BT                CC                LUNCH   DBS               CC                DL) Tj",
        "0 -22 Td",
        "(THU        DBS               CC                BT                LUNCH   DL                FSD               TUTORIAL) Tj",
        "0 -22 Td",
        "(FRI        BT                FSD               DL                LUNCH   DBS               FSD               CC) Tj",
        "0 -22 Td",
        "(SAT        DBS               BT                DL                LUNCH   CC                FSD               TUTORIAL) Tj",
        "0 -40 Td",
        "/F1 11 Tf",
        "(SUBJECT DETAILS & FACULTY ASSIGNMENT:) Tj",
        "/F1 9 Tf",
        "0 -18 Td",
        "(1. R22A0522 - CLOUD COMPUTING (CC) - A. SUPRIYA) Tj",
        "0 -16 Td",
        "(2. R22A6605 - DEEP LEARNING (DL) - D. SOWJANYA) Tj",
        "0 -16 Td",
        "(3. R22A0527 - BLOCKCHAIN TECHNOLOGY (BT) - CH. SRIVALLI) Tj",
        "0 -16 Td",
        "(4. R22A6214 - DATABASE SECURITY (DBS) - B. SWAPNA LATHA) Tj",
        "0 -16 Td",
        "(5. R22A0513 - FULL STACK DEVELOPMENT (FSD) - A.R. LAVANYA) Tj",
        "0 -16 Td",
        "(6. R22A0589 - FULL STACK DEVELOPMENT LAB (FSD LAB) - A.R. LAVANYA / BALAJI) Tj",
        "ET"
    ];

    const streamContent = contentLines.join("\n");
    const streamLength = Buffer.byteLength(streamContent, 'utf-8');

    let pdf = "%PDF-1.4\n";
    const offsets = [];

    function addObj(str) {
        offsets.push(Buffer.byteLength(pdf, 'utf-8'));
        pdf += str + "\n";
    }

    addObj("1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj");
    addObj("2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj");
    addObj("3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 842 595] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>\nendobj");
    addObj("4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>\nendobj");
    addObj(`5 0 obj\n<< /Length ${streamLength} >>\nstream\n${streamContent}\nendstream\nendobj`);

    const startXref = Buffer.byteLength(pdf, 'utf-8');
    pdf += "xref\n";
    pdf += `0 ${offsets.length + 1}\n`;
    pdf += "0000000000 65535 f \n";
    for (const off of offsets) {
        pdf += String(off).padStart(10, '0') + " 00000 n \n";
    }
    pdf += "trailer\n";
    pdf += `<< /Size ${offsets.length + 1} /Root 1 0 R >>\n`;
    pdf += "startxref\n";
    pdf += `${startXref}\n`;
    pdf += "%%EOF\n";

    const outputPath = path.join(__dirname, 'sample_timetable_iv_d.pdf');
    fs.writeFileSync(outputPath, pdf, 'utf-8');
    console.log("Created valid sample timetable PDF at:", outputPath);
}

createTimetablePdf();
