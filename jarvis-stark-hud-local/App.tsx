
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ChatMessage, MessageRole, SystemStats } from './types';
import { getJarvisResponse, getJarvisVoice } from './services/jarvisService';
import Visualizer from './components/Visualizer';
import VirtualKeyboard from './components/VirtualKeyboard';
import Terminal from './components/Terminal';
import MeasuringWorkbench from './components/MeasuringWorkbench';

const App: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init-1',
      role: MessageRole.JARVIS,
      text: 'Local Neural Core Online. All STARK HUD modules synchronized. Systems armed, Sir.',
      timestamp: Date.now(),
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState('IDLE');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isWakewordDetected, setIsWakewordDetected] = useState(false);
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
  const isManuallyStopped = useRef(false);
  const lastProcessedTranscript = useRef<string>('');

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
      await getJarvisVoice(result.text);
      setIsSpeaking(false);

    } catch (error) {
      console.error("Local Neural Failure:", error);
      setIsLoading(false);
      setLoadingStep('ERROR');
    }
  }, [inputValue, isLoading]);

  // Voice System Logic
  const initVoiceSystem = useCallback(async () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition && !recognitionRef.current) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true; // Crucial for responsive wakeword
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }

        const fullTranscript = (finalTranscript + interimTranscript).toLowerCase();
        
        // 1. WAKEWORD DETECTION
        if (fullTranscript.includes('jarvis') && !isWakewordDetected) {
          setIsWakewordDetected(true);
          
          // Visual pulse feedback
          setTimeout(() => setIsWakewordDetected(false), 2500);

          // If there's content after "Jarvis" in the same result
          const parts = fullTranscript.split('jarvis');
          const command = parts[parts.length - 1].trim();

          if (command.length > 3 && event.results[event.results.length - 1].isFinal) {
            // Already a full command detected
            handleSendMessage(command);
          } else if (!isListening && !isLoading && !isSpeaking) {
            // Standalone "Jarvis" heard, prepare to listen
            setIsListening(true);
            getJarvisVoice("Yes, Sir?");
          }
        } 
        
        // 2. ACTIVE LISTENING MODE (After JARVIS says "Yes, Sir?")
        else if (isListening && finalTranscript.length > 0) {
          handleSendMessage(finalTranscript);
          setIsListening(false);
        }
      };

      recognitionRef.current.onstart = () => {
        console.log("HUD: Voice engine online and listening for 'JARVIS'...");
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error("Speech Recognition Error:", event.error);
        if (event.error === 'not-allowed') {
          alert("Microphone access denied. JARVIS cannot hear you.");
        }
      };

      recognitionRef.current.onend = () => {
        // High-availability restart loop
        if (!isManuallyStopped.current) {
          try {
            recognitionRef.current.start();
          } catch (e) {
            // Likely already started
          }
        }
      };

      try {
        recognitionRef.current.start();
      } catch (e) {}
    }
  }, [isListening, handleSendMessage, isLoading, isSpeaking, isWakewordDetected]);

  useEffect(() => {
    const handleInit = async () => {
      initVoiceSystem();
      await getJarvisVoice("Local systems operational. Voice node active. Monitoring for wakeword.");
      window.removeEventListener('click', handleInit);
      window.removeEventListener('touchstart', handleInit);
    };
    window.addEventListener('click', handleInit);
    window.addEventListener('touchstart', handleInit);
    return () => {
      window.removeEventListener('click', handleInit);
      window.removeEventListener('touchstart', handleInit);
    };
  }, [initVoiceSystem]);

  const toggleListening = () => {
    if (isListening) {
      setIsListening(false);
    } else {
      setIsListening(true);
      getJarvisVoice("Standing by.");
    }
  };

  const handleDeploy = useCallback(() => {
    if (pendingUrl) {
      window.open(pendingUrl, '_blank');
      setPendingUrl(null);
    }
  }, [pendingUrl]);

  const handleQuickAction = (cmd: string) => {
    setInputValue(cmd.toUpperCase());
    if (window.innerWidth < 1024) handleSendMessage(cmd); 
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

      {/* Wakeword Alert Pulse */}
      {isWakewordDetected && (
        <div className="fixed inset-0 pointer-events-none z-[100] flex items-center justify-center">
           <div className="absolute inset-0 border-[20px] border-cyan-400/20 animate-pulse"></div>
           <div className="bg-slate-950/90 backdrop-blur-xl px-12 py-8 rounded-full border border-cyan-400 shadow-[0_0_80px_rgba(34,211,238,0.5)] flex flex-col items-center">
             <span className="text-4xl font-black italic tracking-[0.4em] text-cyan-400 glow-text uppercase mb-2">JARVIS_LISTEN</span>
             <div className="flex gap-1 h-4">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="w-1 bg-cyan-400 animate-bounce" style={{ animationDelay: `${i * 0.1}s` }}></div>
                ))}
             </div>
           </div>
        </div>
      )}

      <div className="flex justify-between items-center z-10 hud-border px-4 md:px-6 py-2 md:py-3 rounded-xl bg-slate-900/80">
        <div className="flex items-center gap-4 md:gap-6">
          <div className="flex flex-col">
            <h1 className="text-lg md:text-2xl font-black tracking-tighter glow-text italic leading-none">STARK_HUD_X1</h1>
            <span className="text-[8px] md:text-[10px] tracking-[0.4em] md:tracking-[0.6em] opacity-40 uppercase">Voice Sync: ACTIVE</span>
          </div>
        </div>
        
        <div className="flex items-center gap-4 md:gap-8">
          <div className="hidden md:block text-right">
            <div className="text-xl font-bold tracking-widest mono-font">{new Date().toLocaleTimeString()}</div>
            <div className="text-[8px] text-cyan-500/60 uppercase tracking-widest font-bold">WAKEWORD: "JARVIS"</div>
          </div>

          <button 
            onClick={toggleListening}
            className={`relative group w-10 h-10 md:w-12 md:h-12 rounded-full border flex items-center justify-center transition-all duration-300 ${isListening ? 'bg-cyan-500/20 border-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.5)]' : 'bg-cyan-500/5 border-cyan-500/20 hover:border-cyan-400'}`}
          >
             <div className={`absolute -inset-1 rounded-full border border-cyan-400/20 ${isListening ? 'animate-ping' : 'hidden'}`}></div>
             <svg className={`w-5 h-5 md:w-6 md:h-6 ${isListening ? 'text-cyan-300' : 'text-cyan-500/40 group-hover:text-cyan-400'}`} fill="currentColor" viewBox="0 0 20 20">
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
          <div className={`hud-border rounded-xl p-6 flex flex-col items-center bg-slate-900/60 flex-shrink-0 relative overflow-hidden transition-all duration-500 ${isListening || isWakewordDetected ? 'border-cyan-400 shadow-[0_0_30px_rgba(34,211,238,0.1)]' : ''}`}>
            <h2 className="text-[10px] uppercase tracking-[0.4em] mb-6 opacity-60">Speech Core Alpha</h2>
            <div className="relative">
              <Visualizer isListening={isListening || isWakewordDetected} />
            </div>
            <div className="mt-4 text-[9px] font-black uppercase text-center opacity-40 tracking-widest leading-relaxed">
              {isWakewordDetected ? 'JARVIS SPOTTER: POSITIVE' : 'Monitoring: "JARVIS"'}
            </div>
          </div>
          <div className="hud-border rounded-xl p-6 flex-grow flex flex-col gap-6 bg-slate-900/60 overflow-y-auto">
            <h2 className="text-[10px] uppercase tracking-[0.4em] opacity-60">System Telemetry</h2>
            {[
              { label: 'CPU_CORE', value: stats.cpu, color: 'bg-cyan-500' },
              { label: 'VOICE_GATE', value: isListening || isSpeaking || isWakewordDetected ? 95 : 12, color: 'bg-blue-500' },
              { label: 'MEM_BUFFER', value: stats.memory, color: 'bg-emerald-500' }
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

        <div className="flex-grow h-full flex flex-col overflow-hidden">
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
                   onClick={() => handleQuickAction(btn.cmd)}
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
      
      {/* Mobile-Only Action Bar */}
      <div className="lg:hidden z-20 flex gap-2">
         <button 
           onClick={toggleListening}
           className={`flex-grow py-4 rounded-xl border-2 font-black uppercase text-xs tracking-widest transition-all ${isListening ? 'bg-cyan-500/30 border-cyan-400 animate-pulse text-cyan-100 shadow-[0_0_20px_rgba(34,211,238,0.4)]' : 'bg-slate-900/90 border-cyan-500/30 text-cyan-500/70'}`}
         >
           {isListening ? 'LISTENING' : 'ACTIVATE_VOICE'}
         </button>
         {pendingUrl && (
            <button 
              onClick={handleDeploy}
              className="px-6 bg-cyan-500 text-black font-black uppercase text-xs rounded-xl shadow-[0_0_30px_rgba(34,211,238,0.6)] animate-pulse"
            >
              DEPLOY
            </button>
         )}
      </div>
    </div>
  );
};

export default App;
