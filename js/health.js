/**
 * 体质分析模块 - Family Diet
 * 根据八字五行分析脏腑强弱，为食谱推荐提供依据
 */

const HealthAnalyzer = (function() {
    'use strict';
    
    // 五行与脏腑对应
    const ORGAN_MAP = {
        '木': {
            organ: '肝',
            related: '胆',
            function: '疏泄、藏血',
            manifestation: '目、筋、爪',
            emotion: '怒',
            symptoms: '易怒、目涩、抽筋、月经不调'
        },
        '火': {
            organ: '心',
            related: '小肠',
            function: '主血脉、藏神',
            manifestation: '舌、面、脉',
            emotion: '喜',
            symptoms: '心悸、失眠、口舌生疮、面色异常'
        },
        '土': {
            organ: '脾',
            related: '胃',
            function: '运化、统血',
            manifestation: '口、肌肉、四肢',
            emotion: '思',
            symptoms: '食欲不振、腹胀、乏力、肌肉松弛'
        },
        '金': {
            organ: '肺',
            related: '大肠',
            function: '主气、司呼吸',
            manifestation: '鼻、皮毛、声音',
            emotion: '忧',
            symptoms: '咳嗽、气短、皮肤干燥、便秘'
        },
        '水': {
            organ: '肾',
            related: '膀胱',
            function: '藏精、主水',
            manifestation: '耳、骨、发',
            emotion: '恐',
            symptoms: '腰膝酸软、耳鸣、脱发、水肿'
        }
    };
    
    // 体质类型定义
    const CONSTITUTION_TYPES = {
        '平和质': {
            description: '阴阳气血调和，体态适中，面色红润',
            diet: '饮食多样化，粗细搭配，不寒不热',
            recommendations: ['五谷为养', '五果为助', '五畜为益', '五菜为充']
        },
        '气虚质': {
            description: '元气不足，疲乏无力，气短懒言',
            diet: '益气健脾，避免耗气食物',
            recommendations: ['山药', '大枣', '黄芪', '鸡肉', '糯米']
        },
        '阳虚质': {
            description: '阳气不足，畏寒怕冷，手足不温',
            diet: '温补阳气，忌食生冷',
            recommendations: ['羊肉', '韭菜', '核桃', '生姜', '桂圆']
        },
        '阴虚质': {
            description: '阴液亏少，口燥咽干，手足心热',
            diet: '滋阴润燥，避免辛辣',
            recommendations: ['百合', '银耳', '梨', '鸭肉', '黑芝麻']
        },
        '痰湿质': {
            description: '痰湿凝聚，形体肥胖，腹部肥满',
            diet: '健脾利湿，化痰泄浊',
            recommendations: ['薏米', '冬瓜', '白萝卜', '海带', '荷叶']
        },
        '湿热质': {
            description: '湿热内蕴，面垢油光，口苦苔黄',
            diet: '清热利湿，忌辛辣油腻',
            recommendations: ['绿豆', '苦瓜', '芹菜', '黄瓜', '莲藕']
        },
        '血瘀质': {
            description: '血行不畅，肤色晦暗，舌质紫黯',
            diet: '活血化瘀，疏肝理气',
            recommendations: ['山楂', '玫瑰花', '黑木耳', '洋葱', '醋']
        },
        '气郁质': {
            description: '气机郁滞，神情抑郁，忧虑脆弱',
            diet: '疏肝理气，解郁安神',
            recommendations: ['柑橘', '玫瑰花茶', '佛手', '萝卜', '芹菜']
        },
        '特禀质': {
            description: '先天失常，过敏体质，易患过敏',
            diet: '清淡均衡，避免过敏原',
            recommendations: ['清淡饮食', '避免发物', '增强免疫']
        }
    };
    
    /**
     * 分析体质
     * @param {Object} member - 成员信息
     * @returns {Object} 体质分析结果
     */
    function analyze(member) {
        if (!member.bazi) {
            return null;
        }
        
        const bazi = member.bazi;
        const wuXing = bazi.wuXing;
        const dayMaster = bazi.dayMaster;
        
        // 分析各脏腑状态
        const organStatus = analyzeOrganStatus(wuXing, dayMaster);
        
        // 确定主要体质类型
        const constitutionType = determineConstitution(organStatus, wuXing, member);
        
        // 分析五行喜忌（用于食谱推荐）
        const preference = BaziCalculator.analyzePreference(bazi);
        
        // 根据基础疾病调整建议
        const medicalAdjustments = analyzeMedicalConditions(member.conditions);
        
        return {
            organStatus,
            constitutionType,
            preference,
            medicalAdjustments,
            overallAdvice: generateOverallAdvice(organStatus, constitutionType, medicalAdjustments),
            analyzedAt: new Date().toISOString()
        };
    }
    
    /**
     * 分析各脏腑状态
     */
    function analyzeOrganStatus(wuXing, dayMaster) {
        const status = {};
        const wxTypes = ['木', '火', '土', '金', '水'];
        
        // 计算平均值和标准差
        const values = wxTypes.map(wx => wuXing[wx]);
        const avg = values.reduce((a, b) => a + b, 0) / values.length;
        const variance = values.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / values.length;
        const stdDev = Math.sqrt(variance);
        
        wxTypes.forEach(wx => {
            const count = wuXing[wx];
            const organInfo = ORGAN_MAP[wx];
            
            let level, description;
            const deviation = (count - avg) / stdDev;
            
            if (deviation > 0.5) {
                level = 'strong';
                description = `${organInfo.organ}气偏旺，注意疏泄`;
            } else if (deviation < -0.5) {
                level = 'weak';
                description = `${organInfo.organ}气偏弱，宜补益`;
            } else {
                level = 'normal';
                description = `${organInfo.organ}气平和`;
            }
            
            status[wx] = {
                organ: organInfo.organ,
                level,
                count: Math.round(count * 10) / 10,
                description,
                function: organInfo.function,
                recommendations: generateOrganRecommendations(wx, level)
            };
        });
        
        return status;
    }
    
    /**
     * 生成脏腑调理建议
     */
    function generateOrganRecommendations(wuXing, level) {
        const recommendations = {
            '木': {
                weak: ['食用绿色蔬菜', '适量酸味食物', '避免熬夜', '保持心情舒畅'],
                strong: ['清淡饮食', '适量甘味食物', '避免动怒', '适度运动']
            },
            '火': {
                weak: ['适量苦味食物', '红色食材', '避免过劳', '保证睡眠'],
                strong: ['清凉食物', '适量咸味', '避免辛辣', '静心养神']
            },
            '土': {
                weak: ['黄色食材', '适量甘味', '规律饮食', '避免思虑过度'],
                strong: ['清淡易消化', '适量运动', '避免甜腻', '按时进餐']
            },
            '金': {
                weak: ['白色食材', '适量辛味', '呼吸新鲜空气', '避免悲伤'],
                strong: ['润肺食物', '适量酸味', '避免燥热', '保持湿润']
            },
            '水': {
                weak: ['黑色食材', '适量咸味', '避免过劳', '保暖腰部'],
                strong: ['清淡利水', '适量苦燥', '避免寒凉', '节制房事']
            }
        };
        
        return recommendations[wuXing][level] || [];
    }
    
    /**
     * 确定体质类型
     */
    function determineConstitution(organStatus, wuXing, member) {
        const scores = {};
        
        // 初始化各体质分数
        Object.keys(CONSTITUTION_TYPES).forEach(type => {
            scores[type] = 0;
        });
        
        // 根据五行分布评分
        const weakOrgans = [];
        const strongOrgans = [];
        
        Object.entries(organStatus).forEach(([wx, info]) => {
            if (info.level === 'weak') weakOrgans.push(wx);
            if (info.level === 'strong') strongOrgans.push(wx);
        });
        
        // 气虚质：土弱或整体偏弱
        if (organStatus['土'].level === 'weak' || weakOrgans.length >= 3) {
            scores['气虚质'] += 3;
        }
        
        // 阳虚质：火弱或水旺
        if (organStatus['火'].level === 'weak' || organStatus['水'].level === 'strong') {
            scores['阳虚质'] += 2;
        }
        
        // 阴虚质：火旺或水弱
        if (organStatus['火'].level === 'strong' || organStatus['水'].level === 'weak') {
            scores['阴虚质'] += 2;
        }
        
        // 痰湿质：土旺且水不弱
        if (organStatus['土'].level === 'strong' && organStatus['水'].level !== 'weak') {
            scores['痰湿质'] += 3;
        }
        
        // 湿热质：火旺且土不弱
        if (organStatus['火'].level === 'strong' && organStatus['土'].level !== 'weak') {
            scores['湿热质'] += 2;
        }
        
        // 血瘀质：金旺或木郁
        if (organStatus['金'].level === 'strong' || 
            (organStatus['木'].level === 'weak' && organStatus['土'].level === 'strong')) {
            scores['血瘀质'] += 2;
        }
        
        // 气郁质：木弱或金旺克木
        if (organStatus['木'].level === 'weak' || 
            (organStatus['金'].level === 'strong' && organStatus['木'].level !== 'strong')) {
            scores['气郁质'] += 2;
        }
        
        // 特禀质：根据用户输入的条件判断
        if (member.conditions && /过敏|哮喘|湿疹|荨麻疹/i.test(member.conditions)) {
            scores['特禀质'] += 5;
        }
        
        // 平和质：五行相对平衡
        if (weakOrgans.length === 0 && strongOrgans.length <= 1) {
            scores['平和质'] += 3;
        }
        
        // 找出最高分的体质
        let maxScore = 0;
        let primaryType = '平和质';
        
        Object.entries(scores).forEach(([type, score]) => {
            if (score > maxScore) {
                maxScore = score;
                primaryType = type;
            }
        });
        
        // 如果最高分为0，默认为平和质
        if (maxScore === 0) {
            primaryType = '平和质';
        }
        
        return {
            primary: primaryType,
            info: CONSTITUTION_TYPES[primaryType],
            scores: scores,
            weakOrgans: weakOrgans.map(wx => ORGAN_MAP[wx].organ),
            strongOrgans: strongOrgans.map(wx => ORGAN_MAP[wx].organ)
        };
    }
    
    /**
     * 分析基础疾病的影响
     */
    function analyzeMedicalConditions(conditions) {
        if (!conditions) return null;
        
        const adjustments = {
            avoidFoods: [],
            recommendFoods: [],
            cookingMethods: [],
            notes: []
        };
        
        const conditionLower = conditions.toLowerCase();
        
        // 高血压
        if (/高血压|血压高/i.test(conditions)) {
            adjustments.avoidFoods.push('高盐食物', '腌制食品', '加工肉类');
            adjustments.recommendFoods.push('芹菜', '木耳', '海带', '西红柿');
            adjustments.cookingMethods.push('少盐', '清蒸', '水煮');
            adjustments.notes.push('每日盐摄入量控制在6克以下');
        }
        
        // 糖尿病
        if (/糖尿病|血糖高/i.test(conditions)) {
            adjustments.avoidFoods.push('精制糖', '白米白面', '甜饮料', '油炸食品');
            adjustments.recommendFoods.push('燕麦', '荞麦', '苦瓜', '南瓜');
            adjustments.cookingMethods.push('低油', '低糖', '定时定量');
            adjustments.notes.push('控制碳水化合物摄入，少食多餐');
        }
        
        // 高血脂
        if (/高血脂|血脂高/i.test(conditions)) {
            adjustments.avoidFoods.push('肥肉', '动物内脏', '油炸食品', '奶油');
            adjustments.recommendFoods.push('深海鱼', '燕麦', '豆制品', '绿茶');
            adjustments.cookingMethods.push('少油', '去油');
            adjustments.notes.push('限制饱和脂肪摄入，增加膳食纤维');
        }
        
        // 痛风
        if (/痛风|尿酸高/i.test(conditions)) {
            adjustments.avoidFoods.push('动物内脏', '海鲜', '浓肉汤', '啤酒');
            adjustments.recommendFoods.push('低脂奶', '鸡蛋', '大部分蔬菜', '樱桃');
            adjustments.notes.push('多饮水，每日2000ml以上');
        }
        
        // 胃病
        if (/胃炎|胃溃疡|胃病/i.test(conditions)) {
            adjustments.avoidFoods.push('辛辣食物', '生冷食物', '咖啡', '浓茶');
            adjustments.recommendFoods.push('小米粥', '山药', '南瓜', '猴头菇');
            adjustments.cookingMethods.push('软烂', '温热', '少食多餐');
            adjustments.notes.push('细嚼慢咽，避免过饱过饥');
        }
        
        // 肾病
        if (/肾病|肾功能/i.test(conditions)) {
            adjustments.avoidFoods.push('高蛋白食物', '高盐食物', '杨桃');
            adjustments.recommendFoods.push('低蛋白主食', '适量蔬菜');
            adjustments.notes.push('请在医生指导下控制饮食蛋白质');
        }
        
        return adjustments;
    }
    
    /**
     * 生成整体建议
     */
    function generateOverallAdvice(organStatus, constitutionType, medicalAdjustments) {
        const advice = [];
        
        // 基于体质的建议
        advice.push(`您的体质偏向：${constitutionType.primary}`);
        advice.push(constitutionType.info.description);
        advice.push(`饮食原则：${constitutionType.info.diet}`);
        
        // 脏腑调理重点
        const weakOrgans = Object.entries(organStatus)
            .filter(([_, info]) => info.level === 'weak')
            .map(([wx, info]) => info.organ);
        
        if (weakOrgans.length > 0) {
            advice.push(`建议重点调理：${weakOrgans.join('、')}`);
        }
        
        // 基础疾病注意事项
        if (medicalAdjustments && medicalAdjustments.notes.length > 0) {
            advice.push('特殊注意事项：' + medicalAdjustments.notes.join('；'));
        }
        
        return advice;
    }
    
    /**
     * 根据体质和健康状况推荐食材属性
     */
    function recommendFoodProperties(constitution) {
        if (!constitution) return { nature: [], flavor: [] };
        
        const primaryType = constitution.constitutionType.primary;
        
        const recommendations = {
            '平和质': {
                nature: ['平', '温', '凉'],
                flavor: ['甘', '淡']
            },
            '气虚质': {
                nature: ['温', '平'],
                flavor: ['甘']
            },
            '阳虚质': {
                nature: ['温', '热'],
                flavor: ['甘', '辛']
            },
            '阴虚质': {
                nature: ['凉', '寒'],
                flavor: ['甘', '酸']
            },
            '痰湿质': {
                nature: ['温', '平'],
                flavor: ['苦', '辛', '淡']
            },
            '湿热质': {
                nature: ['寒', '凉'],
                flavor: ['苦', '甘']
            },
            '血瘀质': {
                nature: ['温', '平'],
                flavor: ['辛', '甘']
            },
            '气郁质': {
                nature: ['温', '平'],
                flavor: ['辛', '甘']
            },
            '特禀质': {
                nature: ['平'],
                flavor: ['甘', '淡']
            }
        };
        
        return recommendations[primaryType] || recommendations['平和质'];
    }
    
    // 公开API
    return {
        analyze,
        recommendFoodProperties,
        CONSTITUTION_TYPES,
        ORGAN_MAP
    };
})();
