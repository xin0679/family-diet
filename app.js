// 家庭记账应用 - 摆摊收支管理系统（Supabase 云端版）

// ==================== 配置 ====================
const CONFIG = {
    FAMILY_PASSWORD: '550022',
    SUPABASE_URL: 'https://hixhjmgiylnefjvcwndd.supabase.co',
    SUPABASE_KEY: 'sb_publishable_qPxKlBoLIn9o5Simphl0IA_wdBNL0WL'
};

// ==================== 全局状态 ====================
let currentUser = null;
let currentView = 'daily';
let records = [];
let supabase = null;

// ==================== 初始化 ====================
document.addEventListener('DOMContentLoaded', async function() {
    // 设置今天的日期为默认值
    const dateInput = document.getElementById('recordDate');
    if (dateInput) {
        dateInput.valueAsDate = new Date();
    }
    
    // 初始化 Supabase 客户端（带错误处理）
    try {
        console.log('检查 Supabase 库...', typeof window.supabase);
        if (typeof window.supabase !== 'undefined' && window.supabase.createClient) {
            supabase = window.supabase.createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_KEY);
            console.log('Supabase 初始化成功');
        } else {
            console.warn('Supabase 库未正确加载，将使用本地存储模式');
            supabase = null;
        }
    } catch (err) {
        console.error('Supabase 初始化失败:', err);
        supabase = null;
    }
    
    // 检查本地存储的登录状态
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        currentUser = savedUser;
        await showMainApp();
    }
});

// ==================== 用户认证 ====================
function selectUser(user) {
    console.log('选择用户:', user);
    currentUser = user;
    
    // 更新UI
    document.querySelectorAll('.user-btn').forEach(btn => {
        btn.classList.remove('border-purple-500', 'bg-purple-50');
        btn.classList.add('border-gray-200');
    });
    
    const selectedBtn = user === 'husband' ? document.getElementById('btnHusband') : document.getElementById('btnWife');
    if (selectedBtn) {
        selectedBtn.classList.remove('border-gray-200');
        selectedBtn.classList.add('border-purple-500', 'bg-purple-50');
    }
}

async function login() {
    console.log('点击登录按钮');
    const passwordInput = document.getElementById('passwordInput');
    const errorMsg = document.getElementById('loginError');
    
    if (!passwordInput || !errorMsg) {
        console.error('找不到必要的DOM元素');
        return;
    }
    
    const password = passwordInput.value;
    console.log('当前选择用户:', currentUser);
    
    if (!currentUser) {
        errorMsg.textContent = '请先选择用户';
        errorMsg.classList.remove('hidden');
        return;
    }
    
    if (password === CONFIG.FAMILY_PASSWORD) {
        localStorage.setItem('currentUser', currentUser);
        errorMsg.classList.add('hidden');
        await showMainApp();
    } else {
        errorMsg.textContent = '密码错误，请重试';
        errorMsg.classList.remove('hidden');
    }
}

function logout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    document.getElementById('loginPage').classList.remove('hidden');
    document.getElementById('mainApp').classList.add('hidden');
    document.getElementById('passwordInput').value = '';
}

async function showMainApp() {
    document.getElementById('loginPage').classList.add('hidden');
    document.getElementById('mainApp').classList.remove('hidden');
    
    // 设置用户信息
    const userName = currentUser === 'husband' ? '老公' : '老婆';
    const userIcon = currentUser === 'husband' ? 'fa-user' : 'fa-user';
    const userColor = currentUser === 'husband' ? 'text-blue-500' : 'text-pink-500';
    
    document.getElementById('userName').textContent = userName;
    document.getElementById('userIcon').className = `fas ${userIcon} ${userColor}`;
    
    // 加载数据
    await loadRecords();
}

// ==================== 数据管理（Supabase）====================
async function loadRecords() {
    // 如果 Supabase 未初始化，直接加载本地数据
    if (!supabase) {
        console.log('Supabase 未初始化，使用本地存储模式');
        loadFromLocal();
        return;
    }
    
    try {
        showToast('正在同步数据...');
        
        const { data, error } = await supabase
            .from('records')
            .select('*')
            .order('date', { ascending: false });
        
        if (error) {
            console.error('加载数据失败:', error);
            showToast('数据同步失败，使用本地数据');
            // 失败时尝试从本地加载
            loadFromLocal();
            return;
        }
        
        // 转换数据格式
        records = data.map(r => ({
            id: r.id,
            user: r.user_id,
            date: r.date,
            alipay: parseFloat(r.alipay) || 0,
            wechat: parseFloat(r.wechat) || 0,
            cash: parseFloat(r.cash) || 0,
            expense: parseFloat(r.expense) || 0,
            remark: r.remark || '',
            createdAt: r.created_at
        }));
        
        // 同时保存到本地作为备份
        localStorage.setItem('familyRecords', JSON.stringify(records));
        
        updateUI();
        showToast('数据同步成功！');
    } catch (err) {
        console.error('加载数据异常:', err);
        loadFromLocal();
    }
}

function loadFromLocal() {
    const savedRecords = localStorage.getItem('familyRecords');
    if (savedRecords) {
        records = JSON.parse(savedRecords);
        records = records.map(r => ({
            ...r,
            alipay: parseFloat(r.alipay) || 0,
            wechat: parseFloat(r.wechat) || 0,
            cash: parseFloat(r.cash) || 0,
            expense: parseFloat(r.expense) || 0
        }));
        updateUI();
    }
}

function saveToLocal(record) {
    // 转换记录格式以兼容本地存储
    const localRecord = {
        id: Date.now(),
        user: record.user_id,
        date: record.date,
        alipay: record.alipay,
        wechat: record.wechat,
        cash: record.cash,
        expense: record.expense,
        remark: record.remark,
        createdAt: new Date().toISOString()
    };
    
    // 检查是否已有同日期记录
    const existingIndex = records.findIndex(r => r.date === record.date && r.user === record.user_id);
    if (existingIndex >= 0) {
        records[existingIndex] = localRecord;
    } else {
        records.push(localRecord);
    }
    
    // 保存到 localStorage
    localStorage.setItem('familyRecords', JSON.stringify(records));
    
    hideAddModal();
    updateUI();
    showToast('保存成功（本地模式）！');
    
    // 重置表单
    document.getElementById('recordForm').reset();
    document.getElementById('recordDate').valueAsDate = new Date();
}

async function saveRecord(event) {
    event.preventDefault();
    
    const record = {
        user_id: currentUser,
        date: document.getElementById('recordDate').value,
        alipay: parseFloat(document.getElementById('alipayIncome').value) || 0,
        wechat: parseFloat(document.getElementById('wechatIncome').value) || 0,
        cash: parseFloat(document.getElementById('cashIncome').value) || 0,
        expense: parseFloat(document.getElementById('expense').value) || 0,
        remark: document.getElementById('remark').value || ''
    };
    
    // 如果 Supabase 未初始化，使用本地存储
    if (!supabase) {
        saveToLocal(record);
        return;
    }
    
    try {
        showToast('正在保存...');
        
        // 检查是否已有同日期记录
        const { data: existingData, error: checkError } = await supabase
            .from('records')
            .select('id')
            .eq('date', record.date)
            .eq('user_id', currentUser);
        
        if (checkError) throw checkError;
        
        let result;
        if (existingData && existingData.length > 0) {
            // 更新现有记录
            result = await supabase
                .from('records')
                .update(record)
                .eq('id', existingData[0].id);
        } else {
            // 插入新记录
            result = await supabase
                .from('records')
                .insert([record]);
        }
        
        if (result.error) throw result.error;
        
        hideAddModal();
        await loadRecords();
        showToast('保存成功！');
        
        // 重置表单
        document.getElementById('recordForm').reset();
        document.getElementById('recordDate').valueAsDate = new Date();
        
    } catch (err) {
        console.error('保存失败:', err);
        showToast('保存失败，请重试');
    }
}

async function deleteRecord(id) {
    if (!confirm('确定要删除这条记录吗？')) return;
    
    // 如果 Supabase 未初始化，使用本地存储删除
    if (!supabase) {
        records = records.filter(r => r.id !== id);
        localStorage.setItem('familyRecords', JSON.stringify(records));
        updateUI();
        showToast('删除成功');
        return;
    }
    
    try {
        showToast('正在删除...');
        
        const { error } = await supabase
            .from('records')
            .delete()
            .eq('id', id);
        
        if (error) throw error;
        
        await loadRecords();
        showToast('删除成功');
    } catch (err) {
        console.error('删除失败:', err);
        showToast('删除失败，请重试');
    }
}

// ==================== UI 更新 ====================
function updateUI() {
    updateTodayStats();
    renderRecordsList();
    renderWeeklyStats();
    renderMonthlyStats();
    updateFamilyOverview();
}

function updateTodayStats() {
    const today = new Date().toISOString().split('T')[0];
    const todayRecords = records.filter(r => r.date === today);
    
    let totalIncome = 0;
    let totalExpense = 0;
    
    todayRecords.forEach(r => {
        totalIncome += r.alipay + r.wechat + r.cash;
        totalExpense += r.expense;
    });
    
    const profit = totalIncome - totalExpense;
    
    document.getElementById('todayIncome').textContent = `¥${totalIncome.toFixed(2)}`;
    document.getElementById('todayExpense').textContent = `¥${totalExpense.toFixed(2)}`;
    document.getElementById('todayProfit').textContent = `${profit >= 0 ? '+' : ''}¥${profit.toFixed(2)}`;
    document.getElementById('todayProfit').className = `text-lg font-bold ${profit >= 0 ? 'text-white' : 'text-red-200'}`;
}

function renderRecordsList() {
    const container = document.getElementById('recordsList');
    
    // 按日期降序排列
    const sortedRecords = [...records].sort((a, b) => new Date(b.date) - new Date(a.date));
    
    if (sortedRecords.length === 0) {
        container.innerHTML = `
            <div class="text-center py-8 text-gray-400">
                <i class="fas fa-clipboard-list text-4xl mb-3"></i>
                <p>还没有记录，点击上方按钮添加</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = sortedRecords.map(record => {
        const totalIncome = record.alipay + record.wechat + record.cash;
        const profit = totalIncome - record.expense;
        const userName = record.user === 'husband' ? '老公' : '老婆';
        const userColor = record.user === 'husband' ? 'bg-blue-100 text-blue-600' : 'bg-pink-100 text-pink-600';
        
        return `
            <div class="record-item bg-gray-50 p-4 rounded-xl">
                <div class="flex justify-between items-start mb-2">
                    <div class="flex items-center space-x-2">
                        <span class="text-sm font-medium text-gray-800">${record.date}</span>
                        <span class="text-xs px-2 py-1 rounded-full ${userColor}">${userName}</span>
                    </div>
                    <button onclick="deleteRecord(${record.id})" class="text-gray-400 hover:text-red-500">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </div>
                <div class="grid grid-cols-4 gap-2 text-sm mb-2">
                    ${record.alipay > 0 ? `<div class="text-green-600">支付宝 ¥${record.alipay}</div>` : ''}
                    ${record.wechat > 0 ? `<div class="text-green-600">微信 ¥${record.wechat}</div>` : ''}
                    ${record.cash > 0 ? `<div class="text-green-600">现金 ¥${record.cash}</div>` : ''}
                    ${record.expense > 0 ? `<div class="text-red-500">支出 ¥${record.expense}</div>` : ''}
                </div>
                <div class="flex justify-between items-center">
                    <div class="text-xs text-gray-500">${record.remark || ''}</div>
                    <div class="font-bold ${profit >= 0 ? 'text-green-600' : 'text-red-500'}">
                        ${profit >= 0 ? '+' : ''}¥${profit.toFixed(2)}
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function renderWeeklyStats() {
    const container = document.getElementById('weeklyStats');
    
    // 获取本周数据
    const weekData = getWeekData();
    
    if (weekData.length === 0) {
        container.innerHTML = '<p class="text-center text-gray-400 py-4">本周暂无数据</p>';
        return;
    }
    
    let totalIncome = 0;
    let totalExpense = 0;
    
    const dayNames = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    
    container.innerHTML = weekData.map(day => {
        totalIncome += day.income;
        totalExpense += day.expense;
        const profit = day.income - day.expense;
        const dayName = dayNames[new Date(day.date).getDay()];
        
        return `
            <div class="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                <div>
                    <p class="font-medium text-gray-800">${dayName} ${day.date.slice(5)}</p>
                    <p class="text-xs text-gray-500">收:¥${day.income.toFixed(0)} 支:¥${day.expense.toFixed(0)}</p>
                </div>
                <div class="font-bold ${profit >= 0 ? 'text-green-600' : 'text-red-500'}">
                    ${profit >= 0 ? '+' : ''}¥${profit.toFixed(0)}
                </div>
            </div>
        `;
    }).join('') + `
        <div class="mt-4 p-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl text-white">
            <div class="flex justify-between mb-2">
                <span>本周总收入</span>
                <span class="font-bold">¥${totalIncome.toFixed(2)}</span>
            </div>
            <div class="flex justify-between mb-2">
                <span>本周总支出</span>
                <span class="font-bold">¥${totalExpense.toFixed(2)}</span>
            </div>
            <div class="flex justify-between pt-2 border-t border-white/30">
                <span>本周盈亏</span>
                <span class="font-bold text-lg">${(totalIncome - totalExpense) >= 0 ? '+' : ''}¥${(totalIncome - totalExpense).toFixed(2)}</span>
            </div>
        </div>
    `;
}

function renderMonthlyStats() {
    const container = document.getElementById('monthlyStats');
    
    // 按月份分组
    const monthGroups = {};
    records.forEach(record => {
        const month = record.date.slice(0, 7); // YYYY-MM
        if (!monthGroups[month]) {
            monthGroups[month] = { income: 0, expense: 0 };
        }
        monthGroups[month].income += record.alipay + record.wechat + record.cash;
        monthGroups[month].expense += record.expense;
    });
    
    const months = Object.keys(monthGroups).sort().reverse();
    
    if (months.length === 0) {
        container.innerHTML = '<p class="text-center text-gray-400 py-4">暂无月度数据</p>';
        return;
    }
    
    container.innerHTML = months.map(month => {
        const data = monthGroups[month];
        const profit = data.income - data.expense;
        const [year, monthNum] = month.split('-');
        
        return `
            <div class="p-4 bg-gray-50 rounded-xl">
                <div class="flex justify-between items-center mb-3">
                    <h4 class="font-bold text-gray-800">${year}年${monthNum}月</h4>
                    <span class="font-bold text-lg ${profit >= 0 ? 'text-green-600' : 'text-red-500'}">
                        ${profit >= 0 ? '+' : ''}¥${profit.toFixed(0)}
                    </span>
                </div>
                <div class="grid grid-cols-2 gap-4">
                    <div class="text-center p-2 bg-green-50 rounded-lg">
                        <p class="text-xs text-green-600 mb-1">收入</p>
                        <p class="font-bold text-green-700">¥${data.income.toFixed(0)}</p>
                    </div>
                    <div class="text-center p-2 bg-red-50 rounded-lg">
                        <p class="text-xs text-red-600 mb-1">支出</p>
                        <p class="font-bold text-red-700">¥${data.expense.toFixed(0)}</p>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function updateFamilyOverview() {
    let totalIncome = 0;
    let totalExpense = 0;
    
    records.forEach(r => {
        totalIncome += r.alipay + r.wechat + r.cash;
        totalExpense += r.expense;
    });
    
    const profit = totalIncome - totalExpense;
    
    document.getElementById('familyIncome').textContent = `¥${totalIncome.toFixed(2)}`;
    document.getElementById('familyExpense').textContent = `¥${totalExpense.toFixed(2)}`;
    document.getElementById('familyProfit').textContent = `${profit >= 0 ? '+' : ''}¥${profit.toFixed(2)}`;
}

// ==================== 辅助函数 ====================
function getWeekData() {
    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());
    weekStart.setHours(0, 0, 0, 0);
    
    const weekData = [];
    
    for (let i = 0; i < 7; i++) {
        const date = new Date(weekStart);
        date.setDate(weekStart.getDate() + i);
        const dateStr = date.toISOString().split('T')[0];
        
        const dayRecords = records.filter(r => r.date === dateStr);
        let income = 0;
        let expense = 0;
        
        dayRecords.forEach(r => {
            income += r.alipay + r.wechat + r.cash;
            expense += r.expense;
        });
        
        weekData.push({ date: dateStr, income, expense });
    }
    
    return weekData;
}

// ==================== 视图切换 ====================
function switchView(view) {
    currentView = view;
    
    // 更新标签样式
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
        btn.classList.add('text-gray-600');
    });
    document.getElementById(`tab${view.charAt(0).toUpperCase() + view.slice(1)}`).classList.add('active');
    document.getElementById(`tab${view.charAt(0).toUpperCase() + view.slice(1)}`).classList.remove('text-gray-600');
    
    // 显示对应视图
    document.querySelectorAll('.view-section').forEach(section => {
        section.classList.add('hidden');
    });
    document.getElementById(`${view}View`).classList.remove('hidden');
}

// ==================== 弹窗控制 ====================
function showAddModal() {
    const modal = document.getElementById('addModal');
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    
    // 检查今天是否已有记录，有则填充
    const today = new Date().toISOString().split('T')[0];
    const existingRecord = records.find(r => r.date === today && r.user === currentUser);
    
    if (existingRecord) {
        document.getElementById('alipayIncome').value = existingRecord.alipay || '';
        document.getElementById('wechatIncome').value = existingRecord.wechat || '';
        document.getElementById('cashIncome').value = existingRecord.cash || '';
        document.getElementById('expense').value = existingRecord.expense || '';
        document.getElementById('remark').value = existingRecord.remark || '';
    }
}

function hideAddModal() {
    const modal = document.getElementById('addModal');
    modal.classList.add('hidden');
    modal.classList.remove('flex');
}

// ==================== Excel 导出 ====================
function exportToExcel() {
    // 准备数据
    const exportData = records.map(r => ({
        '日期': r.date,
        '记录人': r.user === 'husband' ? '老公' : '老婆',
        '支付宝收入': r.alipay,
        '微信收入': r.wechat,
        '现金收入': r.cash,
        '总收入': r.alipay + r.wechat + r.cash,
        '支出': r.expense,
        '盈亏': (r.alipay + r.wechat + r.cash) - r.expense,
        '备注': r.remark
    }));
    
    // 创建工作簿
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(exportData);
    
    // 设置列宽
    ws['!cols'] = [
        { wch: 12 },
        { wch: 8 },
        { wch: 12 },
        { wch: 12 },
        { wch: 12 },
        { wch: 12 },
        { wch: 12 },
        { wch: 12 },
        { wch: 20 }
    ];
    
    XLSX.utils.book_append_sheet(wb, ws, '收支记录');
    
    // 下载文件
    const today = new Date().toISOString().split('T')[0];
    XLSX.writeFile(wb, `家庭记账_${today}.xlsx`);
    
    showToast('Excel导出成功！');
}

// ==================== 提示消息 ====================
function showToast(message) {
    // 移除现有toast
    const existingToast = document.querySelector('.toast-message');
    if (existingToast) existingToast.remove();
    
    const toast = document.createElement('div');
    toast.className = 'toast-message fixed top-4 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-6 py-3 rounded-full shadow-lg z-50';
    toast.style.animation = 'slideDown 0.3s ease';
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transition = 'opacity 0.3s';
        setTimeout(() => toast.remove(), 300);
    }, 2000);
}

// 点击模态框外部关闭
document.getElementById('addModal').addEventListener('click', function(e) {
    if (e.target === this) {
        hideAddModal();
    }
});

// 添加CSS动画
const style = document.createElement('style');
style.textContent = `
    @keyframes slideDown {
        from { transform: translate(-50%, -100%); opacity: 0; }
        to { transform: translate(-50%, 0); opacity: 1; }
    }
`;
document.head.appendChild(style);