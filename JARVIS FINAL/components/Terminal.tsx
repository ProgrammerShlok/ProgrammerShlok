
import React, { useRef, useEffect } from 'react';
import { ChatMessage, MessageRole } from '../types';

interface GroundingSource {
  title: string;
  uri: string;
}

interface TerminalProps {
  messages: ChatMessage[];
  inputValue: string;
  setInputValue: (val: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
  loadingStep: string;
  groundingSources: Record<string, GroundingSource[]>;
  onMicClick?: () => void;
  isListening?: boolean;
  pendingUrl?: string | null;
  onDeploy?: () => void;
}

const Terminal: React.FC<TerminalProps> = ({ 
  messages, 
  inputValue, 
  setInputValue, 
  onSubmit, 
  isLoading, 
  loadingStep, 
  groundingSources,
  onMicClick,
  isListening,
  pendingUrl,
  onDeploy
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading, pendingUrl, isListening]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onSubmit();
    }
  };

  return (
    <div className="flex flex-col h-full hud-border rounded-xl p-3 md:p-6 mono-font overflow-hidden relative bg-slate-950/80">
      <div className="absolute left-0 top-0 bottom-0 w-1 flex flex-col justify-between opacity-20 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div key={i} className="w-2 h-[2px] bg-cyan-400 ml-1"></div>
        ))}
      </div>

      <div className="flex items-center justify-between border-b border-cyan-500/20 pb-2 md:pb-4 mb-2 md:mb-4">
        <div className="flex items-center gap-2 md:gap-4">
          <div className="flex gap-1">
            <div className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-red-500/40 border border-red-500"></div>
            <div className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-yellow-500/40 border border-yellow-500"></div>
            <div className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-green-500/40 border border-green-500"></div>
          </div>
          <span className="text-[10px] md:text-xs text-cyan-400 font-bold uppercase tracking-[0.2em] md:tracking-[0.4em] opacity-80 truncate">STARK_TERMINAL_v9.0</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="px-2 py-0.5 border border-cyan-500/30 rounded text-[8px] uppercase font-bold opacity-50">Local_Node</div>
        </div>
      </div>

      <div ref={scrollRef} className="flex-grow overflow-y-auto space-y-4 md:space-y-6 pr-2 md:pr-4 custom-scrollbar text-xs md:text-sm">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex flex-col ${msg.role === MessageRole.USER ? 'items-end' : 'items-start'}`}>
            <div className={`text-[8px] md:text-[10px] mb-1 md:mb-2 uppercase tracking-widest font-bold ${msg.role === MessageRole.USER ? 'text-cyan-500' : 'text-cyan-300'}`}>
              <span className="opacity-40">[{new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}]</span> {msg.role === MessageRole.USER ? 'HOST >>' : 'JARVIS <<'}
            </div>
            <div className={`p-3 md:p-5 rounded-xl md:rounded-2xl max-w-[95%] border shadow-2xl relative transition-all duration-300 ${
              msg.role === MessageRole.USER 
                ? 'bg-cyan-500/5 border-cyan-500/30 text-cyan-300' 
                : 'bg-slate-900/40 border-cyan-300/10 text-cyan-50'
            }`}>
              <div className="leading-relaxed tracking-wide whitespace-pre-wrap break-words">{msg.text}</div>
            </div>
          </div>
        ))}
        
        {/* Real-time Listening Indicator in Terminal History */}
        {isListening && (
          <div className="flex flex-col items-start animate-pulse">
            <div className="text-[8px] md:text-[10px] mb-1 md:mb-2 uppercase tracking-widest font-bold text-red-500">
               [SYSTEM] LISTENING_ACTIVE...
            </div>
            <div className="p-3 border border-red-500/30 bg-red-500/5 rounded-xl text-red-400 italic">
               Waiting for vocal input sequence...
            </div>
          </div>
        )}

        {isLoading && (
          <div className="flex flex-col gap-2 p-3 bg-cyan-950/20 border border-cyan-500/10 rounded-xl">
             <div className="flex items-center gap-3 text-cyan-400 font-bold tracking-widest text-[10px] md:text-xs">
               <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
               {loadingStep.toUpperCase()}...
             </div>
             <div className="w-full h-1 bg-black/40 overflow-hidden rounded-full">
                <div className="h-full bg-cyan-500 w-1/3 animate-[loading_1.5s_infinite_ease-in-out]"></div>
             </div>
          </div>
        )}
      </div>

      {/* Prominent Action Area (Above Input) */}
      <div className="mt-4 flex flex-col gap-2">
        {pendingUrl && (
          <button 
            onClick={() => onDeploy && onDeploy()}
            className="w-full p-4 bg-cyan-500 text-black font-black uppercase text-sm tracking-[0.2em] rounded-xl shadow-[0_0_30px_rgba(34,211,238,0.5)] animate-pulse hover:bg-cyan-400 active:scale-[0.98] transition-all flex items-center justify-center gap-4 border-2 border-cyan-300"
          >
            <span className="text-xl">🚀</span>
            <span>DEPLOY_EXTERNAL_NODE</span>
            <span className="text-[10px] opacity-60 mono-font hidden md:inline">({new URL(pendingUrl).hostname})</span>
          </button>
        )}

        <div className="relative group flex gap-2">
          <div className="relative flex-grow">
            <div className={`absolute -inset-1 rounded-xl blur-lg transition duration-1000 ${isListening ? 'bg-red-500/20 opacity-100' : 'bg-cyan-500/10 opacity-0 group-focus-within:opacity-100'}`}></div>
            <span className={`absolute left-4 top-1/2 -translate-y-1/2 text-sm md:text-lg font-black transition-colors ${isListening ? 'text-red-500 animate-pulse' : 'text-cyan-500'}`}>
              {isListening ? 'VOX_' : '>_'}
            </span>
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isListening ? "TRANSCRIBING VOCAL DATA..." : "COMMAND..."}
              className={`w-full bg-black/50 border rounded-xl py-3 md:py-5 pl-14 md:pl-16 pr-4 md:pr-6 transition-all text-xs md:text-sm uppercase tracking-[0.1em] md:tracking-[0.2em] font-black focus:outline-none ${
                isListening 
                  ? 'border-red-500/50 text-red-200 placeholder:text-red-900/60' 
                  : 'border-cyan-500/30 text-cyan-200 placeholder:text-cyan-950 focus:border-cyan-400'
              }`}
            />
          </div>
          
          <button 
            onClick={onMicClick}
            className={`flex items-center justify-center w-12 md:w-16 rounded-xl border transition-all duration-300 ${isListening ? 'bg-red-500/20 border-red-500 text-red-400 shadow-[0_0_20px_rgba(239,68,68,0.4)] animate-pulse' : 'bg-cyan-500/5 border-cyan-500/30 text-cyan-500 hover:bg-cyan-500/10 hover:border-cyan-400'}`}
          >
            <svg className={`w-6 h-6 ${isListening ? 'scale-125' : ''} transition-transform`} fill="currentColor" viewBox="0 0 20 20">
              <path d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4z" />
              <path fillRule="evenodd" d="M3 8a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
      <style>{`
        @keyframes loading {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(300%); }
        }
      `}</style>
    </div>
  );
};

export default Terminal;
