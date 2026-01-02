
import React, { useRef, useEffect } from 'react';
import { ChatMessage, MessageRole } from '../types';

interface TerminalProps {
  messages: ChatMessage[];
  inputValue: string;
  setInputValue: (val: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
  loadingStep: string;
}

const Terminal: React.FC<TerminalProps> = ({ messages, inputValue, setInputValue, onSubmit, isLoading, loadingStep }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onSubmit();
    }
  };

  return (
    <div className="flex flex-col h-full hud-border rounded-xl p-4 mono-font overflow-hidden relative">
      {/* Measuring Tool: Side Ruler */}
      <div className="absolute left-0 top-0 bottom-0 w-1 flex flex-col justify-between opacity-30 pointer-events-none">
        {[...Array(10)].map((_, i) => (
          <div key={i} className="w-2 h-[1px] bg-cyan-400 ml-1"></div>
        ))}
      </div>

      <div className="flex items-center justify-between border-b border-cyan-500/20 pb-2 mb-2">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500/60 shadow-[0_0_5px_red]"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500/60 shadow-[0_0_5px_yellow]"></div>
          <div className="w-3 h-3 rounded-full bg-green-500/60 shadow-[0_0_5px_green]"></div>
          <span className="text-[10px] text-cyan-400 opacity-50 ml-2 uppercase tracking-widest">CONSOLE_CORE_v4.2</span>
        </div>
        <div className="text-[9px] text-cyan-600 font-bold uppercase tracking-tighter">
          SECURE ENCRYPTED // 2048-BIT
        </div>
      </div>

      <div ref={scrollRef} className="flex-grow overflow-y-auto space-y-3 pr-2 custom-scrollbar">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex flex-col ${msg.role === MessageRole.USER ? 'items-end' : 'items-start'}`}>
            <div className={`text-[9px] mb-1 uppercase tracking-tighter ${msg.role === MessageRole.USER ? 'text-cyan-500' : 'text-cyan-300'}`}>
              [{new Date(msg.timestamp).toLocaleTimeString()}] {msg.role === MessageRole.USER ? 'CMD_IN >> STARK' : 'DATA_OUT << JARVIS'}
            </div>
            <div className={`p-3 rounded-lg max-w-[85%] border shadow-sm ${
              msg.role === MessageRole.USER 
                ? 'bg-cyan-900/20 border-cyan-500/40 text-cyan-400' 
                : 'bg-slate-900/50 border-cyan-300/10 text-cyan-100'
            }`}>
              <span className="leading-relaxed">{msg.text}</span>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex flex-col gap-1 p-2 bg-cyan-950/20 border border-cyan-500/10 rounded italic text-xs">
             <div className="flex items-center gap-2 text-cyan-400 processing-pulse">
               <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
               RUNNING: {loadingStep}...
             </div>
             <div className="w-full h-1 bg-cyan-900/30 overflow-hidden">
                <div className="h-full bg-cyan-500 w-1/2 animate-[progress_1s_infinite_linear]"></div>
             </div>
             <style>{`
                @keyframes progress {
                  0% { transform: translateX(-100%); }
                  100% { transform: translateX(200%); }
                }
             `}</style>
          </div>
        )}
      </div>

      <div className="mt-4 relative group">
        <div className="absolute -inset-0.5 bg-cyan-500/20 rounded blur opacity-0 group-focus-within:opacity-100 transition duration-500"></div>
        <div className="relative">
          <span className="absolute left-2 top-1/2 -translate-y-1/2 text-cyan-500 text-sm">&gt;</span>
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="AWAITING COMMAND..."
            className="w-full bg-black/60 border border-cyan-500/40 rounded-lg py-3 pl-8 pr-4 text-cyan-300 placeholder:text-cyan-900 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-500/50 transition-all text-sm uppercase tracking-widest font-bold"
          />
        </div>
      </div>
    </div>
  );
};

export default Terminal;
