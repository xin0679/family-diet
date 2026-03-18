/**
 * 八字计算模块 - Family Diet
 * 简化版八字排盘，支持扩展为精确版
 */

const BaziCalculator = (function() {
    'use strict';
    
    // 天干
    const TIAN_GAN = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
    
    // 地支
    const DI_ZHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
    
    // 五行对应
    const WU_XING = {
        '甲': '木', '乙': '木',
        '丙': '火', '丁': '火',
        '戊': '土', '己': '土',
        '庚': '金', '辛': '金',
        '壬': '水', '癸': '水',
        '子': '水', '丑': '土', '寅': '木', '卯': '木',
        '辰': '土', '巳': '火', '午': '火', '未': '土',
        '申': '金', '酉': '金', '戌': '土', '亥': '水'
    };
    
    // 地支藏干
    const DI_ZHI_CANG_GAN = {
        '子': ['癸'],
        '丑': ['己', '癸', '辛'],
        '寅': ['甲', '丙', '戊'],
        '卯': ['乙'],
        '辰': ['戊', '乙', '癸'],
        '巳': ['丙', '庚', '戊'],
        '午': ['丁', '己'],
        '未': ['己', '丁', '乙'],
        '申': ['庚', '壬', '戊'],
        '酉': ['辛'],
        '戌': ['戊', '辛', '丁'],
        '亥': ['壬', '甲']
    };
    
    // 五行生克关系
    const WU_XING_RELATION = {
        '木': { '生': '火', '克': '土', '被生': '水', '被克': '金' },
        '火': { '生': '土', '克': '金', '被生': '木', '被克': '水' },
        '土': { '生': '金', '克': '水', '被生': '火', '被克': '木' },
        '金': { '生': '水', '克': '木', '被生': '土', '被克': '火' },
        '水': { '生': '木', '克': '火', '被生': '金', '被克': '土' }
    };
    
    // 脏腑对应五行
    const ORGAN_WU_XING = {
        '木': { organ: '肝', related: '胆' },
        '火': { organ: '心', related: '小肠' },
        '土': { organ: '脾', related: '胃' },
        '金': { organ: '肺', related: '大肠' },
        '水': { organ: '肾', related: '膀胱' }
    };
    
    /**
     * 计算八字
     * @param {Object} member - 成员信息
     * @returns {Object} 八字信息
     */
    function calculate(member) {
        const birthDate = new Date(member.birthdate);
        const year = birthDate.getFullYear();
        const month = birthDate.getMonth() + 1;
        const day = birthDate.getDate();
        
        // 获取时辰（简化处理）
        let hour = 12; // 默认午时
        if (member.birthtime) {
            const [h] = member.birthtime.split(':').map(Number);
            hour = h;
        }
        
        // 计算四柱
        const yearZhu = calculateYearZhu(year);
        const monthZhu = calculateMonthZhu(year, month);
        const dayZhu = calculateDayZhu(year, month, day);
        const hourZhu = calculateHourZhu(dayZhu.gan, hour);
        
        // 计算五行分布
        const wuXingCount = countWuXing(yearZhu, monthZhu, dayZhu, hourZhu);
        
        // 计算日主强弱（简化算法）
        const dayMasterStrength = calculateDayMasterStrength(dayZhu.gan, wuXingCount);
        
        return {
            year: yearZhu,
            month: monthZhu,
            day: dayZhu,
            hour: hourZhu,
            wuXing: wuXingCount,
            dayMaster: {
                gan: dayZhu.gan,
                wuXing: WU_XING[dayZhu.gan],
                strength: dayMasterStrength
            },
            calculatedAt: new Date().toISOString()
        };
    }
    
    /**
     * 计算年柱
     */
    function calculateYearZhu(year) {
        const ganIndex = (year - 4) % 10;
        const zhiIndex = (year - 4) % 12;
        return {
            gan: TIAN_GAN[ganIndex],
            zhi: DI_ZHI[zhiIndex]
        };
    }
    
    /**
     * 计算月柱（简化版，未考虑节气）
     */
    function calculateMonthZhu(year, month) {
        // 年干决定月干起始
        const yearGanIndex = (year - 4) % 10;
        const yearGan = TIAN_GAN[yearGanIndex];
        
        // 月干计算（五虎遁月）
        let monthGanStart;
        if (['甲', '己'].includes(yearGan)) monthGanStart = 0; // 甲
        else if (['乙', '庚'].includes(yearGan)) monthGanStart = 2; // 丙
        else if (['丙', '辛'].includes(yearGan)) monthGanStart = 4; // 戊
        else if (['丁', '壬'].includes(yearGan)) monthGanStart = 6; // 庚
        else monthGanStart = 8; // 壬
        
        const monthGanIndex = (monthGanStart + month - 1) % 10;
        const monthZhiIndex = (month + 1) % 12; // 寅月为正月
        
        return {
            gan: TIAN_GAN[monthGanIndex],
            zhi: DI_ZHI[monthZhiIndex]
        };
    }
    
    /**
     * 计算日柱（简化版蔡勒公式）
     */
    function calculateDayZhu(year, month, day) {
        // 蔡勒公式计算星期，再推算干支
        if (month < 3) {
            month += 12;
            year -= 1;
        }
        const c = Math.floor(year / 100);
        const y = year % 100;
        const weekDay = (c / 4 - 2 * c + y + y / 4 + 13 * (month + 1) / 5 + day - 1) % 7;
        
        // 已知1900年1月31日为甲子日，以此为基准计算
        const baseDate = new Date(1900, 0, 31);
        const targetDate = new Date(year, month - 1, day);
        const diffDays = Math.floor((targetDate - baseDate) / (1000 * 60 * 60 * 24));
        
        const ganIndex = (diffDays % 10 + 10) % 10;
        const zhiIndex = (diffDays % 12 + 12) % 12;
        
        return {
            gan: TIAN_GAN[ganIndex],
            zhi: DI_ZHI[zhiIndex]
        };
    }
    
    /**
     * 计算时柱
     */
    function calculateHourZhu(dayGan, hour) {
        // 时辰地支
        const hourZhiIndex = Math.floor((hour + 1) / 2) % 12;
        const hourZhi = DI_ZHI[hourZhiIndex];
        
        // 时干计算（五鼠遁时）
        const dayGanIndex = TIAN_GAN.indexOf(dayGan);
        let hourGanStart;
        if (['甲', '己'].includes(dayGan)) hourGanStart = 0; // 甲
        else if (['乙', '庚'].includes(dayGan)) hourGanStart = 2; // 丙
        else if (['丙', '辛'].includes(dayGan)) hourGanStart = 4; // 戊
        else if (['丁', '壬'].includes(dayGan)) hourGanStart = 6; // 庚
        else hourGanStart = 8; // 壬
        
        const hourGanIndex = (hourGanStart + hourZhiIndex) % 10;
        
        return {
            gan: TIAN_GAN[hourGanIndex],
            zhi: hourZhi
        };
    }
    
    /**
     * 统计五行分布
     */
    function countWuXing(yearZhu, monthZhu, dayZhu, hourZhu) {
        const count = { '木': 0, '火': 0, '土': 0, '金': 0, '水': 0 };
        const zhuList = [yearZhu, monthZhu, dayZhu, hourZhu];
        
        zhuList.forEach(zhu => {
            // 天干五行
            count[WU_XING[zhu.gan]]++;
            
            // 地支本气
            count[WU_XING[zhu.zhi]]++;
            
            // 地支藏干（权重较低）
            const cangGan = DI_ZHI_CANG_GAN[zhu.zhi];
            if (cangGan) {
                cangGan.forEach((gan, index) => {
                    const weight = index === 0 ? 0.5 : 0.25;
                    count[WU_XING[gan]] += weight;
                });
            }
        });
        
        return count;
    }
    
    /**
     * 计算日主强弱
     */
    function calculateDayMasterStrength(dayGan, wuXingCount) {
        const dayWuXing = WU_XING[dayGan];
        const relation = WU_XING_RELATION[dayWuXing];
        
        // 生助日主的五行
        const support = wuXingCount[relation['被生']] + wuXingCount[relation['生']] * 0.5;
        // 克制日主的五行
        const restrain = wuXingCount[relation['被克']] + wuXingCount[relation['克']] * 0.5;
        
        const ratio = support / (support + restrain);
        
        if (ratio > 0.6) return 'strong';
        if (ratio < 0.4) return 'weak';
        return 'neutral';
    }
    
    /**
     * 获取五行对应的脏腑
     */
    function getOrganByWuXing(wuXing) {
        return ORGAN_WU_XING[wuXing] || null;
    }
    
    /**
     * 分析五行喜忌
     */
    function analyzePreference(bazi) {
        const dayMaster = bazi.dayMaster;
        const wuXing = bazi.wuXing;
        
        const preference = {
            favorable: [],
            unfavorable: [],
            neutral: []
        };
        
        const wxTypes = ['木', '火', '土', '金', '水'];
        const wxCount = wxTypes.map(wx => ({ type: wx, count: wuXing[wx] }));
        wxCount.sort((a, b) => b.count - a.count);
        
        const maxCount = wxCount[0].count;
        const minCount = wxCount[wxCount.length - 1].count;
        
        wxCount.forEach(item => {
            if (item.count === maxCount) {
                preference.unfavorable.push(item.type);
            } else if (item.count === minCount) {
                preference.favorable.push(item.type);
            } else {
                preference.neutral.push(item.type);
            }
        });
        
        return preference;
    }
    
    // 公开API
    return {
        calculate,
        getOrganByWuXing,
        analyzePreference,
        TIAN_GAN,
        DI_ZHI,
        WU_XING
    };
})();
