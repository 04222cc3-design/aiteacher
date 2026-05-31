import { createClient } from '@supabase/supabase-js';

// 使用你当前项目的 Supabase 凭据
const supabaseUrl = 'https://soxpkytjeqygryertwoe.supabase.co';   // 你的 Project URL
const supabaseAnonKey = 'sb_publishable_Fghoblj4Hzk1Mor3_j9T9g_NQrU57PC';     // 你的 Publishable key（完整复制）

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Supabase credentials are not set.");
}

export const supabase = createClient(supabaseUrl!, supabaseAnonKey!);
