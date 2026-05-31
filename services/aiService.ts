import type { StudentMajor, Course, AcademicPlan } from '../types';
import { sendTextMessageToAI } from './deepseekService';

export interface AIAnalysisResult {
  type: 'summary' | 'warning' | 'recommendation';
  title: string;
  content: string;
  confidence: number;
  suggestions: string[];
  priority: 'high' | 'medium' | 'low';
}

interface ChatContext {
  history: { role: string; content: string }[];
  timestamp: number;
}

const chatContexts = new Map<string | undefined, ChatContext>();

function getOrCreateContext(major?: string): ChatContext {
  const key = major || 'default';
  if (!chatContexts.has(key)) {
    chatContexts.set(key, {
      history: [],
      timestamp: Date.now()
    });
  }
  return chatContexts.get(key)!;
}

function updateContext(context: ChatContext, role: string, content: string): void {
  context.history.push({ role, content });
  context.timestamp = Date.now();
  
  if (context.history.length > 20) {
    context.history.shift();
  }
}

function buildPrompt(query: string, context: ChatContext, major?: string): string {
  let prompt = `你是一位专业的学业导师AI助手。`;
  
  if (major) {
    prompt += `用户的专业是：${major}。`;
  }
  
  prompt += `请根据以下对话历史和用户的问题，提供专业、友好的回答。

对话历史：
${context.history.map(h => `${h.role === 'user' ? '用户' : '助手'}: ${h.content}`).join('\n')}

用户问题：${query}

请用中文回答，保持专业且易懂。`;
  
  return prompt;
}

export async function aiChat(query: string, major?: string): Promise<string> {
  const context = getOrCreateContext(major);
  const prompt = buildPrompt(query, context, major);
  
  try {
    const response = await sendTextMessageToAI(prompt);
    updateContext(context, 'user', query);
    updateContext(context, 'assistant', response);
    return response;
  } catch (error) {
    console.error('AI问答失败:', error);
    return '抱歉，AI服务暂时不可用，请稍后再试。';
  }
}

export async function analyzeAcademicData(
  major: StudentMajor,
  courses: Course[],
  plans: AcademicPlan[]
): Promise<AIAnalysisResult[]> {
  const results: AIAnalysisResult[] = [];
  
  const academicData = {
    major: major.majorName,
    degree: major.degree,
    entranceYear: major.entranceYear,
    courses: courses.map(c => ({
      name: c.name,
      credit: c.credit,
      grade: c.grade,
      completed: c.completed
    })),
    plans: plans.map(p => ({
      id: p.id,
      title: p.title,
      progress: p.progress,
      milestones: p.milestones?.length || 0
    }))
  };

  const prompt = `请分析以下学生的学业数据，并提供结构化的分析报告：

${JSON.stringify(academicData, null, 2)}

请输出JSON格式的分析结果，包含以下类型的分析：
1. summary: 总体学业状况总结
2. warning: 需要关注的风险点
3. recommendation: 改进建议

每个分析项应包含：type, title, content, confidence(0-1), suggestions(array), priority(high/medium/low)`;

  try {
    const response = await sendTextMessageToAI(prompt);
    
    try {
      const parsed = JSON.parse(response);
      if (Array.isArray(parsed)) {
        return parsed.map(item => ({
          ...item,
          confidence: typeof item.confidence === 'number' ? item.confidence : 0.8
        }));
      } else if (typeof parsed === 'object' && parsed !== null) {
        return [{
          ...parsed,
          confidence: typeof parsed.confidence === 'number' ? parsed.confidence : 0.8
        }];
      } else {
        results.push({
          type: 'summary',
          title: '学业分析报告',
          content: response,
          confidence: 0.85,
          suggestions: [],
          priority: 'medium'
        });
      }
    } catch {
      results.push({
        type: 'summary',
        title: '学业分析报告',
        content: response,
        confidence: 0.85,
        suggestions: [],
        priority: 'medium'
      });
    }
  } catch (error) {
    console.error('AI分析失败:', error);
    results.push({
      type: 'summary',
      title: '分析暂不可用',
      content: 'AI服务暂时不可用，系统将使用本地分析。',
      confidence: 0.6,
      suggestions: ['请检查网络连接', '稍后重试'],
      priority: 'low'
    });
  }
  
  return results;
}

export async function generateAcademicPlan(
  major: StudentMajor,
  currentSemester: number
): Promise<string> {
  const prompt = `请为以下学生生成一份个性化的学业规划：

专业：${major.majorName}
学位：${major.degree}
入学年份：${major.entranceYear}
当前学期：第${currentSemester}学期

请提供详细的规划建议，包括：
1. 当前学期应重点关注的课程
2. 未来学期的选课建议
3. 学业目标设定
4. 时间管理建议

请用中文回答，保持专业且易懂。`;

  try {
    return await sendTextMessageToAI(prompt);
  } catch (error) {
    console.error('AI规划生成失败:', error);
    return '抱歉，AI规划生成服务暂时不可用。';
  }
}

export async function predictAcademicRisk(
  courses: Course[],
  gpa: number
): Promise<string> {
  const prompt = `请分析以下学业数据，预测可能的学业风险：

当前GPA：${gpa}

课程列表：
${courses.map(c => `${c.name}: ${c.grade || '未修'} (${c.credit}学分)`).join('\n')}

请分析可能存在的风险，如：
1. 成绩下滑风险
2. 学分不足风险
3. 课程难度挑战
4. 时间管理问题

请用中文回答，提供风险评估和应对建议。`;

  try {
    return await sendTextMessageToAI(prompt);
  } catch (error) {
    console.error('AI风险预测失败:', error);
    return '抱歉，AI风险预测服务暂时不可用。';
  }
}