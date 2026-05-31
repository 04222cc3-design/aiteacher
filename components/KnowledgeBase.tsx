import React, { useState, useCallback } from 'react';
import type { KnowledgeBaseItem, KnowledgeCategory, RawSource, KnowledgeLintResult } from '../types';
import { getKnowledgeCategories, getKnowledgeByCategory, searchKnowledge, getAnswerFromKnowledgeBase, processUploadedFile, extractKeyInformation, addRawSource, createKnowledgeFromSource, getAllRawSources, lintKnowledgeBase, getLintStatistics, getKnowledgeById, generateKnowledgeGraphData } from '../services/knowledgeBaseService';

interface KnowledgeBaseProps {
  onClose: () => void;
}

export const KnowledgeBase: React.FC<KnowledgeBaseProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'browse' | 'search' | 'ask' | 'sources' | 'manage'>('browse');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<KnowledgeBaseItem[]>([]);
  const [question, setQuestion] = useState<string>('');
  const [answer, setAnswer] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [errorDetails, setErrorDetails] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [knowledgeItems, setKnowledgeItems] = useState<KnowledgeBaseItem[]>([]);
  const [rawSources, setRawSources] = useState<RawSource[]>(getAllRawSources());
  const [uploading, setUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [lintResults, setLintResults] = useState<KnowledgeLintResult[]>([]);
  const [lintStats, setLintStats] = useState<any>(null);
  const [isRunningLint, setIsRunningLint] = useState<boolean>(false);
  const [categories] = useState<KnowledgeCategory[]>(getKnowledgeCategories());
  const [showGraph, setShowGraph] = useState<boolean>(false);
  const [sourceSearch, setSourceSearch] = useState<string>('');
  const [sourceTypeFilter, setSourceTypeFilter] = useState<string>('all');
  const [filteredSources, setFilteredSources] = useState<RawSource[]>(getAllRawSources());

  const handleCategorySelect = useCallback((category: string) => {
    setSelectedCategory(category);
    const items = getKnowledgeByCategory(category);
    setKnowledgeItems(items);
  }, []);

  const handleSearch = useCallback(() => {
    if (searchQuery.trim()) {
      const results = searchKnowledge(searchQuery);
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  const handleAskQuestion = useCallback(async () => {
    if (question.trim()) {
      setIsLoading(true);
      setError('');
      setErrorDetails('');
      try {
        // 使用用户ID或会话ID来维护对话历史
        const userId = sessionStorage.getItem('userId') || 'default';
        const response = await getAnswerFromKnowledgeBase(question, userId);
        setAnswer(response.answer);
        if (response.error) {
          setError(response.error);
          setErrorDetails(response.errorDetails || '');
        }
      } catch (error) {
        console.error('提问错误:', error);
        setAnswer('抱歉，处理您的问题时出错了。请稍后再试。');
        setError('系统错误');
        setErrorDetails((error as Error).message || JSON.stringify(error));
      } finally {
        setIsLoading(false);
      }
    }
  }, [question]);

  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setUploadProgress(0);

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setUploadProgress((i + 1) / files.length * 100);

        // 处理上传的文件
        const processedFile = await processUploadedFile(file);

        // 提取关键信息
        const keyInfo = await extractKeyInformation(processedFile.content, processedFile.type);

        // 添加到原始资料
        const newSource = addRawSource({
          title: keyInfo.title,
          type: processedFile.type,
          content: processedFile.content,
          source_url: '',
          knowledge_ids: []
        });

        // 创建知识条目
        const newKnowledge = createKnowledgeFromSource(newSource, keyInfo);

        // 更新原始资料的知识ID
        newSource.knowledge_ids.push(newKnowledge.id);

        // 刷新资料列表
        setRawSources(getAllRawSources());

        // 如果当前在浏览标签页，刷新知识列表
        if (activeTab === 'browse' && selectedCategory) {
          handleCategorySelect(selectedCategory);
        }
      }
    } catch (error) {
      console.error('文件上传失败:', error);
      setError('文件上传失败');
      setErrorDetails((error as Error).message || JSON.stringify(error));
    } finally {
      setUploading(false);
      setUploadProgress(0);
      // 重置文件输入
      event.target.value = '';
    }
  }, [activeTab, selectedCategory, handleCategorySelect]);

  const handleRunLint = useCallback(() => {
    setIsRunningLint(true);
    try {
      const results = lintKnowledgeBase();
      const stats = getLintStatistics();
      setLintResults(results);
      setLintStats(stats);
    } catch (error) {
      console.error('知识体检失败:', error);
      setError('知识体检失败');
      setErrorDetails((error as Error).message || JSON.stringify(error));
    } finally {
      setIsRunningLint(false);
    }
  }, []);

  const handleSourceFilter = useCallback(() => {
    let filtered = rawSources;
    
    // 应用搜索过滤
    if (sourceSearch) {
      const searchLower = sourceSearch.toLowerCase();
      filtered = filtered.filter(source => 
        source.title.toLowerCase().includes(searchLower) ||
        source.content.toLowerCase().includes(searchLower)
      );
    }
    
    // 应用类型过滤
    if (sourceTypeFilter !== 'all') {
      filtered = filtered.filter(source => source.type === sourceTypeFilter);
    }
    
    setFilteredSources(filtered);
  }, [rawSources, sourceSearch, sourceTypeFilter]);

  // 当搜索关键词或类型过滤器变化时，更新过滤结果
  React.useEffect(() => {
    handleSourceFilter();
  }, [handleSourceFilter]);

  // 当原始资料变化时，更新过滤结果
  React.useEffect(() => {
    setFilteredSources(rawSources);
  }, [rawSources]);

  React.useEffect(() => {
    // 初始加载第一个分类的内容
    if (categories.length > 0 && !selectedCategory) {
      handleCategorySelect(categories[0].name);
    }
  }, [categories, selectedCategory, handleCategorySelect]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fadeIn">
      <div className="bg-slate-800 rounded-lg w-full max-w-4xl max-h-[80vh] overflow-hidden flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-slate-700 bg-slate-800/95 backdrop-blur-sm">
          <h2 className="text-xl font-bold text-cyan-400 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            知识库与智能问答
          </h2>
          <button 
            onClick={onClose} 
            className="text-slate-400 hover:text-white transition-colors p-1 rounded-full hover:bg-slate-700"
            aria-label="关闭"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-700 bg-slate-800/90 backdrop-blur-sm">
          <button
            className={`flex-1 py-3 px-4 text-center transition-all duration-300 ${activeTab === 'browse' ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-slate-400 hover:text-white hover:bg-slate-700/50'}`}
            onClick={() => setActiveTab('browse')}
          >
            浏览知识库
          </button>
          <button
            className={`flex-1 py-3 px-4 text-center transition-all duration-300 ${activeTab === 'search' ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-slate-400 hover:text-white hover:bg-slate-700/50'}`}
            onClick={() => setActiveTab('search')}
          >
            搜索知识
          </button>
          <button
            className={`flex-1 py-3 px-4 text-center transition-all duration-300 ${activeTab === 'ask' ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-slate-400 hover:text-white hover:bg-slate-700/50'}`}
            onClick={() => setActiveTab('ask')}
          >
            智能问答
          </button>
          <button
            className={`flex-1 py-3 px-4 text-center transition-all duration-300 ${activeTab === 'sources' ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-slate-400 hover:text-white hover:bg-slate-700/50'}`}
            onClick={() => setActiveTab('sources')}
          >
            资料管理
          </button>
          <button
            className={`flex-1 py-3 px-4 text-center transition-all duration-300 ${activeTab === 'manage' ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-slate-400 hover:text-white hover:bg-slate-700/50'}`}
            onClick={() => setActiveTab('manage')}
          >
            知识管理
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-4 bg-slate-900">
          {activeTab === 'browse' && (
            <div className="flex h-full">
              {/* Category sidebar */}
              <div className="w-64 border-r border-slate-700 pr-4">
                <h3 className="text-lg font-semibold mb-4 text-white">知识分类</h3>
                <div className="space-y-2">
                  {categories.map(category => (
                    <button
                      key={category.id}
                      className={`w-full text-left px-3 py-2 rounded-md transition-all duration-300 ${selectedCategory === category.name ? 'bg-cyan-900/30 text-cyan-400' : 'text-slate-300 hover:bg-slate-700'}`}
                      onClick={() => handleCategorySelect(category.name)}
                    >
                      {category.name}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Knowledge items */}
              <div className="flex-1 pl-4">
                <h3 className="text-lg font-semibold mb-4 text-white">{selectedCategory}</h3>
                <div className="space-y-4">
                  {knowledgeItems.map(item => (
                    <div key={item.id} className="bg-slate-900 rounded-lg p-4 border border-slate-700 hover:border-cyan-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/10">
                      <h4 className="text-lg font-medium text-cyan-300 mb-2">{item.title}</h4>
                      <div className="text-slate-300 whitespace-pre-line mb-3">{item.content}</div>
                      <div className="flex flex-wrap gap-2">
                        {item.tags.map((tag, index) => (
                          <span key={index} className="px-2 py-1 bg-slate-700 rounded-full text-xs text-slate-300 hover:bg-cyan-800/50 hover:text-cyan-300 transition-all duration-300">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'search' && (
            <div>
              <div className="mb-4">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="搜索知识..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all duration-300"
                  />
                  <button
                    onClick={handleSearch}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 px-3 py-1 bg-cyan-600 hover:bg-cyan-700 text-white rounded-md transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </button>
                </div>
              </div>
              <div className="space-y-4">
                {searchResults.map(item => (
                  <div key={item.id} className="bg-slate-900 rounded-lg p-4 border border-slate-700 hover:border-cyan-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/10">
                    <h4 className="text-lg font-medium text-cyan-300 mb-2">{item.title}</h4>
                    <div className="text-slate-300 whitespace-pre-line mb-3">{item.content}</div>
                    <div className="flex flex-wrap gap-2">
                      {item.tags.map((tag, index) => (
                        <span key={index} className="px-2 py-1 bg-slate-700 rounded-full text-xs text-slate-300 hover:bg-cyan-800/50 hover:text-cyan-300 transition-all duration-300">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
                {searchQuery && searchResults.length === 0 && (
                  <div className="text-center py-8 text-slate-400 animate-fadeIn">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-4 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p>没有找到与"{searchQuery}"相关的内容</p>
                    <p className="text-sm mt-2">尝试使用不同的关键词搜索</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'ask' && (
            <div>
              <div className="mb-4">
                <textarea
                  placeholder="输入您的问题..."
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && e.shiftKey === false && handleAskQuestion()}
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 min-h-[120px] transition-all duration-300"
                />
                <div className="flex justify-end mt-2">
                  <button
                    onClick={handleAskQuestion}
                    disabled={isLoading || !question.trim()}
                    className="px-6 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-md transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    {isLoading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        思考中...
                      </>
                    ) : (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        提问
                      </>
                    )}
                  </button>
                </div>
              </div>
              {answer && (
                <div className="bg-slate-900 rounded-lg p-4 border border-slate-700 animate-fadeIn">
                  <div className="flex items-center mb-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-cyan-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h4 className="text-lg font-medium text-cyan-300">回答</h4>
                  </div>
                  <div className="text-slate-300 whitespace-pre-line">{answer}</div>
                  {error && (
                    <div className="mt-4 p-3 bg-red-900/20 border border-red-800/50 rounded-md">
                      <div className="flex items-center mb-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-.77-1.732-1-2.732-1H6.316c-1 0-1.962.23-2.732 1L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <h5 className="text-md font-medium text-red-400">错误信息</h5>
                      </div>
                      <div className="text-slate-400 text-sm">{error}</div>
                      {errorDetails && (
                        <details className="mt-2">
                          <summary className="text-slate-400 text-sm hover:text-white cursor-pointer">查看详细错误</summary>
                          <div className="mt-2 p-2 bg-slate-900 rounded border border-slate-800 text-xs text-slate-400 overflow-auto max-h-40">
                            {errorDetails}
                          </div>
                        </details>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === 'sources' && (
            <div>
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-4 text-white">上传资料</h3>
                <div className="bg-slate-800 rounded-lg p-6 border border-dashed border-slate-700 hover:border-cyan-500 transition-all duration-300">
                  <div className="text-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <p className="text-slate-400 mb-4">拖拽文件到此处或点击上传</p>
                    <input
                      type="file"
                      multiple
                      accept=".txt,.md,.pdf,.mp4,.avi,.mov,.mp3,.wav,.m4a,.jpg,.jpeg,.png,.gif"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="file-upload"
                    />
                    <label
                      htmlFor="file-upload"
                      className="px-6 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-md transition-colors cursor-pointer inline-block"
                    >
                      选择文件
                    </label>
                    <p className="text-xs text-slate-500 mt-2">支持文本、PDF、视频、音频和图片文件</p>
                  </div>
                  {uploading && (
                    <div className="mt-4">
                      <div className="w-full bg-slate-700 rounded-full h-2.5">
                        <div 
                          className="bg-cyan-500 h-2.5 rounded-full transition-all duration-300"
                          style={{ width: `${uploadProgress}%` }}
                        ></div>
                      </div>
                      <p className="text-sm text-slate-400 mt-2">上传中... {Math.round(uploadProgress)}%</p>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-3">
                  <h3 className="text-lg font-semibold text-white">原始资料列表</h3>
                  <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                    <div className="relative flex-1 min-w-[200px]">
                      <input
                        type="text"
                        placeholder="搜索资料..."
                        value={sourceSearch}
                        onChange={(e) => setSourceSearch(e.target.value)}
                        className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-md text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all"
                      />
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 absolute right-3 top-2.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    <select
                      value={sourceTypeFilter}
                      onChange={(e) => setSourceTypeFilter(e.target.value)}
                      className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all"
                    >
                      <option value="all">所有类型</option>
                      <option value="text">文本</option>
                      <option value="pdf">PDF</option>
                      <option value="video">视频</option>
                      <option value="audio">音频</option>
                      <option value="image">图片</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-4">
                  {filteredSources.map(source => (
                    <div key={source.id} className="bg-slate-900 rounded-lg p-4 border border-slate-700 hover:border-cyan-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/10">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="text-lg font-medium text-cyan-300 mb-2 truncate">{source.title}</h4>
                          <div className="flex flex-wrap items-center text-sm text-slate-400 mb-3 gap-2">
                            <span className="px-2 py-1 bg-slate-700 rounded-full text-xs">{source.type}</span>
                            <span>创建于: {new Date(source.created_at).toLocaleString()}</span>
                          </div>
                          <div className="text-slate-300 text-sm mb-3 line-clamp-2">
                            {source.content.length > 150 ? source.content.substring(0, 150) + '...' : source.content}
                          </div>
                        </div>
                        {source.knowledge_ids.length > 0 && (
                          <div className="bg-slate-800 rounded-md p-2 ml-4">
                            <p className="text-xs text-slate-400">关联知识</p>
                            <p className="text-xs text-cyan-400">{source.knowledge_ids.length} 条</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  {filteredSources.length === 0 && (
                    <div className="text-center py-8 text-slate-400 animate-fadeIn">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-4 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <p>暂无匹配的资料</p>
                      <p className="text-sm mt-2">尝试调整搜索条件或上传新资料</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'manage' && (
            <div>
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-4 text-white">知识体检</h3>
                <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
                  <div className="flex justify-between items-center mb-4">
                    <p className="text-slate-300">运行知识体检以检查知识库的健康状况，包括孤立页面、未验证内容、过时信息等问题。</p>
                    <button
                      onClick={handleRunLint}
                      disabled={isRunningLint}
                      className="px-6 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                    >
                      {isRunningLint ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          检查中...
                        </>
                      ) : (
                        <>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                          </svg>
                          运行体检
                        </>
                      )}
                    </button>
                  </div>
                  
                  {lintStats && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                      <div className="bg-slate-700 rounded-lg p-4">
                        <h4 className="text-sm text-slate-400 mb-2">总问题数</h4>
                        <p className="text-2xl font-bold text-white">{lintStats.total}</p>
                      </div>
                      <div className="bg-slate-700 rounded-lg p-4">
                        <h4 className="text-sm text-slate-400 mb-2">严重问题</h4>
                        <p className="text-2xl font-bold text-red-400">{lintStats.bySeverity.high}</p>
                      </div>
                      <div className="bg-slate-700 rounded-lg p-4">
                        <h4 className="text-sm text-slate-400 mb-2">中等问题</h4>
                        <p className="text-2xl font-bold text-yellow-400">{lintStats.bySeverity.medium}</p>
                      </div>
                      <div className="bg-slate-700 rounded-lg p-4">
                        <h4 className="text-sm text-slate-400 mb-2">轻微问题</h4>
                        <p className="text-2xl font-bold text-green-400">{lintStats.bySeverity.low}</p>
                      </div>
                    </div>
                  )}
                  
                  {lintResults.length > 0 && (
                    <div className="mt-6">
                      <h4 className="text-lg font-medium text-white mb-4">体检结果</h4>
                      <div className="space-y-4">
                        {lintResults.map(result => {
                          const knowledge = getKnowledgeById(result.knowledge_id);
                          let severityColor = 'text-slate-400';
                          switch (result.severity) {
                            case 'high':
                              severityColor = 'text-red-400';
                              break;
                            case 'medium':
                              severityColor = 'text-yellow-400';
                              break;
                            case 'low':
                              severityColor = 'text-green-400';
                              break;
                          }
                          
                          return (
                            <div key={result.id} className="bg-slate-900 rounded-lg p-4 border border-slate-700 hover:border-cyan-500/50 transition-all duration-300">
                              <div className="flex justify-between items-start">
                                <div>
                                  <div className="flex items-center mb-2">
                                    <span className={`px-2 py-1 bg-slate-700 rounded-full text-xs ${severityColor}`}>
                                      {result.severity === 'high' ? '严重' : result.severity === 'medium' ? '中等' : '轻微'}
                                    </span>
                                    <span className="mx-2 text-slate-500">•</span>
                                    <span className="text-sm text-slate-400">{result.type === 'isolated' ? '孤立页面' : result.type === 'incomplete' ? '内容不完整' : result.type === 'outdated' ? '内容过时' : '内容冲突'}</span>
                                  </div>
                                  <h5 className="text-md font-medium text-white mb-2">{knowledge?.title || '未知知识'}</h5>
                                  <p className="text-slate-300 text-sm mb-3">{result.message}</p>
                                  {result.suggested_fix && (
                                    <p className="text-sm text-cyan-400">建议：{result.suggested_fix}</p>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                  
                  {lintResults.length === 0 && lintStats && (
                    <div className="text-center py-8 text-slate-400 animate-fadeIn">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p>知识库健康状况良好</p>
                      <p className="text-sm mt-2">未发现任何问题</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="mb-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-white">知识图谱</h3>
                  <button
                    onClick={() => setShowGraph(!showGraph)}
                    className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-md transition-colors flex items-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                    {showGraph ? '隐藏图谱' : '显示图谱'}
                  </button>
                </div>
                
                {showGraph && (
                  <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
                    <div className="h-[500px] w-full overflow-auto">
                      <KnowledgeGraph />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// 知识图谱组件
const KnowledgeGraph: React.FC = () => {
  const [graphData, setGraphData] = useState(() => generateKnowledgeGraphData());
  const [positions, setPositions] = useState<Record<string, { x: number; y: number }>>({});
  
  // 初始化节点位置
  React.useEffect(() => {
    const initialPositions: Record<string, { x: number; y: number }> = {};
    const width = 800;
    const height = 600;
    
    graphData.nodes.forEach((node, index) => {
      // 使用圆形布局
      const angle = (index / graphData.nodes.length) * Math.PI * 2;
      const radius = Math.min(width, height) / 3;
      initialPositions[node.id] = {
        x: width / 2 + Math.cos(angle) * radius,
        y: height / 2 + Math.sin(angle) * radius
      };
    });
    
    setPositions(initialPositions);
  }, [graphData]);
  
  // 简单的力导向布局模拟（优化性能）
  React.useEffect(() => {
    if (Object.keys(positions).length === 0) return;
    
    // 减少计算步骤，提高性能
    const simulationSteps = 50;
    const stepSize = 0.02;
    const repulsionForce = 800;
    const attractionForce = 0.1;
    const minDistance = 20; // 最小距离，避免过度计算
    
    let currentPositions = { ...positions };
    
    for (let i = 0; i < simulationSteps; i++) {
      // 计算排斥力（优化：只计算附近的节点）
      graphData.nodes.forEach(nodeA => {
        graphData.nodes.forEach(nodeB => {
          if (nodeA.id !== nodeB.id) {
            const dx = currentPositions[nodeB.id].x - currentPositions[nodeA.id].x;
            const dy = currentPositions[nodeB.id].y - currentPositions[nodeA.id].y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // 只计算距离小于100的节点，减少计算量
            if (distance > 0 && distance < 100) {
              const force = repulsionForce / Math.max(distance * distance, minDistance * minDistance);
              const fx = (dx / distance) * force;
              const fy = (dy / distance) * force;
              
              currentPositions[nodeA.id].x -= fx * stepSize;
              currentPositions[nodeA.id].y -= fy * stepSize;
              currentPositions[nodeB.id].x += fx * stepSize;
              currentPositions[nodeB.id].y += fy * stepSize;
            }
          }
        });
      });
      
      // 计算吸引力（针对链接）
      graphData.links.forEach(link => {
        const nodeA = graphData.nodes.find(n => n.id === link.source);
        const nodeB = graphData.nodes.find(n => n.id === link.target);
        
        if (nodeA && nodeB) {
          const dx = currentPositions[nodeB.id].x - currentPositions[nodeA.id].x;
          const dy = currentPositions[nodeB.id].y - currentPositions[nodeA.id].y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance > 0) {
            const force = distance * attractionForce;
            const fx = (dx / distance) * force;
            const fy = (dy / distance) * force;
            
            currentPositions[nodeA.id].x += fx * stepSize;
            currentPositions[nodeA.id].y += fy * stepSize;
            currentPositions[nodeB.id].x -= fx * stepSize;
            currentPositions[nodeB.id].y -= fy * stepSize;
          }
        }
      });
    }
    
    setPositions(currentPositions);
  }, [graphData, positions]);
  
  const getNodeColor = (node: any) => {
    if (node.type) {
      // 原始资料节点
      return '#60a5fa';
    } else if (node.category) {
      // 知识节点，根据分类设置颜色
      const categoryColors: Record<string, string> = {
        '学习方法': '#f87171',
        '网课': '#60a5fa',
        '学习技巧': '#34d399',
        '考试技巧': '#fbbf24',
        '科研竞赛': '#a78bfa',
        '社会实践': '#fb7185',
        '专业能力实践': '#6ee7b7',
        '考研': '#f97316',
        '就业指导': '#8b5cf6'
      };
      return categoryColors[node.category] || '#9ca3af';
    }
    return '#9ca3af';
  };
  
  return (
    <svg width="800" height="600" className="border border-slate-700 rounded-lg bg-slate-900">
      {/* 绘制链接 */}
      {graphData.links.map(link => {
        const sourcePos = positions[link.source as string];
        const targetPos = positions[link.target as string];
        
        if (!sourcePos || !targetPos) return null;
        
        return (
          <line
            key={link.id}
            x1={sourcePos.x}
            y1={sourcePos.y}
            x2={targetPos.x}
            y2={targetPos.y}
            stroke={link.type === 'source' ? '#60a5fa' : '#4b5563'}
            strokeWidth={link.strength || 1}
            strokeOpacity={0.6}
          />
        );
      })}
      
      {/* 绘制节点 */}
      {graphData.nodes.map(node => {
        const pos = positions[node.id];
        if (!pos) return null;
        
        return (
          <g key={node.id} transform={`translate(${pos.x}, ${pos.y})`}>
            <circle
              r={node.size || 10}
              fill={getNodeColor(node)}
              stroke="#1e293b"
              strokeWidth={1}
            />
            <text
              x={0}
              y={0}
              textAnchor="middle"
              dy=".3em"
              fill="white"
              fontSize="10"
              className="font-medium"
            >
              {node.title.length > 10 ? node.title.substring(0, 10) + '...' : node.title}
            </text>
          </g>
        );
      })}
    </svg>
  );
};;
