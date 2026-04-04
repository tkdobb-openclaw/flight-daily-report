// 飞行日报录入系统主脚本

// 数据存储键名
const STORAGE_KEY = 'flightDailyReports';

// 初始化
document.addEventListener('DOMContentLoaded', function() {
    // 设置默认日期为今天
    document.getElementById('date').valueAsDate = new Date();
    
    // 绑定事件
    bindEvents();
    
    // 加载最近报告
    loadRecentReports();
});

function bindEvents() {
    // 表单提交
    document.getElementById('dailyReportForm').addEventListener('submit', handleSubmit);
    
    // 时间变化时自动计算时长
    document.getElementById('startTime').addEventListener('change', calculateDuration);
    document.getElementById('endTime').addEventListener('change', calculateDuration);
    
    // 图片预览
    document.getElementById('trackImage').addEventListener('change', handleImagePreview);
    
    // 导出PDF
    document.getElementById('exportBtn').addEventListener('click', exportCurrentPDF);
    
    // 删除图片
    document.getElementById('deleteImageBtn').addEventListener('click', deleteImage);
}

// 计算飞行时长
function calculateDuration() {
    const startTime = document.getElementById('startTime').value;
    const endTime = document.getElementById('endTime').value;
    
    if (startTime && endTime) {
        const start = new Date(`2000-01-01T${startTime}`);
        const end = new Date(`2000-01-01T${endTime}`);
        
        let diff = (end - start) / 1000 / 60; // 分钟
        
        if (diff < 0) {
            diff += 24 * 60; // 跨天
        }
        
        const hours = Math.floor(diff / 60);
        const minutes = Math.floor(diff % 60);
        
        document.getElementById('duration').value = `${hours}小时${minutes}分钟`;
    }
}

// 图片预览
function handleImagePreview(e) {
    const file = e.target.files[0];
    const preview = document.getElementById('imagePreview');
    const deleteBtn = document.getElementById('deleteImageBtn');
    
    if (file) {
        const reader = new FileReader();
        reader.onload = function(event) {
            preview.innerHTML = `<img src="${event.target.result}" alt="轨迹预览">`;
            deleteBtn.style.display = 'inline-block';
        };
        reader.readAsDataURL(file);
    } else {
        preview.innerHTML = '';
        deleteBtn.style.display = 'none';
    }
}

// 删除图片
function deleteImage() {
    document.getElementById('trackImage').value = '';
    document.getElementById('imagePreview').innerHTML = '';
    document.getElementById('deleteImageBtn').style.display = 'none';
}

// 提交表单
function handleSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const report = {
        id: Date.now(),
        date: formData.get('date'),
        company: formData.get('company'),
        pilot: formData.get('pilot'),
        aircraft: formData.get('aircraft'),
        area: formData.get('area'),
        startTime: formData.get('startTime'),
        endTime: formData.get('endTime'),
        duration: formData.get('duration'),
        patrolStatus: formData.get('patrolStatus'),
        patrolDetail: formData.get('patrolDetail'),
        handleStatus: formData.get('handleStatus'),
        handleDetail: formData.get('handleDetail'),
        remarks: formData.get('remarks'),
        trackImage: document.getElementById('imagePreview').querySelector('img')?.src || null,
        createdAt: new Date().toISOString()
    };
    
    // 保存到 localStorage
    saveReport(report);
    
    // 提示成功
    alert('✅ 日报保存成功！');
    
    // 刷新最近报告列表
    loadRecentReports();
    
    // 重置表单（保留日期）
    const currentDate = document.getElementById('date').value;
    e.target.reset();
    document.getElementById('date').value = currentDate;
    document.getElementById('company').value = '朝阳通航（太湖）';
    document.getElementById('imagePreview').innerHTML = '';
    document.getElementById('deleteImageBtn').style.display = 'none';
}

// 保存报告
function saveReport(report) {
    let reports = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    reports.unshift(report); // 新报告放前面
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reports));
}

// 加载最近报告
function loadRecentReports() {
    const reports = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    const container = document.getElementById('reportsList');
    
    if (reports.length === 0) {
        container.innerHTML = '<p style="color: #999; text-align: center;">暂无日报记录</p>';
        return;
    }
    
    // 只显示最近5条
    container.innerHTML = reports.slice(0, 5).map(report => `
        <div class="report-card">
            <div class="report-info">
                <h4>${report.date} - ${report.pilot}</h4>
                <p>${report.area} | ${report.startTime}-${report.endTime} | ${report.patrolStatus}</p>
            </div>
            <div class="report-actions">
                <button class="btn-view" onclick="viewReport(${report.id})">查看</button>
                <button class="btn-delete" onclick="deleteReport(${report.id})">删除</button>
            </div>
        </div>
    `).join('');
}

// 查看报告
function viewReport(id) {
    const reports = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    const report = reports.find(r => r.id === id);
    
    if (!report) return;
    
    // 填充表单
    document.getElementById('date').value = report.date;
    document.getElementById('company').value = report.company;
    document.getElementById('pilot').value = report.pilot;
    document.getElementById('aircraft').value = report.aircraft;
    document.getElementById('area').value = report.area;
    document.getElementById('startTime').value = report.startTime;
    document.getElementById('endTime').value = report.endTime;
    document.getElementById('duration').value = report.duration;
    document.getElementById('patrolStatus').value = report.patrolStatus;
    document.getElementById('patrolDetail').value = report.patrolDetail;
    document.getElementById('handleStatus').value = report.handleStatus;
    document.getElementById('handleDetail').value = report.handleDetail || '';
    document.getElementById('remarks').value = report.remarks || '';
    
    if (report.trackImage) {
        document.getElementById('imagePreview').innerHTML = `<img src="${report.trackImage}" alt="轨迹图">`;
        document.getElementById('deleteImageBtn').style.display = 'inline-block';
    } else {
        document.getElementById('imagePreview').innerHTML = '';
        document.getElementById('deleteImageBtn').style.display = 'none';
    }
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// 删除报告
function deleteReport(id) {
    if (!confirm('确定要删除这条日报吗？')) return;
    
    let reports = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    reports = reports.filter(r => r.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reports));
    
    loadRecentReports();
}

// 导出当前表单为PDF
function exportCurrentPDF() {
    const element = document.getElementById('dailyReportForm');
    
    if (!document.getElementById('date').value) {
        alert('请先填写表单再导出');
        return;
    }
    
    const date = document.getElementById('date').value;
    const pilot = document.getElementById('pilot').value;
    
    // 克隆表单用于PDF导出（避免影响原页面）
    const clone = element.cloneNode(true);
    clone.style.width = '210mm';
    clone.style.padding = '10mm';
    clone.style.background = 'white';
    clone.style.position = 'absolute';
    clone.style.left = '-9999px';
    clone.style.top = '0';
    document.body.appendChild(clone);
    
    // 隐藏按钮
    const buttons = clone.querySelectorAll('button, .recent-reports, nav');
    buttons.forEach(btn => btn.style.display = 'none');
    
    const opt = {
        margin: 0,
        filename: `飞行日报_${date}_${pilot || '未命名'}.pdf`,
        image: { type: 'jpeg', quality: 0.95 },
        html2canvas: { 
            scale: 2,
            useCORS: true,
            scrollY: 0,
            scrollX: 0,
            windowWidth: clone.scrollWidth,
            windowHeight: clone.scrollHeight
        },
        jsPDF: { 
            unit: 'mm', 
            format: 'a4', 
            orientation: 'portrait'
        }
    };
    
    html2pdf().set(opt).from(clone).save().then(() => {
        document.body.removeChild(clone);
    });
}