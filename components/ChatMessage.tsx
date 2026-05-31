
import React from 'react';
import type { Message } from '../types';

interface ChatMessageProps {
  message: Message;
}

const MathIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-cyan-300" fill="none" viewBox="0 0 24" stroke="currentColor" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
  </svg>
);

const UserIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-300" fill="none" viewBox="0 0 24" stroke="currentColor" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
);


export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isModel = message.role === 'model';
  
  const containerClasses = isModel ? 'justify-start' : 'justify-end';
  const bubbleClasses = isModel ? 'bg-slate-700 text-slate-200' : 'bg-indigo-600 text-white';

  return (
    <div className={`flex items-end gap-3 ${containerClasses}`}>
      {isModel && <div className="flex-shrink-0"><MathIcon/></div>}
      <div className={`rounded-xl px-4 py-3 max-w-xl shadow-md ${bubbleClasses}`}>
        {message.image && (
          <div className="mb-2">
            <img
              src={message.image}
              alt="用户上传的图片"
              className="max-w-full max-h-48 rounded-lg object-contain"
              style={{ maxWidth: '100%' }}
            />
          </div>
        )}
        {message.content && (
           <p className="whitespace-pre-wrap">
              {message.content}
           </p>
        )}
      </div>
      {!isModel && <div className="flex-shrink-0"><UserIcon/></div>}
    </div>
  );
};
