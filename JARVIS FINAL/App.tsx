
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ChatMessage, MessageRole, SystemStats } from './types';
import { getJarvisResponse, getJarvisVoice, playJarvisSound } from './services/jarvisService';
import Visualizer from './components/Visualizer';
import VirtualKeyboard from './components/VirtualKeyboard';
import Terminal from './components/Terminal';
import MeasuringWorkbench from './components/MeasuringWorkbench';

const App: React.FC = () => {
  const [hasStarted, setHasStarted] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init-1',
      role: MessageRole.JARVIS,
      text: 'Local Neural Core Online. Awaiting manual link authorization, Sir.',
      timestamp: Date.now(),
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState('IDLE');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isWorkbenchOpen, setIsWorkbenchOpen] = useState(false);
  const [pendingUrl, setPendingUrl] = useState<string | null>(null);
  const [showKeyboard, setShowKeyboard] = useState(false);
  const [stats, setStats] = useState<SystemStats>({
    cpu: 8,
    memory: 32,
    network: 0.1,
    aiLoad: 2
  });

  const recognitionRef = useRef<any>(null);
  const isSpeakingRef = useRef(false);
  const isListeningRef = useRef(false); 
  const isManuallyStopped = useRef(false);

  // Synchronize ref with state
  useEffect(() => {
    isListeningRef.current = isListening;
  }, [isListening]);

  const handleDeploy = useCallback(() => {
    if (pendingUrl) {
      playJarvisSound('deploy');
      window.open(pendingUrl, '_blank');
      setPendingUrl(null);
    }
  }, [pendingUrl]);

  const handleSendMessage = useCallback(async (textOverride?: string) => {
    const messageText = textOverride || inputValue;
    if (!messageText.trim() || isLoading) return;

    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      role: MessageRole.USER,
      text: messageText,
      timestamp: Date.now(),
    }]);
    setInputValue('');
    setIsLoading(true);
    setLoadingStep('ANALYZING');

    try {
      const result = await getJarvisResponse(messageText, []);
      
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: MessageRole.JARVIS,
        text: result.text,
        timestamp: Date.now(),
      }]);

      if (result.url) setPendingUrl(result.url);
      if (result.intent === 'OPEN_MEASURING_TOOL') setIsWorkbenchOpen(true);

      setIsLoading(false);
      setLoadingStep('IDLE');

      setIsSpeaking(true);
      isSpeakingRef.current = true;
      await getJarvisVoice(result.text);
      setIsSpeaking(false);
      isSpeakingRef.current = false;

    } catch (error) {
      console.error("Local Neural Failure:", error);
      setIsLoading(false);
      setLoadingStep('ERROR');
    }
  }, [inputValue, isLoading]);

  const initVoiceSystem = useCallback(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    if (!recognitionRef.current) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        if (isSpeakingRef.current || !isListeningRef.current) return;

        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }

        if (interimTranscript.trim().length > 0) {
          setInputValue(interimTranscript.toUpperCase());
        }

        if (finalTranscript.trim().length > 0) {
          handleSendMessage(finalTranscript.trim());
          setIsListening(false);
        }
      };

      recognitionRef.current.onend = () => {
        if (!isManuallyStopped.current) {
          try { recognitionRef.current.start(); } catch (e) {}
        }
      };

      try { recognitionRef.current.start(); } catch (e) {}
    }
  }, [handleSendMessage]);

  const startSystem = async () => {
    if (hasStarted) return;
    setHasStarted(true);
    playJarvisSound('boot');
    initVoiceSystem();
    await getJarvisVoice("HUD Active. All systems report nominal. Monitoring for instructions, Sir.");
  };

  const toggleListening = () => {
    if (isListening) {
      setIsListening(false);
      setInputValue('');
    } else {
      setInputValue('');
      setIsListening(true);
      playJarvisSound('wake');
      try { recognitionRef.current.start(); } catch (e) {}
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setStats(prev => ({
        cpu: Math.min(100, Math.max(5, prev.cpu + (Math.random() - 0.5) * 4)),
        memory: Math.min(100, Math.max(20, prev.memory + (Math.random() - 0.5) * 1)),
        network: Math.max(0.1, prev.network + (Math.random() - 0.5) * 0.1),
        aiLoad: Math.min(100, Math.max(1, prev.aiLoad + (Math.random() - 0.5) * 2))
      }));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-screen w-screen p-4 md:p-6 flex flex-col gap-4 md:gap-6 relative overflow-hidden text-cyan-400">
      {isWorkbenchOpen && <MeasuringWorkbench onClose={() => setIsWorkbenchOpen(false)} />}

      {!hasStarted && (
        <div 
          onClick={startSystem}
          className="fixed inset-0 z-[200] bg-slate-950/90 backdrop-blur-xl flex flex-col items-center justify-center cursor-pointer group"
        >
          <div className="relative w-48 h-48 mb-8">
             <div className="absolute inset-0 border-4 border-cyan-500/20 rounded-full animate-ping"></div>
             <div className="absolute inset-4 border-2 border-cyan-400/40 rounded-full animate-[spin_3s_linear_infinite] border-t-transparent"></div>
             <div className="absolute inset-0 flex items-center justify-center">
               <span className="text-4xl group-hover:scale-125 transition-transform">⚡</span>
             </div>
          </div>
          <h2 className="text-2xl font-black italic tracking-[0.5em] glow-text mb-2">INITIALIZE_HUD</h2>
          <p className="text-[10px] uppercase tracking-widest opacity-40 animate-pulse">Touch to establish neural link</p>
        </div>
      )}

      {isListening && (
        <div className="fixed inset-0 z-[100] pointer-events-none flex flex-col items-center justify-center p-6">
          <div className="absolute w-[80vw] h-[80vw] max-w-[400px] max-h-[400px] border border-cyan-400/20 rounded-full animate-[ping_3s_infinite] opacity-10"></div>
          <div className="relative p-8 md:p-12 bg-slate-950/40 backdrop-blur-3xl rounded-full border border-red-500/20 shadow-[0_0_80px_rgba(239,68,68,0.1)]">
             <div className="flex flex-col items-center">
               <span className="text-xl md:text-3xl font-black italic tracking-[0.3em] md:tracking-[0.4em] text-red-500 glow-text uppercase mb-4 md:mb-6 animate-pulse">LISTENING</span>
               <div className="flex gap-1 md:gap-2 items-end h-8 md:h-12">
                 {[...Array(8)].map((_, i) => (
                   <div 
                     key={i} 
                     className="w-1 md:w-1.5 bg-red-500 animate-[bounce_1s_infinite]" 
                     style={{ 
                       height: `${30 + Math.random() * 70}%`,
                       animationDelay: `${i * 0.1}s` 
                     }}
                   ></div>
                 ))}
               </div>
             </div>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center z-10 hud-border px-4 md:px-6 py-2 md:py-3 rounded-xl bg-slate-900/80">
        <div className="flex items-center gap-4 md:gap-6">
          <div className="flex flex-col">
            <h1 className="text-lg md:text-2xl font-black tracking-tighter glow-text italic leading-none">STARK_HUD_X1</h1>
            <div className="flex items-center gap-2 mt-1">
               <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
               <span className="text-[8px] md:text-[9px] tracking-[0.2em] font-black text-emerald-500 uppercase">SECURE_OFFLINE_CORE</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-4 md:gap-8">
          <div className="hidden md:block text-right">
            <div className="text-xl font-bold tracking-widest mono-font">{new Date().toLocaleTimeString()}</div>
            <div className="text-[8px] text-cyan-500/60 uppercase tracking-widest font-bold">100% LOCAL PROCESSING</div>
          </div>

          <button 
            onClick={toggleListening}
            className={`relative group w-10 h-10 md:w-12 md:h-12 rounded-full border flex items-center justify-center transition-all duration-300 ${isListening ? 'bg-red-500/20 border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)]' : 'bg-cyan-500/5 border-cyan-500/20 hover:border-cyan-400'}`}
          >
             <div className={`absolute -inset-1 rounded-full border border-red-500/20 ${isListening ? 'animate-ping' : 'hidden'}`}></div>
             <svg className={`w-5 h-5 md:w-6 md:h-6 ${isListening ? 'text-red-400' : 'text-cyan-500/40 group-hover:text-cyan-400'}`} fill="currentColor" viewBox="0 0 20 20">
               <path d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4z" />
               <path d="M3 8a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" />
             </svg>
          </button>
          
          <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full border border-cyan-500/30 flex items-center justify-center bg-cyan-500/5 ${isLoading || isSpeaking ? 'animate-pulse' : ''}`}>
             <div className={`w-8 h-8 md:w-10 md:h-10 border-2 border-t-cyan-400 border-r-transparent border-b-cyan-400 border-l-transparent rounded-full ${isLoading || isSpeaking ? 'animate-spin' : ''}`}></div>
          </div>
        </div>
      </div>

      <div className="flex-grow flex flex-col lg:flex-row gap-4 md:gap-6 z-10 overflow-hidden relative">
        <div className="hidden lg:flex w-80 flex-col gap-6 h-full flex-shrink-0">
          <div className={`hud-border rounded-xl p-6 flex flex-col items-center bg-slate-900/60 flex-shrink-0 relative overflow-hidden transition-all duration-500 ${isListening ? 'border-red-500 shadow-[0_0_40px_rgba(239,68,68,0.1)] bg-red-500/5' : ''}`}>
            <h2 className="text-[10px] uppercase tracking-[0.4em] mb-6 opacity-60">Neural Core</h2>
            <div className="relative">
              <Visualizer isListening={isListening} />
            </div>
            <div className="mt-6 flex flex-col items-center gap-2">
               <div className="flex gap-1">
                  {[...Array(15)].map((_, i) => (
                    <div key={i} className={`w-1 transition-all duration-150 ${isListening || isSpeaking ? (isListening ? 'bg-red-500' : 'bg-cyan-400') + ' h-6 scale-y-125' : 'bg-cyan-900 h-1 scale-y-100'}`} style={{ transitionDelay: `${i * 20}ms` }}></div>
                  ))}
               </div>
               <span className={`text-[9px] font-black uppercase tracking-widest opacity-60 ${isListening ? 'text-red-500' : 'text-cyan-500'}`}>
                 {isListening ? 'VOICE_BUS_BUSY' : isSpeaking ? 'DATA_TX_STREAM' : 'SYSTEM_IDLE'}
               </span>
            </div>
          </div>
          
          <div className="hud-border rounded-xl p-6 flex-grow flex flex-col gap-6 bg-slate-900/60 overflow-y-auto">
            <h2 className="text-[10px] uppercase tracking-[0.4em] opacity-60">HUD Telemetry</h2>
            {[
              { label: 'CPU_CORE', value: stats.cpu, color: 'bg-cyan-500' },
              { label: 'VOICE_BUS', value: isListening || isSpeaking ? 98 : 4, color: isListening ? 'bg-red-500' : 'bg-blue-500' },
              { label: 'STABILITY', value: stats.memory, color: 'bg-emerald-500' }
            ].map(item => (
              <div key={item.label} className="space-y-1">
                <div className="flex justify-between text-[9px] uppercase font-black">
                  <span>{item.label}</span>
                  <span className="mono-font">{Math.round(item.value)}%</span>
                </div>
                <div className="w-full h-1 bg-black/40 rounded-full overflow-hidden border border-cyan-500/5">
                  <div className={`h-full ${item.color} shadow-[0_0_10px_currentColor] transition-all duration-1000`} style={{ width: `${item.value}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex-grow h-full flex flex-col overflow-hidden relative">
          <Terminal 
            messages={messages}
            inputValue={inputValue}
            setInputValue={(val) => setInputValue(val)}
            onSubmit={() => handleSendMessage()}
            isLoading={isLoading}
            loadingStep={loadingStep}
            groundingSources={{}}
            onMicClick={toggleListening}
            isListening={isListening}
            pendingUrl={pendingUrl}
            onDeploy={handleDeploy}
          />
        </div>

        <div className="w-full lg:w-96 flex flex-col gap-4 md:gap-6 flex-shrink-0 lg:h-full">
          <div className="hud-border p-4 md:p-6 rounded-xl flex flex-col gap-4 bg-slate-900/60">
             <div className="flex justify-between items-center border-b border-cyan-500/10 pb-2">
                <div className="text-[10px] uppercase opacity-60 tracking-[0.4em]">Control Deck</div>
                <button 
                  onClick={() => setShowKeyboard(!showKeyboard)}
                  className="lg:hidden text-[10px] text-cyan-400 font-bold border border-cyan-500/30 px-2 py-1 rounded hover:bg-cyan-500/10"
                >
                  {showKeyboard ? 'HIDE_KEYS' : 'SHOW_KEYS'}
                </button>
             </div>
             <div className="grid grid-cols-3 lg:grid-cols-2 gap-2">
               {[
                 { label: 'SEARCH', cmd: 'search stark industries', icon: '🌐' },
                 { label: 'YOUTUBE', cmd: 'open youtube', icon: '📺' },
                 { label: 'MEASURE', cmd: 'open tool', icon: '📐' },
                 { label: 'SCAN', cmd: 'show photo', icon: '📷' },
                 { label: 'HELLO', cmd: 'hi jarvis', icon: '🤖' },
                 { label: 'ID', cmd: 'who are you', icon: '🆔' }
               ].map(btn => (
                 <button 
                   key={btn.label}
                   onClick={() => {
                     setInputValue(btn.cmd.toUpperCase());
                     handleSendMessage(btn.cmd);
                   }}
                   className="text-[8px] md:text-[9px] text-left border border-cyan-500/20 p-2 bg-cyan-500/5 hover:bg-cyan-400 hover:text-slate-950 transition-all rounded uppercase font-bold flex flex-col md:flex-row items-center gap-1 md:gap-2"
                 >
                   <span>{btn.icon}</span>
                   <span className="truncate">{btn.label}</span>
                 </button>
               ))}
             </div>
          </div>

          <div className={`${showKeyboard || window.innerWidth >= 1024 ? 'flex' : 'hidden'} flex-grow flex-col justify-end`}>
            <VirtualKeyboard 
              onKeyPress={(key) => setInputValue(prev => prev + key)}
              onBackspace={() => setInputValue(prev => prev.slice(0, -1))}
              onEnter={() => handleSendMessage()}
            />
          </div>
        </div>
      </div>
      
      <div className="lg:hidden z-20 flex gap-2">
         {pendingUrl ? (
           <button 
             onClick={handleDeploy}
             className="flex-grow py-4 rounded-xl border-2 border-cyan-300 bg-cyan-400 text-black font-black uppercase text-xs tracking-widest shadow-[0_0_30px_rgba(34,211,238,0.6)] animate-pulse"
           >
             🚀 DEPLOY_NODE
           </button>
         ) : (
           <button 
             onClick={toggleListening}
             className={`flex-grow py-4 rounded-xl border-2 font-black uppercase text-xs tracking-widest transition-all ${isListening ? 'bg-red-500 border-red-400 text-black shadow-[0_0_20px_rgba(239,68,68,0.5)] animate-pulse' : 'bg-slate-900/90 border-cyan-500/30 text-cyan-500/70'}`}
           >
             {isListening ? '🔴 LISTENING...' : '🛰️ ACTIVATE_VOICE'}
           </button>
         )}
      </div>
    </div>
  );
};

export default App;
