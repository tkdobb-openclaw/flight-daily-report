# 🚁 飞行日报管理系统

朝阳通航太湖巡查飞行日报录入、统计与PDF导出系统。

## ✨ 功能特性

- ✅ **数据录入** - 完整的飞行日报表单
- ✅ **图片上传** - 巡查轨迹图片预览
- ✅ **自动计算** - 根据起止时间自动计算飞行时长
- ✅ **数据看板** - 可视化统计图表（月度趋势、飞行员分布、区域分布、状态统计）
- ✅ **筛选功能** - 支持按年份、月份筛选数据
- ✅ **PDF导出** - 单条日报导出 + 全部报表导出
- ✅ **数据导出** - JSON格式数据备份
- ✅ **响应式设计** - 支持PC、Mac、iOS等全平台

## 📁 文件结构

```
flight-daily-report/
├── index.html      # 日报录入页面
├── dashboard.html  # 统计看板页面
├── style.css       # 样式文件
├── app.js          # 录入功能脚本
├── dashboard.js    # 看板统计脚本
└── README.md       # 说明文档
```

## 🚀 使用说明

### 本地使用
1. 直接用浏览器打开 `index.html` 文件
2. 填写日报信息并保存
3. 打开 `dashboard.html` 查看统计数据

### 部署到 GitHub Pages

1. **创建 GitHub 仓库**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/你的用户名/flight-daily-report.git
   git push -u origin main
   ```

2. **开启 GitHub Pages**
   - 进入 GitHub 仓库 → Settings → Pages
   - Source 选择 "Deploy from a branch"
   - Branch 选择 "main"，文件夹选 "/ (root)"
   - 保存后等待几分钟，访问 `https://你的用户名.github.io/flight-daily-report/`

### 数据同步到 GitHub

由于纯前端方案使用 localStorage 存储数据，如需云端同步：

1. 在看板页面点击 "导出数据JSON" 下载数据文件
2. 将 JSON 文件提交到 GitHub 仓库
3. 其他设备下载后导入（后续可开发导入功能）

## 📝 数据字段

| 字段 | 说明 |
|------|------|
| 日期 | 飞行日期 |
| 公司名称 | 朝阳通航（太湖） |
| 飞行员 | 飞行员姓名 |
| 航空器登记号 | 如 B-12W8 |
| 巡查区域 | 如 太湖宜兴 |
| 作业时间 | 起止时间，自动计算时长 |
| 巡查轨迹 | GPS轨迹图片 |
| 巡查情况 | 正常/发现异常/其他 |
| 处置情况 | 无需处置/已处置/待跟进 |

## 📊 看板统计

- **飞行次数** - 总飞行任务数
- **飞行时长** - 累计飞行小时数
- **飞行员数** - 参与飞行的飞行员人数
- **巡查区域** - 覆盖的巡查区域数量
- **月度趋势** - 飞行任务时间趋势图
- **飞行员分布** - 各飞行员任务占比
- **区域分布** - 巡查区域频次排行
- **状态统计** - 巡查状态分布饼图

## 🔧 技术栈

- HTML5 + CSS3
- Vanilla JavaScript
- ECharts 图表库
- html2pdf.js PDF导出
- localStorage 本地存储

## 📄 License

MIT