
import React, { useRef, useEffect } from 'react';
import { ChatMessage, MessageRole } from '../types';

interface TerminalProps {
  messages: ChatMessage[];
  inputValue: string;
  setInputValue: (val: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
  loadingStep: string;
  groundingSources: Record<string, any>;
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
    <div className="flex flex-col h-full hud-border rounded-xl p-4 mono-font bg-slate-900/60 overflow-hidden relative">
      <div className="flex justify-between border-b border-cyan-500/20 pb-2 mb-4 text-[10px] opacity-60">
        <span>LOG_TERMINAL_v1.0</span>
        <span className="text-emerald-500">LOCAL_LINK_STABLE</span>
      </div>

      <div ref={scrollRef} className="flex-grow overflow-y-auto space-y-4 pr-2 custom-scrollbar text-xs">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex flex-col ${msg.role === MessageRole.USER ? 'items-end' : 'items-start'}`}>
            <span className="text-[8px] opacity-40 mb-1 uppercase tracking-widest">{msg.role === MessageRole.USER ? 'HOST' : 'JARVIS'}</span>
            <div className={`p-3 rounded-lg border max-w-[90%] ${msg.role === MessageRole.USER ? 'bg-cyan-500/5 border-cyan-500/20 text-cyan-300' : 'bg-slate-950/60 border-cyan-500/10 text-cyan-50'}`}>
              {msg.text}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex items-center gap-2 text-cyan-500 animate-pulse text-[10px]">
            <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-ping"></span>
            {loadingStep}...
          </div>
        )}
      </div>

      {/* Desktop Inline Input Area */}
      <div className="hidden lg:flex mt-4 gap-2">
        <div className="relative flex-grow">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-cyan-500 opacity-50">{'>_'}</span>
          <input 
            type="text" 
            value={inputValue} 
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onSubmit()}
            placeholder="COMMAND_INPUT..."
            className="w-full bg-slate-950 border border-cyan-500/30 rounded-lg py-3 pl-10 pr-4 text-xs focus:outline-none focus:border-cyan-400 uppercase tracking-widest font-black"
          />
        </div>
        <button onClick={onMicClick} className={`px-4 rounded-lg border transition-all ${isListening ? 'bg-red-500/20 border-red-500 text-red-400' : 'bg-cyan-500/10 border-cyan-500/30 text-cyan-500'}`}>
          🎙️
        </button>
      </div>
    </div>
  );
};

export default Terminal;
