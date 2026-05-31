
import React, { useState, useRef, useEffect, useCallback } from 'react';

interface ChatInputProps {
  onSendMessage: (input: string, image?: string) => void;
  isLoading: boolean;
  isDisabled: boolean;
  placeholder: string;
  onMicStart?: () => void;
}

export const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, isLoading, isDisabled, placeholder, onMicStart }) => {
  const [input, setInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [pastedImage, setPastedImage] = useState<string | null>(null);
  // Fix: Use `any` for the SpeechRecognition instance type. The browser-specific
  // `SpeechRecognition` type is not available in standard TS DOM libs and a local
  // variable of the same name creates a name collision.
  const recognitionRef = useRef<any | null>(null);
  const baseTextRef = useRef('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Fix: Cast `window` to `any` to access the non-standard SpeechRecognition API
  // without generating TypeScript errors.
  const SpeechRecognition = typeof window !== 'undefined' ? ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition) : null;
  const isSpeechRecognitionSupported = !!SpeechRecognition;

  const isEffectivelyDisabled = isLoading || isDisabled;

  // 处理粘贴事件 - 从剪贴板读取图片
  const handlePaste = useCallback((e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.type.startsWith('image/')) {
        e.preventDefault();
        const file = item.getAsFile();
        if (file) {
          const reader = new FileReader();
          reader.onload = (loadEvent) => {
            const result = loadEvent.target?.result as string;
            if (result) {
              setPastedImage(result);
            }
          };
          reader.readAsDataURL(file);
        }
        break;
      }
    }
  }, []);

  // 移除粘贴的图片
  const removePastedImage = useCallback(() => {
    setPastedImage(null);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if ((input.trim() || pastedImage) && !isEffectivelyDisabled) {
      onSendMessage(input, pastedImage || undefined);
      setInput('');
      setPastedImage(null);
      // Bug Fix: Stop the recognition if it's running when a message is sent.
      // This prevents the AI's audio response from being transcribed into the input field.
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSubmit(e);
    }
  };

  const handleMicClick = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
      return;
    }

    if (!isSpeechRecognitionSupported) {
      alert("抱歉，您的浏览器不支持语音识别功能。");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'zh-CN';
    recognition.interimResults = true;
    recognition.continuous = true;

    recognitionRef.current = recognition;

    recognition.onstart = () => {
      setIsRecording(true);
      baseTextRef.current = input; // Store text before recording starts
    };

    recognition.onend = () => {
      setIsRecording(false);
      recognitionRef.current = null;
    };

    recognition.onerror = (event: any) => {
      console.error('语音识别错误:', event.error);
       if (event.error === 'not-allowed') {
        alert("语音识别失败：请允许麦克风访问权限。");
      }
      setIsRecording(false);
    };

    recognition.onresult = (event: any) => {
      let fullTranscript = '';
       // The SpeechRecognitionResultList object is not an array, so we can't use .map or .forEach
      for (let i = 0; i < event.results.length; i++) {
        fullTranscript += event.results[i][0].transcript;
      }
      
      const separator = baseTextRef.current.trim().length > 0 ? ' ' : '';
      setInput(baseTextRef.current + separator + fullTranscript);
    };

    onMicStart?.();
    recognition.start();
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      recognitionRef.current?.abort();
    };
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    // When the user types manually, update the input
    setInput(e.target.value);
    // And, critically, if speech recognition is in progress, stop it.
    // This prevents the STT from overwriting the user's manual edits.
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  return (
    <div className="bg-slate-900 p-4 border-t border-slate-700">
      <form onSubmit={handleSubmit} className="flex flex-col space-y-2">
        {/* 图片预览区域 */}
        {pastedImage && (
          <div className="relative inline-flex items-center bg-slate-800 rounded-lg p-2 border border-slate-600 max-w-xs">
            <img
              src={pastedImage}
              alt="粘贴的图片"
              className="max-h-20 rounded object-contain"
            />
            <button
              type="button"
              onClick={removePastedImage}
              className="absolute -top-2 -right-2 bg-red-600 hover:bg-red-700 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
              aria-label="移除图片"
            >
              ×
            </button>
          </div>
        )}
        <div className="flex items-center space-x-2">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyPress}
            onPaste={handlePaste}
            placeholder={pastedImage ? '可添加图片描述（可选）...' : placeholder}
            disabled={isEffectivelyDisabled}
            rows={1}
            className="flex-1 bg-slate-800 border border-slate-600 rounded-lg p-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none disabled:opacity-50"
            aria-label="Chat input"
          />
          {isSpeechRecognitionSupported && (
              <button
                  type="button"
                  onClick={handleMicClick}
                  disabled={isEffectivelyDisabled && !isRecording}
                  className={`p-3 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center ${
                  isRecording 
                      ? 'bg-red-600 hover:bg-red-700 text-white animate-pulse' 
                      : 'bg-slate-700 hover:bg-slate-600 text-slate-300'
                  }`}
                  aria-label={isRecording ? "停止录音" : "开始录音"}
              >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-14 0m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
              </button>
          )}
          <button
            type="submit"
            disabled={isEffectivelyDisabled || (!input.trim() && !pastedImage)}
            className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-3 px-4 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            aria-label="Send message"
          >
            {isLoading ? (
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
