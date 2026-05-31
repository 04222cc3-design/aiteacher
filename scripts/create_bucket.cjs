const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://soxpkytjeqygryertwoe.supabase.co', 'sb_publishable_Fghoblj4Hzk1Mor3_j9T9g_NQrU57PC');

async function createBucket() {
  // 创建 lesson_materials 存储桶
  const { data, error } = await supabase.storage.createBucket('lesson_materials', {
    public: true,
    allowedMimeTypes: ['application/pdf', 'video/mp4', 'video/webm'],
    fileSizeLimit: 52428800 // 50MB
  });

  if (error) {
    console.error('创建存储桶失败:', error.message);
    console.log('可能需要用 service_role key 才能创建存储桶');
    console.log('请手动在 Supabase Dashboard 创建:');
    console.log('1. 打开 Storage');
    console.log('2. 点击 "New Bucket"');
    console.log('3. Name: lesson_materials');
    console.log('4. Public: 勾选');
    console.log('5. 点击 "Create bucket"');
    return;
  }

  console.log('✅ 存储桶创建成功:', data);
}

createBucket();
