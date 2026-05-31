// FIX: Add a side-effect import for React.
// This ensures that React's global JSX namespace is loaded before we attempt to augment it.
// Without this, our augmentation would overwrite the base definition, causing all standard
// JSX elements (like `div`) and react-three-fiber elements to be unrecognized.
// FIX: Changed the side-effect import to a full import to more reliably load React's global JSX types before augmentation.
import React from 'react';
// FIX: Corrected the JSX type augmentation for react-three-fiber. The previous namespace import
// (`import * as ...`) was failing. Switched to a direct import for `ThreeElements`.
// Using a regular import instead of `import type` helps ensure that build tools do not
// strip this file, which is critical for applying the global JSX namespace augmentation.
import { ThreeElements } from '@react-three/fiber';
// FIX: Changed all `import type` to regular `import` statements.
// When a file that provides global augmentations contains only type imports,
// some build tools may strip the file, causing the augmentations to be ignored.
// Using regular imports ensures this module is always processed, allowing the JSX
// namespace augmentation for react-three-fiber to apply correctly project-wide.
import { Euler } from "three";
import { AudioProcessor } from "./lib/AudioProcessor";


// FIX: Commented out the manual global augmentation for JSX.IntrinsicElements.
// This was overwriting the default types from React and conflicting with
// react-three-fiber's own augmentation, causing all JSX elements to be unrecognized.
// Removing this allows the libraries' built-in typings to work as expected.
/*
declare global {
  namespace JSX {
    // FIX: Use the directly imported `ThreeElements` type to extend intrinsic elements.
    interface IntrinsicElements extends ThreeElements {}
  }
}
*/


export interface Message {
  id: string;
  role: 'user' | 'model';
  content: string;
  image?: string; // base64 encoded image data
}

export type BlackboardContent = {
  type: 'pdf';
  url: string;
  page: number;
} | {
  type: 'video';
  url: string;
} | null;

export type DrawingOperation = {
  type: 'text';
  text: string; // LaTeX format
  x: number; // percentage
  y: number; // percentage
  color?: string;
  fontSize?: number; // in pixels
  displayMode?: boolean; // Whether to render as display math (true) or inline math (false)
} | {
  type: 'line';
  x1: number; y1: number; // percentages
  x2: number; y2: number; // percentages
  color?: string;
  lineWidth?: number;
} | {
  type: 'circle';
  cx: number; cy: number; // percentages
  radius: number; // percentage of the smaller container dimension (width or height)
  color?: string;
  lineWidth?: number;
  fill?: string;
} | {
  type: 'rect';
  x: number; y: number; // percentages
  width: number; height: number; // percentages
  color?: string;
  lineWidth?: number;
  fill?: string;
} | {
    type: 'clear';
} | {
    type: 'background';
    color: 'black' | 'white' | 'transparent';
};

// REFACTOR: Replaced the complex AIResponse/AICommand structure with a single, streamlined AIAction type.
// The AI will now return one action object at a time, making the lesson flow sequential and easier to manage.
export type AIAction = {
  type: 'speech';
  payload: {
    text: string;
  };
} | {
  type: 'command';
  payload: {
    name: 'show_pdf' | 'goto_page' | 'show_video' | 'present_choices' | 'clear_blackboard' | 'complete_lesson' | 'start_qa' | 'draw';
    // Use a flexible args object for different commands.
    args: {
      url?: string;
      page?: number;
      options?: string[];
      correctAnswer?: string;
      operations?: DrawingOperation[];
    };
  };
};

export interface Lesson {
  id: string; // uuid from Supabase
  category_id: string;
  title: string;
  description: string;
  system_prompt: string;
}

// Represents the data needed to create or update a lesson
export type LessonData = Omit<Lesson, 'id' | 'category_id'>;


export interface CourseCategory {
  id: string; // uuid from Supabase
  name: string;
  lessons: Lesson[];
}

export interface Profile {
  id: string; // uuid from auth.users
  role: 'student' | 'teacher';
  email?: string; // User's email, optional for backwards compatibility
}

export interface LessonProgress {
  user_id: string;
  lesson_id: string;
  completed_at: string;
}

// 知识库相关类型

// 原始资料类型
export interface RawSource {
  id: string;
  title: string;
  type: 'text' | 'pdf' | 'video' | 'audio' | 'image';
  content: string; // 文本内容或文件路径/URL
  source_url?: string; // 原始来源URL
  created_at: string;
  updated_at: string;
  knowledge_ids: string[]; // 关联的知识ID
}

// 知识关联类型
export interface KnowledgeRelation {
  id: string;
  source_id: string; // 源知识ID
  target_id: string; // 目标知识ID
  type: 'related' | 'prerequisite' | 'extension' | 'example';
  strength: number; // 关联强度（0-1）
  created_at: string;
}

// 知识版本类型
export interface KnowledgeVersion {
  id: string;
  knowledge_id: string;
  version: number;
  content: string;
  changes: string; // 变更描述
  created_at: string;
  created_by: string; // 创建者ID
}

// 知识项目类型
export interface KnowledgeBaseItem {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  source_ids: string[]; // 关联的原始资料ID
  related_ids: string[]; // 关联的其他知识ID
  version: number;
  created_at: string;
  updated_at: string;
  last_verified_at?: string; // 最后验证时间
  verification_status: 'verified' | 'unverified' | 'outdated';
}

export interface KnowledgeCategory {
  id: string;
  name: string;
  description: string;
  parent_id?: string; // 父分类ID
  depth: number; // 分类深度
}

export interface KnowledgeTag {
  id: string;
  name: string;
  count: number; // 使用次数
}

// 知识体检结果类型
export interface KnowledgeLintResult {
  id: string;
  knowledge_id: string;
  type: 'conflict' | 'outdated' | 'isolated' | 'incomplete';
  severity: 'low' | 'medium' | 'high';
  message: string;
  suggested_fix?: string;
  created_at: string;
}

// 知识查询结果类型
export interface KnowledgeQueryResult {
  knowledge: KnowledgeBaseItem;
  relevance: number; // 相关性分数
  sources: RawSource[]; // 相关的原始资料
  relations: KnowledgeRelation[]; // 相关的知识关联
}

export enum VISEMES {
  sil = "viseme_sil",
  PP = "viseme_PP",
  FF = "viseme_FF",
  TH = "viseme_TH",
  DD = "viseme_DD",
  kk = "viseme_kk",
  CH = "viseme_CH",
  SS = "viseme_SS",
  nn = "viseme_nn",
  RR = "viseme_RR",
  aa = "viseme_aa",
  E = "viseme_E",
  I = "viseme_I",
  O = "viseme_O",
  U = "viseme_U",
}

export type Blendshapes = { [key: string]: number };

export interface AppState {
  isRecording: boolean;
  isReady: boolean;
  isSpeaking: boolean;
  // FIX: Corrected typo 'Audio-Processor' to 'AudioProcessor'.
  // The hyphen caused a major parsing error, leading to a cascade of
  // incorrect type-checking errors across the application.
  audioProcessor: AudioProcessor | null;
  blendshapes: Blendshapes;
  isMuted: boolean;
  volume: number;
  error: string | null;
  isTestAudioPlaying: boolean;
  uploadedAudioFile: File | null;
  isDebugAnimationRunning: boolean;
  activeDebugViseme: string | null;
  availableBlendshapes: string[];
  isSpeakingSentence: boolean;


  startRecording: () => Promise<void>;
  stopRecording: () => void;
  playTestAudio: () => Promise<void>;
  speakSentence: (text: string) => Promise<void>;
  setUploadedAudio: (file: File) => void;
  runDebugAnimation: () => void;
  setBlendshapes: (blendshapes: Blendshapes) => void;
  setIsReady: (isReady: boolean) => void;
  toggleMute: () => void;
  setVolume: (volume: number) => void;
  setError: (error: string | null) => void;
  setAvailableBlendshapes: (names: string[]) => void;
  resetAvatarState: () => void;
}

// ==================== 学业导师模块类型 ====================

export interface StudentMajor {
  id: string;
  majorName: string;
  department: string;
  degree: '本科' | '硕士' | '博士';
  enrollmentYear: number;
  expectedGraduationYear: number;
  requiredCredits: number;
  completedCredits: number;
  createdAt: string;
  updatedAt: string;
}

export interface Course {
  id: string;
  courseName: string;
  courseCode: string;
  credits: number;
  semester: string;
  category: '必修' | '选修' | '公选';
  status: '未修读' | '在读' | '已修读' | '已通过' | '未通过';
  grade?: number;
  score?: number;
  createdAt: string;
  updatedAt: string;
}

export interface AcademicPlan {
  id: string;
  title: string;
  description: string;
  type: '短期' | '中期' | '长期';
  targetDate: string;
  status: '待开始' | '进行中' | '已完成' | '已延期';
  progress: number;
  milestones: PlanMilestone[];
  createdAt: string;
  updatedAt: string;
}

export interface PlanMilestone {
  id: string;
  title: string;
  description: string;
  targetDate: string;
  status: 'pending' | 'completed' | 'overdue';
  completedAt?: string;
}

export interface AcademicRisk {
  id: string;
  studentId: string;
  riskType: '成绩下滑' | '学分不足' | '选课冲突' | '延毕风险' | '学术预警' | '其他';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  relatedCourseIds: string[];
  suggestions: string[];
  status: 'identified' | 'monitoring' | 'resolved' | 'escalated';
  identifiedAt: string;
  resolvedAt?: string;
}

export interface LearningProgress {
  id: string;
  courseId: string;
  progress: number;
  currentChapter?: string;
  completedChapters: string[];
  notes: string;
  lastStudiedAt: string;
  studyTimeTotal: number;
  difficulties: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ThesisWriting {
  id: string;
  title: string;
  type: '课程论文' | '毕业论文' | '学术论文' | '其他';
  deadline: string;
  status: '准备中' | '开题中' | '撰写中' | '修改中' | '已完成' | '已提交';
  progress: number;
  abstract?: string;
  outline?: string;
  references: ReferenceItem[];
  chapters: ThesisChapter[];
  supervisor?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReferenceItem {
  id: string;
  title: string;
  authors: string;
  source: string;
  year: number;
  url?: string;
  readStatus: '未读' | '在读' | '已读';
  notes: string;
}

export interface ThesisChapter {
  id: string;
  title: string;
  content: string;
  status: 'pending' | 'drafting' | 'completed' | 'revised';
  wordCount: number;
  deadline?: string;
}

export interface LiteratureReading {
  id: string;
  title: string;
  authors: string;
  type: '期刊论文' | '会议论文' | '学位论文' | '书籍' | '其他';
  source: string;
  year: number;
  url?: string;
  readStatus: '未读' | '在读' | '已读';
  readProgress: number;
  readDate?: string;
  summary: string;
  keyPoints: string[];
  quotes: string[];
  questions: string[];
  createdAt: string;
  updatedAt: string;
}

export interface AcademicStatistics {
  totalCredits: number;
  completedCredits: number;
  gpa: number;
  majorGpa: number;
  courseCount: number;
  passedCount: number;
  failedCount: number;
  riskCount: number;
  planCount: number;
  thesisCount: number;
  literatureCount: number;
}