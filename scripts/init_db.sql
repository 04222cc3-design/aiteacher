-- 创建课程分类表
CREATE TABLE IF NOT EXISTS course_categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建课程表
CREATE TABLE IF NOT EXISTS lessons (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    category_id UUID REFERENCES course_categories(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT DEFAULT '',
    system_prompt TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 启用 RLS
ALTER TABLE course_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;

-- 允许所有用户读写（开发阶段）
CREATE POLICY "Allow all on course_categories" ON course_categories
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all on lessons" ON lessons
    FOR ALL USING (true) WITH CHECK (true);
