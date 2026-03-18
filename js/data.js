/**
 * 数据管理模块 - Family Diet
 * 负责家庭成员数据的存储、读取和管理
 */

const DataStore = (function() {
    'use strict';
    
    const STORAGE_KEY = 'family_diet_data';
    
    // 默认数据结构
    const defaultData = {
        members: [],
        settings: {
            baziPrecision: 'simple', // 'simple' | 'precise'
            autoGenerateMenu: true,
            dietaryRestrictions: {
                avoidSpicy: false,
                lowSalt: false,
                lowSugar: false,
                vegetarian: false
            }
        },
        weeklyMenus: {}, // 按周存储的菜单
        lastUpdated: null
    };
    
    let data = null;
    
    /**
     * 初始化数据存储
     */
    function init() {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            try {
                data = JSON.parse(stored);
                // 合并可能的新字段
                data = { ...defaultData, ...data };
            } catch (e) {
                console.error('Failed to parse stored data:', e);
                data = { ...defaultData };
            }
        } else {
            data = { ...defaultData };
        }
        save();
    }
    
    /**
     * 保存数据到本地存储
     */
    function save() {
        if (!data) return;
        data.lastUpdated = new Date().toISOString();
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }
    
    /**
     * 获取所有家庭成员
     */
    function getMembers() {
        return data ? [...data.members] : [];
    }
    
    /**
     * 根据ID获取家庭成员
     */
    function getMemberById(id) {
        if (!data) return null;
        return data.members.find(m => m.id === id) || null;
    }
    
    /**
     * 添加家庭成员
     */
    function addMember(memberData) {
        if (!data) init();
        
        const member = {
            id: generateId(),
            name: memberData.name,
            gender: memberData.gender,
            birthdate: memberData.birthdate,
            birthtime: memberData.birthtime || null,
            baziPrecision: memberData.baziPrecision || 'simple',
            conditions: memberData.conditions || '',
            preferences: memberData.preferences || '',
            createdAt: new Date().toISOString(),
            // 以下是计算得出的字段
            bazi: null,
            constitution: null
        };
        
        // 计算八字和体质
        if (typeof BaziCalculator !== 'undefined') {
            member.bazi = BaziCalculator.calculate(member);
        }
        if (typeof HealthAnalyzer !== 'undefined') {
            member.constitution = HealthAnalyzer.analyze(member);
        }
        
        data.members.push(member);
        save();
        return member;
    }
    
    /**
     * 更新家庭成员
     */
    function updateMember(id, updates) {
        if (!data) return null;
        const index = data.members.findIndex(m => m.id === id);
        if (index === -1) return null;
        
        const member = { ...data.members[index], ...updates };
        
        // 如果出生信息变化，重新计算八字
        if (updates.birthdate || updates.birthtime) {
            if (typeof BaziCalculator !== 'undefined') {
                member.bazi = BaziCalculator.calculate(member);
            }
            if (typeof HealthAnalyzer !== 'undefined') {
                member.constitution = HealthAnalyzer.analyze(member);
            }
        }
        
        data.members[index] = member;
        save();
        return member;
    }
    
    /**
     * 删除家庭成员
     */
    function deleteMember(id) {
        if (!data) return false;
        const index = data.members.findIndex(m => m.id === id);
        if (index === -1) return false;
        
        data.members.splice(index, 1);
        save();
        return true;
    }
    
    /**
     * 获取设置
     */
    function getSettings() {
        return data ? { ...data.settings } : { ...defaultData.settings };
    }
    
    /**
     * 更新设置
     */
    function updateSettings(settings) {
        if (!data) init();
        data.settings = { ...data.settings, ...settings };
        save();
    }
    
    /**
     * 获取指定周的菜单
     */
    function getWeeklyMenu(weekKey) {
        if (!data) return null;
        return data.weeklyMenus[weekKey] || null;
    }
    
    /**
     * 保存周菜单
     */
    function saveWeeklyMenu(weekKey, menu) {
        if (!data) init();
        data.weeklyMenus[weekKey] = menu;
        save();
    }
    
    /**
     * 生成唯一ID
     */
    function generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }
    
    /**
     * 导出所有数据
     */
    function exportData() {
        return data ? JSON.stringify(data, null, 2) : '{}';
    }
    
    /**
     * 导入数据
     */
    function importData(jsonString) {
        try {
            const imported = JSON.parse(jsonString);
            data = { ...defaultData, ...imported };
            save();
            return true;
        } catch (e) {
            console.error('Failed to import data:', e);
            return false;
        }
    }
    
    /**
     * 清除所有数据
     */
    function clearAll() {
        data = { ...defaultData };
        save();
    }
    
    // 初始化
    init();
    
    // 公开API
    return {
        init,
        save,
        getMembers,
        getMemberById,
        addMember,
        updateMember,
        deleteMember,
        getSettings,
        updateSettings,
        getWeeklyMenu,
        saveWeeklyMenu,
        exportData,
        importData,
        clearAll
    };
})();
