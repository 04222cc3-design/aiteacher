import React, { useState, useEffect, useCallback } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '../services/supabaseClient';
import type { CourseCategory, Profile, Lesson, LessonData } from '../types';
import { LessonEditor } from './LessonEditor';

// REFACTOR: The help modal is updated with new instructions for the simplified, sequential JSON action system.
const TeacherHelpModal: React.FC<{ onClose: () => void }> = ({ onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-70 z-[100] flex items-center justify-center backdrop-blur-sm animate-fade-in" onClick={onClose}>
        <style>{`@keyframes fade-in { 0% { opacity: 0; } 100% { opacity: 1; } } .animate-fade-in { animation: fade-in 0.3s ease-out forwards; }`}</style>
        <div className="bg-slate-800 rounded-lg shadow-2xl p-6 max-w-3xl w-11/12 relative text-slate-300" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-700">
                <h2 className="text-2xl font-bold text-cyan-400">如何创建课程脚本</h2>
                <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-700 transition-colors" aria-label="关闭"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
            </div>
            <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2 text-base">
                <p>您的课程脚本（System Prompt）是驱动AI导师的核心。AI的每一个回复都必须是一个独立的、单一的动作指令，格式为JSON对象。</p>
                
                <div className="p-3 bg-slate-700/50 rounded-lg">
                    <h3 className="font-semibold text-white mb-2">核心JSON动作结构</h3>
                    <p className="mb-2">AI的每一个回复都必须是以下两种结构之一：</p>
                    <code className="block bg-slate-900 p-2 rounded text-sm text-yellow-300 whitespace-pre-wrap">
{`// 用于对话
{
  "type": "speech",
  "payload": { "text": "这是AI导师要讲的话。" }
}

// 用于执行界面操作
{
  "type": "command",
  "payload": {
    "name": "command_name",
    "args": { "key": "value" }
  }
}`}
                    </code>
                </div>

                <div className="p-3 bg-slate-700/50 rounded-lg">
                    <h3 className="font-semibold text-white mb-2">可用指令 (`name`) 及其 `args`</h3>
                    <ul className="space-y-2 text-sm">
                        <li><strong>show_pdf</strong>: 在黑板上显示PDF。
                            <code className="block bg-slate-900 p-2 mt-1 rounded text-cyan-300">{`"args": {"url": "...", "page": 1}`}</code>
                        </li>
                        <li><strong>goto_page</strong>: 翻到PDF的指定页码。
                             <code className="block bg-slate-900 p-2 mt-1 rounded text-cyan-300">{`"args": {"page": 3}`}</code>
                        </li>
                        <li><strong>show_video</strong>: 在黑板上播放视频。
                            <code className="block bg-slate-900 p-2 mt-1 rounded text-cyan-300">{`"args": {"url": "..."}`}</code>
                        </li>
                        <li><strong>present_choices</strong>: 向学生显示选择题。
                             <code className="block bg-slate-900 p-2 mt-1 rounded text-cyan-300">{`"args": {"options": ["选项A", "选项B"]}`}</code>
                        </li>
                        <li><strong>draw</strong>: 在黑板上绘制图形或文字。
                             <code className="block bg-slate-900 p-2 mt-1 rounded text-cyan-300">{`"args": {"operations": [ ... ]}`}</code>
                        </li>
                         <li><strong>complete_lesson</strong>: 标记课程结束。
                             <code className="block bg-slate-900 p-2 mt-1 rounded text-cyan-300">{`"args": {}`}</code>
                        </li>
                        <li><strong>clear_blackboard</strong>: 清空黑板（包括PDF/视频和所有绘图）。
                             <code className="block bg-slate-900 p-2 mt-1 rounded text-cyan-300">{`"args": {}`}</code>
                        </li>
                    </ul>
                </div>
                
                <div className="p-3 bg-slate-700/50 rounded-lg">
                    <h3 className="font-semibold text-white mb-2">绘制操作 (`draw` command)</h3>
                    <p>`draw` 指令的 `operations` 是一个操作数组，会按顺序执行。坐标和尺寸都使用百分比（0-100），使布局自适应。</p>
                     <ul className="space-y-2 text-sm mt-2">
                        <li><strong>background</strong>: 改变黑板背景色。
                            <code className="block bg-slate-900 p-2 mt-1 rounded text-cyan-300">{`{"type": "background", "color": "black" | "white" | "transparent"}`}</code>
                        </li>
                         <li><strong>clear</strong>: 清除所有之前的绘图（不影响背景色）。
                            <code className="block bg-slate-900 p-2 mt-1 rounded text-cyan-300">{`{"type": "clear"}`}</code>
                        </li>
                        <li><strong>text</strong>: 显示文字或LaTeX公式。
                            <code className="block bg-slate-900 p-2 mt-1 rounded text-cyan-300">{`{"type": "text", "text": "E = mc^2", "x": 50, "y": 10, "fontSize": 24, "color": "#FFFF00"}`}</code>
                        </li>
                         <li><strong>line</strong>: 画一条线。
                            <code className="block bg-slate-900 p-2 mt-1 rounded text-cyan-300">{`{"type": "line", "x1": 10, "y1": 20, "x2": 90, "y2": 20, "lineWidth": 3, "color": "white"}`}</code>
                        </li>
                         <li><strong>rect</strong>: 画一个矩形。
                            <code className="block bg-slate-900 p-2 mt-1 rounded text-cyan-300">{`{"type": "rect", "x": 10, "y": 30, "width": 80, "height": 40, "fill": "rgba(0, 100, 255, 0.5)"}`}</code>
                        </li>
                         <li><strong>circle</strong>: 画一个圆形。
                            <code className="block bg-slate-900 p-2 mt-1 rounded text-cyan-300">{`{"type": "circle", "cx": 50, "cy": 50, "radius": 20, "color": "red", "lineWidth": 2}`}</code>
                        </li>
                    </ul>
                </div>

                <div className="p-3 bg-cyan-900/50 rounded-lg border border-cyan-700">
                    <h3 className="font-semibold text-cyan-300 mb-2">课程流程 (`next_step` 约定)</h3>
                    <p>课程是按顺序进行的。在一个动作（如 `speech` 或 `show_pdf`）完成后，应用会自动向AI发送 `next_step` 消息以请求下一步。您需要在脚本中定义当AI收到 `next_step` 时应该返回哪个动作。</p>
                    <p className="mt-2">这个流程只在 `present_choices` 命令处暂停，等待用户的实际选择作为下一条消息。</p>
                    <blockquote className="mt-2 border-l-4 border-cyan-500 pl-4 py-2 bg-slate-900 rounded-r-lg">
                        <p className="italic text-slate-300">"当用户说 'next_step' 时，你的回复必须是下一个 'command' 动作，用于翻到PDF的第2页。"</p>
                    </blockquote>
                </div>
            </div>
        </div>
    </div>
);


export const TeacherApp: React.FC<{ session: Session; profile: Profile | null; }> = ({ session, profile }) => {
    const [categories, setCategories] = useState<CourseCategory[]>([]);
    const [loading, setLoading] = useState(true);
    const [showHelp, setShowHelp] = useState(false);
    const [isEditorOpen, setIsEditorOpen] = useState(false);
    const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
    const [currentCategoryId, setCurrentCategoryId] = useState<string | null>(null);

    const fetchCourses = useCallback(async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('course_categories')
                .select(`*, lessons (*)`);
            
            if (error) {
                console.error("Error fetching courses:", error);
                // 降级处理：设置为空数组，不弹出错误提示
                setCategories([]);
            } else {
                setCategories((data as CourseCategory[]) || []);
            }
        } catch (err) {
            console.error("Exception fetching courses:", err);
            // 降级处理：设置为空数组
            setCategories([]);
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        fetchCourses();
    }, [fetchCourses]);

    const handleAddNewLesson = (categoryId: string) => {
        setCurrentLesson(null);
        setCurrentCategoryId(categoryId);
        setIsEditorOpen(true);
    };

    const handleEditLesson = (lesson: Lesson) => {
        setCurrentLesson(lesson);
        setCurrentCategoryId(lesson.category_id);
        setIsEditorOpen(true);
    };

    const handleCloseEditor = () => {
        setIsEditorOpen(false);
        setCurrentLesson(null);
        setCurrentCategoryId(null);
    };

    const handleSaveLesson = async (lessonData: LessonData) => {
        if (currentLesson) { // Editing existing lesson
            const { error } = await supabase
                .from('lessons')
                .update(lessonData)
                .eq('id', currentLesson.id);
            if (error) {
                alert('Error updating lesson: ' + error.message);
            }
        } else { // Creating new lesson
            const { error } = await supabase
                .from('lessons')
                .insert({ ...lessonData, category_id: currentCategoryId });
            if (error) {
                alert('Error creating lesson: ' + error.message);
            }
        }
        handleCloseEditor();
        fetchCourses();
    };

    const handleDeleteLesson = async (lessonId: string) => {
        const { error } = await supabase
            .from('lessons')
            .delete()
            .eq('id', lessonId);
        if (error) {
            alert('Error deleting lesson: ' + error.message);
        }
        handleCloseEditor();
        fetchCourses();
    };

    const handleAddNewCategory = async () => {
        const name = prompt("Enter the name for the new category:");
        if (name) {
            const { error } = await supabase
                .from('course_categories')
                .insert({ name });
            if (error) {
                alert('Error creating category: ' + error.message);
            } else {
                fetchCourses();
            }
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 text-white font-sans">
            {showHelp && <TeacherHelpModal onClose={() => setShowHelp(false)} />}
            {isEditorOpen && (
                <LessonEditor 
                    lesson={currentLesson}
                    onSave={handleSaveLesson}
                    onClose={handleCloseEditor}
                    onDelete={handleDeleteLesson}
                />
            )}
            <header className="bg-slate-800 p-4 shadow-md flex justify-between items-center border-b border-slate-700">
                <div>
                    <h1 className="text-2xl font-bold text-cyan-400">教师仪表盘</h1>
                    <p className="text-slate-400 text-sm">课程内容管理</p>
                </div>
                <div className="flex items-center gap-4">
                    {profile?.email && <span className="text-slate-400 text-sm hidden lg:block">{profile.email}</span>}
                    <button 
                        onClick={() => setShowHelp(true)}
                        className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        课程脚本指南
                    </button>
                    <button 
                        onClick={() => supabase.auth.signOut()} 
                        className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors" aria-label="登出">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                        登出
                    </button>
                </div>
            </header>
            <main className="p-8">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold">课程列表</h2>
                    <button onClick={handleAddNewCategory} className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-4 rounded-lg transition-colors">
                        + 新增分类
                    </button>
                </div>

                {loading ? (
                     <div className="flex h-screen bg-slate-900 items-center justify-center text-white text-xl">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        正在加载课程...
                    </div>
                ) : (
                    <div className="space-y-6">
                        {categories.map(category => (
                            <div key={category.id} className="bg-slate-800 p-4 rounded-lg border border-slate-700">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-bold text-cyan-400">{category.name}</h3>
                                    <button onClick={() => handleAddNewLesson(category.id)} className="text-sm bg-slate-700 hover:bg-slate-600 text-white font-semibold py-1 px-3 rounded-lg transition-colors">
                                        + 新增课程
                                    </button>
                                </div>
                                <div className="space-y-3">
                                    {category.lessons.map(lesson => (
                                        <div key={lesson.id} className="flex justify-between items-center p-3 bg-slate-700/50 rounded-md">
                                            <div>
                                                <p className="font-semibold">{lesson.title}</p>
                                                <p className="text-sm text-slate-400">{lesson.description}</p>
                                            </div>
                                            <button onClick={() => handleEditLesson(lesson)} className="text-sm text-cyan-400 hover:text-cyan-300 font-medium">编辑</button>
                                        </div>
                                    ))}
                                    {category.lessons.length === 0 && <p className="text-slate-500 italic p-3">该分类下暂无课程。</p>}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
};