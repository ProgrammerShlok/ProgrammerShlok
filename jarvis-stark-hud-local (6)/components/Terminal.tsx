
import React, { useRef, useEffect } from 'react';
import { ChatMessage, MessageRole } from '../types';

interface TerminalProps {
  messages: ChatMessage[];
  inputValue: string;
  setInputValue: (val: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
  loadingStep: string;
  onMicClick?: () => void;
  isListening?: boolean;
}

const Terminal: React.FC<TerminalProps> = ({ 
  messages, 
  inputValue, 
  setInputValue, 
  onSubmit, 
  isLoading, 
  loadingStep,
  onMicClick,
  isListening
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isLoading]);

  return (
    <div className="flex flex-col h-full min-h-0 mono-font bg-transparent overflow-hidden relative">
      <div className="flex justify-between border-b border-cyan-500/20 pb-2 mb-3 text-[8px] md:text-[10px] opacity-60">
        <span>STARK_LOG_v10.5_LOCAL</span>
        <span className="text-emerald-500 font-bold hidden sm:inline">SECURE_LINK</span>
      </div>

      <div ref={scrollRef} className="flex-grow overflow-y-auto space-y-3 pr-1 custom-scrollbar text-[11px] md:text-xs">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex flex-col ${msg.role === MessageRole.USER ? 'items-end' : 'items-start'}`}>
            <span className="text-[7px] md:text-[8px] opacity-40 mb-1 uppercase tracking-widest px-1">
              {msg.role === MessageRole.USER ? 'HOST' : 'JARVIS'}
            </span>
            <div className={`p-2.5 md:p-3 rounded-lg border max-w-[85%] md:max-w-[90%] transition-all duration-300 ${msg.role === MessageRole.USER ? 'bg-cyan-500/5 border-cyan-500/30 text-cyan-300' : 'bg-slate-950/80 border-cyan-500/20 text-cyan-50'}`}>
              {msg.text}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex items-center gap-2 text-cyan-500 animate-pulse text-[9px] font-bold py-2">
            <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-ping"></span>
            {loadingStep}...
          </div>
        )}
      </div>

      {/* Desktop Input Area */}
      <div className="hidden lg:flex mt-4 gap-4">
        <div className="relative flex-grow">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-cyan-500 opacity-50 text-xl font-bold">{'>'}</span>
          <input 
            type="text" 
            value={inputValue} 
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onSubmit()}
            placeholder="SYSTEM_INPUT..."
            className="w-full bg-slate-950 border-2 border-cyan-500/40 rounded-2xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:border-cyan-400 uppercase tracking-widest font-black transition-all"
          />
        </div>
        <button 
          onClick={onMicClick} 
          className={`w-20 h-14 rounded-xl border-2 transition-all flex items-center justify-center text-2xl ${isListening ? 'bg-red-500 border-red-400 text-white animate-pulse' : 'bg-cyan-500/10 border-cyan-500/40 text-cyan-500 hover:bg-cyan-500/30'}`}
        >
          {isListening ? '⏹️' : '🎙️'}
        </button>
      </div>
    </div>
  );
};

export default Terminal;
