/**
 * 主应用模块 - Family Diet 移动端优化版
 * 适配底部标签栏导航，支持手势操作
 */

document.addEventListener('DOMContentLoaded', function() {
    'use strict';
    
    // ========== 状态管理 ==========
    let currentPage = 'home';
    let currentWeekOffset = 0;
    let currentFilter = 'all';
    let touchStartX = 0;
    let touchEndX = 0;
    
    // ========== DOM 元素 ==========
    const navItems = document.querySelectorAll('.bottom-nav .nav-item');
    const pages = document.querySelectorAll('.page');
    
    // 页面容器
    const todayMenu = document.getElementById('today-menu');
    const weekDaysPreview = document.getElementById('week-days-preview');
    const weeklyMenu = document.getElementById('weekly-menu');
    const recipesList = document.getElementById('recipes-list');
    const membersList = document.getElementById('members-list');
    const homeMembersList = document.getElementById('home-members-list');
    const healthContent = document.getElementById('health-content');
    
    // ========== 节气数据 ==========
    const solarTerms = [
        { name: '立春', date: '2月3-5日', icon: '🌱', tip: '立春时节，阳气生发，宜养肝护肝' },
        { name: '雨水', date: '2月18-20日', icon: '🌧️', tip: '雨水时节，湿气渐重，宜健脾祛湿' },
        { name: '惊蛰', date: '3月5-7日', icon: '🌩️', tip: '惊蛰时节，万物复苏，宜清淡养肝' },
        { name: '春分', date: '3月20-22日', icon: '🌸', tip: '春分时节，阴阳平衡，宜养肝健脾' },
        { name: '清明', date: '4月4-6日', icon: '🌿', tip: '清明时节，肝气旺盛，宜清肝明目' },
        { name: '谷雨', date: '4月19-21日', icon: '🌾', tip: '谷雨时节，湿气加重，宜健脾祛湿' },
        { name: '立夏', date: '5月5-7日', icon: '☀️', tip: '立夏时节，心火渐旺，宜清心降火' },
        { name: '小满', date: '5月20-22日', icon: '🌻', tip: '小满时节，湿热交加，宜清热利湿' },
        { name: '芒种', date: '6月5-7日', icon: '🌾', tip: '芒种时节，暑湿渐盛，宜清热解暑' },
        { name: '夏至', date: '6月21-22日', icon: '☀️', tip: '夏至时节，阳气最盛，宜养心安神' },
        { name: '小暑', date: '7月6-8日', icon: '🌞', tip: '小暑时节，暑热渐盛，宜清热解暑' },
        { name: '大暑', date: '7月22-24日', icon: '🔥', tip: '大暑时节，酷热难耐，宜清热生津' },
        { name: '立秋', date: '8月7-9日', icon: '🍂', tip: '立秋时节，秋燥渐起，宜滋阴润肺' },
        { name: '处暑', date: '8月22-24日', icon: '🌤️', tip: '处暑时节，暑气渐消，宜润肺养阴' },
        { name: '白露', date: '9月7-9日', icon: '💧', tip: '白露时节，秋燥明显，宜润肺防燥' },
        { name: '秋分', date: '9月22-24日', icon: '🍁', tip: '秋分时节，阴阳平衡，宜润肺养胃' },
        { name: '寒露', date: '10月8-9日', icon: '🍂', tip: '寒露时节，寒气渐重，宜温润滋补' },
        { name: '霜降', date: '10月23-24日', icon: '❄️', tip: '霜降时节，寒气加重，宜温润养肺' },
        { name: '立冬', date: '11月7-8日', icon: '❄️', tip: '立冬时节，阳气潜藏，宜补肾养阳' },
        { name: '小雪', date: '11月22-23日', icon: '⛄', tip: '小雪时节，寒邪易侵，宜温补御寒' },
        { name: '大雪', date: '12月6-8日', icon: '❄️', tip: '大雪时节，寒气最盛，宜温补助阳' },
        { name: '冬至', date: '12月21-23日', icon: '🌙', tip: '冬至时节，阴极阳生，宜进补养阳' },
        { name: '小寒', date: '1月5-7日', icon: '🧊', tip: '小寒时节，寒气袭人，宜温阳御寒' },
        { name: '大寒', date: '1月20-21日', icon: '❄️', tip: '大寒时节，寒气至极，宜温补养肾' }
    ];
    
    // ========== 初始化 ==========
    function init() {
        bindEvents();
        updateSolarTerm();
        renderHome();
        renderRecipes();
        renderMembers();
        
        // 初始化周计划页面（默认本周）
        renderWeeklyMenu();
    }
    
    // ========== 事件绑定 ==========
    function bindEvents() {
        // 底部导航切换
        navItems.forEach(item => {
            item.addEventListener('click', () => {
                const page = item.dataset.page;
                switchPage(page);
            });
        });
        
        // 页面内按钮跳转
        document.querySelectorAll('.btn-text[data-page]').forEach(btn => {
            btn.addEventListener('click', () => {
                switchPage(btn.dataset.page);
            });
        });
        
        // 添加成员
        document.getElementById('add-member-btn').addEventListener('click', openMemberModal);
        document.getElementById('close-modal').addEventListener('click', closeMemberModal);
        document.getElementById('cancel-btn').addEventListener('click', closeMemberModal);
        document.getElementById('member-form').addEventListener('submit', handleAddMember);
        
        // 周切换
        document.getElementById('prev-week').addEventListener('click', () => changeWeek(-1));
        document.getElementById('next-week').addEventListener('click', () => changeWeek(1));
        
        // 菜谱搜索和筛选
        document.getElementById('recipe-search').addEventListener('input', debounce(handleRecipeSearch, 300));
        document.querySelectorAll('.filter-tab').forEach(tab => {
            tab.addEventListener('click', () => handleFilterClick(tab));
        });
        
        // 菜谱详情弹窗
        document.getElementById('close-recipe-modal').addEventListener('click', closeRecipeModal);
        
        // 健康分析
        document.getElementById('health-analysis-btn').addEventListener('click', openHealthModal);
        document.getElementById('close-health-modal').addEventListener('click', closeHealthModal);
        
        // 数据管理
        document.getElementById('data-export-btn').addEventListener('click', exportData);
        document.getElementById('data-import-btn').addEventListener('click', importData);
        document.getElementById('clear-data-btn').addEventListener('click', clearAllData);
        
        // 弹窗外部点击关闭
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', e => {
                if (e.target === modal) {
                    modal.classList.remove('active');
                }
            });
        });
        
        // 滑动手势（周计划页面）
        const weeklyPage = document.getElementById('weekly-page');
        weeklyPage.addEventListener('touchstart', handleTouchStart, { passive: true });
        weeklyPage.addEventListener('touchend', handleTouchEnd, { passive: true });
    }
    
    // ========== 页面切换 ==========
    function switchPage(page) {
        currentPage = page;
        
        // 更新导航状态
        navItems.forEach(item => {
            item.classList.toggle('active', item.dataset.page === page);
        });
        
        // 更新页面显示
        pages.forEach(p => {
            p.classList.toggle('active', p.id === `${page}-page`);
        });
        
        // 刷新页面内容
        if (page === 'home') renderHome();
        if (page === 'weekly') renderWeeklyMenu();
        if (page === 'recipes') renderRecipes();
        if (page === 'members') renderMembers();
    }
    
    // ========== 节气更新 ==========
    function updateSolarTerm() {
        const now = new Date();
        const month = now.getMonth() + 1;
        const day = now.getDate();
        
        // 简化的节气判断（实际应该根据具体日期计算）
        let currentTerm = solarTerms[0];
        
        // 根据当前日期找到对应的节气
        for (let i = 0; i < solarTerms.length; i++) {
            const term = solarTerms[i];
            // 这里简化处理，实际应该精确计算节气日期
            if (i === Math.floor((month - 1) * 2 + day / 15) % 24) {
                currentTerm = term;
                break;
            }
        }
        
        document.getElementById('current-solar-term').textContent = currentTerm.name;
        document.getElementById('solar-term-date').textContent = currentTerm.date;
        document.getElementById('solar-term-tip').textContent = currentTerm.tip;
        
        // 更新今日日期显示
        const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
        const todayStr = `${month}月${day}日 ${weekDays[now.getDay()]}`;
        document.getElementById('today-date').textContent = todayStr;
    }
    
    // ========== 首页渲染 ==========
    function renderHome() {
        const members = DataStore.getMembers();
        const weekKey = getWeekKey(0);
        let menu = DataStore.getWeeklyMenu(weekKey);
        
        if (!menu && members.length > 0) {
            menu = RecipeDatabase.generateWeeklyMenu(members, 0);
            DataStore.saveWeeklyMenu(weekKey, menu);
        }
        
        // 渲染今日食谱
        renderTodayMenu(menu);
        
        // 渲染本周预览
        renderWeekPreview(menu);
        
        // 渲染家庭成员快捷入口
        renderHomeMembers(members);
    }
    
    function renderTodayMenu(menu) {
        if (!menu) {
            todayMenu.innerHTML = `
                <div class="empty-state" style="grid-column: 1 / -1;">
                    <div class="empty-icon">🍽️</div>
                    <div class="empty-title">还没有食谱</div>
                    <div class="empty-desc">添加家庭成员后获取今日推荐</div>
                </div>
            `;
            return;
        }
        
        const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
        const today = weekDays[new Date().getDay()];
        const todayMenu_data = menu[today] || {};
        
        const meals = [
            { type: '早餐', key: '早餐', icon: '🌅' },
            { type: '午餐', key: '午餐', icon: '☀️' },
            { type: '下午茶', key: '下午茶', icon: '☕' },
            { type: '晚餐', key: '晚餐', icon: '🌙' }
        ];
        
        todayMenu.innerHTML = meals.map(meal => {
            const recipe = todayMenu_data[meal.key];
            if (!recipe) {
                return `
                    <div class="today-meal-card">
                        <div class="today-meal-type">${meal.icon} ${meal.type}</div>
                        <div class="today-meal-name">暂无推荐</div>
                    </div>
                `;
            }
            return `
                <div class="today-meal-card" onclick="showRecipeDetailById('${recipe.id}')">
                    <div class="today-meal-type">${meal.icon} ${meal.type}</div>
                    <div class="today-meal-name">${recipe.name}</div>
                    <div class="today-meal-calories">${recipe.calories} kcal</div>
                </div>
            `;
        }).join('');
    }
    
    function renderWeekPreview(menu) {
        if (!menu) {
            weekDaysPreview.innerHTML = '';
            return;
        }
        
        const weekDays = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
        const today = new Date().getDay();
        const dayMap = [6, 0, 1, 2, 3, 4, 5]; // 转换为周一开始
        const todayIndex = dayMap[today];
        
        const now = new Date();
        const monday = new Date(now);
        monday.setDate(now.getDate() - todayIndex);
        
        weekDaysPreview.innerHTML = weekDays.map((day, index) => {
            const date = new Date(monday);
            date.setDate(monday.getDate() + index);
            const dayMenu = menu[day];
            const mealCount = dayMenu ? Object.keys(dayMenu).length : 0;
            const isToday = index === todayIndex;
            
            return `
                <div class="week-day-item ${isToday ? 'active' : ''}" onclick="switchPage('weekly')">
                    <div class="week-day-name">${day}</div>
                    <div class="week-day-number">${date.getDate()}</div>
                    <div class="week-day-meals">${mealCount}餐</div>
                </div>
            `;
        }).join('');
    }
    
    function renderHomeMembers(members) {
        if (members.length === 0) {
            homeMembersList.innerHTML = `
                <div style="text-align: center; padding: 20px; color: var(--text-tertiary); font-size: 14px;">
                    点击管理添加成员
                </div>
            `;
            return;
        }
        
        homeMembersList.innerHTML = members.map(member => {
            const avatar = member.gender === 'male' ? '👨' : '👩';
            return `
                <div style="text-align: center;" onclick="switchPage('members')">
                    <div class="member-avatar-small">${avatar}</div>
                    <div class="member-name-small">${member.name}</div>
                </div>
            `;
        }).join('');
    }
    
    // ========== 周计划页面 ==========
    function renderWeeklyMenu() {
        const members = DataStore.getMembers();
        const weekKey = getWeekKey(currentWeekOffset);
        
        // 更新周显示
        const weekDisplay = document.getElementById('week-display');
        if (currentWeekOffset === 0) {
            weekDisplay.textContent = '本周';
        } else if (currentWeekOffset === 1) {
            weekDisplay.textContent = '下周';
        } else if (currentWeekOffset === -1) {
            weekDisplay.textContent = '上周';
        } else {
            weekDisplay.textContent = `${currentWeekOffset > 0 ? '+' : ''}${currentWeekOffset}周`;
        }
        
        if (members.length === 0) {
            weeklyMenu.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">📅</div>
                    <div class="empty-title">请先添加家庭成员</div>
                    <div class="empty-desc">添加成员后获取个性化食谱推荐</div>
                    <button class="btn btn-primary" onclick="switchPage('members')" style="margin-top: 16px;">去添加</button>
                </div>
            `;
            return;
        }
        
        let menu = DataStore.getWeeklyMenu(weekKey);
        if (!menu) {
            menu = RecipeDatabase.generateWeeklyMenu(members, currentWeekOffset);
            DataStore.saveWeeklyMenu(weekKey, menu);
        }
        
        const weekDays = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
        const today = new Date().getDay();
        const dayMap = [6, 0, 1, 2, 3, 4, 5];
        const todayIndex = currentWeekOffset === 0 ? dayMap[today] : -1;
        
        const now = new Date();
        const monday = new Date(now);
        monday.setDate(now.getDate() - dayMap[today] + currentWeekOffset * 7);
        
        weeklyMenu.innerHTML = weekDays.map((day, index) => {
            const date = new Date(monday);
            date.setDate(monday.getDate() + index);
            const dayMenu = menu[day] || {};
            const isToday = index === todayIndex;
            
            const meals = [
                { type: '早餐', key: '早餐', icon: '🌅' },
                { type: '午餐', key: '午餐', icon: '☀️' },
                { type: '下午茶', key: '下午茶', icon: '☕' },
                { type: '晚餐', key: '晚餐', icon: '🌙' }
            ];
            
            return `
                <div class="day-card">
                    <div class="day-card-header" style="${isToday ? 'background: var(--primary-light);' : ''}">
                        <span class="day-card-name">${day}${isToday ? ' · 今天' : ''}</span>
                        <span class="day-card-date">${date.getMonth() + 1}/${date.getDate()}</span>
                    </div>
                    <div class="day-meals-list">
                        ${meals.map(meal => {
                            const recipe = dayMenu[meal.key];
                            if (!recipe) {
                                return `
                                    <div class="day-meal-item">
                                        <div class="day-meal-type-icon">${meal.icon}</div>
                                        <div class="day-meal-info">
                                            <div class="day-meal-type-name">${meal.type}</div>
                                            <div class="day-meal-recipe-name" style="color: var(--text-tertiary);">暂无推荐</div>
                                        </div>
                                    </div>
                                `;
                            }
                            return `
                                <div class="day-meal-item" onclick="showRecipeDetailById('${recipe.id}')">
                                    <div class="day-meal-type-icon">${meal.icon}</div>
                                    <div class="day-meal-info">
                                        <div class="day-meal-type-name">${meal.type}</div>
                                        <div class="day-meal-recipe-name">${recipe.name}</div>
                                    </div>
                                    <span class="day-meal-arrow">›</span>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
            `;
        }).join('');
    }
    
    function changeWeek(offset) {
        currentWeekOffset += offset;
        renderWeeklyMenu();
    }
    
    // ========== 滑动手势 ==========
    function handleTouchStart(e) {
        touchStartX = e.changedTouches[0].screenX;
    }
    
    function handleTouchEnd(e) {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    }
    
    function handleSwipe() {
        const swipeThreshold = 50;
        const diff = touchStartX - touchEndX;
        
        if (Math.abs(diff) > swipeThreshold) {
            if (diff > 0) {
                // 向左滑动，下周
                changeWeek(1);
            } else {
                // 向右滑动，上周
                changeWeek(-1);
            }
        }
    }
    
    // ========== 菜谱库 ==========
    function renderRecipes(searchQuery = '') {
        let recipes;
        
        if (searchQuery) {
            recipes = RecipeDatabase.searchRecipes(searchQuery);
        } else if (currentFilter !== 'all') {
            recipes = RecipeDatabase.getRecipesByType(currentFilter);
        } else {
            recipes = RecipeDatabase.getAllRecipes();
        }
        
        if (recipes.length === 0) {
            recipesList.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">🍳</div>
                    <div class="empty-title">没有找到菜谱</div>
                </div>
            `;
            return;
        }
        
        recipesList.innerHTML = recipes.map(recipe => {
            const typeNames = {
                'breakfast': '早餐',
                'lunch': '午餐',
                'snack': '下午茶',
                'dinner': '晚餐'
            };
            
            return `
                <div class="recipe-list-item" onclick="showRecipeDetailById('${recipe.id}')">
                    <div class="recipe-list-image">${recipe.image}</div>
                    <div class="recipe-list-info">
                        <div class="recipe-list-name">${recipe.name}</div>
                        <div class="recipe-list-meta">${typeNames[recipe.type]} · ${recipe.calories} kcal · ${recipe.time}分钟</div>
                        <div class="recipe-list-tags">
                            ${recipe.tags.slice(0, 2).map(tag => `<span class="recipe-list-tag">${tag}</span>`).join('')}
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }
    
    function handleRecipeSearch(e) {
        const query = e.target.value.trim();
        renderRecipes(query);
    }
    
    function handleFilterClick(tab) {
        document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        currentFilter = tab.dataset.filter;
        renderRecipes();
    }
    
    // ========== 成员管理 ==========
    function renderMembers() {
        const members = DataStore.getMembers();
        
        if (members.length === 0) {
            membersList.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">👨‍👩‍👧‍👦</div>
                    <div class="empty-title">还没有家庭成员</div>
                    <div class="empty-desc">点击右上角 + 添加成员</div>
                </div>
            `;
            return;
        }
        
        membersList.innerHTML = members.map(member => {
            const avatar = member.gender === 'male' ? '👨' : '👩';
            const constitution = member.constitution;
            const tags = [];
            
            if (constitution) {
                tags.push(constitution.constitutionType.primary);
                if (constitution.constitutionType.weakOrgans.length > 0) {
                    tags.push(`${constitution.constitutionType.weakOrgans[0]}弱`);
                }
            }
            
            return `
                <div class="member-list-item">
                    <div class="member-list-avatar">${avatar}</div>
                    <div class="member-list-info">
                        <div class="member-list-name">${member.name}</div>
                        <div class="member-list-detail">${member.gender === 'male' ? '男' : '女'} · ${new Date(member.birthdate).getFullYear()}年</div>
                        <div class="member-list-tags">
                            ${tags.map(tag => `<span class="member-list-tag ${tag.includes('弱') ? 'highlight' : ''}">${tag}</span>`).join('')}
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }
    
    function openMemberModal() {
        document.getElementById('member-modal').classList.add('active');
        document.getElementById('member-form').reset();
    }
    
    function closeMemberModal() {
        document.getElementById('member-modal').classList.remove('active');
    }
    
    function handleAddMember(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const memberData = {
            name: formData.get('name'),
            gender: formData.get('gender'),
            birthdate: formData.get('birthdate'),
            birthtime: formData.get('birthtime'),
            baziPrecision: formData.get('bazi-precision'),
            conditions: formData.get('conditions'),
            preferences: formData.get('preferences')
        };
        
        DataStore.addMember(memberData);
        closeMemberModal();
        renderMembers();
        renderHome();
        
        // 切换到首页显示今日食谱
        setTimeout(() => {
            switchPage('home');
        }, 300);
    }
    
    // ========== 菜谱详情 ==========
    window.showRecipeDetailById = function(recipeId) {
        const recipe = RecipeDatabase.getRecipeById(recipeId);
        if (!recipe) return;
        
        const modalTitle = document.getElementById('recipe-modal-title');
        const detailContainer = document.getElementById('recipe-detail');
        
        modalTitle.textContent = recipe.name;
        
        const typeNames = {
            'breakfast': '早餐',
            'lunch': '午餐',
            'snack': '下午茶',
            'dinner': '晚餐'
        };
        
        detailContainer.innerHTML = `
            <div class="recipe-detail-image">${recipe.image}</div>
            <div class="recipe-detail-tags">
                <span class="recipe-detail-tag">${typeNames[recipe.type]}</span>
                <span class="recipe-detail-tag">${recipe.calories} kcal</span>
                <span class="recipe-detail-tag">${recipe.time}分钟</span>
                <span class="recipe-detail-tag">${recipe.difficulty}</span>
            </div>
            
            <div class="recipe-section">
                <h3 class="recipe-section-title">📝 食材清单</h3>
                <div class="ingredients-list">
                    ${recipe.ingredients.map(ing => `
                        <div class="ingredient-item">
                            <span class="ingredient-name">${ing.name}</span>
                            <span class="ingredient-amount">${ing.amount}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <div class="recipe-section">
                <h3 class="recipe-section-title">👨‍🍳 制作步骤</h3>
                <div class="steps-list">
                    ${recipe.steps.map((step, index) => `
                        <div class="step-item">
                            <div class="step-number">${index + 1}</div>
                            <div class="step-content">${step}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
            
            ${recipe.tcm ? `
                <div class="recipe-section">
                    <div class="recipe-tcm-box">
                        <div class="recipe-tcm-title">🌿 中医食疗</div>
                        <div class="recipe-tcm-content">
                            <p><strong>性味：</strong>${recipe.tcm.nature}性 · ${recipe.tcm.flavor.join('、')}味</p>
                            <p><strong>归经：</strong>${recipe.tcm.meridian.join('、')}经</p>
                            <p><strong>功效：</strong>${recipe.tcm.benefits}</p>
                        </div>
                    </div>
                </div>
            ` : ''}
        `;
        
        document.getElementById('recipe-modal').classList.add('active');
    };
    
    function closeRecipeModal() {
        document.getElementById('recipe-modal').classList.remove('active');
    }
    
    // ========== 健康分析 ==========
    function openHealthModal() {
        const members = DataStore.getMembers();
        const content = document.getElementById('health-content');
        
        if (members.length === 0) {
            content.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">💚</div>
                    <div class="empty-title">暂无健康数据</div>
                    <div class="empty-desc">添加家庭成员后查看体质分析</div>
                </div>
            `;
        } else {
            content.innerHTML = members.map(member => {
                if (!member.constitution) {
                    return `<div style="padding: 20px; text-align: center; color: var(--text-secondary);">${member.name} - 分析中...</div>`;
                }
                
                const c = member.constitution;
                return `
                    <div style="background: var(--card-bg); border-radius: var(--radius); padding: 20px; margin-bottom: 16px; box-shadow: var(--shadow-sm);">
                        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px;">
                            <div style="font-size: 32px;">${member.gender === 'male' ? '👨' : '👩'}</div>
                            <div>
                                <div style="font-size: 18px; font-weight: 700;">${member.name}</div>
                                <div style="font-size: 14px; color: var(--primary); font-weight: 600;">${c.constitutionType.primary}</div>
                            </div>
                        </div>
                        <div style="font-size: 14px; color: var(--text-secondary); line-height: 1.6; margin-bottom: 12px;">
                            ${c.constitutionType.info.description}
                        </div>
                        <div style="font-size: 13px; color: var(--text-tertiary);">
                            <strong>饮食建议：</strong>${c.constitutionType.info.diet}
                        </div>
                    </div>
                `;
            }).join('');
        }
        
        document.getElementById('health-modal').classList.add('active');
    }
    
    function closeHealthModal() {
        document.getElementById('health-modal').classList.remove('active');
    }
    
    // ========== 数据管理 ==========
    function exportData() {
        const data = DataStore.exportData();
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `family-diet-backup-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
        alert('数据已导出');
    }
    
    function importData() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;
            
            const reader = new FileReader();
            reader.onload = (event) => {
                if (DataStore.importData(event.target.result)) {
                    alert('数据导入成功');
                    renderHome();
                    renderMembers();
                } else {
                    alert('数据导入失败，请检查文件格式');
                }
            };
            reader.readAsText(file);
        };
        input.click();
    }
    
    function clearAllData() {
        if (confirm('确定要清除所有数据吗？此操作不可恢复。')) {
            DataStore.clearAll();
            alert('数据已清除');
            renderHome();
            renderMembers();
        }
    }
    
    // ========== 工具函数 ==========
    function getWeekKey(offset) {
        const now = new Date();
        now.setDate(now.getDate() + offset * 7);
        return `${now.getFullYear()}-W${getWeekNumber(now)}`;
    }
    
    function getWeekNumber(date) {
        const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
        const dayNum = d.getUTCDay() || 7;
        d.setUTCDate(d.getUTCDate() + 4 - dayNum);
        const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
        return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
    }
    
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
    
    // 全局函数供HTML调用
    window.switchPage = switchPage;
    
    // 启动应用
    init();
});