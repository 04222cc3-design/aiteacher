import type { 
  StudentMajor, 
  Course, 
  AcademicPlan, 
  AcademicRisk, 
  LearningProgress,
  ThesisWriting,
  LiteratureReading,
  AcademicStatistics,
  PlanMilestone,
  ReferenceItem,
  ThesisChapter
} from '../types';

// 学业数据存储（使用localStorage）
const STORAGE_KEYS = {
  MAJOR: 'academic_mentor_major',
  COURSES: 'academic_mentor_courses',
  PLANS: 'academic_mentor_plans',
  RISKS: 'academic_mentor_risks',
  PROGRESS: 'academic_mentor_progress',
  THESIS: 'academic_mentor_thesis',
  LITERATURE: 'academic_mentor_literature'
};

// 辅助函数：生成UUID
function generateId(): string {
  return 'id_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// 辅助函数：保存到localStorage
function saveToStorage<T>(key: string, data: T[]): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error('保存数据失败:', error);
  }
}

// 辅助函数：从localStorage读取
function loadFromStorage<T>(key: string): T[] {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('读取数据失败:', error);
    return [];
  }
}

// ==================== 专业信息管理 ====================

export function saveStudentMajor(major: Omit<StudentMajor, 'id' | 'createdAt' | 'updatedAt'>): StudentMajor {
  const majors = loadFromStorage<StudentMajor>(STORAGE_KEYS.MAJOR);
  const now = new Date().toISOString();
  
  const newMajor: StudentMajor = {
    ...major,
    id: generateId(),
    createdAt: now,
    updatedAt: now
  };
  
  majors.push(newMajor);
  saveToStorage(STORAGE_KEYS.MAJOR, majors);
  
  return newMajor;
}

export function getStudentMajor(): StudentMajor | null {
  const majors = loadFromStorage<StudentMajor>(STORAGE_KEYS.MAJOR);
  return majors.length > 0 ? majors[majors.length - 1] : null;
}

export function updateStudentMajor(id: string, updates: Partial<StudentMajor>): StudentMajor | null {
  const majors = loadFromStorage<StudentMajor>(STORAGE_KEYS.MAJOR);
  const index = majors.findIndex(m => m.id === id);
  
  if (index === -1) return null;
  
  majors[index] = {
    ...majors[index],
    ...updates,
    updatedAt: new Date().toISOString()
  };
  
  saveToStorage(STORAGE_KEYS.MAJOR, majors);
  return majors[index];
}

// ==================== 课程管理 ====================

export function addCourse(course: Omit<Course, 'id' | 'createdAt' | 'updatedAt'>): Course {
  const courses = loadFromStorage<Course>(STORAGE_KEYS.COURSES);
  const now = new Date().toISOString();
  
  const newCourse: Course = {
    ...course,
    id: generateId(),
    createdAt: now,
    updatedAt: now
  };
  
  courses.push(newCourse);
  saveToStorage(STORAGE_KEYS.COURSES, courses);
  
  // 自动检查学业风险
  checkAcademicRisks();
  
  return newCourse;
}

export function getCourses(): Course[] {
  return loadFromStorage<Course>(STORAGE_KEYS.COURSES);
}

export function getCourseById(id: string): Course | undefined {
  const courses = loadFromStorage<Course>(STORAGE_KEYS.COURSES);
  return courses.find(c => c.id === id);
}

export function updateCourse(id: string, updates: Partial<Course>): Course | null {
  const courses = loadFromStorage<Course>(STORAGE_KEYS.COURSES);
  const index = courses.findIndex(c => c.id === id);
  
  if (index === -1) return null;
  
  courses[index] = {
    ...courses[index],
    ...updates,
    updatedAt: new Date().toISOString()
  };
  
  saveToStorage(STORAGE_KEYS.COURSES, courses);
  
  // 自动检查学业风险
  checkAcademicRisks();
  
  return courses[index];
}

export function deleteCourse(id: string): boolean {
  const courses = loadFromStorage<Course>(STORAGE_KEYS.COURSES);
  const filteredCourses = courses.filter(c => c.id !== id);
  
  if (filteredCourses.length === courses.length) return false;
  
  saveToStorage(STORAGE_KEYS.COURSES, filteredCourses);
  return true;
}

// ==================== 学业规划管理 ====================

export function createAcademicPlan(plan: Omit<AcademicPlan, 'id' | 'createdAt' | 'updatedAt'>): AcademicPlan {
  const plans = loadFromStorage<AcademicPlan>(STORAGE_KEYS.PLANS);
  const now = new Date().toISOString();
  
  const newPlan: AcademicPlan = {
    ...plan,
    id: generateId(),
    createdAt: now,
    updatedAt: now
  };
  
  plans.push(newPlan);
  saveToStorage(STORAGE_KEYS.PLANS, plans);
  
  return newPlan;
}

export function getAcademicPlans(): AcademicPlan[] {
  return loadFromStorage<AcademicPlan>(STORAGE_KEYS.PLANS);
}

export function getActivePlans(): AcademicPlan[] {
  const plans = getAcademicPlans();
  return plans.filter(p => p.status === '进行中' || p.status === '待开始');
}

export function updatePlanProgress(id: string, progress: number): AcademicPlan | null {
  const plans = loadFromStorage<AcademicPlan>(STORAGE_KEYS.PLANS);
  const index = plans.findIndex(p => p.id === id);
  
  if (index === -1) return null;
  
  const status = progress >= 100 ? '已完成' : 
                 progress > 0 ? '进行中' : '待开始';
  
  plans[index] = {
    ...plans[index],
    progress,
    status,
    updatedAt: new Date().toISOString()
  };
  
  saveToStorage(STORAGE_KEYS.PLANS, plans);
  return plans[index];
}

export function addMilestone(planId: string, milestone: Omit<PlanMilestone, 'id'>): PlanMilestone | null {
  const plans = loadFromStorage<AcademicPlan>(STORAGE_KEYS.PLANS);
  const index = plans.findIndex(p => p.id === planId);
  
  if (index === -1) return null;
  
  const newMilestone: PlanMilestone = {
    ...milestone,
    id: generateId()
  };
  
  plans[index].milestones.push(newMilestone);
  plans[index].updatedAt = new Date().toISOString();
  
  saveToStorage(STORAGE_KEYS.PLANS, plans);
  return newMilestone;
}

export function updateMilestoneStatus(planId: string, milestoneId: string, status: PlanMilestone['status']): boolean {
  const plans = loadFromStorage<AcademicPlan>(STORAGE_KEYS.PLANS);
  const planIndex = plans.findIndex(p => p.id === planId);
  
  if (planIndex === -1) return false;
  
  const milestoneIndex = plans[planIndex].milestones.findIndex(m => m.id === milestoneId);
  if (milestoneIndex === -1) return false;
  
  plans[planIndex].milestones[milestoneIndex].status = status;
  if (status === 'completed') {
    plans[planIndex].milestones[milestoneIndex].completedAt = new Date().toISOString();
  }
  
  // 重新计算计划进度
  const completedMilestones = plans[planIndex].milestones.filter(m => m.status === 'completed').length;
  const totalMilestones = plans[planIndex].milestones.length;
  plans[planIndex].progress = totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0;
  plans[planIndex].updatedAt = new Date().toISOString();
  
  saveToStorage(STORAGE_KEYS.PLANS, plans);
  return true;
}

// ==================== 学业风险预警 ====================

export function checkAcademicRisks(): AcademicRisk[] {
  const risks = loadFromStorage<AcademicRisk>(STORAGE_KEYS.RISKS);
  const courses = getCourses();
  const major = getStudentMajor();
  
  // 清除已解决的风险
  const activeRisks = risks.filter(r => r.status !== 'resolved');
  
  // 检查成绩下滑风险
  const failedCourses = courses.filter(c => c.status === '未通过');
  if (failedCourses.length > 0) {
    const existingRisk = activeRisks.find(r => r.riskType === '成绩下滑');
    if (!existingRisk) {
      const newRisk: AcademicRisk = {
        id: generateId(),
        studentId: major?.id || 'unknown',
        riskType: '成绩下滑',
        severity: failedCourses.length >= 3 ? 'high' : 'medium',
        title: '检测到未通过课程',
        description: `您有 ${failedCourses.length} 门课程未通过，建议及时补考或重修`,
        relatedCourseIds: failedCourses.map(c => c.id),
        suggestions: [
          '及时联系任课教师了解补考安排',
          '分析未通过原因，制定复习计划',
          '参加补考或重修，避免影响毕业'
        ],
        status: 'identified',
        identifiedAt: new Date().toISOString()
      };
      activeRisks.push(newRisk);
    }
  }
  
  // 检查学分不足风险
  if (major) {
    const completedCredits = courses
      .filter(c => c.status === '已通过')
      .reduce((sum, c) => sum + c.credits, 0);
    
    const requiredCredits = major.requiredCredits;
    const currentSemester = new Date().getFullYear();
    const studyYears = currentSemester - major.enrollmentYear;
    const expectedCredits = (requiredCredits / 4) * Math.min(studyYears + 1, 4);
    
    if (completedCredits < expectedCredits * 0.8) {
      const existingRisk = activeRisks.find(r => r.riskType === '学分不足');
      if (!existingRisk) {
        const newRisk: AcademicRisk = {
          id: generateId(),
          studentId: major.id,
          riskType: '学分不足',
          severity: (expectedCredits - completedCredits) > 10 ? 'high' : 'medium',
          title: '学分进度落后',
          description: `当前应完成约 ${Math.round(expectedCredits)} 学分，实际完成 ${completedCredits} 学分`,
          relatedCourseIds: [],
          suggestions: [
            '检查是否有漏修的必修课程',
            '考虑增加下学期的选课数量',
            '咨询学业导师了解补救方案'
          ],
          status: 'identified',
          identifiedAt: new Date().toISOString()
        };
        activeRisks.push(newRisk);
      }
    }
  }
  
  saveToStorage(STORAGE_KEYS.RISKS, activeRisks);
  return activeRisks;
}

export function getAcademicRisks(): AcademicRisk[] {
  return loadFromStorage<AcademicRisk>(STORAGE_KEYS.RISKS);
}

export function getActiveRisks(): AcademicRisk[] {
  const risks = getAcademicRisks();
  return risks.filter(r => r.status !== 'resolved');
}

export function resolveRisk(id: string): boolean {
  const risks = loadFromStorage<AcademicRisk>(STORAGE_KEYS.RISKS);
  const index = risks.findIndex(r => r.id === id);
  
  if (index === -1) return false;
  
  risks[index].status = 'resolved';
  risks[index].resolvedAt = new Date().toISOString();
  
  saveToStorage(STORAGE_KEYS.RISKS, risks);
  return true;
}

// ==================== 学习进度追踪 ====================

export function updateLearningProgress(courseId: string, updates: Partial<LearningProgress>): LearningProgress | null {
  const progressList = loadFromStorage<LearningProgress>(STORAGE_KEYS.PROGRESS);
  const index = progressList.findIndex(p => p.courseId === courseId);
  
  const now = new Date().toISOString();
  
  if (index === -1) {
    // 创建新的学习进度记录
    const newProgress: LearningProgress = {
      id: generateId(),
      courseId,
      progress: 0,
      completedChapters: [],
      notes: '',
      lastStudiedAt: now,
      studyTimeTotal: 0,
      difficulties: [],
      createdAt: now,
      updatedAt: now,
      ...updates
    };
    
    progressList.push(newProgress);
    saveToStorage(STORAGE_KEYS.PROGRESS, progressList);
    return newProgress;
  } else {
    // 更新现有记录
    progressList[index] = {
      ...progressList[index],
      ...updates,
      lastStudiedAt: now,
      updatedAt: now
    };
    
    saveToStorage(STORAGE_KEYS.PROGRESS, progressList);
    return progressList[index];
  }
}

export function getLearningProgress(courseId?: string): LearningProgress | LearningProgress[] | null {
  const progressList = loadFromStorage<LearningProgress>(STORAGE_KEYS.PROGRESS);
  
  if (courseId) {
    return progressList.find(p => p.courseId === courseId) || null;
  }
  
  return progressList.length > 0 ? progressList : null;
}

// ==================== 论文写作管理 ====================

export function createThesisWriting(thesis: Omit<ThesisWriting, 'id' | 'createdAt' | 'updatedAt'>): ThesisWriting {
  const thesisList = loadFromStorage<ThesisWriting>(STORAGE_KEYS.THESIS);
  const now = new Date().toISOString();
  
  const newThesis: ThesisWriting = {
    ...thesis,
    id: generateId(),
    createdAt: now,
    updatedAt: now
  };
  
  thesisList.push(newThesis);
  saveToStorage(STORAGE_KEYS.THESIS, thesisList);
  
  return newThesis;
}

export function getThesisWritings(): ThesisWriting[] {
  return loadFromStorage<ThesisWriting>(STORAGE_KEYS.THESIS);
}

export function getActiveThesis(): ThesisWriting | null {
  const thesisList = getThesisWritings();
  const activeList = thesisList.filter(t => t.status !== '已完成' && t.status !== '已提交');
  return activeList.length > 0 ? activeList[0] : null;
}

export function updateThesisWriting(id: string, updates: Partial<ThesisWriting>): ThesisWriting | null {
  const thesisList = loadFromStorage<ThesisWriting>(STORAGE_KEYS.THESIS);
  const index = thesisList.findIndex(t => t.id === id);
  
  if (index === -1) return null;
  
  thesisList[index] = {
    ...thesisList[index],
    ...updates,
    updatedAt: new Date().toISOString()
  };
  
  saveToStorage(STORAGE_KEYS.THESIS, thesisList);
  return thesisList[index];
}

export function addReference(thesisId: string, reference: Omit<ReferenceItem, 'id'>): ReferenceItem | null {
  const thesisList = loadFromStorage<ThesisWriting>(STORAGE_KEYS.THESIS);
  const index = thesisList.findIndex(t => t.id === thesisId);
  
  if (index === -1) return null;
  
  const newReference: ReferenceItem = {
    ...reference,
    id: generateId()
  };
  
  thesisList[index].references.push(newReference);
  thesisList[index].updatedAt = new Date().toISOString();
  
  saveToStorage(STORAGE_KEYS.THESIS, thesisList);
  return newReference;
}

export function addChapter(thesisId: string, chapter: Omit<ThesisChapter, 'id'>): ThesisChapter | null {
  const thesisList = loadFromStorage<ThesisWriting>(STORAGE_KEYS.THESIS);
  const index = thesisList.findIndex(t => t.id === thesisId);
  
  if (index === -1) return null;
  
  const newChapter: ThesisChapter = {
    ...chapter,
    id: generateId()
  };
  
  thesisList[index].chapters.push(newChapter);
  thesisList[index].updatedAt = new Date().toISOString();
  
  saveToStorage(STORAGE_KEYS.THESIS, thesisList);
  return newChapter;
}

// ==================== 文献阅读管理 ====================

export function addLiteratureReading(literature: Omit<LiteratureReading, 'id' | 'createdAt' | 'updatedAt'>): LiteratureReading {
  const literatureList = loadFromStorage<LiteratureReading>(STORAGE_KEYS.LITERATURE);
  const now = new Date().toISOString();
  
  const newLiterature: LiteratureReading = {
    ...literature,
    id: generateId(),
    createdAt: now,
    updatedAt: now
  };
  
  literatureList.push(newLiterature);
  saveToStorage(STORAGE_KEYS.LITERATURE, literatureList);
  
  return newLiterature;
}

export function getLiteratureReadings(): LiteratureReading[] {
  return loadFromStorage<LiteratureReading>(STORAGE_KEYS.LITERATURE);
}

export function updateLiteratureReading(id: string, updates: Partial<LiteratureReading>): LiteratureReading | null {
  const literatureList = loadFromStorage<LiteratureReading>(STORAGE_KEYS.LITERATURE);
  const index = literatureList.findIndex(l => l.id === id);
  
  if (index === -1) return null;
  
  literatureList[index] = {
    ...literatureList[index],
    ...updates,
    updatedAt: new Date().toISOString()
  };
  
  saveToStorage(STORAGE_KEYS.LITERATURE, literatureList);
  return literatureList[index];
}

// ==================== 学业统计 ====================

export function getAcademicStatistics(): AcademicStatistics {
  const courses = getCourses();
  const plans = getAcademicPlans();
  const thesisList = getThesisWritings();
  const literature = getLiteratureReadings();
  const risks = getAcademicRisks();
  const major = getStudentMajor();
  
  const completedCourses = courses.filter(c => c.status === '已通过');
  const failedCourses = courses.filter(c => c.status === '未通过');
  
  // 计算GPA
  const gradedCourses = courses.filter(c => c.grade !== undefined);
  const gpa = gradedCourses.length > 0 
    ? gradedCourses.reduce((sum, c) => sum + (c.score || 0), 0) / gradedCourses.length 
    : 0;
  
  // 计算已获学分
  const completedCredits = completedCourses.reduce((sum, c) => sum + c.credits, 0);
  
  return {
    totalCredits: major?.requiredCredits || 0,
    completedCredits,
    gpa: Math.round(gpa * 100) / 100,
    majorGpa: gpa, // 简化计算
    courseCount: courses.length,
    passedCount: completedCourses.length,
    failedCount: failedCourses.length,
    riskCount: risks.filter(r => r.status !== 'resolved').length,
    planCount: plans.filter(p => p.status === '进行中').length,
    thesisCount: thesisList.filter(t => t.status !== '已完成' && t.status !== '已提交').length,
    literatureCount: literature.filter(l => l.readStatus === '已读').length
  };
}

// ==================== AI规划建议 ====================

export function generateAcademicAdvice(): string[] {
  const statistics = getAcademicStatistics();
  const risks = getActiveRisks();
  const plans = getActivePlans();
  const courses = getCourses();
  const major = getStudentMajor();
  
  const advice: string[] = [];
  
  // 基于风险的警告
  if (risks.length > 0) {
    const highSeverityRisks = risks.filter(r => r.severity === 'high' || r.severity === 'critical');
    if (highSeverityRisks.length > 0) {
      advice.push(`⚠️ 您有 ${highSeverityRisks.length} 项高风险学业问题需要关注，建议优先处理`);
    }
  }
  
  // 基于学分的建议
  const creditProgress = statistics.totalCredits > 0 
    ? Math.round((statistics.completedCredits / statistics.totalCredits) * 100) 
    : 0;
  
  if (creditProgress < 50) {
    advice.push(`📚 当前学分完成进度为 ${creditProgress}%，建议加强课程学习，提高学分获取效率`);
  } else if (creditProgress > 80) {
    advice.push(`🎓 学分进度良好，已完成 ${creditProgress}%，继续保持当前学习状态`);
  }
  
  // 基于GPA的建议
  const validGpa = typeof statistics.gpa === 'number' && !isNaN(statistics.gpa) && statistics.gpa > 0;
  if (validGpa && statistics.gpa < 2.5) {
    advice.push(`📈 您的平均绩点为 ${statistics.gpa.toFixed(2)}，建议重点关注核心课程，提高成绩`);
  } else if (validGpa && statistics.gpa >= 3.5) {
    advice.push(`🌟 优秀！您的平均绩点达到 ${statistics.gpa.toFixed(2)}，继续保持`);
  }
  
  // 基于考试记录的建议
  if (statistics.failedCount > 0) {
    advice.push(`🔄 您有 ${statistics.failedCount} 门课程未通过，建议尽快安排补考或重修`);
  }
  
  // 基于规划的建议
  if (plans.length > 0) {
    const overduePlans = plans.filter(p => new Date(p.targetDate) < new Date());
    if (overduePlans.length > 0) {
      advice.push(`📋 您有 ${overduePlans.length} 项学业规划已逾期，请及时调整或重新规划`);
    }
  }
  
  // 论文建议
  if (statistics.thesisCount > 0) {
    advice.push(`📝 您有 ${statistics.thesisCount} 篇论文正在进行中，注意按进度完成各章节`);
  }
  
  // 毕业规划建议
  if (major) {
    const yearsToGraduation = major.expectedGraduationYear - new Date().getFullYear();
    if (yearsToGraduation <= 1 && creditProgress < 80) {
      advice.push(`⏰ 距预计毕业时间不足一年，学分进度需要加快，建议咨询学业导师`);
    }
  }
  
  // 通用建议
  if (advice.length === 0) {
    advice.push(`✨ 您的学业状态良好，继续保持当前的学习节奏`);
    advice.push(`💡 建议定期更新学习进度，以便获得更精准的规划建议`);
  }
  
  return advice;
}

// ==================== 论文写作指导建议 ====================

export function generateThesisGuidance(): {
  general: string[];
  structure: string[];
  writing: string[];
  commonMistakes: string[];
} {
  return {
    general: [
      '论文写作是一个迭代过程，不要期望一蹴而就',
      '建议先完成文献综述，了解研究领域的现状和发展趋势',
      '与导师保持定期沟通，及时获取反馈和指导',
      '制定详细的写作计划，设定明确的里程碑'
    ],
    structure: [
      '标题：简洁明了，反映研究核心内容',
      '摘要：独立成文，涵盖研究目的、方法、结果和结论',
      '引言：介绍研究背景、研究问题和研究意义',
      '文献综述：系统梳理相关研究，指出研究空白',
      '研究方法：详细描述研究设计、数据收集和分析方法',
      '结果：客观呈现研究结果，使用图表辅助说明',
      '讨论：解释结果，与已有研究比较，讨论局限性和未来方向',
      '结论：总结主要发现，提出研究贡献和实践意义'
    ],
    writing: [
      '使用清晰、简洁的学术语言',
      '避免口语化和主观情感表达',
      '保持逻辑连贯，段落之间有清晰的过渡',
      '正确引用文献，遵循学术规范',
      '注意语法、拼写和格式的统一性'
    ],
    commonMistakes: [
      '研究问题不明确或过于宽泛',
      '文献综述不够系统全面',
      '研究方法描述不够详细',
      '结果与讨论混淆',
      '引用格式不统一或遗漏',
      '缺乏对研究局限性的讨论'
    ]
  };
}

// ==================== 文献阅读指导建议 ====================

export function generateLiteratureGuidance(): {
  general: string[];
  reading: string[];
  noteTaking: string[];
  evaluation: string[];
} {
  return {
    general: [
      '优先阅读高质量期刊和顶级会议论文',
      '从综述性文章开始，建立领域知识框架',
      '关注论文的引用次数和研究影响力',
      '跟踪领域内的知名研究者的工作'
    ],
    reading: [
      '先读标题和摘要，判断论文的相关性',
      '仔细阅读引言，了解研究背景和动机',
      '重点阅读研究方法和结果部分',
      '批判性思考，关注研究的创新点和局限性',
      '最后阅读讨论部分，理解作者的解释'
    ],
    noteTaking: [
      '记录论文的基本信息（作者、年份、期刊等）',
      '概括研究目的、主要方法和核心发现',
      '记录关键数据、图表和重要引用',
      '写下自己的思考、疑问和启发',
      '定期整理笔记，建立知识管理系统'
    ],
    evaluation: [
      '研究问题是否重要且明确',
      '研究方法是否适当和严谨',
      '结果是否可靠和有效',
      '讨论是否深入和客观',
      '论文的创新点和贡献是什么',
      '对你的研究有什么启发和借鉴'
    ]
  };
}