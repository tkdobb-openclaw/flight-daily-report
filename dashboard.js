// 看板统计脚本

const STORAGE_KEY = 'flightDailyReports';

// 图表实例
let monthlyChart, pilotChart, areaChart, statusChart;

// 当前筛选条件
let currentFilter = { year: 'all', month: 'all' };

document.addEventListener('DOMContentLoaded', function() {
    // 初始化年份选项
    initYearOptions();
    
    // 初始化图表
    initCharts();
    
    // 绑定事件
    document.getElementById('applyFilter').addEventListener('click', applyFilter);
    document.getElementById('exportAllPdf').addEventListener('click', exportDashboardPDF);
    document.getElementById('exportJson').addEventListener('click', exportDataJson);
    
    // 加载数据
    loadDashboard();
});

// 初始化年份选项
function initYearOptions() {
    const reports = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    const years = [...new Set(reports.map(r => new Date(r.date).getFullYear()))].sort().reverse();
    
    const yearSelect = document.getElementById('filterYear');
    years.forEach(year => {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year + '年';
        yearSelect.appendChild(option);
    });
}

// 初始化图表
function initCharts() {
    monthlyChart = echarts.init(document.getElementById('monthlyChart'));
    pilotChart = echarts.init(document.getElementById('pilotChart'));
    areaChart = echarts.init(document.getElementById('areaChart'));
    statusChart = echarts.init(document.getElementById('statusChart'));
    
    // 响应窗口变化
    window.addEventListener('resize', () => {
        monthlyChart.resize();
        pilotChart.resize();
        areaChart.resize();
        statusChart.resize();
    });
}

// 应用筛选
function applyFilter() {
    currentFilter.year = document.getElementById('filterYear').value;
    currentFilter.month = document.getElementById('filterMonth').value;
    loadDashboard();
}

// 加载看板数据
function loadDashboard() {
    const reports = getFilteredReports();
    
    // 更新统计卡片
    updateStatsCards(reports);
    
    // 更新图表
    updateMonthlyChart(reports);
    updatePilotChart(reports);
    updateAreaChart(reports);
    updateStatusChart(reports);
    
    // 更新数据表格
    updateDataTable(reports);
}

// 获取筛选后的报告
function getFilteredReports() {
    let reports = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    
    return reports.filter(r => {
        const date = new Date(r.date);
        const year = date.getFullYear().toString();
        const month = (date.getMonth() + 1).toString();
        
        if (currentFilter.year !== 'all' && year !== currentFilter.year) return false;
        if (currentFilter.month !== 'all' && month !== currentFilter.month) return false;
        
        return true;
    });
}

// 更新统计卡片
function updateStatsCards(reports) {
    // 飞行次数
    document.getElementById('totalFlights').textContent = reports.length;
    
    // 飞行时长（小时）
    let totalMinutes = 0;
    reports.forEach(r => {
        if (r.duration) {
            const match = r.duration.match(/(\d+)小时(\d+)分钟/);
            if (match) {
                totalMinutes += parseInt(match[1]) * 60 + parseInt(match[2]);
            }
        }
    });
    document.getElementById('totalHours').textContent = (totalMinutes / 60).toFixed(1);
    
    // 飞行员数
    const pilots = new Set(reports.map(r => r.pilot).filter(Boolean));
    document.getElementById('totalPilots').textContent = pilots.size;
    
    // 巡查区域数
    const areas = new Set(reports.map(r => r.area).filter(Boolean));
    document.getElementById('totalAreas').textContent = areas.size;
}

// 更新月度趋势图
function updateMonthlyChart(reports) {
    const monthlyData = {};
    
    reports.forEach(r => {
        const date = new Date(r.date);
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        monthlyData[key] = (monthlyData[key] || 0) + 1;
    });
    
    const sortedKeys = Object.keys(monthlyData).sort();
    
    const option = {
        tooltip: { trigger: 'axis' },
        xAxis: {
            type: 'category',
            data: sortedKeys,
            axisLabel: { rotate: 45 }
        },
        yAxis: { type: 'value', name: '次数' },
        series: [{
            data: sortedKeys.map(k => monthlyData[k]),
            type: 'line',
            smooth: true,
            areaStyle: {
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                    { offset: 0, color: 'rgba(102, 126, 234, 0.5)' },
                    { offset: 1, color: 'rgba(102, 126, 234, 0.1)' }
                ])
            },
            itemStyle: { color: '#667eea' }
        }]
    };
    
    monthlyChart.setOption(option);
}

// 更新飞行员分布图
function updatePilotChart(reports) {
    const pilotData = {};
    reports.forEach(r => {
        if (r.pilot) {
            pilotData[r.pilot] = (pilotData[r.pilot] || 0) + 1;
        }
    });
    
    const data = Object.entries(pilotData)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value);
    
    const option = {
        tooltip: { trigger: 'item', formatter: '{b}: {c}次 ({d}%)' },
        series: [{
            type: 'pie',
            radius: ['40%', '70%'],
            avoidLabelOverlap: false,
            itemStyle: {
                borderRadius: 10,
                borderColor: '#fff',
                borderWidth: 2
            },
            label: { show: true, formatter: '{b}\n{c}次' },
            data: data
        }]
    };
    
    pilotChart.setOption(option);
}

// 更新区域分布图
function updateAreaChart(reports) {
    const areaData = {};
    reports.forEach(r => {
        if (r.area) {
            areaData[r.area] = (areaData[r.area] || 0) + 1;
        }
    });
    
    const data = Object.entries(areaData)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 10); // 只显示前10
    
    const option = {
        tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
        xAxis: { type: 'value', name: '次数' },
        yAxis: {
            type: 'category',
            data: data.map(d => d.name).reverse(),
            axisLabel: { width: 100, overflow: 'truncate' }
        },
        series: [{
            type: 'bar',
            data: data.map(d => d.value).reverse(),
            itemStyle: {
                color: new echarts.graphic.LinearGradient(1, 0, 0, 0, [
                    { offset: 0, color: '#764ba2' },
                    { offset: 1, color: '#667eea' }
                ])
            }
        }]
    };
    
    areaChart.setOption(option);
}

// 更新状态统计图
function updateStatusChart(reports) {
    const statusData = { '正常': 0, '发现异常': 0, '其他': 0 };
    reports.forEach(r => {
        if (r.patrolStatus) {
            statusData[r.patrolStatus] = (statusData[r.patrolStatus] || 0) + 1;
        }
    });
    
    const option = {
        tooltip: { trigger: 'item' },
        legend: { bottom: 0 },
        series: [{
            type: 'pie',
            radius: '60%',
            data: [
                { value: statusData['正常'], name: '正常', itemStyle: { color: '#52c41a' } },
                { value: statusData['发现异常'], name: '发现异常', itemStyle: { color: '#f5222d' } },
                { value: statusData['其他'], name: '其他', itemStyle: { color: '#faad14' } }
            ],
            label: { formatter: '{b}: {c}' }
        }]
    };
    
    statusChart.setOption(option);
}

// 更新数据表格
function updateDataTable(reports) {
    const tbody = document.getElementById('dataTableBody');
    
    if (reports.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;color:#999;">暂无数据</td></tr>';
        return;
    }
    
    tbody.innerHTML = reports.slice(0, 50).map(r => {
        const statusClass = r.patrolStatus === '正常' ? 'status-normal' : 
                           r.patrolStatus === '发现异常' ? 'status-abnormal' : 'status-other';
        return `
            <tr>
                <td>${r.date}</td>
                <td>${r.pilot || '-'}</td>
                <td>${r.area || '-'}</td>
                <td>${r.startTime || '-'}-${r.endTime || '-'}</td>
                <td>${r.duration || '-'}</td>
                <td><span class="status-badge ${statusClass}">${r.patrolStatus || '-'}</span></td>
                <td><button class="btn-view" onclick="viewReportDetail(${r.id})">查看</button></td>
            </tr>
        `;
    }).join('');
}

// 导出看板PDF
function exportDashboardPDF() {
    const element = document.querySelector('main');
    
    const opt = {
        margin: 10,
        filename: `飞行日报统计报表_${new Date().toLocaleDateString()}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' }
    };
    
    html2pdf().set(opt).from(element).save();
}

// 导出JSON数据
function exportDataJson() {
    const reports = getFilteredReports();
    const dataStr = JSON.stringify(reports, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `飞行日报数据_${new Date().toLocaleDateString()}.json`;
    a.click();
    
    URL.revokeObjectURL(url);
}

// 查看报告详情
function viewReportDetail(id) {
    // 跳转到录入页面并加载数据
    localStorage.setItem('viewReportId', id);
    window.location.href = 'index.html';
}