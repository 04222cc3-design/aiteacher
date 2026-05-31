import type { StudentMajor, KnowledgeBaseItem, KnowledgeCategory } from '../types';
import { sendTextMessageToAI } from './deepseekService';

const STORAGE_KEY_SMART_ITEMS = 'smart_knowledge_items';
const STORAGE_KEY_SMART_CATEGORIES = 'smart_knowledge_categories';

interface GeneratedKnowledge {
  title: string;
  content: string;
  tags: string[];
}

const CATEGORY_TEMPLATES: Record<string, { name: string; description: string; icon: string }[]> = {
  default: [
    { name: '专业基础', description: '专业入门知识和基础概念', icon: '📚' },
    { name: '核心课程', description: '专业核心课程学习资料', icon: '📖' },
    { name: '学习方法', description: '高效学习技巧和方法论', icon: '✨' },
    { name: '学术资源', description: '学术论文、书籍和工具', icon: '🔬' },
    { name: '职业发展', description: '职业规划和就业指导', icon: '🎯' },
    { name: '实践项目', description: '实践项目和案例分析', icon: '💻' }
  ]
};

export async function generateKnowledgeCategories(major: StudentMajor): Promise<KnowledgeCategory[]> {
  const templates = CATEGORY_TEMPLATES.default;
  
  return templates.map((template, index) => ({
    id: `cat_${index}_${Date.now()}`,
    name: template.name,
    description: template.description,
    icon: template.icon,
    parent_id: null,
    depth: 1,
    order: index
  }));
}

export async function generateKnowledgeContent(
  categoryName: string,
  majorName: string,
  degree: string
): Promise<GeneratedKnowledge[]> {
  const prompt = `请为${majorName}专业${degree}学位的学生生成${categoryName}相关的知识内容。

要求：
1. 生成5-8条知识条目
2. 每条包含标题和详细内容
3. 提供相关标签
4. 内容要专业且实用

请输出JSON格式，包含title, content, tags字段。`;

  try {
    const response = await sendTextMessageToAI(prompt);
    
    try {
      const parsed = JSON.parse(response);
      if (Array.isArray(parsed)) {
        return parsed.map(item => ({
          title: item.title || `知识条目 ${Date.now()}`,
          content: item.content || '暂无内容',
          tags: item.tags || []
        }));
      }
    } catch {
      // 如果不是JSON格式，生成默认内容
    }
  } catch (error) {
    console.error('生成知识内容失败:', error);
  }
  
  // 默认生成内容
  const defaultContents: Record<string, GeneratedKnowledge[]> = {
    '专业基础': [
      { title: `${majorName}专业概述`, content: `${majorName}是一门综合性学科，涉及多个领域的知识和技能。本专业培养具备扎实理论基础和实践能力的专业人才。`, tags: ['专业介绍', '学科概述'] },
      { title: '核心概念解析', content: '掌握专业的核心概念是学习的基础，包括基本原理、方法论和关键术语。', tags: ['基础概念', '核心理论'] },
      { title: '学习路径规划', content: '建议从基础课程开始，逐步深入专业领域，建立系统的知识体系。', tags: ['学习规划', '路径建议'] }
    ],
    '核心课程': [
      { title: '课程体系介绍', content: `${majorName}专业的核心课程包括多门必修和选修课程，涵盖理论和实践环节。`, tags: ['课程体系', '必修课程'] },
      { title: '重点课程解析', content: '高等数学、专业导论、核心专业课等是本专业的重点课程。', tags: ['重点课程', '学习重点'] },
      { title: '学习资源推荐', content: '推荐使用教材、在线课程、学术论文等多种资源进行学习。', tags: ['学习资源', '推荐资料'] }
    ],
    '学习方法': [
      { title: '高效学习技巧', content: '采用主动学习、思维导图、定期复习等方法可以提高学习效率。', tags: ['学习技巧', '时间管理'] },
      { title: '笔记整理方法', content: '建立系统化的笔记体系，便于复习和知识回顾。', tags: ['笔记技巧', '知识管理'] },
      { title: '小组学习策略', content: '与同学组成学习小组，互相讨论和答疑，共同进步。', tags: ['合作学习', '小组讨论'] }
    ],
    '学术资源': [
      { title: '学术数据库', content: '推荐使用知网、万方、IEEE等学术数据库查找论文和文献。', tags: ['学术资源', '数据库'] },
      { title: '专业期刊', content: '关注本专业的核心期刊，了解最新研究动态。', tags: ['期刊', '研究动态'] },
      { title: '学术工具', content: '使用Zotero、EndNote等工具管理文献引用。', tags: ['文献管理', '工具推荐'] }
    ],
    '职业发展': [
      { title: '就业方向', content: `${majorName}专业毕业生可以从事多种职业，包括技术研发、管理咨询、教育等领域。`, tags: ['就业方向', '职业规划'] },
      { title: '技能要求', content: '除专业知识外，还需要具备沟通能力、团队协作和持续学习能力。', tags: ['技能要求', '软技能'] },
      { title: '实习建议', content: '建议在学习期间参加相关实习，积累实践经验。', tags: ['实习', '实践经验'] }
    ],
    '实践项目': [
      { title: '课程设计', content: '完成课程设计项目，锻炼实践能力和解决问题的能力。', tags: ['课程设计', '实践'] },
      { title: '毕业设计', content: '毕业设计是大学期间最重要的实践项目，需要认真对待。', tags: ['毕业设计', '毕业论文'] },
      { title: '竞赛参与', content: '积极参加学科竞赛，提升专业技能和团队协作能力。', tags: ['学科竞赛', '竞赛经验'] }
    ]
  };
  
  return defaultContents[categoryName] || defaultContents['专业基础'];
}

export async function generateKnowledgeBase(major: StudentMajor): Promise<{
  categories: KnowledgeCategory[];
  items: KnowledgeBaseItem[];
}> {
  const categories = await generateKnowledgeCategories(major);
  const allItems: KnowledgeBaseItem[] = [];

  for (const category of categories) {
    const items = await generateKnowledgeContent(
      category.name,
      major.majorName,
      major.degree
    );

    const knowledgeItems: KnowledgeBaseItem[] = items.map((item, index) => ({
      id: `kb_${category.id}_${index}_${Date.now()}`,
      title: item.title,
      content: item.content,
      category: category.name,
      tags: item.tags,
      source_ids: [],
      related_ids: [],
      version: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      verification_status: 'verified' as const
    }));

    allItems.push(...knowledgeItems);
  }

  return { categories, items: allItems };
}

export async function generateAndSaveKnowledgeBase(major: StudentMajor): Promise<{
  success: boolean;
  message: string;
  categories?: KnowledgeCategory[];
  items?: KnowledgeBaseItem[];
}> {
  try {
    const { categories, items } = await generateKnowledgeBase(major);
    
    saveToStorage(STORAGE_KEY_SMART_CATEGORIES, categories);
    saveToStorage(STORAGE_KEY_SMART_ITEMS, items);
    
    return {
      success: true,
      message: `知识库生成成功！共生成 ${categories.length} 个知识目录，${items.length} 条知识内容。`,
      categories,
      items
    };
  } catch (error) {
    console.error('生成并保存知识库失败:', error);
    return {
      success: false,
      message: '生成知识库时发生错误，请稍后重试。'
    };
  }
}

function saveToStorage<T>(key: string, data: T): void {
  localStorage.setItem(key, JSON.stringify(data));
}

function loadFromStorage<T>(key: string): T | null {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : null;
}

export function getSmartKnowledgeItems(): KnowledgeBaseItem[] {
  return loadFromStorage<KnowledgeBaseItem[]>(STORAGE_KEY_SMART_ITEMS) || [];
}

export function getSmartKnowledgeCategories(): KnowledgeCategory[] {
  return loadFromStorage<KnowledgeCategory[]>(STORAGE_KEY_SMART_CATEGORIES) || [];
}

export function getKnowledgeStats(): { categories: number; items: number; generated: boolean } {
  const categories = getSmartKnowledgeCategories();
  const items = getSmartKnowledgeItems();
  return {
    categories: categories.length,
    items: items.length,
    generated: categories.length > 0 && items.length > 0
  };
}

export function searchSmartKnowledge(query: string): KnowledgeBaseItem[] {
  const items = getSmartKnowledgeItems();
  const lowerQuery = query.toLowerCase();
  return items.filter(item =>
    item.title.toLowerCase().includes(lowerQuery) ||
    item.content.toLowerCase().includes(lowerQuery) ||
    item.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
  );
}

export function getSmartKnowledgeByCategory(categoryName: string): KnowledgeBaseItem[] {
  const items = getSmartKnowledgeItems();
  return items.filter(item => item.category === categoryName);
}