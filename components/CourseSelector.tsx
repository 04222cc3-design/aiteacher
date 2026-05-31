import React, { useState } from 'react';
import type { CourseCategory, Lesson, LessonProgress } from '../types';

interface CourseSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  categories: CourseCategory[];
  currentLessonId: string;
  onSelectLesson: (lesson: Lesson) => void;
  lessonProgress: LessonProgress[];
}

const CheckIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-400 ml-2 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
    </svg>
);

export const CourseSelector: React.FC<CourseSelectorProps> = ({ isOpen, onClose, categories, currentLessonId, onSelectLesson, lessonProgress }) => {
  const [openCategoryId, setOpenCategoryId] = useState<string | null>(null);

  // Effect to open the first category when categories are loaded
  React.useEffect(() => {
    if (categories.length > 0 && !openCategoryId) {
        setOpenCategoryId(categories[0].id);
    }
  }, [categories, openCategoryId]);

  const toggleCategory = (categoryId: string) => {
    setOpenCategoryId(prevId => prevId === categoryId ? null : categoryId);
  };

  const completedLessonIds = new Set(lessonProgress.map(p => p.lesson_id));

  return (
    <>
      {/* Overlay */}
      <div 
        className={`fixed inset-0 bg-black/60 z-[60] transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* Sidebar */}
      <div className={`fixed top-0 left-0 h-full w-80 max-w-[80vw] bg-slate-900 shadow-xl z-[70] transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex justify-between items-center p-4 border-b border-slate-700">
          <h2 className="text-xl font-bold text-cyan-400">选择课程</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-700 transition-colors" aria-label="关闭课程选择">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
             </svg>
          </button>
        </div>
        <nav className="p-4 space-y-2">
          {categories.map(category => (
            <div key={category.id}>
              <button 
                onClick={() => toggleCategory(category.id)}
                className="w-full text-left flex justify-between items-center p-3 rounded-lg hover:bg-slate-800 transition-colors text-lg font-semibold"
              >
                <span>{category.name}</span>
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 transition-transform duration-200 ${openCategoryId === category.id ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
              {openCategoryId === category.id && (
                <div className="pl-4 mt-1 border-l-2 border-slate-700 space-y-1">
                  {category.lessons && category.lessons.length > 0 ? (
                    category.lessons.map(lesson => (
                      <button
                        key={lesson.id}
                        onClick={() => onSelectLesson(lesson)}
                        className={`w-full text-left p-3 rounded-md transition-colors text-slate-300 flex justify-between items-center ${currentLessonId === lesson.id ? 'bg-cyan-600 text-white font-medium' : 'hover:bg-slate-700'}`}
                      >
                        <span>{lesson.title}</span>
                        {completedLessonIds.has(lesson.id) && <CheckIcon />}
                      </button>
                    ))
                  ) : (
                    <p className="p-3 text-slate-500 italic">暂无课程</p>
                  )}
                </div>
              )}
            </div>
          ))}
        </nav>
      </div>
    </>
  );
};