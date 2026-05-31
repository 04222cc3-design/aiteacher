import React, { useState, useCallback } from 'react';
import { aiChat } from '../services/aiService';

interface AIChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export const AIAssistantButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<AIChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = useCallback(async () => {
    if (!inputValue.trim()) return;

    const userMessage: AIChatMessage = {
      id: `msg_${Date.now()}`,
      role: 'user',
      content: inputValue,
      timestamp: new Date().toLocaleTimeString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    try {
      const response = await aiChat(inputValue);
      const assistantMessage: AIChatMessage = {
        id: `msg_${Date.now()}`,
        role: 'assistant',
        content: response,
        timestamp: new Date().toLocaleTimeString()
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: AIChatMessage = {
        id: `msg_${Date.now()}`,
        role: 'assistant',
        content: '抱歉，AI服务暂时不可用，请稍后再试。',
        timestamp: new Date().toLocaleTimeString()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  }, [inputValue]);

  const quickQuestions = [
    '如何提高学习效率？',
    '如何选择专业课程？',
    '如何准备期末考试？',
    '如何写好毕业论文？'
  ];

  return (
    <>
      {/* 浮动按钮 */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white rounded-full shadow-lg shadow-purple-500/30 flex items-center justify-center text-2xl transition-all duration-300 hover:scale-110 z-50"
      >
        🤖
      </button>

      {/* 聊天窗口 */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 rounded-2xl w-full max-w-md shadow-2xl flex flex-col">
            {/* 头部 */}
            <div className="flex items-center justify-between p-4 border-b border-slate-700">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full flex items-center justify-center text-xl">
                  🤖
                </div>
                <div>
                  <h3 className="text-white font-semibold">AI学业助手</h3>
                  <p className="text-slate-400 text-xs">随时为您解答学业问题</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-white transition-colors text-xl"
              >
                ✕
              </button>
            </div>

            {/* 消息区域 */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-slate-400">
                  <div className="text-6xl mb-4">👋</div>
                  <p className="text-center">
                    您好！我是您的AI学业助手<br/>有什么问题我可以帮您解答？
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2 justify-center">
                    {quickQuestions.map((question, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          setInputValue(question);
                        }}
                        className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-300 text-sm rounded-full transition-colors"
                      >
                        {question}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                messages.map(message => (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                      message.role === 'user'
                        ? 'bg-purple-500 text-white'
                        : 'bg-slate-700 text-slate-300'
                    }`}>
                      {message.role === 'user' ? '👤' : '🤖'}
                    </div>
                    <div className={`max-w-[70%] ${message.role === 'user' ? 'text-right' : ''}`}>
                      <div className={`rounded-2xl px-4 py-2 ${
                        message.role === 'user'
                          ? 'bg-purple-500 text-white rounded-br-md'
                          : 'bg-slate-700 text-slate-200 rounded-bl-md'
                      }`}>
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">{message.timestamp}</p>
                    </div>
                  </div>
                ))
              )}
              {isTyping && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-sm">
                    🤖
                  </div>
                  <div className="bg-slate-700 rounded-2xl px-4 py-2 rounded-bl-md">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                      <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                      <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 输入区域 */}
            <div className="p-4 border-t border-slate-700">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="输入您的问题..."
                  className="flex-1 bg-slate-800 border border-slate-600 rounded-xl px-4 py-2.5 text-white placeholder-slate-400 focus:outline-none focus:border-purple-500 transition-colors"
                />
                <button
                  onClick={handleSend}
                  disabled={!inputValue.trim() || isTyping}
                  className="px-4 py-2.5 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 disabled:from-slate-600 disabled:to-slate-600 text-white rounded-xl transition-all"
                >
                  发送
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};