/**
 * 食谱数据库模块 - Family Diet
 * 内置基础食谱数据，支持中医食疗属性
 */

const RecipeDatabase = (function() {
    'use strict';
    
    // 食谱数据
    const recipes = [
        // ========== 早餐 ==========
        {
            id: 'b1',
            name: '小米南瓜粥',
            type: 'breakfast',
            calories: 180,
            time: 30,
            difficulty: '简单',
            image: '🥣',
            ingredients: [
                { name: '小米', amount: '50g' },
                { name: '南瓜', amount: '100g' },
                { name: '红枣', amount: '3颗' },
                { name: '水', amount: '800ml' }
            ],
            steps: [
                '小米洗净，用清水浸泡20分钟',
                '南瓜去皮去籽，切成小块',
                '锅中加水烧开，放入小米和南瓜',
                '大火煮沸后转小火，熬煮20-25分钟',
                '加入红枣，再煮5分钟即可'
            ],
            tcm: {
                nature: '温',
                flavor: ['甘'],
                meridian: ['脾', '胃'],
                benefits: '健脾和胃，补中益气，适合脾胃虚弱者',
                suitFor: ['气虚质', '阳虚质', '平和质'],
                avoid: ['湿热质']
            },
            tags: ['养胃', '易消化', '甜味']
        },
        {
            id: 'b2',
            name: '燕麦香蕉奶昔',
            type: 'breakfast',
            calories: 220,
            time: 5,
            difficulty: '简单',
            image: '🥤',
            ingredients: [
                { name: '燕麦片', amount: '30g' },
                { name: '香蕉', amount: '1根' },
                { name: '牛奶', amount: '250ml' },
                { name: '蜂蜜', amount: '适量' }
            ],
            steps: [
                '燕麦片用少量热水泡软',
                '香蕉切段',
                '将燕麦、香蕉、牛奶放入搅拌机',
                '搅打30秒至顺滑',
                '倒入杯中，可加蜂蜜调味'
            ],
            tcm: {
                nature: '平',
                flavor: ['甘'],
                meridian: ['脾', '大肠'],
                benefits: '润肠通便，健脾养胃，提供持久能量',
                suitFor: ['气虚质', '阴虚质', '平和质'],
                avoid: ['痰湿质', '糖尿病']
            },
            tags: ['快手', '高纤维', '能量']
        },
        {
            id: 'b3',
            name: '全麦蔬菜三明治',
            type: 'breakfast',
            calories: 280,
            time: 10,
            difficulty: '简单',
            image: '🥪',
            ingredients: [
                { name: '全麦面包', amount: '2片' },
                { name: '生菜', amount: '2片' },
                { name: '番茄', amount: '2片' },
                { name: '黄瓜', amount: '适量' },
                { name: '鸡蛋', amount: '1个' },
                { name: '低脂沙拉酱', amount: '少许' }
            ],
            steps: [
                '鸡蛋煮熟切片或煎成荷包蛋',
                '蔬菜洗净，番茄黄瓜切片',
                '面包片上涂抹少许沙拉酱',
                '依次铺上生菜、番茄、黄瓜、鸡蛋',
                '盖上另一片面包，对角切开即可'
            ],
            tcm: {
                nature: '凉',
                flavor: ['甘', '淡'],
                meridian: ['肝', '胃'],
                benefits: '清热利湿，补充维生素，低脂健康',
                suitFor: ['湿热质', '痰湿质', '平和质'],
                avoid: ['阳虚质']
            },
            tags: ['低脂', '高纤维', '维生素']
        },
        {
            id: 'b4',
            name: '山药红枣蒸糕',
            type: 'breakfast',
            calories: 160,
            time: 25,
            difficulty: '中等',
            image: '🍰',
            ingredients: [
                { name: '山药', amount: '150g' },
                { name: '红枣', amount: '30g' },
                { name: '糯米粉', amount: '50g' },
                { name: '白糖', amount: '20g' }
            ],
            steps: [
                '山药去皮蒸熟，压成泥',
                '红枣去核切碎',
                '将山药泥、糯米粉、白糖混合',
                '加入红枣碎拌匀',
                '放入蒸锅，大火蒸15分钟即可'
            ],
            tcm: {
                nature: '平',
                flavor: ['甘'],
                meridian: ['脾', '肺', '肾'],
                benefits: '健脾益胃，补肾固精，润肺止咳',
                suitFor: ['气虚质', '阳虚质', '阴虚质'],
                avoid: ['湿热质', '糖尿病']
            },
            tags: ['健脾', '补气', '甜点']
        },
        {
            id: 'b5',
            name: '紫菜蛋花汤面',
            type: 'breakfast',
            calories: 240,
            time: 15,
            difficulty: '简单',
            image: '🍜',
            ingredients: [
                { name: '挂面', amount: '80g' },
                { name: '鸡蛋', amount: '1个' },
                { name: '紫菜', amount: '5g' },
                { name: '虾皮', amount: '5g' },
                { name: '葱花', amount: '适量' }
            ],
            steps: [
                '锅中加水烧开，放入挂面煮熟',
                '紫菜撕碎放入碗中',
                '打入蛋花（水开后慢慢倒入搅散）',
                '加入虾皮、盐调味',
                '撒上葱花，淋少许香油'
            ],
            tcm: {
                nature: '寒',
                flavor: ['咸', '甘'],
                meridian: ['肾', '胃'],
                benefits: '软坚散结，补肾养心，补充碘元素',
                suitFor: ['阴虚质', '气郁质'],
                avoid: ['阳虚质', '脾胃虚寒']
            },
            tags: ['补钙', '快手', '暖胃']
        },

        // ========== 午餐 ==========
        {
            id: 'l1',
            name: '清蒸鲈鱼',
            type: 'lunch',
            calories: 150,
            time: 20,
            difficulty: '中等',
            image: '🐟',
            ingredients: [
                { name: '鲈鱼', amount: '1条(约500g)' },
                { name: '葱', amount: '2根' },
                { name: '姜', amount: '1块' },
                { name: '蒸鱼豉油', amount: '2勺' },
                { name: '料酒', amount: '1勺' }
            ],
            steps: [
                '鲈鱼处理干净，两面划几刀',
                '鱼身抹料酒，塞入姜片腌制10分钟',
                '水开后放入蒸锅，大火蒸8-10分钟',
                '取出倒掉蒸出的汤汁',
                '铺上葱丝，淋蒸鱼豉油，浇热油'
            ],
            tcm: {
                nature: '平',
                flavor: ['甘'],
                meridian: ['肝', '脾', '肾'],
                benefits: '补肝肾，益脾胃，化痰止咳',
                suitFor: ['气虚质', '阴虚质', '平和质'],
                avoid: ['痛风']
            },
            tags: ['高蛋白', '低脂', '补钙']
        },
        {
            id: 'l2',
            name: '蒜蓉西兰花',
            type: 'lunch',
            calories: 80,
            time: 10,
            difficulty: '简单',
            image: '🥦',
            ingredients: [
                { name: '西兰花', amount: '300g' },
                { name: '大蒜', amount: '4瓣' },
                { name: '生抽', amount: '1勺' },
                { name: '蚝油', amount: '1勺' }
            ],
            steps: [
                '西兰花掰小朵，用盐水浸泡洗净',
                '蒜切末',
                '水烧开，加少许盐和油，焯水1分钟',
                '热锅凉油，爆香蒜末',
                '放入西兰花，加生抽蚝油，快速翻炒出锅'
            ],
            tcm: {
                nature: '凉',
                flavor: ['甘'],
                meridian: ['肝', '胃'],
                benefits: '清热解毒，护肝明目，抗氧化',
                suitFor: ['湿热质', '气郁质', '平和质'],
                avoid: ['阳虚质']
            },
            tags: ['高维C', '抗氧化', '素食']
        },
        {
            id: 'l3',
            name: '红烧排骨',
            type: 'lunch',
            calories: 320,
            time: 45,
            difficulty: '中等',
            image: '🍖',
            ingredients: [
                { name: '猪小排', amount: '500g' },
                { name: '葱', amount: '2根' },
                { name: '姜', amount: '3片' },
                { name: '冰糖', amount: '20g' },
                { name: '生抽', amount: '2勺' },
                { name: '老抽', amount: '1勺' }
            ],
            steps: [
                '排骨冷水下锅焯水去血沫',
                '捞出洗净沥干',
                '锅中放油，小火炒糖色',
                '放入排骨翻炒上色',
                '加葱姜、生抽老抽，加水没过排骨',
                '大火烧开转小火炖30分钟，收汁即可'
            ],
            tcm: {
                nature: '平',
                flavor: ['甘', '咸'],
                meridian: ['脾', '胃'],
                benefits: '滋阴润燥，益精补血，强筋健骨',
                suitFor: ['气虚质', '血虚质', '阴虚质'],
                avoid: ['湿热质', '高血脂', '肥胖']
            },
            tags: ['补钙', '高蛋白', '下饭菜']
        },
        {
            id: 'l4',
            name: '麻婆豆腐',
            type: 'lunch',
            calories: 200,
            time: 15,
            difficulty: '中等',
            image: '🍲',
            ingredients: [
                { name: '嫩豆腐', amount: '400g' },
                { name: '猪肉末', amount: '50g' },
                { name: '豆瓣酱', amount: '1勺' },
                { name: '花椒粉', amount: '适量' },
                { name: '蒜末', amount: '适量' }
            ],
            steps: [
                '豆腐切2cm方块，淡盐水浸泡',
                '热锅凉油，炒香肉末',
                '加入豆瓣酱、蒜末炒出红油',
                '加水烧开，放入豆腐',
                '小火炖煮5分钟，勾芡收汁',
                '装盘后撒上花椒粉'
            ],
            tcm: {
                nature: '温',
                flavor: ['辛', '甘'],
                meridian: ['脾', '胃', '大肠'],
                benefits: '开胃健脾，温中散寒，促进食欲',
                suitFor: ['阳虚质', '气虚质'],
                avoid: ['阴虚质', '湿热质', '胃病患者']
            },
            tags: ['高蛋白', '开胃', '下饭']
        },
        {
            id: 'l5',
            name: '番茄炒蛋',
            type: 'lunch',
            calories: 160,
            time: 10,
            difficulty: '简单',
            image: '🍳',
            ingredients: [
                { name: '番茄', amount: '2个' },
                { name: '鸡蛋', amount: '3个' },
                { name: '白糖', amount: '1勺' },
                { name: '盐', amount: '适量' },
                { name: '葱花', amount: '适量' }
            ],
            steps: [
                '番茄切块，鸡蛋打散加少许盐',
                '热锅放油，倒入蛋液炒熟盛出',
                '锅中再加少许油，放入番茄翻炒',
                '加入白糖，炒出汁水',
                '倒入炒好的鸡蛋，翻炒均匀',
                '撒葱花出锅'
            ],
            tcm: {
                nature: '凉',
                flavor: ['酸', '甘'],
                meridian: ['肝', '脾'],
                benefits: '生津止渴，健胃消食，滋阴润燥',
                suitFor: ['阴虚质', '湿热质', '平和质'],
                avoid: ['阳虚质']
            },
            tags: ['家常', '维C', '易做']
        },

        // ========== 下午茶 ==========
        {
            id: 's1',
            name: '枸杞菊花茶',
            type: 'snack',
            calories: 15,
            time: 5,
            difficulty: '简单',
            image: '🍵',
            ingredients: [
                { name: '枸杞', amount: '10g' },
                { name: '菊花', amount: '5g' },
                { name: '冰糖', amount: '适量' }
            ],
            steps: [
                '枸杞、菊花用清水冲洗',
                '放入杯中，加沸水冲泡',
                '加盖焖5分钟',
                '可根据口味加冰糖调味'
            ],
            tcm: {
                nature: '凉',
                flavor: ['甘', '苦'],
                meridian: ['肝', '肾'],
                benefits: '清肝明目，滋阴降火，适合用眼过度者',
                suitFor: ['阴虚质', '湿热质', '气郁质'],
                avoid: ['阳虚质', '脾胃虚寒']
            },
            tags: ['明目', '降火', '零卡']
        },
        {
            id: 's2',
            name: '核桃芝麻糊',
            type: 'snack',
            calories: 180,
            time: 15,
            difficulty: '简单',
            image: '🥜',
            ingredients: [
                { name: '核桃仁', amount: '30g' },
                { name: '黑芝麻', amount: '30g' },
                { name: '糯米', amount: '20g' },
                { name: '冰糖', amount: '适量' }
            ],
            steps: [
                '糯米提前浸泡2小时',
                '核桃仁、芝麻炒香',
                '将所有材料放入豆浆机',
                '加适量水，选择米糊功能',
                '煮好后加冰糖调味'
            ],
            tcm: {
                nature: '温',
                flavor: ['甘'],
                meridian: ['肾', '肺', '大肠'],
                benefits: '补肾益精，润肠通便，乌发养颜',
                suitFor: ['阳虚质', '阴虚质', '气虚质'],
                avoid: ['痰湿质', '腹泻']
            },
            tags: ['补肾', '乌发', '能量']
        },
        {
            id: 's3',
            name: '银耳雪梨羹',
            type: 'snack',
            calories: 120,
            time: 40,
            difficulty: '简单',
            image: '🍐',
            ingredients: [
                { name: '银耳', amount: '1朵' },
                { name: '雪梨', amount: '1个' },
                { name: '冰糖', amount: '30g' },
                { name: '枸杞', amount: '10g' }
            ],
            steps: [
                '银耳提前泡发，撕成小朵',
                '雪梨去皮去核切块',
                '银耳加水大火煮开，转小火炖30分钟',
                '加入雪梨、冰糖继续炖10分钟',
                '出锅前加入枸杞'
            ],
            tcm: {
                nature: '凉',
                flavor: ['甘'],
                meridian: ['肺', '胃'],
                benefits: '润肺止咳，滋阴养颜，生津止渴',
                suitFor: ['阴虚质', '燥热体质'],
                avoid: ['阳虚质', '痰湿质', '脾胃虚寒']
            },
            tags: ['润肺', '养颜', '低卡']
        },

        // ========== 晚餐 ==========
        {
            id: 'd1',
            name: '冬瓜薏米排骨汤',
            type: 'dinner',
            calories: 200,
            time: 60,
            difficulty: '简单',
            image: '🍲',
            ingredients: [
                { name: '冬瓜', amount: '300g' },
                { name: '薏米', amount: '50g' },
                { name: '排骨', amount: '300g' },
                { name: '姜片', amount: '3片' }
            ],
            steps: [
                '薏米提前浸泡2小时',
                '排骨焯水去血沫',
                '锅中加水，放入排骨、薏米、姜片',
                '大火煮开转小火炖40分钟',
                '加入冬瓜块，继续炖15分钟',
                '加盐调味即可'
            ],
            tcm: {
                nature: '凉',
                flavor: ['甘', '淡'],
                meridian: ['脾', '肺', '肾'],
                benefits: '利水消肿，健脾祛湿，清热解暑',
                suitFor: ['痰湿质', '湿热质', '水肿'],
                avoid: ['阳虚质', '孕妇']
            },
            tags: ['祛湿', '低卡', '清热']
        },
        {
            id: 'd2',
            name: '蒜蓉粉丝蒸娃娃菜',
            type: 'dinner',
            calories: 90,
            time: 15,
            difficulty: '简单',
            image: '🥬',
            ingredients: [
                { name: '娃娃菜', amount: '2颗' },
                { name: '粉丝', amount: '50g' },
                { name: '大蒜', amount: '1头' },
                { name: '蒸鱼豉油', amount: '2勺' }
            ],
            steps: [
                '粉丝温水泡软',
                '娃娃菜洗净切半',
                '大蒜切末，一半炒香',
                '盘子铺粉丝，放上娃娃菜',
                '撒上金银蒜（生熟混合）',
                '蒸8-10分钟，淋豉油即可'
            ],
            tcm: {
                nature: '凉',
                flavor: ['甘'],
                meridian: ['胃', '大肠'],
                benefits: '清热解毒，养胃生津，低热量',
                suitFor: ['阴虚质', '湿热质', '减肥'],
                avoid: ['阳虚质', '腹泻']
            },
            tags: ['低卡', '素食', '快手']
        },
        {
            id: 'd3',
            name: '黑木耳炒山药',
            type: 'dinner',
            calories: 110,
            time: 15,
            difficulty: '简单',
            image: '🍄',
            ingredients: [
                { name: '山药', amount: '200g' },
                { name: '黑木耳', amount: '50g(干)' },
                { name: '胡萝卜', amount: '50g' },
                { name: '蒜末', amount: '适量' }
            ],
            steps: [
                '木耳提前泡发，撕小朵',
                '山药去皮切片，泡水中防氧化',
                '胡萝卜切片',
                '热锅凉油，爆香蒜末',
                '依次放入胡萝卜、木耳、山药翻炒',
                '加少许盐调味，炒匀出锅'
            ],
            tcm: {
                nature: '平',
                flavor: ['甘'],
                meridian: ['脾', '肺', '肾'],
                benefits: '健脾益胃，补肾固精，活血化瘀',
                suitFor: ['气虚质', '阴虚质', '血瘀质'],
                avoid: []
            },
            tags: ['素食', '健脾', '低卡']
        },
        {
            id: 'd4',
            name: '莲藕排骨汤',
            type: 'dinner',
            calories: 220,
            time: 90,
            difficulty: '简单',
            image: '🥣',
            ingredients: [
                { name: '莲藕', amount: '300g' },
                { name: '排骨', amount: '400g' },
                { name: '花生', amount: '50g' },
                { name: '姜片', amount: '3片' }
            ],
            steps: [
                '花生提前浸泡1小时',
                '排骨焯水去血沫',
                '莲藕去皮切块',
                '所有材料放入锅中，加水',
                '大火煮开转小火炖1.5小时',
                '加盐调味即可'
            ],
            tcm: {
                nature: '寒',
                flavor: ['甘'],
                meridian: ['心', '脾', '胃'],
                benefits: '清热生津，健脾开胃，养血止血',
                suitFor: ['阴虚质', '血热体质'],
                avoid: ['阳虚质', '脾胃虚寒']
            },
            tags: ['补血', '养颜', '滋补']
        },
        {
            id: 'd5',
            name: '白灼虾',
            type: 'dinner',
            calories: 100,
            time: 10,
            difficulty: '简单',
            image: '🦐',
            ingredients: [
                { name: '鲜虾', amount: '300g' },
                { name: '姜片', amount: '3片' },
                { name: '料酒', amount: '1勺' },
                { name: '蘸料', amount: '适量' }
            ],
            steps: [
                '虾洗净，剪去虾须',
                '锅中加水、姜片、料酒烧开',
                '放入虾，煮至变色卷曲（约2分钟）',
                '立即捞出过冰水（可选）',
                '配蘸料食用'
            ],
            tcm: {
                nature: '温',
                flavor: ['甘', '咸'],
                meridian: ['肝', '肾'],
                benefits: '补肾壮阳，通乳抗毒，益气养血',
                suitFor: ['阳虚质', '气虚质', '肾虚'],
                avoid: ['痛风', '过敏体质', '湿热质']
            },
            tags: ['高蛋白', '低脂', '补肾']
        },
        {
            id: 'd6',
            name: '苦瓜酿肉',
            type: 'dinner',
            calories: 180,
            time: 30,
            difficulty: '中等',
            image: '🥒',
            ingredients: [
                { name: '苦瓜', amount: '2根' },
                { name: '猪肉馅', amount: '200g' },
                { name: '香菇', amount: '3朵' },
                { name: '生抽', amount: '1勺' }
            ],
            steps: [
                '苦瓜切段去瓤，焯水去苦味',
                '香菇切末，与肉馅混合',
                '加生抽、料酒、淀粉调味',
                '将肉馅塞入苦瓜段',
                '摆盘蒸15分钟',
                '可淋芡汁增味'
            ],
            tcm: {
                nature: '寒',
                flavor: ['苦'],
                meridian: ['心', '肝', '脾'],
                benefits: '清热解暑，明目解毒，降血糖',
                suitFor: ['湿热质', '阴虚质', '糖尿病'],
                avoid: ['阳虚质', '脾胃虚寒', '孕妇']
            },
            tags: ['清热', '降糖', '明目']
        }
    ];
    
    /**
     * 获取所有食谱
     */
    function getAllRecipes() {
        return [...recipes];
    }
    
    /**
     * 根据类型获取食谱
     */
    function getRecipesByType(type) {
        return recipes.filter(r => r.type === type);
    }
    
    /**
     * 根据ID获取食谱
     */
    function getRecipeById(id) {
        return recipes.find(r => r.id === id) || null;
    }
    
    /**
     * 搜索食谱
     */
    function searchRecipes(query) {
        const lowerQuery = query.toLowerCase();
        return recipes.filter(r => 
            r.name.toLowerCase().includes(lowerQuery) ||
            r.ingredients.some(i => i.name.includes(lowerQuery)) ||
            r.tags.some(t => t.includes(lowerQuery))
        );
    }
    
    /**
     * 根据体质推荐食谱
     */
    function recommendByConstitution(constitution, mealType = null) {
        const primaryType = constitution.constitutionType.primary;
        
        let candidates = mealType ? getRecipesByType(mealType) : getAllRecipes();
        
        return candidates.filter(recipe => {
            const tcm = recipe.tcm;
            
            // 优先推荐适合该体质的
            if (tcm.suitFor.includes(primaryType)) {
                return true;
            }
            
            // 避免不适合的
            if (tcm.avoid.includes(primaryType)) {
                return false;
            }
            
            // 检查基础疾病禁忌
            const medical = constitution.medicalAdjustments;
            if (medical) {
                // 检查食材是否在被推荐列表中
                const isRecommended = medical.recommendFoods.some(food => 
                    recipe.ingredients.some(i => i.name.includes(food))
                );
                if (isRecommended) return true;
                
                // 检查是否包含禁忌食材
                const hasAvoided = medical.avoidFoods.some(food =>
                    recipe.ingredients.some(i => i.name.includes(food))
                );
                if (hasAvoided) return false;
            }
            
            return true;
        });
    }
    
    /**
     * 生成一周食谱
     */
    function generateWeeklyMenu(members, weekOffset = 0) {
        const weekDays = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
        const mealTypes = ['breakfast', 'lunch', 'snack', 'dinner'];
        const mealNames = {
            'breakfast': '早餐',
            'lunch': '午餐', 
            'snack': '下午茶',
            'dinner': '晚餐'
        };
        
        const menu = {};
        
        // 根据家庭成员综合推荐
        const allRecommendations = members.map(m => {
            if (m.constitution) {
                return recommendByConstitution(m.constitution);
            }
            return getAllRecipes();
        });
        
        weekDays.forEach((day, dayIndex) => {
            menu[day] = {};
            
            // 使用周偏移和日期确保每周不同
            const seed = weekOffset * 7 + dayIndex;
            
            mealTypes.forEach(type => {
                // 获取该餐类型的推荐食谱
                const typeRecipes = allRecommendations
                    .flat()
                    .filter(r => r.type === type);
                
                // 去重
                const uniqueRecipes = [...new Map(typeRecipes.map(r => [r.id, r])).values()];
                
                if (uniqueRecipes.length > 0) {
                    // 根据seed选择，确保每周相同天的推荐一致
                    const index = (seed + type.length) % uniqueRecipes.length;
                    menu[day][mealNames[type]] = uniqueRecipes[index];
                }
            });
        });
        
        return menu;
    }
    
    // 公开API
    return {
        getAllRecipes,
        getRecipesByType,
        getRecipeById,
        searchRecipes,
        recommendByConstitution,
        generateWeeklyMenu
    };
})();
