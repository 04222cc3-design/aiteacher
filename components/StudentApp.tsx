import React, { useState, useEffect, useCallback, useRef } from 'react';
import type { Session } from '@supabase/supabase-js';
import type { Lesson, Message, CourseCategory, LessonProgress, Profile, BlackboardContent, AIAction, DrawingOperation } from '../types';
import { ChatWindow } from './ChatWindow';
import { ChatInput } from './ChatInput';
import { InteractiveAvatar } from './InteractiveAvatar';
import { initializeChat, sendMessageToAI } from '../services/deepseekService';
import type { ChatHistory } from '../services/deepseekService';
import { useAppStore } from '../store/useAppStore';
import { AvatarCreator } from './AvatarCreator';
import { DEFAULT_AVATAR_URL } from '../constants';
import { InteractiveChoices } from './InteractiveChoices';
import { CourseSelector } from './CourseSelector';
import { HelpModal } from './HelpModal';
import { supabase } from '../services/supabaseClient';
import { Blackboard } from './Blackboard';
import * as pdfjsLib from 'pdfjs-dist';
import { courseCategories as localCourseCategories, localLessons } from '../lessons';
import { KnowledgeBase } from './KnowledgeBase';
import { AcademicMentor } from './AcademicMentor';
import { AIAssistantButton } from './AIAssistantButton';

import { usePersistentState } from '../hooks/usePersistentState';

const AVATAR_STORAGE_KEY = 'interactive-tutor-avatar-url';
const SESSION_STARTED_KEY = 'interactive-tutor-session-started';
const MESSAGES_STORAGE_KEY = 'interactive-tutor-messages';
const CHOICES_STORAGE_KEY = 'interactive-tutor-choices';
const CAPTION_STORAGE_KEY = 'interactive-tutor-caption';
const SCRIPT_INDEX_STORAGE_KEY = 'interactive-tutor-script-index';
const BLACKBOARD_CONTENT_STORAGE_KEY = 'interactive-tutor-blackboard-content';
const DRAWING_STATE_STORAGE_KEY = 'interactive-tutor-drawing-state';

interface StudentAppProps {
  session: Session;
  profile: Profile | null;
}

export const StudentApp: React.FC<StudentAppProps> = ({ session, profile }) => {
  const [messages, setMessages] = usePersistentState<Message[]>(MESSAGES_STORAGE_KEY, []);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [chatHistory, setChatHistory] = useState<ChatHistory | null>(null);
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [textToSpeak, setTextToSpeak] = useState<string>('');
  const [isSessionStarted, setIsSessionStarted] = usePersistentState<boolean>(
    SESSION_STARTED_KEY,
    false
  );
  const [showAvatarCreator, setShowAvatarCreator] = useState(false);
  const [isCourseSelectorOpen, setIsCourseSelectorOpen] = useState(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [isHistoryVisible, setIsHistoryVisible] = useState(true);
  const [isKnowledgeBaseOpen, setIsKnowledgeBaseOpen] = useState(false);
  const [isAcademicMentorOpen, setIsAcademicMentorOpen] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(
    () => localStorage.getItem(AVATAR_STORAGE_KEY) || DEFAULT_AVATAR_URL
  );
  const [interactiveChoices, setInteractiveChoices] = usePersistentState<string[] | null>(
    CHOICES_STORAGE_KEY,
    null
  );
  const [courseCategories, setCourseCategories] = useState<CourseCategory[]>([]);
  const [lessonProgress, setLessonProgress] = useState<LessonProgress[]>([]);
  const [blackboardContent, setBlackboardContent] = usePersistentState<BlackboardContent>(
    BLACKBOARD_CONTENT_STORAGE_KEY,
    null
  );
  const [captionText, setCaptionText] = usePersistentState<string>(
    CAPTION_STORAGE_KEY,
    ''
  );
  const [systemStatus, setSystemStatus] = usePersistentState<'playing' | 'paused' | 'asking_question' | 'interrupted'>(
    'interactive-tutor-system-status',
    'playing'
  );
  const [scriptIndex, setScriptIndex] = usePersistentState<number>(
    SCRIPT_INDEX_STORAGE_KEY,
    0
  );
  // 获取当前课程的脚本和摘要
  const currentLessonData = currentLesson ? localLessons[currentLesson.id] : null;
  const lessonScript = currentLessonData?.script ?? [];
  const lessonSummary = currentLessonData?.summary ?? '';

  const sentenceQueueRef = useRef<string[]>([]);
  const [drawingState, setDrawingState] = usePersistentState<{
    operations: DrawingOperation[];
    background: 'black' | 'white' | 'transparent';
  }>(DRAWING_STATE_STORAGE_KEY, {
    operations: [],
    background: 'transparent',
  });

  const {
    isSpeakingSentence: isSpeaking,
    resetAvatarState,
    volume,
    setVolume,
    speechRate,
    setSpeechRate,
  } = useAppStore();

  const pauseLesson = () => {
    setSystemStatus('paused');
  };

  const resumeLesson = () => {
    setSystemStatus('playing');
  };

  useEffect(() => {
    if (systemStatus === 'paused') {
      window.speechSynthesis.pause();
    } else if (systemStatus === 'playing') {
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }
    }
  }, [systemStatus]);

  const stopSpeaking = useCallback(() => {
    window.speechSynthesis.cancel();
    setTextToSpeak('');
    sentenceQueueRef.current = [];
    resetAvatarState();
  }, [resetAvatarState]);

  useEffect(() => {
    let subscription: any;
    try {
      const { data } = supabase.auth.onAuthStateChange((event) => {
        if (event === 'SIGNED_OUT') {
          sessionStorage.clear();
        }
      });
      subscription = data.subscription;
    } catch (error) {
      console.error('[StudentApp] Error setting up auth listener:', error);
    }

    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, []);

  useEffect(() => {
    const workerUrl = `https://cdn.jsdelivr.net/npm/pdfjs-dist@4.5.136/build/pdf.worker.min.mjs`;
    fetch(workerUrl)
      .then(response => response.text())
      .then(text => {
        const blob = new Blob([text], { type: 'application/javascript' });
        pdfjsLib.GlobalWorkerOptions.workerSrc = URL.createObjectURL(blob);
      }).catch(error => {
        console.error("Failed to set up PDF.js worker:", error);
      });
  }, []);

  const completeLesson = useCallback(async (lessonId: string) => {
    if (lessonId === 'local-lesson-1' || lessonProgress.some(p => p.lesson_id === lessonId)) {
      return;
    }
    try {
      const { data, error } = await supabase.from('lesson_progress').insert({ lesson_id: lessonId, user_id: session.user.id }).select();
      if (error) {
        console.error('Failed to save lesson progress:', error);
        throw error;
      }
      if(data) {
        setLessonProgress(prev => [...prev, ...data]);
      }
    } catch (error) {
      console.error('Error in completeLesson:', error);
      // 可以添加用户通知
    }
  }, [session.user.id, lessonProgress]);
  
  const systemStatusRef = useRef(systemStatus);
  systemStatusRef.current = systemStatus;

  const advanceScript = useCallback((increment = 1) => {
    if (systemStatusRef.current !== 'playing') return; // Do not advance script if not playing
    setScriptIndex(prev => prev + increment);
  }, []);
  
  const handleSpeechEnd = useCallback(() => {
    setTextToSpeak('');

    if (sentenceQueueRef.current.length > 0) {
        const nextSentence = sentenceQueueRef.current.shift()!;
        setTextToSpeak(nextSentence);
        setCaptionText(nextSentence);
        return;
    }

    setCaptionText('');

    if (systemStatus === 'interrupted') {
      setSystemStatus('paused'); // Stay paused after interruption is handled.
      return; 
    }
    
    if (systemStatus === 'asking_question') {
      return;
    }
    
    const lastAction = lessonScript[scriptIndex];

    if (lastAction.type === 'speech') {
      const prevAction = scriptIndex > 0 ? lessonScript[scriptIndex - 1] : null;
      const prevPrevAction = scriptIndex > 1 ? lessonScript[scriptIndex - 2] : null;

      const isCorrectFeedback = prevAction?.type === 'command' &&
                                prevAction.payload.name === 'present_choices' &&
                                prevAction.payload.args.correctAnswer !== undefined;
                                
      const isIncorrectFeedback = prevPrevAction?.type === 'command' &&
                                  prevPrevAction.payload.name === 'present_choices' &&
                                  prevPrevAction.payload.args.correctAnswer !== undefined;

      if (isCorrectFeedback) {
        advanceScript(2);
      } else if (isIncorrectFeedback) {
        advanceScript(1);
      } else {
        advanceScript(1);
      }
    }
  }, [scriptIndex, systemStatus, advanceScript]);
  
  const switchToQAMode = useCallback(() => {
    setSystemStatus('asking_question');
    const systemPrompt = `你是一位友好且知识渊博的大学学习与职业发展导师。你刚刚通过一个脚本讲授了以下课程内容：\n\n${lessonSummary}\n\n现在，课程的脚本讲解部分已经结束。请根据以上内容，回答学生的提问。保持你的角色，并鼓励学生进行开放式讨论。\n\n重要：你的所有回复都必须是 JSON 格式，且结构必须如下：\n{"type": "speech", "payload": {"text": "你的回答内容"}}`;
    const newHistory = initializeChat(systemPrompt);
    setChatHistory(newHistory);
    
    const qaStartMessage: Message = {
      id: crypto.randomUUID(),
      role: 'model',
      content: '课程讲解部分结束了。关于我们今天讨论的内容，你有什么问题吗？现在可以自由提问了！'
    };
    setMessages(prev => [...prev, qaStartMessage]);
    const sentences = qaStartMessage.content.split('\n').filter(s => s.trim() !== '');
    if (sentences.length > 0) {
      sentenceQueueRef.current = sentences.slice(1);
      setTextToSpeak(sentences[0]);
      setCaptionText(sentences[0]);
    }
  }, []);

  const processScriptAction = useCallback((action: AIAction) => {
      if (systemStatus !== 'playing') return; // Do not process actions if not playing
      let shouldAdvance = true;
      let advanceDelay = 1000;

      if (action.type === 'speech') {
          const speech = action.payload.text;
          const aiMessage: Message = { id: crypto.randomUUID(), role: 'model', content: speech.replace(/\n/g, '\n') };
          
          // 直接添加消息，不再检查重复，避免依赖messages
          setMessages(prev => {
              const lastMessage = prev[prev.length - 1];
              if (lastMessage?.role !== 'model' || lastMessage?.content !== aiMessage.content) {
                  return [...prev, aiMessage];
              }
              return prev;
          });
          
          const sentences = speech.split('\n').filter(s => s.trim() !== '');
          if (sentences.length > 0) {
              sentenceQueueRef.current = sentences.slice(1);
              setTextToSpeak(sentences[0]);
              setCaptionText(sentences[0]);
          } else {
              handleSpeechEnd();
          }
          
          shouldAdvance = false;
      } else if (action.type === 'command') {
          const { name, args = {} } = action.payload;

          switch (name) {
              case 'show_pdf':
                if (args.url) {
                  setBlackboardContent({ type: 'pdf', url: args.url, page: args.page ?? 1 });
                }
                break;
              case 'show_video':
                if (args.url) {
                  setBlackboardContent({ type: 'video', url: args.url });
                }
                shouldAdvance = false;
                break;
              case 'goto_page':
                if (args.page) {
                  setBlackboardContent(c => (c?.type === 'pdf' ? { ...c, page: args.page! } : c));
                }
                break;
              case 'clear_blackboard':
                  setBlackboardContent(null);
                  setDrawingState({ operations: [], background: 'transparent' });
                  break;
              case 'draw':
                if (args.operations) {
                    setDrawingState(prevState => {
                        let newOps = [...prevState.operations];
                        let newBg = prevState.background;
                        args.operations!.forEach(op => {
                            if (op.type === 'clear') {
                                newOps = [];
                            } else if (op.type === 'background') {
                                newBg = op.color;
                            } else {
                                newOps.push(op);
                            }
                        });
                        return { operations: newOps, background: newBg };
                    });
                }
                advanceDelay = 100;
                break;
              case 'present_choices':
                  if (args.options) {
                      setInteractiveChoices(args.options);
                  }
                  shouldAdvance = false;
                  break;
              case 'complete_lesson':
                  if (currentLesson) {
                      completeLesson(currentLesson.id);
                  }
                  break;
              case 'start_qa':
                  switchToQAMode();
                  shouldAdvance = false;
                  break;
          }

          if (shouldAdvance) {
              setTimeout(() => advanceScript(), advanceDelay);
          }
      }
  }, [currentLesson, completeLesson, advanceScript, switchToQAMode, handleSpeechEnd, systemStatus]);

  useEffect(() => {
    // This effect drives the lesson forward by processing the script actions one by one.
    // It now only runs when the scriptIndex changes, not on pause/resume.
    if (systemStatus !== 'playing' || !isSessionStarted || scriptIndex >= lessonScript.length || interactiveChoices) {
      return;
    }
    
    const currentAction = lessonScript[scriptIndex];
    processScriptAction(currentAction);
  }, [scriptIndex, isSessionStarted, processScriptAction, interactiveChoices]);


  const startLesson = useCallback((lesson: Lesson) => {
    resetAvatarState();
    setTextToSpeak('');
    setMessages([]);
    setInteractiveChoices(null);
    setBlackboardContent(null);
    setDrawingState({ operations: [], background: 'transparent' });
    setCaptionText('');
    sentenceQueueRef.current = [];
    setScriptIndex(0);
    setSystemStatus('playing');
    setIsSessionStarted(true);
  }, [resetAvatarState, setMessages, setInteractiveChoices, setBlackboardContent, setDrawingState, setCaptionText, setScriptIndex, setSystemStatus, setIsSessionStarted]);

  const handleChoiceSelected = useCallback((choice: string) => {
      setInteractiveChoices(null);
      const userMessage: Message = { id: crypto.randomUUID(), role: 'user', content: choice };
      setMessages(prev => [...prev, userMessage]);

      const choiceAction = lessonScript[scriptIndex];
      if (choiceAction && choiceAction.type === 'command') {
        const { correctAnswer } = choiceAction.payload.args;
        
        if (correctAnswer !== undefined) {
          const isSecondQuestion = correctAnswer === "先尝试再总结";
          const isCorrect = isSecondQuestion 
            ? (choice === "先尝试再总结" || choice === "一边练习一边总结")
            : choice === correctAnswer;

          if (isCorrect) {
            advanceScript(1);
          } else {
            advanceScript(2);
          }
        } else {
          advanceScript(1);
        }
      } else {
        advanceScript(1);
      }

  }, [scriptIndex, advanceScript, setInteractiveChoices, setMessages]);
  
  const handleSendMessage = useCallback(async (userInput: string, image?: string) => {
    if ((!userInput.trim() && !image) || !chatHistory || isLoading) return;

    setIsLoading(true);
    const userMessage: Message = { id: crypto.randomUUID(), role: 'user', content: userInput, image };
    setMessages(prev => [...prev, userMessage]);
    
    try {
        const { newHistory, response: aiAction } = await sendMessageToAI(chatHistory, userInput, image);
        setChatHistory(newHistory);
        
        if (aiAction.type === 'speech') {
            const speech = aiAction.payload.text;
            const aiMessage: Message = { id: crypto.randomUUID(), role: 'model', content: speech.replace(/\\n/g, '\n') };
            setMessages(prev => [...prev, aiMessage]);
            
            const sentences = speech.split('\n').filter(s => s.trim() !== '');
            if (sentences.length > 0) {
              sentenceQueueRef.current = sentences.slice(1);
              setTextToSpeak(sentences[0]);
              setCaptionText(sentences[0]);
            }
        } else {
          console.warn("[StudentApp] Received an unexpected command in Q&A mode:", aiAction);
          // 添加错误处理
          setMessages(prev => [...prev, { id: crypto.randomUUID(), role: 'model', content: "抱歉，我收到了一个意外的响应。请重试。" }]);
        }

    } catch (error) {
        console.error("发送消息失败:", error);
        const errorMessage = error instanceof Error ? error.message : "发生未知错误。";
        setMessages(prev => [...prev, { id: crypto.randomUUID(), role: 'model', content: `抱歉，我遇到了一个错误。请重试。 ${errorMessage}` }]);
    } finally {
        setIsLoading(false);
    }
  }, [chatHistory, isLoading]);

  const handleStudentMessage = useCallback(async (userInput: string, image?: string) => {
    if (systemStatus === 'asking_question') {
      await handleSendMessage(userInput, image);
      return;
    }

    // Interruption logic
    stopSpeaking();
    setSystemStatus('interrupted');

    const userMessage: Message = { id: crypto.randomUUID(), role: 'user', content: userInput, image };
    setMessages(prev => [...prev, userMessage]);

    setIsLoading(true);
    try {
      const interruptionSystemPrompt = `You are a helpful AI tutor. The student has interrupted the current lesson to ask a question. The lesson summary is: ${lessonSummary}. Answer the student's question clearly and concisely. After answering, do not ask a follow-up question. Your response must be in JSON format: {"type": "speech", "payload": {"text": "Your answer"}}`;
      const interruptionHistory = initializeChat(interruptionSystemPrompt);
      const { response: aiAction } = await sendMessageToAI(interruptionHistory, userInput, image);

      if (aiAction.type === 'speech') {
        const speech = aiAction.payload.text;
        const aiMessage: Message = { id: crypto.randomUUID(), role: 'model', content: speech };
        setMessages(prev => [...prev, aiMessage]);
        
        const sentences = speech.split('\n').filter(s => s.trim() !== '');
        if (sentences.length > 0) {
          sentenceQueueRef.current = sentences.slice(1);
          setTextToSpeak(sentences[0]);
          setCaptionText(sentences[0]);
        }
      }
    } catch (error) {
      console.error("Failed to handle interruption:", error);
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
      setMessages(prev => [...prev, { id: crypto.randomUUID(), role: 'model', content: `Sorry, I ran into an error. Please try again. ${errorMessage}` }]);
    } finally {
      setIsLoading(false);
    }
  }, [systemStatus, handleSendMessage, stopSpeaking]);
  
  
  useEffect(() => {
    // 使用本地课程列表
    setCourseCategories(localCourseCategories);
    if (localCourseCategories.length > 0 && localCourseCategories[0].lessons.length > 0) {
      setCurrentLesson(localCourseCategories[0].lessons[0]);
    }
  }, []);

  const handleVideoEnded = useCallback(() => {
    if (systemStatus !== 'asking_question') {
      resumeLesson();
      advanceScript();
    }
  }, [systemStatus, advanceScript, resumeLesson]);
  
  const handleSelectLesson = (lesson: Lesson) => {
    if (currentLesson?.id === lesson.id && isSessionStarted) {
      setIsCourseSelectorOpen(false);
      return;
    }
    setCurrentLesson(lesson);
    setIsCourseSelectorOpen(false);
    startLesson(lesson);
  };
  
  const getPlaceholderText = () => {
    if (!isSessionStarted) return "请先从左侧菜单选择一门课程";
    if (interactiveChoices) return "请从下方的选项中选择";

    switch (systemStatus) {
      case 'playing':
        return '讲课中... 您可以“举手提问”或“暂停”';
      case 'paused':
        return '已暂停，点击“继续”可恢复播放';
      case 'asking_question':
        return '请打字或者语音输入您的问题...';
      case 'interrupted':
        return '正在处理您的问题...';
      default:
        return '准备开始...';
    }
  };

  const getStatusDisplay = () => {
    if (!isSessionStarted) return null;
    
    let text = '';
    let color = 'text-slate-400';
    let bgColor = 'bg-slate-800';

    switch (systemStatus) {
      case 'playing':
        text = '上课中';
        color = 'text-green-300';
        bgColor = 'bg-green-900/50';
        break;
      case 'paused':
        text = '休息中';
        color = 'text-yellow-300';
        bgColor = 'bg-yellow-900/50';
        break;
      case 'asking_question':
        text = '提问中';
        color = 'text-cyan-300';
        bgColor = 'bg-cyan-900/50';
        break;
      case 'interrupted':
        text = '思考中...';
        color = 'text-orange-300';
        bgColor = 'bg-orange-900/50';
        break;
      default:
        return null;
    }

    return (
      <div className={`absolute top-5 left-1/2 -translate-x-1/2 px-3 py-1 text-xs font-semibold rounded-full ${color} ${bgColor} backdrop-blur-sm shadow-lg z-50`}>
        {text}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-screen bg-slate-900 text-white font-sans relative">
       {getStatusDisplay()}
       {showAvatarCreator && <AvatarCreator onAvatarExported={(url) => { setAvatarUrl(url); localStorage.setItem(AVATAR_STORAGE_KEY, url); setShowAvatarCreator(false); }} onClose={() => setShowAvatarCreator(false)} />}
       {isHelpModalOpen && <HelpModal onClose={() => setIsHelpModalOpen(false)} />}
       {isKnowledgeBaseOpen && <KnowledgeBase onClose={() => setIsKnowledgeBaseOpen(false)} />}
        {isAcademicMentorOpen && <AcademicMentor onClose={() => setIsAcademicMentorOpen(false)} />}
       <CourseSelector isOpen={isCourseSelectorOpen} onClose={() => setIsCourseSelectorOpen(false)} categories={courseCategories} currentLessonId={currentLesson?.id || ''} onSelectLesson={handleSelectLesson} lessonProgress={lessonProgress} />
       <AIAssistantButton />

       {!isSessionStarted && (
        <div className="absolute inset-0 bg-slate-900 bg-opacity-90 flex flex-col items-center justify-center z-50 backdrop-blur-sm">
           <h2 className="text-3xl font-bold text-cyan-400 mb-4">欢迎使用交互式 AI 导师</h2>
           <p className="text-slate-300 mb-8 text-lg">点击下方按钮开始您的学习之旅。</p>
           <button onClick={() => currentLesson && startLesson(currentLesson)} className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-3 px-8 rounded-lg transition-all text-lg shadow-lg transform hover:scale-105" disabled={!currentLesson}>开始课程</button>
        </div>
      )}
      
      <header className="p-4 shadow-md text-center border-b border-slate-700 flex-shrink-0 bg-slate-800">
          <div className="flex justify-between items-center w-full">
              <button onClick={() => setIsCourseSelectorOpen(true)} className="p-2" aria-label="选择课程"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg></button>
              <div className="text-center">
                  <h1 className="text-xl font-bold text-cyan-400">{currentLesson?.title || '交互式 AI 导师'}</h1>
                  <p className="text-slate-400 text-sm">{currentLesson?.description || '请选择一门课程'}</p>
              </div>
              <div className="flex items-center space-x-2">
                  {/* Volume Control */}
                  <div className="flex items-center space-x-1 text-slate-300 p-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                    <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={volume}
                        onChange={(e) => setVolume(parseFloat(e.target.value))}
                        className="w-20 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                        aria-label="音量"
                    />
                  </div>

                  {/* Speech Rate Control */}
                  <div className="flex items-center space-x-1 text-slate-300 p-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M4.555 5.168A1 1 0 003 6.118v7.764a1 1 0 001.555.832l4.333-2.889a1 1 0 000-1.664L4.555 5.168zM10.555 5.168A1 1 0 009 6.118v7.764a1 1 0 001.555.832l4.333-2.889a1 1 0 000-1.664l-4.333-2.889z" />
                    </svg>
                    <input
                        type="range"
                        min="0.5"
                        max="2"
                        step="0.25"
                        value={speechRate}
                        onChange={(e) => setSpeechRate(parseFloat(e.target.value))}
                        className="w-20 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                        aria-label="语速"
                    />
                  </div>
                  <button onClick={() => setIsHistoryVisible(v => !v)} className="p-2" aria-label="显示/隐藏对话历史"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 5.523-4.477 10-10 10S1 17.523 1 12 5.477 2 11 2s10 4.477 10 10z" /></svg></button>
                  <button onClick={() => setIsHelpModalOpen(true)} className="p-2" aria-label="应用介绍"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></button>
                  <button onClick={() => setIsKnowledgeBaseOpen(true)} className="p-2" aria-label="知识库"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg></button>
                  <button onClick={() => setIsAcademicMentorOpen(true)} className="p-2" aria-label="学业导师"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg></button>
                  <button onClick={() => setShowAvatarCreator(true)} className="p-2" aria-label="自定义形象"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg></button>
                  <button onClick={() => supabase.auth.signOut()} className="p-2" aria-label="登出"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg></button>
              </div>
          </div>
      </header>
      
      <div className="flex flex-1 min-h-0">
        {/* Column 1: Left (Avatar + Caption) */}
        <div className="w-1/4 hidden md:flex flex-col bg-slate-950 border-r border-slate-800">
          {isSessionStarted && (
            <div className="flex-grow min-h-0">
              <InteractiveAvatar avatarUrl={avatarUrl} textToSpeak={textToSpeak} onSpeechEnd={handleSpeechEnd} />
            </div>
          )}
          {isSessionStarted && (
            <div className="flex-shrink-0 p-4 border-t border-slate-700">
              <div className="h-24 w-full overflow-y-auto whitespace-pre-wrap bg-slate-900 p-2 rounded-md">
                <p className="text-yellow-400">{captionText}</p>
              </div>
            </div>
          )}
        </div>

        {/* Column 2: Middle (Blackboard + ChatInput) */}
        <div className={`flex flex-col transition-all duration-300 ease-in-out ${isHistoryVisible ? 'w-1/2' : 'w-3/4'}`}>
          <main className="flex-1 flex flex-col items-center justify-center p-4 bg-slate-900 min-h-0">
            <Blackboard
              content={blackboardContent}
              drawingState={drawingState}
              onPageChange={(page) => setBlackboardContent(c => (c?.type === 'pdf' ? { ...c, page } : c))}
              onVideoEnded={handleVideoEnded}
              isPaused={systemStatus !== 'playing'}
            />
          </main>
          {isSessionStarted && (
            <footer className="flex-shrink-0 p-4 bg-slate-900">
              {interactiveChoices ? (
                <InteractiveChoices choices={interactiveChoices} onChoiceSelected={handleChoiceSelected} />
              ) : (
                <ChatInput 
                  onSendMessage={handleStudentMessage} 
                  onMicStart={stopSpeaking}
                  isLoading={isLoading} 
                  isDisabled={systemStatus !== 'asking_question'}
                  placeholder={getPlaceholderText()}
                />
              )}
              <div className="flex justify-center items-center space-x-6 mt-2">
                {/* Ask Question Button */}
                <button
                  onClick={() => {
                    stopSpeaking();
                    const qaSystemPrompt = `你是一位友好且知识渊博的大学学习与职业发展导师。学生在课程中途暂停并向你提问。课程的整体内容摘要如下：\n\n${lessonSummary}\n\n请根据学生的问题进行清晰、简洁的回答。回答完毕后，不要主动追问，等待学生继续课程。你的所有回复都必须是 JSON 格式，且结构必须如下：\n{"type": "speech", "payload": {"text": "你的回答内容"}}`;
                    const newHistory = initializeChat(qaSystemPrompt);
                    setChatHistory(newHistory);
                    setSystemStatus('asking_question');
                  }}
                  className="flex flex-col items-center text-slate-300 hover:text-cyan-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="举手提问"
                  disabled={!isSessionStarted || systemStatus === 'asking_question'}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.5 13.5C18.5 12.0373 18.0307 10.642 17.2091 9.51851C16.3876 8.39502 15.2653 7.60863 14 7.29999V5.5C14 4.96956 13.7893 4.46085 13.4142 4.08578C13.0391 3.71071 12.5304 3.49999 12 3.49999C11.4696 3.49999 10.9609 3.71071 10.5858 4.08578C10.2107 4.46085 10 4.96956 10 5.5V10.5C10 11.0304 10.2107 11.5391 10.5858 11.9142C10.9609 12.2893 11.4696 12.5 12 12.5C12.5304 12.5 13.0391 12.2893 13.4142 11.9142C13.7893 11.5391 14 11.0304 14 10.5V9.33999C14.8011 9.58417 15.511 10.0397 16.0556 10.6556C16.5993 11.2704 16.9583 12.0197 17.1 12.8L14 12.2C13.4696 12.2 12.9609 12.4107 12.5858 12.7858C12.2107 13.1609 12 13.6696 12 14.2V19.2C12 19.7304 12.2107 20.2391 12.5858 20.6142C12.9609 20.9893 13.4696 21.2 14 21.2H16.5C17.5913 21.2 18.637 20.7679 19.412 19.9929C20.187 19.2179 20.619 18.1722 20.619 17.081C20.619 15.603 19.713 14.245 18.5 13.5ZM6.5 1.49999C5.50261 1.49999 4.54602 1.89508 3.84099 2.59012C3.13595 3.28515 2.74087 4.24174 2.74087 5.23912V11.2391C2.74087 12.2365 3.13595 13.1931 3.84099 13.8881C4.54602 14.5832 5.50261 14.9783 6.5 14.9783C7.49739 14.9783 8.45398 14.5832 9.15901 13.8881C9.86405 13.1931 10.2591 12.2365 10.2591 11.2391V5.23912C10.2591 4.24174 9.86405 3.28515 9.15901 2.59012C8.45398 1.89508 7.49739 1.49999 6.5 1.49999Z" />
                  </svg>
                  <span className="text-xs mt-1">举手提问</span>
                </button>

                {/* Pause/Continue Button */}
                <button 
                  onClick={() => systemStatus === 'playing' ? pauseLesson() : resumeLesson()}
                  className="p-3 rounded-full text-slate-300 bg-slate-700 hover:bg-cyan-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label={systemStatus === 'playing' ? '暂停课程' : '继续课程'}
                  disabled={!isSessionStarted}
                >
                  {systemStatus === 'playing' ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10 9v6m4-6v6" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    </svg>
                  )}
                </button>
              </div>
            </footer>
          )}
        </div>

        {/* Column 3: Right (ChatWindow only) */}
        <aside className={`flex flex-col bg-slate-800 transition-all duration-300 ease-in-out ${isHistoryVisible ? 'w-1/4 border-l border-slate-700' : 'w-0'}`}>
          {isHistoryVisible && <ChatWindow messages={messages} isLoading={isLoading} />}
        </aside>
      </div>
    </div>
  );
};