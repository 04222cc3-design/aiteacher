const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://soxpkytjeqygryertwoe.supabase.co', 'sb_publishable_Fghoblj4Hzk1Mor3_j9T9g_NQrU57PC');
const fs = require('fs');

async function testUpload() {
  // 1. 先看看能不能列出存储桶
  console.log('=== 列出存储桶 ===');
  const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
  console.log('存储桶:', JSON.stringify(buckets));
  console.log('错误:', bucketError?.message);

  // 2. 尝试上传一个测试文件
  console.log('\n=== 尝试上传 ===');
  const testContent = 'test';
  const testBlob = new Blob([testContent], { type: 'text/plain' });
  
  // 用 File 对象模拟
  const testFile = new File([testContent], 'test.txt', { type: 'text/plain' });
  
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('lesson_materials')
    .upload(`public/test-${Date.now()}.txt`, testFile);

  console.log('上传结果:', JSON.stringify(uploadData));
  console.log('上传错误:', uploadError?.message);
  console.log('上传错误详情:', JSON.stringify(uploadError));

  // 3. 试试不用 public/ 前缀
  console.log('\n=== 尝试上传（无 public 前缀） ===');
  const { data: uploadData2, error: uploadError2 } = await supabase.storage
    .from('lesson_materials')
    .upload(`test-${Date.now()}.txt`, testFile);

  console.log('上传结果:', JSON.stringify(uploadData2));
  console.log('上传错误:', uploadError2?.message);
  console.log('上传错误详情:', JSON.stringify(uploadError2));
}

testUpload();
