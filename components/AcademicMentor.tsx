import React, { useState, useCallback, useEffect } from 'react';
import type { 
  StudentMajor, 
  Course, 
  AcademicPlan, 
  AcademicRisk, 
  ThesisWriting,
  LiteratureReading,
  AcademicStatistics,
  KnowledgeBaseItem,
  KnowledgeCategory
} from '../types';
import {
  saveStudentMajor,
  getStudentMajor,
  updateStudentMajor,
  addCourse,
  getCourses,
  updateCourse,
  deleteCourse,
  getAcademicPlans,
  createAcademicPlan,
  updatePlanProgress,
  addMilestone,
  updateMilestoneStatus,
  getAcademicRisks,
  getActiveRisks,
  resolveRisk,
  getAcademicStatistics,
  generateAcademicAdvice,
  generateThesisGuidance,
  generateLiteratureGuidance
} from '../services/academicMentorService';
import {
  getKnowledgeCategories,
  getKnowledgeByCategory,
  searchKnowledge
} from '../services/knowledgeBaseService';
import {
  aiChat,
  analyzeAcademicData,
  AIAnalysisResult
} from '../services/aiService';
import {
  generateAndSaveKnowledgeBase,
  getSmartKnowledgeItems,
  getSmartKnowledgeCategories,
  getKnowledgeStats,
  searchSmartKnowledge,
  getSmartKnowledgeByCategory
} from '../services/smartKnowledgeService';

interface AcademicMentorProps {
  onClose: () => void;
}

type TabType = 'overview' | 'major' | 'courses' | 'plans' | 'risks' | 'thesis' | 'literature' | 'knowledge' | 'qa';

export const AcademicMentor: React.FC<AcademicMentorProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [statistics, setStatistics] = useState<AcademicStatistics | null>(null);
  const [advice, setAdvice] = useState<string[]>([]);
  const [major, setMajor] = useState<StudentMajor | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [plans, setPlans] = useState<AcademicPlan[]>([]);
  const [risks, setRisks] = useState<AcademicRisk[]>([]);
  const [thesisList, setThesisList] = useState<ThesisWriting[]>([]);
  const [literature, setLiterature] = useState<LiteratureReading[]>([]);
  const [knowledgeCategories, setKnowledgeCategories] = useState<KnowledgeCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [knowledgeItems, setKnowledgeItems] = useState<KnowledgeBaseItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [qaQuery, setQaQuery] = useState('');
  const [qaAnswer, setQaAnswer] = useState('');
  const [qaLoading, setQaLoading] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysisResult[]>([]);
  const [aiAnalyzing, setAiAnalyzing] = useState(false);
  const [smartKnowledgeItems, setSmartKnowledgeItems] = useState<KnowledgeBaseItem[]>([]);
  const [smartKnowledgeCategories, setSmartKnowledgeCategories] = useState<KnowledgeCategory[]>([]);
  const [isGeneratingKnowledge, setIsGeneratingKnowledge] = useState(false);
  const [knowledgeGenerationStatus, setKnowledgeGenerationStatus] = useState<string>('');

  // 加载数据
  useEffect(() => {
    loadData();
  }, []);

  const loadData = useCallback(() => {
    setStatistics(getAcademicStatistics());
    setAdvice(generateAcademicAdvice());
    setMajor(getStudentMajor());
    setCourses(getCourses());
    setPlans(getAcademicPlans());
    setRisks(getActiveRisks());
    setThesisList([]);
    setLiterature([]);
    setKnowledgeCategories(getKnowledgeCategories());
    // 加载智能知识库
    setSmartKnowledgeItems(getSmartKnowledgeItems());
    setSmartKnowledgeCategories(getSmartKnowledgeCategories());
    // 触发AI分析
    triggerAiAnalysis();
  }, []);

  const triggerAiAnalysis = useCallback(async () => {
    const currentMajor = getStudentMajor();
    const currentCourses = getCourses();
    const currentPlans = getAcademicPlans();
    
    if (!currentMajor) return;
    
    setAiAnalyzing(true);
    try {
      const analysis = await analyzeAcademicData(currentMajor, currentCourses, currentPlans);
      setAiAnalysis(analysis);
    } catch (error) {
      console.error('AI分析失败:', error);
    } finally {
      setAiAnalyzing(false);
    }
  }, []);

  const handleGenerateKnowledge = useCallback(async () => {
    const currentMajor = getStudentMajor();
    if (!currentMajor) {
      setKnowledgeGenerationStatus('请先设置专业信息');
      return;
    }

    setIsGeneratingKnowledge(true);
    setKnowledgeGenerationStatus('正在生成知识目录...');

    try {
      const result = await generateAndSaveKnowledgeBase(currentMajor);
      
      if (result.success) {
        setSmartKnowledgeCategories(result.categories || []);
        setSmartKnowledgeItems(result.items || []);
        setKnowledgeGenerationStatus(result.message);
        setActiveTab('knowledge'); // 跳转到知识库页面
      } else {
        setKnowledgeGenerationStatus(result.message);
      }
    } catch (error) {
      setKnowledgeGenerationStatus('生成知识库时发生错误');
    } finally {
      setIsGeneratingKnowledge(false);
    }
  }, []);

  const handleSaveMajor = useCallback((majorData: Omit<StudentMajor, 'id' | 'createdAt' | 'updatedAt'>) => {
    const savedMajor = saveStudentMajor(majorData);
    setMajor(savedMajor);
    setStatistics(getAcademicStatistics());
    setAdvice(generateAcademicAdvice());
    setActiveTab('overview'); // 保存后自动跳转到总览显示建议
  }, []);

  const handleAddCourse = useCallback((courseData: Omit<Course, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newCourse = addCourse(courseData);
    setCourses([...courses, newCourse]);
    setStatistics(getAcademicStatistics());
    setAdvice(generateAcademicAdvice());
    setActiveTab('overview'); // 添加课程后自动跳转到总览显示建议
  }, [courses]);

  const handleUpdateCourse = useCallback((id: string, updates: Partial<Course>) => {
    const updatedCourse = updateCourse(id, updates);
    if (updatedCourse) {
      setCourses(courses.map(c => c.id === id ? updatedCourse : c));
      setStatistics(getAcademicStatistics());
      setAdvice(generateAcademicAdvice());
      setActiveTab('overview'); // 更新课程后自动跳转到总览显示建议
    }
  }, [courses]);

  const handleDeleteCourse = useCallback((id: string) => {
    if (deleteCourse(id)) {
      setCourses(courses.filter(c => c.id !== id));
      setStatistics(getAcademicStatistics());
      setActiveTab('overview'); // 删除课程后自动跳转到总览显示建议
    }
  }, [courses]);

  const handleCreatePlan = useCallback((planData: Omit<AcademicPlan, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newPlan = createAcademicPlan(planData);
    setPlans([...plans, newPlan]);
    setActiveTab('overview'); // 创建规划后自动跳转到总览显示建议
  }, [plans]);

  const handleUpdatePlanProgress = useCallback((id: string, progress: number) => {
    const updatedPlan = updatePlanProgress(id, progress);
    if (updatedPlan) {
      setPlans(plans.map(p => p.id === id ? updatedPlan : p));
    }
  }, [plans]);

  const handleResolveRisk = useCallback((id: string) => {
    if (resolveRisk(id)) {
      const newRisks = risks.filter(r => r.id !== id);
      setRisks(newRisks);
      setStatistics(getAcademicStatistics());
      setAdvice(generateAcademicAdvice());
      setActiveTab('overview');
    }
  }, [risks]);

  const handleSelectCategory = useCallback((categoryId: string) => {
    setSelectedCategory(categoryId);
    // 优先使用智能生成的知识库
    if (smartKnowledgeCategories.length > 0) {
      const items = categoryId ? getSmartKnowledgeByCategory(categoryId) : getSmartKnowledgeItems();
      setKnowledgeItems(items);
    } else {
      setKnowledgeItems(getKnowledgeByCategory(categoryId));
    }
  }, [smartKnowledgeCategories]);

  const handleSearch = useCallback(() => {
    if (searchQuery.trim()) {
      // 优先搜索智能生成的知识库
      const smartResults = searchSmartKnowledge(searchQuery);
      if (smartResults.length > 0) {
        setKnowledgeItems(smartResults);
      } else {
        // 如果没有智能知识库结果，搜索原有知识库
        setKnowledgeItems(searchKnowledge(searchQuery));
      }
      setSelectedCategory(null);
    }
  }, [searchQuery]);

  const handleQaQuery = useCallback(async () => {
    if (!qaQuery.trim()) return;
    setQaLoading(true);
    setQaAnswer('');
    try {
      // 使用AI服务进行智能问答（支持上下文记忆）
      const answer = await aiChat(qaQuery, major?.majorName);
      setQaAnswer(answer);
    } catch (error) {
      setQaAnswer('抱歉，智能问答服务暂时不可用，请稍后再试。');
    } finally {
      setQaLoading(false);
    }
  }, [qaQuery, major]);

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-xl w-full max-w-7xl h-[90vh] flex flex-col shadow-2xl border border-slate-700">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700 bg-slate-800/90 backdrop-blur-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">学业导师</h2>
              <p className="text-slate-400 text-sm">智能化学业规划与指导</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-700 bg-slate-800/90 overflow-x-auto">
          {[
            { key: 'overview', label: '总览', icon: '📊' },
            { key: 'major', label: '专业信息', icon: '🎓' },
            { key: 'courses', label: '课程管理', icon: '📚' },
            { key: 'plans', label: '学业规划', icon: '📋' },
            { key: 'risks', label: '风险预警', icon: '⚠️' },
            { key: 'thesis', label: '论文指导', icon: '📝' },
            { key: 'literature', label: '文献阅读', icon: '📖' },
            { key: 'knowledge', label: '知识库', icon: '🗂️' },
            { key: 'qa', label: '智能问答', icon: '💬' }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as TabType)}
              className={`flex-1 min-w-[100px] py-3 px-4 text-center transition-all duration-300 flex items-center justify-center gap-2 ${
                activeTab === tab.key 
                  ? 'text-cyan-400 border-b-2 border-cyan-400 bg-slate-700/50' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-700/30'
              }`}
            >
              <span>{tab.icon}</span>
              <span className="text-sm">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6 bg-slate-900">
          {activeTab === 'overview' && (
            <OverviewTab 
              statistics={statistics} 
              advice={advice} 
              risks={risks} 
              aiAnalysis={aiAnalysis} 
              aiAnalyzing={aiAnalyzing} 
              onGenerateKnowledge={handleGenerateKnowledge} 
              isGeneratingKnowledge={isGeneratingKnowledge} 
              knowledgeGenerationStatus={knowledgeGenerationStatus} 
              smartKnowledgeStats={getKnowledgeStats()} 
            />
          )}
          {activeTab === 'major' && (
            <MajorTab major={major} onSave={handleSaveMajor} />
          )}
          {activeTab === 'courses' && (
            <CoursesTab 
              courses={courses} 
              major={major}
              onAdd={handleAddCourse}
              onUpdate={handleUpdateCourse}
              onDelete={handleDeleteCourse}
            />
          )}
          {activeTab === 'plans' && (
            <PlansTab 
              plans={plans}
              onCreate={handleCreatePlan}
              onUpdateProgress={handleUpdatePlanProgress}
            />
          )}
          {activeTab === 'risks' && (
            <RisksTab risks={risks} onResolve={handleResolveRisk} />
          )}
          {activeTab === 'thesis' && (
            <ThesisTab />
          )}
          {activeTab === 'literature' && (
            <LiteratureTab />
          )}
          {activeTab === 'knowledge' && (
            <KnowledgeTab
              categories={knowledgeCategories}
              selectedCategory={selectedCategory}
              items={knowledgeItems}
              searchQuery={searchQuery}
              onSelectCategory={handleSelectCategory}
              onSearchChange={setSearchQuery}
              onSearch={handleSearch}
              smartCategories={smartKnowledgeCategories}
              smartItems={smartKnowledgeItems}
            />
          )}
          {activeTab === 'qa' && (
            <QATab
              query={qaQuery}
              answer={qaAnswer}
              loading={qaLoading}
              majorName={major?.majorName}
              onQueryChange={setQaQuery}
              onSubmit={handleQaQuery}
            />
          )}
        </div>
      </div>
    </div>
  );
};





const OverviewTab: React.FC<{
  statistics: AcademicStatistics | null;
  advice: string[];
  risks: AcademicRisk[];
  aiAnalysis: AIAnalysisResult[];
  aiAnalyzing: boolean;
  onGenerateKnowledge: () => void;
  isGeneratingKnowledge: boolean;
  knowledgeGenerationStatus: string;
  smartKnowledgeStats: { categories: number; items: number; generated: boolean };
}> = ({ statistics, advice, risks, aiAnalysis, aiAnalyzing, onGenerateKnowledge, isGeneratingKnowledge, knowledgeGenerationStatus, smartKnowledgeStats }) => {
  if (!statistics) {
    return (
      <div className="flex items-center justify-center h-full text-slate-400">
        加载中...
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* 统计卡片 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-cyan-500/20 to-cyan-600/10 rounded-xl p-4 border border-cyan-500/30">
          <h3 className="text-slate-400 text-sm mb-1">学分完成</h3>
          <p className="text-2xl font-bold text-white">
            {statistics.completedCredits} <span className="text-sm text-slate-400">/ {statistics.totalCredits}</span>
          </p>
          <div className="w-full bg-slate-700 rounded-full h-2 mt-2">
            <div 
              className="bg-cyan-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${statistics.totalCredits > 0 ? (statistics.completedCredits / statistics.totalCredits) * 100 : 0}%` }}
            />
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-green-500/20 to-green-600/10 rounded-xl p-4 border border-green-500/30">
          <h3 className="text-slate-400 text-sm mb-1">平均绩点</h3>
          <p className="text-2xl font-bold text-green-400">{typeof statistics.gpa === 'number' && !isNaN(statistics.gpa) ? statistics.gpa.toFixed(2) : '0.00'}</p>
        </div>
        
        <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/10 rounded-xl p-4 border border-blue-500/30">
          <h3 className="text-slate-400 text-sm mb-1">课程通过</h3>
          <p className="text-2xl font-bold text-white">
            {statistics.passedCount} <span className="text-sm text-slate-400">/ {statistics.courseCount}</span>
          </p>
        </div>
        
        <div className="bg-gradient-to-br from-red-500/20 to-red-600/10 rounded-xl p-4 border border-red-500/30">
          <h3 className="text-slate-400 text-sm mb-1">学业风险</h3>
          <p className="text-2xl font-bold text-red-400">{statistics.riskCount}</p>
        </div>
      </div>

      {/* 风险预警 */}
      {risks.length > 0 && (
        <div className="bg-red-500/10 rounded-xl p-4 border border-red-500/30">
          <h3 className="text-lg font-semibold text-red-400 mb-3 flex items-center gap-2">
            <span>⚠️</span> 学业风险预警
          </h3>
          <div className="space-y-2">
            {risks.map(risk => (
              <div key={risk.id} className="bg-slate-800/50 rounded-lg p-3 flex items-start gap-3">
                <span className={`w-2 h-2 rounded-full mt-1.5 ${
                  risk.severity === 'critical' ? 'bg-red-500' :
                  risk.severity === 'high' ? 'bg-orange-500' :
                  risk.severity === 'medium' ? 'bg-yellow-500' : 'bg-blue-500'
                }`} />
                <div className="flex-1">
                  <h4 className="text-white font-medium">{risk.title}</h4>
                  <p className="text-slate-400 text-sm">{risk.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 学业建议 */}
      <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 rounded-xl p-4 border border-purple-500/30">
        <h3 className="text-lg font-semibold text-purple-400 mb-3 flex items-center gap-2">
          <span>💡</span> 学业建议
        </h3>
        <div className="space-y-2">
          {advice.map((item, index) => (
            <p key={index} className="text-slate-300 text-sm leading-relaxed">{item}</p>
          ))}
        </div>
      </div>

      {/* AI智能分析 */}
      <div className="bg-gradient-to-br from-cyan-500/10 to-blue-600/5 rounded-xl p-4 border border-cyan-500/30">
        <h3 className="text-lg font-semibold text-cyan-400 mb-3 flex items-center gap-2">
          <span>🤖</span> AI智能分析
          {aiAnalyzing && <span className="ml-auto text-sm text-slate-400">分析中...</span>}
        </h3>
        {aiAnalyzing ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-cyan-500 border-t-transparent"></div>
          </div>
        ) : aiAnalysis.length > 0 ? (
          <div className="space-y-3">
            {aiAnalysis.map((result, index) => (
              <div
                key={index}
                className={`rounded-lg p-3 ${
                  result.type === 'warning' ? 'bg-red-500/10 border border-red-500/30' :
                  result.type === 'recommendation' ? 'bg-green-500/10 border border-green-500/30' :
                  'bg-slate-700/50 border border-slate-600'
                }`}
              >
                <div className="flex items-start gap-2">
                  <span className="text-lg">
                    {result.type === 'warning' ? '⚠️' : result.type === 'recommendation' ? '💡' : '📊'}
                  </span>
                  <div className="flex-1">
                    <h4 className="text-white font-medium text-sm">{result.title}</h4>
                    <p className="text-slate-400 text-xs mt-1">{result.content}</p>
                    {result.suggestions.length > 0 && (
                      <div className="mt-2">
                        <p className="text-cyan-400 text-xs mb-1">建议：</p>
                        <ul className="space-y-1">
                          {result.suggestions.map((suggestion, idx) => (
                            <li key={idx} className="text-slate-300 text-xs flex items-start gap-1">
                              <span>•</span>
                              <span>{suggestion}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    <div className="mt-2 flex items-center gap-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        result.priority === 'high' ? 'bg-red-500/20 text-red-400' :
                        result.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-green-500/20 text-green-400'
                      }`}>
                        {result.priority === 'high' ? '高优先级' : result.priority === 'medium' ? '中优先级' : '低优先级'}
                      </span>
                      <span className="text-slate-500 text-xs">置信度: {(result.confidence * 100).toFixed(0)}%</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-slate-400 text-sm text-center py-4">设置专业信息后，AI将为您进行智能分析</p>
        )}
      </div>

      {/* 智能知识库生成 */}
      <div className="bg-gradient-to-br from-purple-500/10 to-indigo-600/5 rounded-xl p-4 border border-purple-500/30">
        <h3 className="text-lg font-semibold text-purple-400 mb-3 flex items-center gap-2">
          <span>🧠</span> 智能知识库
        </h3>
        {smartKnowledgeStats.generated ? (
          <div className="space-y-3">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <p className="text-white text-sm">已为您的专业生成个性化知识库</p>
                <p className="text-slate-400 text-xs mt-1">
                  已生成 {smartKnowledgeStats.categories} 个知识目录，共 {smartKnowledgeStats.items} 条知识内容
                </p>
              </div>
              <button
                onClick={() => {}}
                className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors text-sm"
              >
                查看知识库
              </button>
            </div>
            <button
              onClick={onGenerateKnowledge}
              disabled={isGeneratingKnowledge}
              className="w-full px-4 py-2 bg-slate-700 hover:bg-slate-600 disabled:bg-slate-600 text-slate-300 rounded-lg transition-colors text-sm"
            >
              {isGeneratingKnowledge ? '重新生成中...' : '🔄 重新生成知识库'}
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-slate-300 text-sm">
              根据您的专业信息，AI将自动生成个性化的知识目录和学习内容
            </p>
            <button
              onClick={onGenerateKnowledge}
              disabled={isGeneratingKnowledge}
              className="w-full px-4 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 disabled:from-slate-600 disabled:to-slate-600 text-white rounded-lg transition-all font-medium"
            >
              {isGeneratingKnowledge ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span>
                  {knowledgeGenerationStatus || '正在生成知识库...'}
                </span>
              ) : (
                '🚀 一键生成个性化知识库'
              )}
            </button>
            {!isGeneratingKnowledge && knowledgeGenerationStatus && (
              <p className="text-cyan-400 text-xs text-center">{knowledgeGenerationStatus}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// 专业信息标签页
const MajorTab: React.FC<{
  major: StudentMajor | null;
  onSave: (major: Omit<StudentMajor, 'id' | 'createdAt' | 'updatedAt'>) => void;
}> = ({ major, onSave }) => {
  const [formData, setFormData] = useState({
    majorName: major?.majorName || '',
    department: major?.department || '',
    degree: (major?.degree || '本科') as StudentMajor['degree'],
    enrollmentYear: major?.enrollmentYear || new Date().getFullYear(),
    expectedGraduationYear: major?.expectedGraduationYear || new Date().getFullYear() + 4,
    requiredCredits: major?.requiredCredits || 160,
    completedCredits: major?.completedCredits || 0
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="max-w-2xl mx-auto animate-fadeIn">
      <h3 className="text-xl font-semibold text-white mb-4">专业信息设置</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm text-slate-400 mb-1">专业名称</label>
          <input
            type="text"
            value={formData.majorName}
            onChange={e => setFormData({...formData, majorName: e.target.value})}
            className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
            placeholder="请输入专业名称"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm text-slate-400 mb-1">院系</label>
          <input
            type="text"
            value={formData.department}
            onChange={e => setFormData({...formData, department: e.target.value})}
            className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
            placeholder="请输入院系名称"
            required
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-slate-400 mb-1">学位层次</label>
            <select
              value={formData.degree}
              onChange={e => setFormData({...formData, degree: e.target.value as StudentMajor['degree']})}
              className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              <option value="本科">本科</option>
              <option value="硕士">硕士</option>
              <option value="博士">博士</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm text-slate-400 mb-1">入学年份</label>
            <input
              type="number"
              value={formData.enrollmentYear}
              onChange={e => setFormData({...formData, enrollmentYear: parseInt(e.target.value)})}
              className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
              min="2000"
              max="2030"
              required
            />
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-slate-400 mb-1">预计毕业年份</label>
            <input
              type="number"
              value={formData.expectedGraduationYear}
              onChange={e => setFormData({...formData, expectedGraduationYear: parseInt(e.target.value)})}
              className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
              min="2000"
              max="2040"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm text-slate-400 mb-1">毕业所需总学分</label>
            <input
              type="number"
              value={formData.requiredCredits}
              onChange={e => setFormData({...formData, requiredCredits: parseInt(e.target.value)})}
              className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
              min="0"
              required
            />
          </div>
        </div>
        
        <button
          type="submit"
          className="w-full py-3 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg transition-colors font-medium"
        >
          保存专业信息
        </button>
      </form>
    </div>
  );
};

// 课程管理标签页
const CoursesTab: React.FC<{
  courses: Course[];
  major: StudentMajor | null;
  onAdd: (course: Omit<Course, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onUpdate: (id: string, updates: Partial<Course>) => void;
  onDelete: (id: string) => void;
}> = ({ courses, major, onAdd, onUpdate, onDelete }) => {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    courseName: '',
    courseCode: '',
    credits: 3,
    semester: '2024-1',
    category: '必修' as Course['category'],
    status: '未修读' as Course['status'],
    grade: undefined as number | undefined,
    score: undefined as number | undefined
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd(formData);
    setShowForm(false);
    setFormData({
      courseName: '',
      courseCode: '',
      credits: 3,
      semester: '2024-1',
      category: '必修',
      status: '未修读',
      grade: undefined,
      score: undefined
    });
  };

  const getStatusColor = (status: Course['status']) => {
    switch (status) {
      case '已通过': return 'text-green-400 bg-green-400/10';
      case '未通过': return 'text-red-400 bg-red-400/10';
      case '在读': return 'text-blue-400 bg-blue-400/10';
      default: return 'text-slate-400 bg-slate-400/10';
    }
  };

  return (
    <div className="space-y-4 animate-fadeIn">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold text-white">课程管理</h3>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg transition-colors flex items-center gap-2"
        >
          <span>{showForm ? '取消' : '+ 添加课程'}</span>
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-slate-800 rounded-xl p-4 space-y-4 border border-slate-700">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-slate-400 mb-1">课程名称</label>
              <input
                type="text"
                value={formData.courseName}
                onChange={e => setFormData({...formData, courseName: e.target.value})}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">课程代码</label>
              <input
                type="text"
                value={formData.courseCode}
                onChange={e => setFormData({...formData, courseCode: e.target.value})}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-slate-400 mb-1">学分</label>
              <input
                type="number"
                value={formData.credits}
                onChange={e => setFormData({...formData, credits: parseInt(e.target.value)})}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                min="0"
                max="10"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">学期</label>
              <input
                type="text"
                value={formData.semester}
                onChange={e => setFormData({...formData, semester: e.target.value})}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                placeholder="2024-1"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">类别</label>
              <select
                value={formData.category}
                onChange={e => setFormData({...formData, category: e.target.value as Course['category']})}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                <option value="必修">必修</option>
                <option value="选修">选修</option>
                <option value="公选">公选</option>
              </select>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-slate-400 mb-1">状态</label>
              <select
                value={formData.status}
                onChange={e => setFormData({...formData, status: e.target.value as Course['status']})}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                <option value="未修读">未修读</option>
                <option value="在读">在读</option>
                <option value="已修读">已修读</option>
                <option value="已通过">已通过</option>
                <option value="未通过">未通过</option>
              </select>
            </div>
            {formData.status === '已通过' || formData.status === '已修读' ? (
              <>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">成绩</label>
                  <input
                    type="number"
                    value={formData.grade || ''}
                    onChange={e => setFormData({...formData, grade: parseFloat(e.target.value)})}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    min="0"
                    max="100"
                  />
                </div>
              </>
            ) : null}
          </div>
          
          <button
            type="submit"
            className="w-full py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg transition-colors"
          >
            添加课程
          </button>
        </form>
      )}

      <div className="space-y-3">
        {courses.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <p>暂无课程记录</p>
            <p className="text-sm mt-2">点击上方按钮添加您的第一个课程</p>
          </div>
        ) : (
          courses.map(course => (
            <div key={course.id} className="bg-slate-800 rounded-lg p-4 border border-slate-700 hover:border-cyan-500/50 transition-all">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="text-white font-medium">{course.courseName}</h4>
                  <p className="text-slate-400 text-sm">
                    {course.courseCode && <span>{course.courseCode} • </span>}
                    {course.credits}学分 • {course.semester}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(course.status)}`}>
                      {course.status}
                    </span>
                    <span className="text-slate-500 text-xs">{course.category}</span>
                    {course.grade !== undefined && (
                      <span className="text-slate-400 text-xs">成绩: {course.grade}</span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => onDelete(course.id)}
                  className="text-red-400 hover:text-red-300 text-sm"
                >
                  删除
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

// 学业规划标签页
const PlansTab: React.FC<{
  plans: AcademicPlan[];
  onCreate: (plan: Omit<AcademicPlan, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onUpdateProgress: (id: string, progress: number) => void;
}> = ({ plans, onCreate, onUpdateProgress }) => {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: '中期' as AcademicPlan['type'],
    targetDate: '',
    status: '待开始' as AcademicPlan['status'],
    progress: 0,
    milestones: []
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreate(formData);
    setShowForm(false);
    setFormData({
      title: '',
      description: '',
      type: '中期',
      targetDate: '',
      status: '待开始',
      progress: 0,
      milestones: []
    });
  };

  return (
    <div className="space-y-4 animate-fadeIn">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold text-white">学业规划</h3>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg transition-colors"
        >
          {showForm ? '取消' : '+ 创建规划'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-slate-800 rounded-xl p-4 space-y-4 border border-slate-700">
          <div>
            <label className="block text-sm text-slate-400 mb-1">规划标题</label>
            <input
              type="text"
              value={formData.title}
              onChange={e => setFormData({...formData, title: e.target.value})}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm text-slate-400 mb-1">规划描述</label>
            <textarea
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
              rows={3}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-slate-400 mb-1">规划类型</label>
              <select
                value={formData.type}
                onChange={e => setFormData({...formData, type: e.target.value as AcademicPlan['type']})}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                <option value="短期">短期</option>
                <option value="中期">中期</option>
                <option value="长期">长期</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">目标日期</label>
              <input
                type="date"
                value={formData.targetDate}
                onChange={e => setFormData({...formData, targetDate: e.target.value})}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                required
              />
            </div>
          </div>
          
          <button
            type="submit"
            className="w-full py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg transition-colors"
          >
            创建规划
          </button>
        </form>
      )}

      <div className="space-y-3">
        {plans.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <p>暂无学业规划</p>
            <p className="text-sm mt-2">创建您的第一个学业规划吧</p>
          </div>
        ) : (
          plans.map(plan => (
            <div key={plan.id} className="bg-slate-800 rounded-lg p-4 border border-slate-700">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h4 className="text-white font-medium">{plan.title}</h4>
                  <p className="text-slate-400 text-sm">{plan.description}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  plan.status === '已完成' ? 'bg-green-400/10 text-green-400' :
                  plan.status === '进行中' ? 'bg-blue-400/10 text-blue-400' :
                  'bg-slate-400/10 text-slate-400'
                }`}>
                  {plan.status}
                </span>
              </div>
              
              <div className="mb-3">
                <div className="flex justify-between text-sm text-slate-400 mb-1">
                  <span>进度</span>
                  <span>{plan.progress}%</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2">
                  <div 
                    className="bg-cyan-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${plan.progress}%` }}
                  />
                </div>
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={() => onUpdateProgress(plan.id, Math.min(plan.progress + 10, 100))}
                  className="flex-1 py-1 bg-slate-700 hover:bg-slate-600 text-white rounded text-sm transition-colors"
                >
                  更新进度
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

// 风险预警标签页
const RisksTab: React.FC<{
  risks: AcademicRisk[];
  onResolve: (id: string) => void;
}> = ({ risks, onResolve }) => {
  const guidance = generateThesisGuidance();

  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h3 className="text-xl font-semibold text-white mb-4">学业风险预警</h3>
        
        {risks.length === 0 ? (
          <div className="bg-green-500/10 rounded-xl p-6 border border-green-500/30 text-center">
            <span className="text-4xl mb-3 block">✅</span>
            <p className="text-green-400 font-medium">暂无学业风险</p>
            <p className="text-slate-400 text-sm mt-1">您的学业状态良好</p>
          </div>
        ) : (
          <div className="space-y-3">
            {risks.map(risk => (
              <div key={risk.id} className={`rounded-xl p-4 border ${
                risk.severity === 'critical' ? 'bg-red-500/10 border-red-500/30' :
                risk.severity === 'high' ? 'bg-orange-500/10 border-orange-500/30' :
                risk.severity === 'medium' ? 'bg-yellow-500/10 border-yellow-500/30' :
                'bg-blue-500/10 border-blue-500/30'
              }`}>
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${
                      risk.severity === 'critical' ? 'bg-red-500' :
                      risk.severity === 'high' ? 'bg-orange-500' :
                      risk.severity === 'medium' ? 'bg-yellow-500' : 'bg-blue-500'
                    }`} />
                    <h4 className="text-white font-medium">{risk.title}</h4>
                  </div>
                  <button
                    onClick={() => onResolve(risk.id)}
                    className="text-sm text-cyan-400 hover:text-cyan-300"
                  >
                    标记已解决
                  </button>
                </div>
                <p className="text-slate-300 text-sm mb-3">{risk.description}</p>
                <div className="bg-slate-800/50 rounded-lg p-3">
                  <p className="text-cyan-400 text-sm font-medium mb-2">建议措施：</p>
                  <ul className="space-y-1">
                    {risk.suggestions.map((suggestion, idx) => (
                      <li key={idx} className="text-slate-300 text-sm flex items-start gap-2">
                        <span className="text-cyan-400">•</span>
                        <span>{suggestion}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// 论文指导标签页
const ThesisTab: React.FC = () => {
  const guidance = generateThesisGuidance();
  const [activeSection, setActiveSection] = useState<'structure' | 'writing' | 'mistakes'>('structure');

  return (
    <div className="space-y-4 animate-fadeIn">
      <h3 className="text-xl font-semibold text-white">论文写作指导</h3>
      
      <div className="flex gap-2 mb-4">
        {[
          { key: 'structure', label: '论文结构' },
          { key: 'writing', label: '写作技巧' },
          { key: 'mistakes', label: '常见错误' }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveSection(tab.key as typeof activeSection)}
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeSection === tab.key 
                ? 'bg-cyan-600 text-white' 
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
        {activeSection === 'structure' && (
          <div className="space-y-3">
            <p className="text-cyan-400 text-sm font-medium">完整论文应包含以下部分：</p>
            {guidance.structure.map((item, idx) => (
              <div key={idx} className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-sm flex-shrink-0">
                  {idx + 1}
                </span>
                <p className="text-slate-300 text-sm">{item}</p>
              </div>
            ))}
          </div>
        )}
        
        {activeSection === 'writing' && (
          <div className="space-y-3">
            <p className="text-cyan-400 text-sm font-medium">学术写作要点：</p>
            {guidance.writing.map((item, idx) => (
              <div key={idx} className="flex items-start gap-3">
                <span className="text-cyan-400">•</span>
                <p className="text-slate-300 text-sm">{item}</p>
              </div>
            ))}
          </div>
        )}
        
        {activeSection === 'mistakes' && (
          <div className="space-y-3">
            <p className="text-red-400 text-sm font-medium">需要避免的常见错误：</p>
            {guidance.commonMistakes.map((item, idx) => (
              <div key={idx} className="flex items-start gap-3">
                <span className="text-red-400">⚠️</span>
                <p className="text-slate-300 text-sm">{item}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-purple-500/10 rounded-xl p-4 border border-purple-500/30">
        <h4 className="text-purple-400 font-medium mb-2">💡 写作建议</h4>
        <ul className="space-y-2">
          {guidance.general.map((item, idx) => (
            <li key={idx} className="text-slate-300 text-sm flex items-start gap-2">
              <span className="text-purple-400">•</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

// 知识库标签页
interface KnowledgeTabProps {
  categories: KnowledgeCategory[];
  selectedCategory: string | null;
  items: KnowledgeBaseItem[];
  searchQuery: string;
  onSelectCategory: (categoryId: string) => void;
  onSearchChange: (query: string) => void;
  onSearch: () => void;
  smartCategories: KnowledgeCategory[];
  smartItems: KnowledgeBaseItem[];
}

const KnowledgeTab: React.FC<KnowledgeTabProps> = ({
  categories,
  selectedCategory,
  items,
  searchQuery,
  onSelectCategory,
  onSearchChange,
  onSearch,
  smartCategories,
  smartItems
}) => {
  const displayCategories = smartCategories.length > 0 ? smartCategories : categories;
  const displayItems = smartCategories.length > 0 ? smartItems : items;

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-white">知识库</h3>
        {smartCategories.length > 0 && (
          <span className="px-3 py-1 bg-purple-500/20 text-purple-400 text-xs rounded-full">
            🧠 智能生成
          </span>
        )}
      </div>
      
      {/* 搜索栏 */}
      <div className="flex gap-3">
        <div className="flex-1 relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onSearch()}
            placeholder="搜索知识库内容..."
            className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500 transition-colors"
          />
        </div>
        <button
          onClick={onSearch}
          className="px-6 py-3 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg transition-colors"
        >
          搜索
        </button>
      </div>

      {/* 分类导航 */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => onSelectCategory('')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            !selectedCategory
              ? 'bg-cyan-500 text-white'
              : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
          }`}
        >
          全部
        </button>
        {displayCategories.map(cat => (
          <button
            key={cat.id}
            onClick={() => onSelectCategory(cat.id)}
            className={`px-4 py-2 rounded-lg transition-colors ${
              selectedCategory === cat.id
                ? 'bg-cyan-500 text-white'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* 知识列表 */}
      <div className="space-y-3">
        {displayItems.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            {searchQuery ? '未找到相关知识内容' : '请选择分类或搜索查看知识内容'}
          </div>
        ) : (
          displayItems.map(item => (
            <div
              key={item.id}
              className="bg-slate-700/50 rounded-xl p-4 border border-slate-600 hover:border-cyan-500/50 transition-colors"
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <h4 className="text-white font-medium">{item.title}</h4>
                {item.category && (
                  <span className="px-2 py-0.5 bg-purple-500/20 text-purple-400 text-xs rounded-full whitespace-nowrap">
                    {item.category}
                  </span>
                )}
              </div>
              <p className="text-slate-400 text-sm mb-3 line-clamp-3">{item.content}</p>
              <div className="flex flex-wrap gap-2">
                {item.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-1 bg-cyan-500/20 text-cyan-400 text-xs rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

// 智能问答标签页
interface QATabProps {
  query: string;
  answer: string;
  loading: boolean;
  majorName?: string;
  onQueryChange: (query: string) => void;
  onSubmit: () => void;
}

const QATab: React.FC<QATabProps> = ({
  query,
  answer,
  loading,
  majorName,
  onQueryChange,
  onSubmit
}) => {
  return (
    <div className="space-y-6 animate-fadeIn">
      <h3 className="text-xl font-semibold text-white">智能问答</h3>
      
      {majorName && (
        <div className="bg-cyan-500/10 rounded-xl p-4 border border-cyan-500/30">
          <p className="text-cyan-400 text-sm">
            💡 当前上下文：{majorName}专业学生，可根据您的专业提供个性化建议
          </p>
        </div>
      )}
      
      {/* 问题输入 */}
      <div className="flex gap-3">
        <div className="flex-1 relative">
          <textarea
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                onSubmit();
              }
            }}
            placeholder="输入您的问题，例如：如何提高高数成绩？考研应该什么时候开始准备？..."
            rows={3}
            className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500 transition-colors resize-none"
          />
        </div>
        <button
          onClick={onSubmit}
          disabled={loading || !query.trim()}
          className="px-6 py-3 bg-cyan-500 hover:bg-cyan-600 disabled:bg-slate-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
        >
          {loading ? '回答中...' : '提问'}
        </button>
      </div>

      {/* 回答区域 */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-cyan-500 border-t-transparent"></div>
        </div>
      )}
      
      {answer && (
        <div className="bg-slate-700/50 rounded-xl p-6 border border-slate-600">
          <h4 className="text-cyan-400 font-medium mb-3">回答</h4>
          <div className="text-slate-300 whitespace-pre-wrap leading-relaxed">
            {answer}
          </div>
        </div>
      )}
      
      {!loading && !answer && (
        <div className="text-center py-12 text-slate-400">
          <div className="text-4xl mb-4">💬</div>
          <p>输入您的问题，AI将根据知识库内容为您解答</p>
          <div className="mt-6 text-left bg-slate-700/30 rounded-xl p-4">
            <p className="text-slate-300 text-sm mb-2">示例问题：</p>
            <ul className="space-y-1 text-slate-400 text-sm">
              <li>• 如何提高课程绩点？</li>
              <li>• 考研复习应该怎么安排？</li>
              <li>• 科研竞赛应该如何准备？</li>
              <li>• 毕业论文写作有什么技巧？</li>
              <li>• 如何平衡学习和生活？</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

// 文献阅读标签页
const LiteratureTab: React.FC = () => {
  const guidance = generateLiteratureGuidance();
  const [activeSection, setActiveSection] = useState<'reading' | 'notes' | 'evaluation'>('reading');

  return (
    <div className="space-y-4 animate-fadeIn">
      <h3 className="text-xl font-semibold text-white">文献阅读指导</h3>
      
      <div className="flex gap-2 mb-4">
        {[
          { key: 'reading', label: '阅读方法' },
          { key: 'notes', label: '笔记整理' },
          { key: 'evaluation', label: '评估批判' }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveSection(tab.key as typeof activeSection)}
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeSection === tab.key 
                ? 'bg-cyan-600 text-white' 
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
        {activeSection === 'reading' && (
          <div className="space-y-3">
            <p className="text-cyan-400 text-sm font-medium">高效阅读学术文献的步骤：</p>
            {guidance.reading.map((item, idx) => (
              <div key={idx} className="flex items-start gap-3">
                <span className="text-cyan-400">•</span>
                <p className="text-slate-300 text-sm">{item}</p>
              </div>
            ))}
          </div>
        )}
        
        {activeSection === 'notes' && (
          <div className="space-y-3">
            <p className="text-cyan-400 text-sm font-medium">有效的文献笔记方法：</p>
            {guidance.noteTaking.map((item, idx) => (
              <div key={idx} className="flex items-start gap-3">
                <span className="text-cyan-400">•</span>
                <p className="text-slate-300 text-sm">{item}</p>
              </div>
            ))}
          </div>
        )}
        
        {activeSection === 'evaluation' && (
          <div className="space-y-3">
            <p className="text-cyan-400 text-sm font-medium">批判性评估论文的要点：</p>
            {guidance.evaluation.map((item, idx) => (
              <div key={idx} className="flex items-start gap-3">
                <span className="text-cyan-400">•</span>
                <p className="text-slate-300 text-sm">{item}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-green-500/10 rounded-xl p-4 border border-green-500/30">
        <h4 className="text-green-400 font-medium mb-2">📚 文献选择建议</h4>
        <ul className="space-y-2">
          {guidance.general.map((item, idx) => (
            <li key={idx} className="text-slate-300 text-sm flex items-start gap-2">
              <span className="text-green-400">•</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default AcademicMentor;