const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://soxpkytjeqygryertwoe.supabase.co', 'sb_publishable_Fghoblj4Hzk1Mor3_j9T9g_NQrU57PC');

async function init() {
  // 先检查表是否存在
  const { data: checkData, error: checkError } = await supabase.from('course_categories').select('id').limit(1);
  
  if (checkError && checkError.code === 'PGRST205') {
    console.log('表不存在，需要通过 Supabase Dashboard 创建...');
    console.log('');
    console.log('请按以下步骤操作：');
    console.log('1. 打开 https://supabase.com/dashboard');
    console.log('2. 选择项目 soxpkytjeqygryertwoe');
    console.log('3. 进入 SQL Editor');
    console.log('4. 复制 scripts/init_db.sql 的内容并执行');
    console.log('');
    console.log('或者，我直接通过 REST API 尝试创建...');
    
    // 使用 Supabase Management API 需要 service_role key
    // 尝试用 SQL 方式
    try {
      const response = await fetch('https://soxpkytjeqygryertwoe.supabase.co/rest/v1/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': 'sb_publishable_Fghoblj4Hzk1Mor3_j9T9g_NQrU57PC',
          'Authorization': 'Bearer sb_publishable_Fghoblj4Hzk1Mor3_j9T9g_NQrU57PC',
          'Prefer': 'resolution=merge-duplicates'
        }
      });
      console.log('Response:', response.status);
    } catch(e) {
      console.log('Error:', e.message);
    }
  } else {
    console.log('表已存在，可以导入数据');
  }
}

init();
