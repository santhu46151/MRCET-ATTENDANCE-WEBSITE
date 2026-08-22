document.addEventListener('DOMContentLoaded', () => {
    if (!authManager.isAuthenticated() || (authManager.user.role !== 'hod' && authManager.user.role !== 'admin')) {
        alert("Access Denied: HOD or Admin only.");
        window.location.href = 'login.html';
        return;
    }

    // --- Logout & Theme ---
    const logoutBtn = document.getElementById('logout-btn');
    logoutBtn.addEventListener('click', async () => {
        await authManager.logout();
    });

    const themeToggleBtn = document.getElementById('theme-toggle');
    const isDarkMode = localStorage.getItem('theme') === 'dark' || 
        (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
    
    if (isDarkMode) {
        document.body.classList.add('dark-mode');
        themeToggleBtn.innerHTML = '<i class="fas fa-sun"></i>';
    } else {
        document.body.classList.remove('dark-mode');
        themeToggleBtn.innerHTML = '<i class="fas fa-moon"></i>';
    }

    themeToggleBtn.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        const isDarkNow = document.body.classList.contains('dark-mode');
        localStorage.setItem('theme', isDarkNow ? 'dark' : 'light');
        themeToggleBtn.innerHTML = isDarkNow ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
        
        if (classesData.length > 0) {
            renderCharts(); // Update chart colors
        }
    });

    // --- UI Elements ---
    const displayDateText = document.getElementById('display-date-text');
    const dayStatusBadge = document.getElementById('day-status-badge');
    const prevDayBtn = document.getElementById('prev-day-btn');
    const nextDayBtn = document.getElementById('next-day-btn');
    const todayBtn = document.getElementById('today-btn');
    const datePickerHidden = document.getElementById('date-picker-hidden');
    const calendarTriggerBtn = document.getElementById('calendar-trigger-btn');
    const filterYear = document.getElementById('filter-year');

    const kpiTotal = document.getElementById('kpi-total');
    const kpiPresent = document.getElementById('kpi-present');
    const kpiAbsent = document.getElementById('kpi-absent');
    const kpiPercent = document.getElementById('kpi-percent');

    const heroPercent = document.getElementById('hero-percent');
    const heroStatus = document.getElementById('hero-status');
    const rankList = document.getElementById('rank-list');
    const classList = document.getElementById('class-list');
    
    const alertPanel = document.getElementById('alert-panel');
    const alertList = document.getElementById('alert-list');

    const analyticsContent = document.getElementById('analytics-content');
    const emptyStateContainer = document.getElementById('empty-state-container');
    const holidayStateContainer = document.getElementById('holiday-state-container');
    const loadingContainer = document.getElementById('loading-container');
    const holidayNameText = document.getElementById('holiday-name-text');
    const kpiStrip = document.getElementById('kpi-strip');

    // Drawer Elements
    const drilldownModal = document.getElementById('drilldown-modal');
    const closeDrawerBtn = document.getElementById('close-drawer-btn');
    const drawerClassTitle = document.getElementById('drawer-class-title');
    const drawerClassSubtitle = document.getElementById('drawer-class-subtitle');
    const drawerStudentList = document.getElementById('drawer-student-list');
    const studentSearch = document.getElementById('student-search');
    const tabAll = document.getElementById('tab-all');
    const tabPresent = document.getElementById('tab-present');
    const tabAbsent = document.getElementById('tab-absent');

    // --- State ---
    let classesData = [];
    let globalHolidays = [];
    let currentDate = new Date();
    
    // Aggregation State
    let deptStats = { total: 0, present: 0, absent: 0 };
    let yearStats = {};
    let classStats = []; // array of { classObj, total, present, absent, percent }
    let drawerCurrentStudents = [];
    let currentTab = 'all';

    // Chart Instances
    let heroChartInstance = null;
    let yearChartInstance = null;

    // --- Initialization ---
    async function fetchData() {
        showLoading();
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
            loadingContainer.innerHTML = `<p style="color:var(--danger)">Error loading data. Please try again.</p>`;
        }
    }

    // --- Date Navigation ---
    function formatDateStr(dateObj) {
        const yyyy = dateObj.getFullYear();
        const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
        const dd = String(dateObj.getDate()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}`;
    }

    function formatDisplayDate(dateObj) {
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        return dateObj.toLocaleDateString('en-US', options);
    }

    function changeDate(daysDelta) {
        currentDate.setDate(currentDate.getDate() + daysDelta);
        updateDashboard();
    }

    prevDayBtn.addEventListener('click', () => changeDate(-1));
    nextDayBtn.addEventListener('click', () => changeDate(1));
    todayBtn.addEventListener('click', () => {
        currentDate = new Date();
        updateDashboard();
    });

    calendarTriggerBtn.addEventListener('click', () => {
        datePickerHidden.showPicker ? datePickerHidden.showPicker() : datePickerHidden.click();
    });

    datePickerHidden.addEventListener('change', (e) => {
        if (e.target.value) {
            currentDate = new Date(e.target.value);
            updateDashboard();
        }
    });

    filterYear.addEventListener('change', () => {
        updateDashboard();
    });

    // --- Core Logic ---
    function updateDashboard() {
        const dateStr = formatDateStr(currentDate);
        displayDateText.textContent = formatDisplayDate(currentDate);
        datePickerHidden.value = dateStr;

        // Reset state
        deptStats = { total: 0, present: 0, absent: 0 };
        yearStats = {
            'II': { total: 0, present: 0 },
            'III': { total: 0, present: 0 },
            'IV': { total: 0, present: 0 }
        };
        classStats = [];
        let anyClassHasHistoryForDate = false;

        // Check if holiday
        const holidayObj = globalHolidays.find(h => h.date === dateStr);
        if (holidayObj) {
            showHolidayState(holidayObj.reason || 'School Holiday');
            return;
        }

        // Process data
        const selectedYearFilter = filterYear.value;

        classesData.forEach(cls => {
            if (selectedYearFilter !== 'ALL' && cls.year !== selectedYearFilter) return;

            const roster = cls.roster || [];
            const history = cls.history || {};
            
            // Note: If date is in history, attendance was marked.
            if (history[dateStr] && !history[dateStr].isHoliday) {
                anyClassHasHistoryForDate = true;
                
                const attendance = history[dateStr].attendance || {};
                let cTotal = roster.length;
                let cAbsent = 0;
                let cPresent = 0;

                roster.forEach(student => {
                    const status = attendance[student.rollNo];
                    if (status === 'absent') cAbsent++;
                    else cPresent++; // legacy un-marked implies present
                });

                deptStats.total += cTotal;
                deptStats.present += cPresent;
                deptStats.absent += cAbsent;

                if (yearStats[cls.year]) {
                    yearStats[cls.year].total += cTotal;
                    yearStats[cls.year].present += cPresent;
                }

                classStats.push({
                    cls: cls,
                    roster: roster,
                    attendance: attendance, // map of rollNo -> status
                    total: cTotal,
                    present: cPresent,
                    absent: cAbsent,
                    percent: cTotal > 0 ? (cPresent / cTotal * 100) : 0
                });
            }
        });

        // Check Empty State (not a holiday, but no records exist for this date)
        if (!anyClassHasHistoryForDate || deptStats.total === 0) {
            // But wait, if it's today and they haven't marked, show Not Completed.
            showEmptyState();
            return;
        }

        // Calculate final percentages
        const deptPercent = deptStats.total > 0 ? Math.round((deptStats.present / deptStats.total) * 100) : 0;
        
        // Update UI
        dayStatusBadge.className = 'status-badge status-day';
        dayStatusBadge.innerHTML = `<i class="fas fa-check-circle"></i> <span>Attendance Day</span>`;

        kpiTotal.textContent = deptStats.total;
        kpiPresent.textContent = deptStats.present;
        kpiAbsent.textContent = deptStats.absent;
        kpiPercent.textContent = `${deptPercent}%`;
        kpiPercent.style.color = getStatusColor(deptPercent);

        heroPercent.textContent = `${deptPercent}%`;
        heroPercent.style.color = getStatusColor(deptPercent);
        
        if (deptPercent >= 85) heroStatus.textContent = "Good Attendance";
        else if (deptPercent >= 75) heroStatus.textContent = "Average Attendance";
        else heroStatus.textContent = "Low Attendance";

        // Sort classStats
        classStats.sort((a, b) => b.percent - a.percent);

        renderClassList();
        renderRankList();
        renderAlerts();
        renderCharts();

        showAnalytics();
    }

    function getStatusColor(percent) {
        if (percent >= 85) return 'var(--success)';
        if (percent >= 75) return 'var(--warning)';
        return 'var(--danger)';
    }

    function renderClassList() {
        let html = '';
        classStats.forEach(stat => {
            const pct = stat.percent.toFixed(1);
            const color = getStatusColor(stat.percent);
            
            html += `
                <div class="class-bar-container" data-class-id="${stat.cls.id}">
                    <div class="class-bar-header">
                        <span class="class-name">${stat.cls.year} Year / ${stat.cls.section} Sec</span>
                        <span class="class-stats-text" style="color: ${color};">${pct}%</span>
                    </div>
                    <div class="progress-track">
                        <div class="progress-fill" style="width: ${pct}%; background: ${color};"></div>
                    </div>
                    <div class="class-stats-text" style="margin-top: 0.25rem;">
                        ${stat.present} Present / ${stat.total} Students
                    </div>
                </div>
            `;
        });
        classList.innerHTML = html;

        // Add drilldown listeners
        document.querySelectorAll('.class-bar-container').forEach(el => {
            el.addEventListener('click', (e) => {
                const classId = e.currentTarget.getAttribute('data-class-id');
                openDrilldown(classId);
            });
        });
    }

    function renderRankList() {
        let html = '';
        const topClasses = classStats.slice(0, 5); // top 5
        
        topClasses.forEach((stat, index) => {
            const pct = stat.percent.toFixed(1);
            html += `
                <div class="rank-item" data-class-id="${stat.cls.id}">
                    <div style="display: flex; align-items: center;">
                        <div class="rank-number">${index + 1}</div>
                        <span>${stat.cls.year} ${stat.cls.section}</span>
                    </div>
                    <span style="color: ${getStatusColor(stat.percent)};">${pct}%</span>
                </div>
            `;
        });

        rankList.innerHTML = html || '<div style="color: var(--text-muted);">No classes available.</div>';

        document.querySelectorAll('.rank-item').forEach(el => {
            el.addEventListener('click', (e) => {
                openDrilldown(e.currentTarget.getAttribute('data-class-id'));
            });
        });
    }

    function renderAlerts() {
        const lowClasses = classStats.filter(c => c.percent < 75);
        if (lowClasses.length > 0) {
            let html = '';
            lowClasses.forEach(stat => {
                const pct = stat.percent.toFixed(1);
                html += `
                    <div class="alert-item" data-class-id="${stat.cls.id}">
                        <div>
                            <div style="font-weight: 700; color: var(--text-primary);">⚠ ${stat.cls.year} ${stat.cls.section}</div>
                            <div style="font-size: 0.85rem; color: var(--text-secondary); margin-top: 0.25rem;">${stat.absent} students absent</div>
                        </div>
                        <div style="font-weight: 700; color: var(--danger); font-size: 1.1rem;">${pct}%</div>
                    </div>
                `;
            });
            alertList.innerHTML = html;
            alertPanel.style.display = 'flex';

            document.querySelectorAll('.alert-item').forEach(el => {
                el.addEventListener('click', (e) => {
                    openDrilldown(e.currentTarget.getAttribute('data-class-id'));
                });
            });
        } else {
            alertPanel.style.display = 'none';
        }
    }

    function renderCharts() {
        if (deptStats.total === 0) return; // safety

        const isDark = document.body.classList.contains('dark-mode');
        const textColor = isDark ? '#e2e8f0' : '#1e293b';
        const gridColor = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';

        // Hero Donut Chart
        const ctxHero = document.getElementById('hero-chart').getContext('2d');
        if (heroChartInstance) heroChartInstance.destroy();
        
        heroChartInstance = new Chart(ctxHero, {
            type: 'doughnut',
            data: {
                labels: ['Present', 'Absent'],
                datasets: [{
                    data: [deptStats.present, deptStats.absent],
                    backgroundColor: ['#10b981', '#ef4444'],
                    borderWidth: 0,
                    hoverOffset: 4,
                    cutout: '75%'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return ` ${context.label}: ${context.raw} Students`;
                            }
                        }
                    }
                }
            }
        });

        // Year Bar Chart
        const ctxYear = document.getElementById('year-chart').getContext('2d');
        if (yearChartInstance) yearChartInstance.destroy();
        
        const yearLabels = [];
        const yearDataArr = [];
        const yearColors = [];

        Object.keys(yearStats).forEach(year => {
            const data = yearStats[year];
            if (data.total > 0) {
                yearLabels.push(year + ' Year');
                const pct = (data.present / data.total) * 100;
                yearDataArr.push(pct.toFixed(1));
                yearColors.push(getStatusColor(pct));
            }
        });

        yearChartInstance = new Chart(ctxYear, {
            type: 'bar',
            data: {
                labels: yearLabels,
                datasets: [{
                    label: 'Attendance %',
                    data: yearDataArr,
                    backgroundColor: yearColors,
                    borderRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: { 
                        beginAtZero: true, 
                        max: 100, 
                        ticks: { color: textColor },
                        grid: { color: gridColor }
                    },
                    x: { 
                        ticks: { color: textColor },
                        grid: { display: false }
                    }
                },
                plugins: {
                    legend: { display: false }
                }
            }
        });
    }

    // --- Drilldown Modal ---
    function openDrilldown(classId) {
        const stat = classStats.find(s => s.cls.id === classId);
        if (!stat) return;

        drawerClassTitle.textContent = `${stat.cls.year} Year / ${stat.cls.section} Sec`;
        drawerClassSubtitle.textContent = `${stat.total} Students • ${stat.percent.toFixed(1)}% Attendance`;

        drawerCurrentStudents = stat.roster.map(stu => {
            const status = stat.attendance[stu.rollNo] === 'absent' ? 'absent' : 'present';
            return { ...stu, status };
        });

        currentTab = 'all';
        updateTabStyles();
        studentSearch.value = '';
        renderDrilldownStudents();

        drilldownModal.classList.add('active');
    }

    closeDrawerBtn.addEventListener('click', () => {
        drilldownModal.classList.remove('active');
    });

    // Close when clicking outside drawer
    drilldownModal.addEventListener('click', (e) => {
        if (e.target === drilldownModal) {
            drilldownModal.classList.remove('active');
        }
    });

    function updateTabStyles() {
        [tabAll, tabPresent, tabAbsent].forEach(btn => {
            btn.style.background = 'transparent';
            btn.style.color = 'var(--text-secondary)';
        });
        
        const activeTab = currentTab === 'all' ? tabAll : (currentTab === 'present' ? tabPresent : tabAbsent);
        activeTab.style.background = 'var(--bg-primary)';
        activeTab.style.color = 'var(--text-primary)';
    }

    tabAll.addEventListener('click', () => { currentTab = 'all'; updateTabStyles(); renderDrilldownStudents(); });
    tabPresent.addEventListener('click', () => { currentTab = 'present'; updateTabStyles(); renderDrilldownStudents(); });
    tabAbsent.addEventListener('click', () => { currentTab = 'absent'; updateTabStyles(); renderDrilldownStudents(); });

    studentSearch.addEventListener('input', () => {
        renderDrilldownStudents();
    });

    function renderDrilldownStudents() {
        const query = studentSearch.value.toLowerCase();
        
        const filtered = drawerCurrentStudents.filter(stu => {
            // Filter by tab
            if (currentTab !== 'all' && stu.status !== currentTab) return false;
            // Filter by search
            if (query && !stu.name.toLowerCase().includes(query) && !stu.rollNo.toLowerCase().includes(query)) return false;
            return true;
        });

        let html = '';
        filtered.forEach(stu => {
            const isPresent = stu.status === 'present';
            const color = isPresent ? 'var(--success)' : 'var(--danger)';
            html += `
                <tr>
                    <td style="font-family: monospace; font-weight: 600;">${stu.rollNo}</td>
                    <td>${stu.name}</td>
                    <td style="color: ${color}; font-weight: 700;">${isPresent ? 'Present' : 'Absent'}</td>
                </tr>
            `;
        });

        drawerStudentList.innerHTML = html || '<tr><td colspan="3" style="text-align: center; color: var(--text-muted);">No students found.</td></tr>';
    }


    // --- View States ---
    function showLoading() {
        loadingContainer.style.display = 'block';
        analyticsContent.style.display = 'none';
        emptyStateContainer.style.display = 'none';
        holidayStateContainer.style.display = 'none';
        kpiStrip.style.display = 'none';
    }

    function showAnalytics() {
        loadingContainer.style.display = 'none';
        analyticsContent.style.display = 'grid';
        emptyStateContainer.style.display = 'none';
        holidayStateContainer.style.display = 'none';
        kpiStrip.style.display = 'grid';
    }

    function showEmptyState() {
        loadingContainer.style.display = 'none';
        analyticsContent.style.display = 'none';
        emptyStateContainer.style.display = 'flex';
        holidayStateContainer.style.display = 'none';
        kpiStrip.style.display = 'none';

        dayStatusBadge.className = 'status-badge status-missing';
        dayStatusBadge.innerHTML = `<i class="fas fa-exclamation-circle"></i> <span>Not Completed</span>`;
    }

    function showHolidayState(reason) {
        loadingContainer.style.display = 'none';
        analyticsContent.style.display = 'none';
        emptyStateContainer.style.display = 'none';
        holidayStateContainer.style.display = 'flex';
        kpiStrip.style.display = 'none';

        holidayNameText.textContent = `- ${reason}`;

        dayStatusBadge.className = 'status-badge status-holiday';
        dayStatusBadge.innerHTML = `<i class="fas fa-umbrella-beach"></i> <span>Holiday</span>`;
    }

    fetchData();
});
