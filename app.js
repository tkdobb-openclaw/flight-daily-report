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
async function exportCurrentPDF() {
    if (!document.getElementById('date').value) {
        alert('请先填写表单再导出');
        return;
    }
    
    const date = document.getElementById('date').value;
    const pilot = document.getElementById('pilot').value;
    
    // 创建打印友好的容器
    const printContainer = document.createElement('div');
    printContainer.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        width: 210mm;
        min-height: 297mm;
        background: white;
        padding: 15mm;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        color: #333;
        z-index: -9999;
        opacity: 0;
        pointer-events: none;
    `;
    
    // 获取表单数据
    const formData = {
        date: document.getElementById('date').value,
        company: document.getElementById('company').value,
        pilot: document.getElementById('pilot').value,
        aircraft: document.getElementById('aircraft').value,
        area: document.getElementById('area').value,
        startTime: document.getElementById('startTime').value,
        endTime: document.getElementById('endTime').value,
        duration: document.getElementById('duration').value,
        patrolStatus: document.getElementById('patrolStatus').value,
        patrolDetail: document.getElementById('patrolDetail').value,
        handleStatus: document.getElementById('handleStatus').value,
        handleDetail: document.getElementById('handleDetail').value,
        remarks: document.getElementById('remarks').value,
        trackImage: document.getElementById('imagePreview').querySelector('img')?.src || null
    };
    
    const statusColor = formData.patrolStatus === '正常' ? '#52c41a' : 
                        formData.patrolStatus === '发现异常' ? '#f5222d' : '#faad14';
    
    // 构建PDF内容
    printContainer.innerHTML = `
        <div style="text-align: center; margin-bottom: 30px; border-bottom: 3px solid #667eea; padding-bottom: 15px;">
            <h1 style="font-size: 28px; margin: 0 0 10px 0; color: #333;">🚁 飞行巡查日报</h1>
            <p style="color: #666; margin: 0; font-size: 14px;">${formData.company}</p>
        </div>
        
        <div style="margin-bottom: 20px;">
            <table style="width: 100%; border-collapse: collapse;">
                <tr style="background: #f8f9fa;">
                    <td style="padding: 12px; border: 1px solid #ddd; width: 25%; font-weight: bold;">日期</td>
                    <td style="padding: 12px; border: 1px solid #ddd; width: 25%;">${formData.date}</td>
                    <td style="padding: 12px; border: 1px solid #ddd; width: 25%; font-weight: bold;">飞行员</td>
                    <td style="padding: 12px; border: 1px solid #ddd; width: 25%;">${formData.pilot || '-'}</td>
                </tr>
                <tr>
                    <td style="padding: 12px; border: 1px solid #ddd; font-weight: bold;">航空器登记号</td>
                    <td style="padding: 12px; border: 1px solid #ddd;">${formData.aircraft || '-'}</td>
                    <td style="padding: 12px; border: 1px solid #ddd; font-weight: bold;">巡查区域</td>
                    <td style="padding: 12px; border: 1px solid #ddd;">${formData.area || '-'}</td>
                </tr>
                <tr style="background: #f8f9fa;">
                    <td style="padding: 12px; border: 1px solid #ddd; font-weight: bold;">作业时间</td>
                    <td style="padding: 12px; border: 1px solid #ddd;">${formData.startTime || '-'} ~ ${formData.endTime || '-'}</td>
                    <td style="padding: 12px; border: 1px solid #ddd; font-weight: bold;">飞行时长</td>
                    <td style="padding: 12px; border: 1px solid #ddd;">${formData.duration || '-'}</td>
                </tr>
                <tr>
                    <td style="padding: 12px; border: 1px solid #ddd; font-weight: bold;">巡查状态</td>
                    <td colspan="3" style="padding: 12px; border: 1px solid #ddd;">
                        <span style="display: inline-block; padding: 4px 12px; border-radius: 4px; background: ${statusColor}; color: white; font-weight: bold;">${formData.patrolStatus || '-'}</span>
                    </td>
                </tr>
            </table>
        </div>
        
        <div style="margin-bottom: 20px;">
            <h3 style="color: #667eea; border-left: 4px solid #667eea; padding-left: 10px; margin: 0 0 10px 0;">巡查详情</h3>
            <div style="padding: 15px; background: #f8f9fa; border-radius: 8px; min-height: 60px;">
                ${formData.patrolDetail || '无'}
            </div>
        </div>
        
        <div style="margin-bottom: 20px;">
            <h3 style="color: #667eea; border-left: 4px solid #667eea; padding-left: 10px; margin: 0 0 10px 0;">处置情况</h3>
            <div style="padding: 15px; background: #f8f9fa; border-radius: 8px;">
                <strong>状态：</strong>${formData.handleStatus || '无需处置'}<br>
                <strong>详情：</strong>${formData.handleDetail || '无'}
            </div>
        </div>
        
        ${formData.trackImage ? `
        <div style="margin-bottom: 20px;">
            <h3 style="color: #667eea; border-left: 4px solid #667eea; padding-left: 10px; margin: 0 0 10px 0;">巡查轨迹</h3>
            <div style="text-align: center;">
                <img src="${formData.trackImage}" style="max-width: 100%; max-height: 300px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
            </div>
        </div>
        ` : ''}
        
        ${formData.remarks ? `
        <div style="margin-bottom: 20px;">
            <h3 style="color: #667eea; border-left: 4px solid #667eea; padding-left: 10px; margin: 0 0 10px 0;">备注</h3>
            <div style="padding: 15px; background: #f8f9fa; border-radius: 8px;">
                ${formData.remarks}
            </div>
        </div>
        ` : ''}
        
        <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; color: #999; font-size: 12px; text-align: center;">
            生成时间：${new Date().toLocaleString()}
        </div>
    `;
    
    document.body.appendChild(printContainer);
    
    // 等待图片加载
    if (formData.trackImage) {
        await new Promise(resolve => {
            const img = printContainer.querySelector('img');
            if (img) {
                img.onload = resolve;
                img.onerror = resolve;
                setTimeout(resolve, 1000);
            } else {
                resolve();
            }
        });
    }
    
    const opt = {
        margin: 0,
        filename: `飞行日报_${date}_${pilot || '未命名'}.pdf`,
        image: { type: 'jpeg', quality: 0.95 },
        html2canvas: { 
            scale: 2,
            useCORS: true,
            scrollY: 0,
            scrollX: 0,
            windowWidth: printContainer.scrollWidth,
            windowHeight: printContainer.scrollHeight,
            logging: false
        },
        jsPDF: { 
            unit: 'mm', 
            format: 'a4', 
            orientation: 'portrait'
        }
    };
    
    try {
        await html2pdf().set(opt).from(printContainer).save();
    } catch (error) {
        console.error('PDF导出失败:', error);
        alert('PDF导出失败，请重试');
    } finally {
        document.body.removeChild(printContainer);
    }
}