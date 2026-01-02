
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
}

const Terminal: React.FC<TerminalProps> = ({ messages, inputValue, setInputValue, onSubmit, isLoading, loadingStep, groundingSources }) => {
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
    <div className="flex flex-col h-full hud-border rounded-xl p-6 mono-font overflow-hidden relative bg-slate-950/80">
      <div className="absolute left-0 top-0 bottom-0 w-1 flex flex-col justify-between opacity-20 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div key={i} className="w-2 h-[2px] bg-cyan-400 ml-1"></div>
        ))}
      </div>

      <div className="flex items-center justify-between border-b border-cyan-500/20 pb-4 mb-4">
        <div className="flex items-center gap-4">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500/40 border border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.3)]"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500/40 border border-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.3)]"></div>
            <div className="w-3 h-3 rounded-full bg-green-500/40 border border-green-500 shadow-[0_0_10px_rgba(34,197,94,0.3)]"></div>
          </div>
          <span className="text-xs text-cyan-400 font-bold uppercase tracking-[0.4em] opacity-80">STARK_MAIN_TERMINAL_v8.0.2</span>
        </div>
        <div className="flex gap-4">
            <span className="text-[10px] text-cyan-500 font-black animate-pulse uppercase tracking-widest">REALTIME_SYNC</span>
            <span className="text-[10px] text-slate-600 font-bold uppercase">SEC_CH_UA: PC_EXT</span>
        </div>
      </div>

      <div ref={scrollRef} className="flex-grow overflow-y-auto space-y-6 pr-4 custom-scrollbar text-sm">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex flex-col ${msg.role === MessageRole.USER ? 'items-end' : 'items-start'}`}>
            <div className={`text-[10px] mb-2 uppercase tracking-widest font-bold ${msg.role === MessageRole.USER ? 'text-cyan-500' : 'text-cyan-300'}`}>
              <span className="opacity-40">[{new Date(msg.timestamp).toLocaleTimeString()}]</span> {msg.role === MessageRole.USER ? 'HOST >>' : 'JARVIS <<'}
            </div>
            <div className={`p-5 rounded-2xl max-w-[90%] border shadow-2xl relative transition-all duration-300 ${
              msg.role === MessageRole.USER 
                ? 'bg-cyan-500/5 border-cyan-500/30 text-cyan-300' 
                : 'bg-slate-900/40 border-cyan-300/10 text-cyan-50'
            }`}>
              <div className="leading-relaxed tracking-wide whitespace-pre-wrap">{msg.text}</div>
              
              {groundingSources[msg.id] && groundingSources[msg.id].length > 0 && (
                <div className="mt-4 pt-3 border-t border-cyan-500/10">
                  <div className="text-[9px] uppercase tracking-[0.3em] text-cyan-600 mb-2 font-bold">Encrypted Data Sources:</div>
                  <div className="flex flex-wrap gap-3">
                    {groundingSources[msg.id].map((source, idx) => (
                      <a 
                        key={idx} 
                        href={source.uri} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-[10px] px-3 py-1 border border-cyan-500/20 bg-cyan-500/5 hover:bg-cyan-400 hover:text-black rounded transition-all flex items-center gap-2"
                      >
                        <span className="truncate max-w-[150px] font-bold">{source.title || 'EXTERNAL_NODE'}</span>
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex flex-col gap-3 p-4 bg-cyan-950/20 border border-cyan-500/10 rounded-xl">
             <div className="flex items-center gap-3 text-cyan-400 font-bold tracking-widest text-xs">
               <span className="w-3 h-3 rounded-full bg-cyan-400 animate-ping"></span>
               {loadingStep.toUpperCase()}... PROCESSING_NEURAL_PATH
             </div>
             <div className="w-full h-1 bg-black/40 overflow-hidden rounded-full">
                <div className="h-full bg-cyan-500 w-1/3 animate-[loading_1.5s_infinite_ease-in-out]"></div>
             </div>
          </div>
        )}
      </div>

      <div className="mt-6 relative group">
        <div className="absolute -inset-1 bg-cyan-500/10 rounded-xl blur-lg opacity-0 group-focus-within:opacity-100 transition duration-1000"></div>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-cyan-500 text-lg font-black">&gt;_</span>
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="TYPE COMMAND OR INITIALIZE VOICE ARRAY..."
            className="w-full bg-black/50 border border-cyan-500/30 rounded-xl py-5 pl-12 pr-6 text-cyan-200 placeholder:text-cyan-950 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-500/30 transition-all text-sm uppercase tracking-[0.2em] font-black"
          />
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
