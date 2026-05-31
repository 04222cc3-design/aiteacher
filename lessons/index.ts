import type { CourseCategory } from '../types';
import { lessonScript as universityLessonScript, lessonSummary as universityLessonSummary } from './university-learning-cn';
import { lessonScript as studyMethodsScript, lessonSummary as studyMethodsSummary } from './study-methods-cn';
import { lessonScript as examSkillsScript, lessonSummary as examSkillsSummary } from './exam-skills-cn';
import { lessonScript as researchCompetitionScript, lessonSummary as researchCompetitionSummary } from './research-competition-cn';
import { lessonScript as socialPracticeScript, lessonSummary as socialPracticeSummary } from './social-practice-cn';
import { lessonScript as graduateEmploymentScript, lessonSummary as graduateEmploymentSummary } from './graduate-employment-cn';
import { lessonScript as professionalSkillsScript, lessonSummary as professionalSkillsSummary } from './professional-skills-cn';

// 本地课程脚本映射表
export const localLessons: Record<string, {
  script: typeof universityLessonScript;
  summary: string;
}> = {
  'local-lesson-1': {
    script: universityLessonScript,
    summary: universityLessonSummary,
  },
  'local-lesson-2': {
    script: studyMethodsScript,
    summary: studyMethodsSummary,
  },
  'local-lesson-3': {
    script: examSkillsScript,
    summary: examSkillsSummary,
  },
  'local-lesson-4': {
    script: researchCompetitionScript,
    summary: researchCompetitionSummary,
  },
  'local-lesson-5': {
    script: socialPracticeScript,
    summary: socialPracticeSummary,
  },
  'local-lesson-6': {
    script: graduateEmploymentScript,
    summary: graduateEmploymentSummary,
  },
  'local-lesson-7': {
    script: professionalSkillsScript,
    summary: professionalSkillsSummary,
  },
};

// 本地课程分类
export const courseCategories: CourseCategory[] = [
  {
    id: 'local-cat-1',
    name: '核心课程',
    lessons: [
      {
        id: 'local-lesson-1',
        category_id: 'local-cat-1',
        title: '大学学习效率与工程实践',
        description: '学习效率提升方法、番茄工作法、工程实践能力培养',
        system_prompt: '',
      },
      {
        id: 'local-lesson-2',
        category_id: 'local-cat-1',
        title: '大学学习方法',
        description: '网课学习技巧、时间管理、四象限法则、番茄工作法',
        system_prompt: '',
      },
    ],
  },
  {
    id: 'local-cat-2',
    name: '考试与竞赛',
    lessons: [
      {
        id: 'local-lesson-3',
        category_id: 'local-cat-2',
        title: '考试技巧',
        description: '考前准备策略、各题型答题技巧、心态调整方法',
        system_prompt: '',
      },
      {
        id: 'local-lesson-4',
        category_id: 'local-cat-2',
        title: '科研竞赛',
        description: '科研入门方法、竞赛参与策略、论文写作与展示技巧',
        system_prompt: '',
      },
    ],
  },
  {
    id: 'local-cat-3',
    name: '实践与规划',
    lessons: [
      {
        id: 'local-lesson-5',
        category_id: 'local-cat-3',
        title: '社会实践',
        description: '实践类型、机会寻找、技能培养、成果转化',
        system_prompt: '',
      },
      {
        id: 'local-lesson-6',
        category_id: 'local-cat-3',
        title: '考研就业',
        description: '考研规划、就业准备、保研攻略、多元出路分析',
        system_prompt: '',
      },
      {
        id: 'local-lesson-7',
        category_id: 'local-cat-3',
        title: '专业能力',
        description: '专业认知、课程学习、技能拓展、项目实践、持续学习',
        system_prompt: '',
      },
    ],
  },
];

