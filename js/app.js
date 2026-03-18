/**
 * 主应用模块 - Family Diet
 * 整合所有功能，处理UI交互
 */

document.addEventListener('DOMContentLoaded', function() {
    'use strict';
    
    // ========== 状态管理 ==========
    let currentPage = 'members';
    let currentWeekOffset = 0;
    let recipeFilter = 'all';
    
    // ========== DOM 元素 ==========
    const navItems = document.querySelectorAll('.nav-item');
    const pages = document.querySelectorAll('.page');
    const membersList = document.getElementById('members-list');
    const weeklyMenu = document.getElementById('weekly-menu');
    const recipesList = document.getElementById('recipes-list');
    const healthDashboard = document.getElementById('health-dashboard');
    
    // 弹窗
    const memberModal = document.getElementById('member-modal');
    const recipeModal = document.getElementById('recipe-modal');
    
    // ========== 初始化 ==========
    function init() {
        bindEvents();
        renderMembers();
        renderWeeklyMenu();
        renderRecipes();
        renderHealthDashboard();
    }
    
    // ========== 事件绑定 ==========
    function bindEvents() {
        // 导航切换
        navItems.forEach(item => {
            item.addEventListener('click', () => {
                const page = item.dataset.page;
                switchPage(page);
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
        
        // 食谱搜索和筛选
        document.getElementById('recipe-search').addEventListener('input', debounce(handleRecipeSearch, 300));
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', () => handleFilterClick(btn));
        });
        
        // 菜谱详情弹窗
        document.getElementById('close-recipe-modal').addEventListener('click', closeRecipeModal);
        
        // 点击弹窗外部关闭
        memberModal.addEventListener('click', e => {
            if (e.target === memberModal) closeMemberModal();
        });
        recipeModal.addEventListener('click', e => {
            if (e.target === recipeModal) closeRecipeModal();
        });
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
        if (page === 'members') renderMembers();
        if (page === 'weekly') renderWeeklyMenu();
        if (page === 'recipes') renderRecipes();
        if (page === 'health') renderHealthDashboard();
    }
    
    // ========== 成员管理 ==========
    function renderMembers() {
        const members = DataStore.getMembers();
        
        if (members.length === 0) {
            membersList.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">👨‍👩‍👧‍👦</div>
                    <div class="empty-title">还没有家庭成员</div>
                    <div class="empty-desc">添加家庭成员，获取个性化食谱推荐</div>
                    <button class="btn btn-primary" onclick="document.getElementById('add-member-btn').click()">
                        添加第一个成员
                    </button>
                </div>
            `;
            return;
        }
        
        membersList.innerHTML = members.map(member => {
            const constitution = member.constitution;
            const healthTags = [];
            
            if (constitution) {
                healthTags.push(constitution.constitutionType.primary);
                if (constitution.constitutionType.weakOrgans.length > 0) {
                    healthTags.push(`${constitution.constitutionType.weakOrgans[0]}弱`);
                }
            }
            
            if (member.conditions) {
                const conditions = member.conditions.split(/[,，、]/).filter(c => c.trim());
                if (conditions.length > 0) {
                    healthTags.push(conditions[0]);
                }
            }
            
            const avatarEmoji = member.gender === 'male' ? '👨' : '👩';
            const birthDate = new Date(member.birthdate).toLocaleDateString('zh-CN');
            
            return `
                <div class="member-card" data-id="${member.id}">
                    <div class="member-avatar">${avatarEmoji}</div>
                    <div class="member-name">${member.name}</div>
                    <div class="member-info">
                        ${member.gender === 'male' ? '男' : '女'} · ${birthDate}
                    </div>
                    <div class="member-health">
                        ${healthTags.map(tag => `<span class="health-tag${tag.includes('弱') ? ' warning' : ''}">${tag}</span>`).join('')}
                    </div>
                </div>
            `;
        }).join('');
        
        // 绑定卡片点击事件
        document.querySelectorAll('.member-card').forEach(card => {
            card.addEventListener('click', () => {
                // TODO: 打开成员详情/编辑弹窗
                alert('成员详情功能开发中...');
            });
        });
    }
    
    function openMemberModal() {
        memberModal.classList.add('active');
        document.getElementById('member-form').reset();
    }
    
    function closeMemberModal() {
        memberModal.classList.remove('active');
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
        
        // 如果有成员了，提示可以查看一周食谱
        const members = DataStore.getMembers();
        if (members.length === 1) {
            setTimeout(() => {
                if (confirm('家庭成员已添加！是否查看为您推荐的一周食谱？')) {
                    switchPage('weekly');
                }
            }, 300);
        }
    }
    
    // ========== 一周食谱 ==========
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
                    <div class="empty-desc">添加成员后，我们会根据体质推荐适合的食谱</div>
                    <button class="btn btn-primary" onclick="switchPage('members')">去添加成员</button>
                </div>
            `;
            return;
        }
        
        // 生成或获取周菜单
        let menu = DataStore.getWeeklyMenu(weekKey);
        if (!menu) {
            menu = RecipeDatabase.generateWeeklyMenu(members, currentWeekOffset);
            DataStore.saveWeeklyMenu(weekKey, menu);
        }
        
        const weekDays = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
        const today = new Date().getDay();
        const dayMap = [6, 0, 1, 2, 3, 4, 5]; // 转换为周一始
        const todayIndex = currentWeekOffset === 0 ? dayMap[today] : -1;
        
        weeklyMenu.innerHTML = weekDays.map((day, index) => {
            const dayMenu = menu[day] || {};
            const isToday = index === todayIndex;
            
            // 计算日期
            const date = getDateByWeekOffset(currentWeekOffset, index);
            
            return `
                <div class="day-card">
                    <div class="day-header" style="${isToday ? 'background: linear-gradient(135deg, #6366f1, #8b5cf6);' : ''}">
                        <span class="day-name">${day}${isToday ? ' (今天)' : ''}</span>
                        <span class="day-date">${date}</span>
                    </div>
                    <div class="day-meals">
                        ${renderMealSlot('早餐', dayMenu['早餐'])}
                        ${renderMealSlot('午餐', dayMenu['午餐'])}
                        ${renderMealSlot('下午茶', dayMenu['下午茶'])}
                        ${renderMealSlot('晚餐', dayMenu['晚餐'])}
                    </div>
                </div>
            `;
        }).join('');
        
        // 绑定菜谱点击事件
        document.querySelectorAll('.meal-slot[data-recipe-id]').forEach(slot => {
            slot.addEventListener('click', () => {
                const recipeId = slot.dataset.recipeId;
                const recipe = RecipeDatabase.getRecipeById(recipeId);
                if (recipe) {
                    showRecipeDetail(recipe);
                }
            });
        });
    }
    
    function renderMealSlot(type, recipe) {
        if (!recipe) {
            return `
                <div class="meal-slot">
                    <div class="meal-type">${type}</div>
                    <div class="meal-name">暂无推荐</div>
                </div>
            `;
        }
        
        const benefit = recipe.tcm ? recipe.tcm.benefits.substring(0, 20) + '...' : '';
        
        return `
            <div class="meal-slot" data-recipe-id="${recipe.id}" style="cursor: pointer;">
                <div class="meal-type">${type}</div>
                <div class="meal-name">${recipe.image} ${recipe.name}</div>
                <div class="meal-calories">${recipe.calories} kcal · ${recipe.time}分钟</div>
                ${benefit ? `<div class="meal-benefit">💚 ${benefit}</div>` : ''}
            </div>
        `;
    }
    
    function changeWeek(offset) {
        currentWeekOffset += offset;
        renderWeeklyMenu();
    }
    
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
    
    function getDateByWeekOffset(weekOffset, dayIndex) {
        const now = new Date();
        const currentDay = now.getDay();
        const dayMap = [6, 0, 1, 2, 3, 4, 5];
        const mondayOffset = dayMap[currentDay];
        
        const targetDate = new Date(now);
        targetDate.setDate(now.getDate() - mondayOffset + weekOffset * 7 + dayIndex);
        
        return `${targetDate.getMonth() + 1}/${targetDate.getDate()}`;
    }
    
    // ========== 菜谱库 ==========
    function renderRecipes(searchQuery = '') {
        let recipes;
        
        if (searchQuery) {
            recipes = RecipeDatabase.searchRecipes(searchQuery);
        } else if (recipeFilter !== 'all') {
            recipes = RecipeDatabase.getRecipesByType(recipeFilter);
        } else {
            recipes = RecipeDatabase.getAllRecipes();
        }
        
        if (recipes.length === 0) {
            recipesList.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">🍳</div>
                    <div class="empty-title">没有找到菜谱</div>
                    <div class="empty-desc">试试其他关键词或筛选条件</div>
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
            
            const tcmBenefit = recipe.tcm ? recipe.tcm.benefits.substring(0, 30) + '...' : '';
            
            return `
                <div class="recipe-card" data-id="${recipe.id}">
                    <div class="recipe-image">${recipe.image}</div>
                    <div class="recipe-content">
                        <div class="recipe-title">${recipe.name}</div>
                        <div class="recipe-meta">
                            <span>${typeNames[recipe.type]}</span>
                            <span>${recipe.calories} kcal</span>
                            <span>${recipe.time}分钟</span>
                        </div>
                        <div class="recipe-tags">
                            ${recipe.tags.slice(0, 3).map(tag => `<span class="recipe-tag">${tag}</span>`).join('')}
                        </div>
                    </div>
                </div>
            `;
        }).join('');
        
        // 绑定点击事件
        document.querySelectorAll('.recipe-card').forEach(card => {
            card.addEventListener('click', () => {
                const recipeId = card.dataset.id;
                const recipe = RecipeDatabase.getRecipeById(recipeId);
                if (recipe) {
                    showRecipeDetail(recipe);
                }
            });
        });
    }
    
    function handleRecipeSearch(e) {
        const query = e.target.value.trim();
        renderRecipes(query);
    }
    
    function handleFilterClick(btn) {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        recipeFilter = btn.dataset.filter;
        renderRecipes();
    }
    
    // ========== 菜谱详情 ==========
    function showRecipeDetail(recipe) {
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
            <div class="recipe-section">
                <div style="display: flex; gap: 20px; margin-bottom: 20px; flex-wrap: wrap;">
                    <span style="background: #ecfdf5; color: #059669; padding: 6px 14px; border-radius: 20px; font-size: 13px;">
                        ${typeNames[recipe.type]}
                    </span>
                    <span style="background: #f3f4f6; color: #6b7280; padding: 6px 14px; border-radius: 20px; font-size: 13px;">
                        ${recipe.calories} kcal
                    </span>
                    <span style="background: #f3f4f6; color: #6b7280; padding: 6px 14px; border-radius: 20px; font-size: 13px;">
                        ⏱ ${recipe.time}分钟
                    </span>
                    <span style="background: #f3f4f6; color: #6b7280; padding: 6px 14px; border-radius: 20px; font-size: 13px;">
                        📊 ${recipe.difficulty}
                    </span>
                </div>
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
                    <div class="recipe-tcm-info">
                        <div class="recipe-tcm-title">🌿 中医食疗</div>
                        <div class="recipe-tcm-content">
                            <p><strong>性味：</strong>${recipe.tcm.nature}性 · ${recipe.tcm.flavor.join('、')}味</p>
                            <p><strong>归经：</strong>${recipe.tcm.meridian.join('、')}经</p>
                            <p><strong>功效：</strong>${recipe.tcm.benefits}</p>
                            <p><strong>适宜：</strong>${recipe.tcm.suitFor.join('、')}</p>
                            ${recipe.tcm.avoid.length > 0 ? `<p><strong>慎用：</strong>${recipe.tcm.avoid.join('、')}</p>` : ''}
                        </div>
                    </div>
                </div>
            ` : ''}
        `;
        
        recipeModal.classList.add('active');
    }
    
    function closeRecipeModal() {
        recipeModal.classList.remove('active');
    }
    
    // ========== 健康分析 ==========
    function renderHealthDashboard() {
        const members = DataStore.getMembers();
        
        if (members.length === 0) {
            healthDashboard.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">💚</div>
                    <div class="empty-title">暂无健康数据</div>
                    <div class="empty-desc">添加家庭成员后，查看体质分析和养生建议</div>
                    <button class="btn btn-primary" onclick="switchPage('members')">去添加成员</button>
                </div>
            `;
            return;
        }
        
        healthDashboard.innerHTML = members.map(member => {
            if (!member.constitution) {
                return `
                    <div class="health-card">
                        <div class="health-card-title">${member.name}</div>
                        <p style="color: #6b7280;">正在分析体质数据...</p>
                    </div>
                `;
            }
            
            const constitution = member.constitution;
            const organStatus = constitution.organStatus;
            
            return `
                <div class="health-card">
                    <div class="health-card-title">
                        ${member.name} · ${constitution.constitutionType.primary}
                    </div>
                    
                    <div style="margin-bottom: 24px;">
                        <h4 style="font-size: 14px; color: #6b7280; margin-bottom: 12px;">脏腑状态</h4>
                        <div class="constitution-analysis">
                            ${Object.entries(organStatus).map(([wx, info]) => `
                                <div class="organ-status">
                                    <div class="organ-name">${info.organ}</div>
                                    <div class="organ-level ${info.level}">
                                        ${info.level === 'strong' ? '偏旺' : info.level === 'weak' ? '偏弱' : '平和'}
                                    </div>
                                    <div class="organ-desc">${info.count}</div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    
                    <div style="margin-bottom: 24px;">
                        <h4 style="font-size: 14px; color: #6b7280; margin-bottom: 12px;">体质特点</h4>
                        <p style="color: #374151; line-height: 1.7;">
                            ${constitution.constitutionType.info.description}
                        </p>
                    </div>
                    
                    <div style="margin-bottom: 24px;">
                        <h4 style="font-size: 14px; color: #6b7280; margin-bottom: 12px;">饮食建议</h4>
                        <p style="color: #374151; line-height: 1.7;">
                            ${constitution.constitutionType.info.diet}
                        </p>
                        <div style="display: flex; flex-wrap: wrap; gap: 8px; margin-top: 12px;">
                            ${constitution.constitutionType.info.recommendations.map(rec => `
                                <span style="background: #ecfdf5; color: #059669; padding: 4px 12px; border-radius: 12px; font-size: 12px;">${rec}</span>
                            `).join('')}
                        </div>
                    </div>
                    
                    ${constitution.medicalAdjustments ? `
                        <div>
                            <h4 style="font-size: 14px; color: #6b7280; margin-bottom: 12px;">健康注意</h4>
                            <ul style="color: #374151; line-height: 1.8; padding-left: 20px;">
                                ${constitution.medicalAdjustments.notes.map(note => `<li>${note}</li>`).join('')}
                            </ul>
                        </div>
                    ` : ''}
                </div>
            `;
        }).join('');
    }
    
    // ========== 工具函数 ==========
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
    
    // 启动应用
    init();
});
