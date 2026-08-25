document.addEventListener('DOMContentLoaded', () => {
    if (!authManager.isAuthenticated() || (authManager.user.role !== 'hod' && authManager.user.role !== 'admin')) {
        alert("Access Denied: HOD or Admin only.");
        window.location.href = 'login.html';
        return;
    }

    // --- Logout ---
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            await authManager.logout();
        });
    }

    // --- User Profile UI ---
    const sidebarUserName = document.getElementById('sidebar-user-name');
    const sidebarProfileImg = document.getElementById('sidebar-profile-img');
    const topbarProfileImg = document.getElementById('topbar-profile-img');

    if (authManager.user) {
        const userName = authManager.user.name || 'HOD';
        // Split name into two lines for sidebar if it has spaces
        const nameParts = userName.split(' ');
        if (sidebarUserName) {
            sidebarUserName.innerHTML = nameParts.length > 1 
                ? `${nameParts[0]}<br>${nameParts.slice(1).join(' ')}` 
                : userName;
        }
        
        const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=random`;
        if (sidebarProfileImg) sidebarProfileImg.src = avatarUrl;
        if (topbarProfileImg) topbarProfileImg.src = avatarUrl;
    }

    // --- Interactive UI Visuals ---
    // --- SPA Routing ---
    const navItems = document.querySelectorAll('.nav-menu .nav-item[data-view]');
    const viewSections = document.querySelectorAll('.view-section');

    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            navItems.forEach(n => n.classList.remove('active'));
            item.classList.add('active');
            
            const targetViewId = 'view-' + item.getAttribute('data-view');
            viewSections.forEach(section => {
                section.style.display = (section.id === targetViewId) ? 'block' : 'none';
            });
            
            // If navigating to reports, make sure it has latest data
            if (targetViewId === 'view-reports') {
                updateReportView(currentClassStats);
            }
        });
    });

    document.querySelectorAll('.time-filter button').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            document.querySelectorAll('.time-filter button').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });

    // Removed dummy generate alert, report generation handled in Report View

    // --- UI Elements ---
    const kpiDeptAttendance = document.getElementById('kpi-dept-attendance');
    const kpiDeptTrend = document.getElementById('kpi-dept-trend');
    const kpiYearlyAvg = document.getElementById('kpi-yearly-avg');
    const kpiYearlyTrend = document.getElementById('kpi-yearly-trend');
    const kpiHighlightPercent = document.getElementById('kpi-highlight-percent');
    const kpiHighlightClass = document.getElementById('kpi-highlight-class');
    const recentClassesTable = document.getElementById('recent-classes-table');
    const filterYear = document.getElementById('filter-year');
    const filterSection = document.getElementById('filter-section');
    const tableSearchInput = document.getElementById('table-search-input');
    
    const prevDayBtn = document.getElementById('prev-day-btn');
    const nextDayBtn = document.getElementById('next-day-btn');
    const datePickerHidden = document.getElementById('date-picker-hidden');
    const calendarTriggerBtn = document.getElementById('calendar-trigger-btn');
    const displayDateText = document.getElementById('display-date-text');

    // --- New View Elements ---
    const attendanceCardsContainer = document.getElementById('attendance-cards-container');
    const attFilterYear = document.getElementById('att-filter-year');
    const attFilterSection = document.getElementById('att-filter-section');
    const perfClassSelect = document.getElementById('perf-class-select');
    const perfKpiContainer = document.getElementById('perf-kpi-container');
    const perfChartContainer = document.getElementById('perf-chart-container');
    const perfChartTitle = document.getElementById('perf-chart-title');
    

    const downloadPdfBtn = document.getElementById('download-pdf-btn');
    const reportDateText = document.getElementById('report-date-text');
    const reportHodName = document.getElementById('report-hod-name');
    const reportTableBody = document.getElementById('report-table-body');
    const reportAbsenteesList = document.getElementById('report-absentees-list');
    
    let perfLineChartInstance = null;

    // --- State ---
    let classesData = [];
    let globalHolidays = [];
    let currentDate = new Date();
    let currentClassStats = [];

    // --- Filtering Event Listeners ---
    if (filterYear) filterYear.addEventListener('change', updateDashboard);
    if (filterSection) filterSection.addEventListener('change', updateDashboard);

    if (tableSearchInput) {
        tableSearchInput.addEventListener('input', () => {
            renderTable(currentClassStats);
        });
    }

    // --- Date Navigation ---
    if (prevDayBtn) {
        prevDayBtn.addEventListener('click', () => {
            currentDate.setDate(currentDate.getDate() - 1);
            updateDashboard();
        });
    }

    if (nextDayBtn) {
        nextDayBtn.addEventListener('click', () => {
            currentDate.setDate(currentDate.getDate() + 1);
            updateDashboard();
        });
    }

    if (calendarTriggerBtn && datePickerHidden) {
        calendarTriggerBtn.addEventListener('click', () => {
            datePickerHidden.showPicker ? datePickerHidden.showPicker() : datePickerHidden.click();
        });
        
        datePickerHidden.addEventListener('input', (e) => {
            if (e.target.value) {
                currentDate = new Date(e.target.value);
                updateDashboard();
            }
        });
    }

    function formatDisplayDate(dateObj) {
        const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
        return dateObj.toLocaleDateString('en-US', options);
    }
    
    // --- Faculty Registration ---
    if (addFacultyForm) {
        addFacultyForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const name = document.getElementById('fac-name').value;
            const email = document.getElementById('fac-email').value;
            const password = document.getElementById('fac-password').value;
            
            facMsg.textContent = 'Registering...';
            facMsg.style.color = 'var(--text-secondary)';
            try {
                // Warning: In a real prod app, you'd use a cloud function to add users
                // to avoid logging out the current HOD. 
                // For this demo, we use a secondary app instance or rely on auth.js
                // Assuming authManager.register works. We'll store current user, register, then revert.
                const currentUser = authManager.user;
                await authManager.register(name, email, password, 'faculty', null, null);
                
                // Keep HOD logged in
                localStorage.setItem('authUser', JSON.stringify(currentUser));
                authManager.user = currentUser;
                
                facMsg.textContent = 'Faculty successfully registered!';
                facMsg.style.color = 'var(--brand-green-dark)';
                addFacultyForm.reset();
            } catch (err) {
                facMsg.textContent = err.message;
                facMsg.style.color = 'var(--danger)';
            }
        });
    }

    // --- Performance Dropdown ---
    if (perfClassSelect) {
        perfClassSelect.addEventListener('change', (e) => {
            renderPerformanceView(e.target.value);
        });
    }

    // --- Attendance Filters ---
    if (attFilterYear) {
        attFilterYear.addEventListener('change', () => renderAttendanceView(currentClassStats));
    }
    if (attFilterSection) {
        attFilterSection.addEventListener('change', () => renderAttendanceView(currentClassStats));
    }
    
    // --- PDF Report ---
    if (downloadPdfBtn) {
        downloadPdfBtn.addEventListener('click', () => {
            const element = document.getElementById('report-content-area');
            const opt = {
                margin:       0.5,
                filename:     `Attendance_Report_${formatDateStr(currentDate)}.pdf`,
                image:        { type: 'jpeg', quality: 0.98 },
                html2canvas:  { scale: 2 },
                jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
            };
            html2pdf().set(opt).from(element).save();
        });
    }

    // --- Initialization ---
    async function fetchData() {
        try {
            const holidaysSnap = await db.collection('holidays').get();
            globalHolidays = [];
            holidaysSnap.forEach(doc => {
                globalHolidays.push(doc.data());
            });

            const classesSnap = await db.collection('classes').get();
            classesData = [];
            classesSnap.forEach(doc => {
                classesData.push({ id: doc.id, ...doc.data() });
            });

            updateDashboard();
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    }

    function formatDateStr(dateObj) {
        const yyyy = dateObj.getFullYear();
        const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
        const dd = String(dateObj.getDate()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}`;
    }

    function updateDashboard() {
        const dateStr = formatDateStr(currentDate);
        if (displayDateText) {
            displayDateText.textContent = formatDisplayDate(currentDate);
        }
        if (datePickerHidden) {
            datePickerHidden.value = dateStr;
        }

        let deptStats = { total: 0, present: 0 };
        let classStats = [];
        const selectedYearFilter = filterYear ? filterYear.value : 'ALL';
        const selectedSecFilter = filterSection ? filterSection.value : 'ALL';

        classesData.forEach(cls => {
            if (selectedYearFilter !== 'ALL' && cls.year !== selectedYearFilter) return;
            if (selectedSecFilter !== 'ALL' && cls.section !== selectedSecFilter) return;

            const history = cls.history || {};
            
            // Note: If date is in history (AM or PM or Legacy), attendance was marked.
            let attendanceMap = null;
            let hasMarked = false;
            
            if (history[`${dateStr}_AM`] && !history[`${dateStr}_AM`].isHoliday) {
                attendanceMap = { ...attendanceMap, ...(history[`${dateStr}_AM`].attendance || {}) };
                hasMarked = true;
            }
            if (history[`${dateStr}_PM`] && !history[`${dateStr}_PM`].isHoliday) {
                attendanceMap = { ...attendanceMap, ...(history[`${dateStr}_PM`].attendance || {}) };
                hasMarked = true;
            }
            if (!hasMarked && history[dateStr] && !history[dateStr].isHoliday) {
                attendanceMap = history[dateStr].attendance || {};
                hasMarked = true;
            }

            if (hasMarked) {
                const attendance = attendanceMap || {};
                let cTotal = roster.length;
                let cPresent = 0;
                let absentRolls = [];

                roster.forEach(student => {
                    if (attendance[student.rollNo] !== 'absent') cPresent++;
                    else absentRolls.push(student.rollNo);
                });

                deptStats.total += cTotal;
                deptStats.present += cPresent;

                classStats.push({
                    cls: cls,
                    percent: cTotal > 0 ? (cPresent / cTotal * 100) : 0,
                    absentRolls: absentRolls
                });
            } else {
                // If not marked today, calculate their overall historical attendance for the charts
                let totalDays = 0;
                let totalPresent = 0;
                let cTotal = roster.length;

                for (let d in history) {
                     if (!history[d].isHoliday) {
                          totalDays++;
                          roster.forEach(student => {
                               // history[d].attendance might be missing if legacy, but default to present
                               let status = (history[d].attendance && history[d].attendance[student.rollNo]) || 'present';
                               if (status !== 'absent') totalPresent++;
                          });
                     }
                }
                
                let historicalPercent = (totalDays > 0 && cTotal > 0) ? (totalPresent / (totalDays * cTotal) * 100) : 0;
                classStats.push({
                    cls: cls,
                    percent: historicalPercent,
                    absentRolls: [] // No specific absentees if today's not marked
                });
            }
        });

        // Calculate KPI values
        let avgPercent = 0;
        if (classStats.length > 0) {
             let sum = classStats.reduce((acc, curr) => acc + curr.percent, 0);
             avgPercent = sum / classStats.length;
        }
        
        let topClass = null;
        if (classStats.length > 0) {
            topClass = classStats.reduce((prev, current) => (prev.percent > current.percent) ? prev : current);
        }

        // Update UI Text
        if (kpiDeptAttendance) {
            kpiDeptAttendance.textContent = `${Math.round(avgPercent)}%`;
            kpiDeptTrend.className = 'kpi-trend trend-up';
            kpiDeptTrend.innerHTML = '<i class="fas fa-arrow-up"></i> updated';
        }
        
        if (kpiYearlyAvg) {
            kpiYearlyAvg.textContent = `${Math.round(avgPercent)}%`;
            if (avgPercent >= 90) {
                 kpiYearlyTrend.className = 'kpi-trend trend-up';
                 kpiYearlyTrend.innerHTML = `<i class="fas fa-arrow-up"></i> +${(avgPercent-90).toFixed(1)}% above target`;
            } else {
                 kpiYearlyTrend.className = 'kpi-trend trend-down';
                 kpiYearlyTrend.innerHTML = `<i class="fas fa-arrow-down"></i> -${(90-avgPercent).toFixed(1)}% below target`;
            }
        }
        
        if (topClass && kpiHighlightPercent && kpiHighlightClass) {
             kpiHighlightPercent.textContent = `${Math.round(topClass.percent)}%`;
             kpiHighlightClass.textContent = `${topClass.cls.year} Yr ${topClass.cls.section}`;
        }

        currentClassStats = classStats;
        renderTable(classStats);
        updateCharts(classStats);
        renderAttendanceView(classStats);
        updatePerformanceDropdown();
        
        // If they are on performance tab, re-render it for selected class
        if (perfClassSelect && perfClassSelect.value) {
            renderPerformanceView(perfClassSelect.value);
        }
        
        // If they are on reports tab, update it
        updateReportView(classStats);
    }

    function renderTable(classStats) {
        if (!recentClassesTable) return;
        
        const searchQuery = (tableSearchInput ? tableSearchInput.value : '').toLowerCase();
        
        let html = '';
        const filteredStats = classStats.filter(stat => {
             const className = (`${stat.cls.year} Year / Section ${stat.cls.section}`).toLowerCase();
             return className.includes(searchQuery);
        });

        filteredStats.sort((a,b) => b.percent - a.percent).forEach(stat => {
            const pct = Math.round(stat.percent);
            let barColor = 'var(--brand-green)';
            if (pct < 80 && pct >= 70) barColor = 'var(--black-bar)';
            else if (pct < 70) barColor = 'var(--danger)';
            
            let absenteesText = stat.absentRolls && stat.absentRolls.length > 0 
                ? `<div style="font-size: 11px; color: var(--danger); margin-top: 6px; line-height: 1.3; max-width: 250px; overflow-wrap: break-word;"><strong>Absentees:</strong> ${stat.absentRolls.join(', ')}</div>` 
                : `<div style="font-size: 11px; color: var(--text-secondary); margin-top: 6px;">All Present or Not Marked</div>`;
            
            html += `
            <tr>
                <td>${stat.cls.year} Year / Section ${stat.cls.section}</td>
                <td>Instructor</td>
                <td>
                    <div class="attendance-bar-container">
                        <span style="width: 35px;">${pct}%</span>
                        <div class="attendance-bar-bg">
                            <div class="attendance-bar-fill" style="width: ${pct}%; background-color: ${barColor};"></div>
                        </div>
                    </div>
                    ${absenteesText}
                </td>
                <td style="text-align: right; vertical-align: top; padding-top: 16px;">
                    <button class="btn-view" onclick="window.location.href='admin.html'">View Details</button>
                </td>
            </tr>
            `;
        });
        
        if(html === '') {
            html = '<tr><td colspan="4" style="text-align: center;">No class data available.</td></tr>';
        }
        recentClassesTable.innerHTML = html;
    }

    function updateCharts(classStats) {
        if (typeof barChart !== 'undefined' && barChart.data) {
            // Update Bar Chart
            let labels = [];
            let data = [];
            let colors = [];
            
            classStats.slice(0,4).forEach(stat => {
                labels.push(`${stat.cls.year}-${stat.cls.section}`);
                const pct = Math.round(stat.percent);
                data.push(pct);
                
                if (pct >= 85) colors.push('#34D399');
                else if (pct >= 70) colors.push('#0F172A');
                else colors.push('#DC2626');
            });
            
            barChart.data.labels = labels;
            barChart.data.datasets[0].data = data;
            barChart.data.datasets[0].backgroundColor = colors;
            barChart.update();
        }
        
        // Real data for line chart (Last 7 Days Department Average)
        if (typeof lineChart !== 'undefined' && lineChart.data) {
            const last7Labels = [];
            const last7Data = [];
            
            for (let i = 6; i >= 0; i--) {
                const d = new Date(currentDate);
                d.setDate(d.getDate() - i);
                const dateStr = formatDateStr(d);
                last7Labels.push(dateStr.slice(5)); // MM-DD
                
                let dayTotal = 0;
                let dayPresent = 0;
                let hasData = false;
                
                classesData.forEach(cls => {
                    if (cls.history && cls.history[dateStr] && !cls.history[dateStr].isHoliday) {
                        const att = cls.history[dateStr].attendance || {};
                        const roster = cls.roster || [];
                        dayTotal += roster.length;
                        hasData = true;
                        roster.forEach(st => {
                            if (att[st.rollNo] !== 'absent') dayPresent++;
                        });
                    }
                });
                
                if (hasData && dayTotal > 0) {
                    last7Data.push(Math.round((dayPresent / dayTotal) * 100));
                } else {
                    last7Data.push(null); // Or 0, or keep previous value
                }
            }
            
            lineChart.data.labels = last7Labels;
            lineChart.data.datasets[0].data = last7Data;
            lineChart.update();
        }
    }

    function renderAttendanceView(classStats) {
        if (!attendanceCardsContainer) return;
        
        const filterYearVal = attFilterYear ? attFilterYear.value : 'ALL';
        const filterSecVal = attFilterSection ? attFilterSection.value : 'ALL';
        
        const filteredStats = classStats.filter(stat => {
            if (filterYearVal !== 'ALL' && stat.cls.year !== filterYearVal) return false;
            if (filterSecVal !== 'ALL' && stat.cls.section !== filterSecVal) return false;
            return true;
        });
        
        let html = '';
        filteredStats.forEach(stat => {
            const hasAbsentees = stat.absentRolls && stat.absentRolls.length > 0;
            
            // Build the grid of all roll numbers (last two digits)
            let rosterHtml = '<div style="display: flex; flex-wrap: wrap; gap: 8px; margin-top: 10px;">';
            
            if (stat.cls.roster && stat.cls.roster.length > 0) {
                stat.cls.roster.forEach(student => {
                    const isAbsent = stat.absentRolls && stat.absentRolls.includes(student.rollNo);
                    const lastTwo = String(student.rollNo).slice(-2);
                    
                    // Default style (present or un-marked) vs Absent style
                    const bg = isAbsent ? 'var(--danger)' : '#F1F5F9';
                    const color = isAbsent ? 'var(--white)' : 'var(--text-primary)';
                    const border = isAbsent ? 'none' : '1px solid var(--border-color)';
                    
                    rosterHtml += `<div style="width: 32px; height: 32px; border-radius: 6px; background: ${bg}; color: ${color}; border: ${border}; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700;" title="${student.rollNo}">${lastTwo}</div>`;
                });
            } else {
                rosterHtml += '<div style="font-size: 13px; color: var(--text-secondary);">No roster data.</div>';
            }
            rosterHtml += '</div>';

            html += `
            <div class="kpi-card" style="min-height: auto; align-items: flex-start; justify-content: flex-start;">
                <div class="kpi-card-header" style="width: 100%;">
                    <h3>${stat.cls.year} Yr Sec ${stat.cls.section}</h3>
                    <div style="font-size: 12px; font-weight: 600; color: ${hasAbsentees ? 'var(--danger)' : 'var(--text-secondary)'};">
                        Absentees: ${hasAbsentees ? stat.absentRolls.length : 0}
                    </div>
                </div>
                <div style="width: 100%;">
                    ${rosterHtml}
                </div>
            </div>
            `;
        });
        attendanceCardsContainer.innerHTML = html;
    }

    function updatePerformanceDropdown() {
        if (!perfClassSelect) return;
        const currentSelection = perfClassSelect.value;
        
        let html = '<option value="">Select a Class...</option>';
        classesData.forEach(cls => {
            const val = `${cls.year}-${cls.section}`;
            html += `<option value="${val}" ${currentSelection === val ? 'selected' : ''}>${cls.year} Year / Sec ${cls.section}</option>`;
        });
        perfClassSelect.innerHTML = html;
    }

    function renderPerformanceView(classIdStr) {
        if (!perfKpiContainer || !perfChartContainer || !perfChartTitle) return;
        
        if (!classIdStr) {
            perfKpiContainer.style.display = 'none';
            perfChartContainer.style.display = 'none';
            return;
        }

        perfKpiContainer.style.display = 'grid';
        perfChartContainer.style.display = 'block';
        
        const [cyear, csec] = classIdStr.split('-');
        const cls = classesData.find(c => c.year === cyear && c.section === csec);
        if (!cls) return;
        
        perfChartTitle.textContent = `${cls.year} Yr Sec ${cls.section} - Historical Attendance`;
        
        // Extract 30 days history
        const history = cls.history || {};
        const sortedDates = Object.keys(history).sort();
        
        let labels = [];
        let data = [];
        let totalPresentAllTime = 0;
        let totalDaysAllTime = 0;
        
        sortedDates.forEach(d => {
            if (!history[d].isHoliday) {
                totalDaysAllTime++;
                let dPresent = 0;
                let cTotal = cls.roster.length;
                cls.roster.forEach(st => {
                    let status = (history[d].attendance && history[d].attendance[st.rollNo]) || 'present';
                    if (status !== 'absent') {
                        dPresent++;
                        totalPresentAllTime++;
                    }
                });
                // label like 03-15 (AM)
                let labelStr = d.slice(5); 
                if (labelStr.includes('_PM')) labelStr = labelStr.replace('_PM', ' PM');
                if (labelStr.includes('_AM')) labelStr = labelStr.replace('_AM', ' AM');
                labels.push(labelStr); 
                data.push(cTotal > 0 ? (dPresent / cTotal * 100) : 0);
            }
        });
        
        // Render KPIs
        let avg = (totalDaysAllTime > 0 && cls.roster.length > 0) 
            ? (totalPresentAllTime / (totalDaysAllTime * cls.roster.length) * 100) 
            : 0;
            
        perfKpiContainer.innerHTML = `
            <div class="kpi-card">
                <div class="kpi-card-header">
                    <h3>Overall Average</h3><i class="fas fa-chart-bar"></i>
                </div>
                <div class="kpi-value">${Math.round(avg)}%</div>
            </div>
            <div class="kpi-card">
                <div class="kpi-card-header">
                    <h3>Total Days Recorded</h3><i class="fas fa-calendar-check"></i>
                </div>
                <div class="kpi-value">${totalDaysAllTime}</div>
            </div>
            <div class="kpi-card">
                <div class="kpi-card-header">
                    <h3>Total Students</h3><i class="fas fa-user-graduate"></i>
                </div>
                <div class="kpi-value">${cls.roster ? cls.roster.length : 0}</div>
            </div>
        `;

        // Render Chart
        const ctx = document.getElementById('perfLineChart').getContext('2d');
        if (perfLineChartInstance) perfLineChartInstance.destroy();
        
        perfLineChartInstance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels.slice(-30),
                datasets: [{
                    label: 'Attendance %',
                    data: data.slice(-30),
                    borderColor: '#34D399',
                    borderWidth: 2,
                    pointBackgroundColor: '#FFFFFF',
                    pointBorderColor: '#34D399',
                    fill: { target: 'origin', above: 'rgba(52, 211, 153, 0.1)' },
                    tension: 0.3
                }]
            },
            options: {
                responsive: true, maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    y: { min: 0, max: 100 }
                }
            }
        });
    }

    function updateReportView(classStats) {
        if (!reportTableBody || !reportDateText || !reportHodName || !reportAbsenteesList) return;
        
        reportDateText.textContent = formatDateStr(currentDate);
        reportHodName.textContent = authManager.user ? authManager.user.name : 'Edumetric Admin';
        
        let tableHtml = '';
        let absenteesHtml = '';
        
        classStats.forEach(stat => {
            const hasAbsentees = stat.absentRolls && stat.absentRolls.length > 0;
            const tTotal = stat.cls.roster ? stat.cls.roster.length : 0;
            const pct = Math.round(stat.percent);
            const present = tTotal - (hasAbsentees ? stat.absentRolls.length : 0);
            
            tableHtml += `
                <tr style="border-bottom: 1px solid var(--border-color);">
                    <td style="padding: 10px;">${stat.cls.year} Sec ${stat.cls.section}</td>
                    <td style="padding: 10px;">${tTotal}</td>
                    <td style="padding: 10px;">${present}</td>
                    <td style="padding: 10px; font-weight: bold;">${pct}%</td>
                </tr>
            `;
            
            if (hasAbsentees) {
                absenteesHtml += `<div style="margin-bottom: 10px;"><strong>${stat.cls.year} Sec ${stat.cls.section}:</strong> ${stat.absentRolls.join(', ')}</div>`;
            }
        });
        
        if (tableHtml === '') tableHtml = '<tr><td colspan="4" style="text-align: center;">No data available.</td></tr>';
        if (absenteesHtml === '') absenteesHtml = '<div>No absentees marked for this date.</div>';
        
        reportTableBody.innerHTML = tableHtml;
        reportAbsenteesList.innerHTML = absenteesHtml;
    }

    fetchData();
});
