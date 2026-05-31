const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://soxpkytjeqygryertwoe.supabase.co', 'sb_publishable_Fghoblj4Hzk1Mor3_j9T9g_NQrU57PC');

async function importLessons() {
  console.log('开始导入课程数据...\n');

  // 1. 先创建分类
  const categories = [
    { name: '核心课程' },
    { name: '考试与竞赛' },
    { name: '实践与规划' }
  ];

  const categoryIds = {};
  
  for (const cat of categories) {
    const { data, error } = await supabase
      .from('course_categories')
      .insert({ name: cat.name })
      .select();
    
    if (error) {
      console.error(`创建分类 "${cat.name}" 失败:`, error.message);
      return;
    }
    categoryIds[cat.name] = data[0].id;
    console.log(`✅ 创建分类: ${cat.name} (${data[0].id})`);
  }

  // 2. 创建课程
  const lessons = [
    // 核心课程
    {
      category: '核心课程',
      title: '大学学习效率与工程实践',
      description: '学习效率提升方法、番茄工作法、工程实践能力培养',
      system_prompt: ''
    },
    {
      category: '核心课程',
      title: '大学学习方法',
      description: '网课学习技巧、时间管理、四象限法则、番茄工作法',
      system_prompt: ''
    },
    // 考试与竞赛
    {
      category: '考试与竞赛',
      title: '考试技巧',
      description: '考前准备策略、各题型答题技巧、心态调整方法',
      system_prompt: ''
    },
    {
      category: '考试与竞赛',
      title: '科研竞赛',
      description: '科研入门方法、竞赛参与策略、论文写作与展示技巧',
      system_prompt: ''
    },
    // 实践与规划
    {
      category: '实践与规划',
      title: '社会实践',
      description: '实践类型、机会寻找、技能培养、成果转化',
      system_prompt: ''
    },
    {
      category: '实践与规划',
      title: '考研就业',
      description: '考研规划、就业准备、保研攻略、多元出路分析',
      system_prompt: ''
    },
    {
      category: '实践与规划',
      title: '专业能力',
      description: '专业认知、课程学习、技能拓展、项目实践、持续学习',
      system_prompt: ''
    }
  ];

  for (const lesson of lessons) {
    const { data, error } = await supabase
      .from('lessons')
      .insert({
        category_id: categoryIds[lesson.category],
        title: lesson.title,
        description: lesson.description,
        system_prompt: lesson.system_prompt
      })
      .select();
    
    if (error) {
      console.error(`创建课程 "${lesson.title}" 失败:`, error.message);
    } else {
      console.log(`✅ 创建课程: ${lesson.title} (${data[0].id})`);
    }
  }

  console.log('\n🎉 所有课程导入完成！');
  console.log('请刷新教师端页面 http://localhost:3000/teacher 查看');
}

importLessons();
