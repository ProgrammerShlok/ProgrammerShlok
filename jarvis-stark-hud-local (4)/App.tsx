
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ChatMessage, MessageRole, SystemStats } from './types';
import { getJarvisResponse, getJarvisVoice, playJarvisSound, getJarvisConfirmation } from './services/jarvisService';
import Visualizer from './components/Visualizer';
import VirtualKeyboard from './components/VirtualKeyboard';
import Terminal from './components/Terminal';
import MeasuringWorkbench from './components/MeasuringWorkbench';
import ArcLogo from './components/ArcLogo';

const QUICK_ACTIONS = [
  { label: 'YOUTUBE', cmd: 'OPEN YOUTUBE', icon: '📺' },
  { label: 'STARK_SRCH', cmd: 'SEARCH STARK INDUSTRIES', icon: '🌐' },
  { label: 'GITHUB', cmd: 'OPEN GITHUB', icon: '📁' },
  { label: 'MEASURE', cmd: 'OPEN TOOL', icon: '📐' },
  { label: 'TIME', cmd: 'TIME PROTOCOL', icon: '🕒' },
  { label: 'HELLO', cmd: 'HI JARVIS', icon: '🤖' },
];

const App: React.FC = () => {
  const [hasStarted, setHasStarted] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isWorkbenchOpen, setIsWorkbenchOpen] = useState(false);
  const [pendingUrl, setPendingUrl] = useState<string | null>(null);
  const [showKeyboard, setShowKeyboard] = useState(false);
  const [showProtocols, setShowProtocols] = useState(false);
  const [stats, setStats] = useState<SystemStats>({ cpu: 5, memory: 28, network: 0, aiLoad: 1 });

  const recognitionRef = useRef<any>(null);

  const handleDeploy = useCallback(async () => {
    if (pendingUrl) {
      playJarvisSound('deploy');
      window.open(pendingUrl, '_blank');
      const urlCopy = pendingUrl;
      setPendingUrl(null);
      
      const confirmText = getJarvisConfirmation();
      setMessages(prev => [...prev, { 
        id: 'conf-'+Date.now(), 
        role: MessageRole.JARVIS, 
        text: `Node ${new URL(urlCopy).hostname} deployed. Intelligence returning to local enclave.`, 
        timestamp: Date.now() 
      }]);
      
      setIsSpeaking(true);
      await getJarvisVoice(confirmText);
      setIsSpeaking(false);
    }
  }, [pendingUrl]);

  const handleSendMessage = useCallback(async (textOverride?: string) => {
    const text = (textOverride || inputValue).trim();
    if (!text || isLoading) return;

    setShowProtocols(false);
    setMessages(prev => [...prev, { id: Date.now().toString(), role: MessageRole.USER, text, timestamp: Date.now() }]);
    setInputValue('');
    setIsLoading(true);
    playJarvisSound('wake');

    const result = await getJarvisResponse(text);
    
    setMessages(prev => [...prev, { id: 'jarvis-'+Date.now(), role: MessageRole.JARVIS, text: result.text, timestamp: Date.now() }]);
    setIsLoading(false);

    if (result.url) setPendingUrl(result.url);
    if (result.intent === 'OPEN_TOOL') setIsWorkbenchOpen(true);

    setIsSpeaking(true);
    await getJarvisVoice(result.text);
    setIsSpeaking(false);
  }, [inputValue, isLoading]);

  const toggleListening = () => {
    if (isListening) {
      setIsListening(false);
      recognitionRef.current?.stop();
    } else {
      setIsListening(true);
      setShowProtocols(false);
      playJarvisSound('wake');
      try {
        recognitionRef.current?.start();
      } catch (e) {
        console.error("Speech recognition already started");
      }
    }
  };

  const startSystem = async () => {
    setHasStarted(true);
    playJarvisSound('boot');
    const welcome = "Local Neural Core Active. Intelligence is strictly offline, Sir. Deployments available on command.";
    setMessages([{ id: 'init', role: MessageRole.JARVIS, text: welcome, timestamp: Date.now() }]);
    
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (e: any) => {
        const transcript = e.results[0][0].transcript;
        handleSendMessage(transcript);
        setIsListening(false);
      };
      recognitionRef.current.onerror = () => setIsListening(false);
      recognitionRef.current.onend = () => setIsListening(false);
    }
    
    setIsSpeaking(true);
    await getJarvisVoice(welcome);
    setIsSpeaking(false);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setStats(prev => ({
        cpu: Math.min(100, Math.max(5, prev.cpu + (Math.random() - 0.5) * 4)),
        memory: Math.min(100, Math.max(20, prev.memory + (Math.random() - 0.5) * 1)),
        network: Math.max(0, prev.network + (Math.random() - 0.5) * 0.1),
        aiLoad: Math.min(100, Math.max(1, prev.aiLoad + (Math.random() - 0.5) * 2))
      }));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-screen w-screen flex flex-col relative overflow-hidden text-cyan-400 bg-slate-950 font-['Orbitron']">
      {!hasStarted && (
        <div onClick={startSystem} className="fixed inset-0 z-[200] bg-slate-950/98 flex flex-col items-center justify-center cursor-pointer group">
          <div className="w-48 h-48 border-4 border-cyan-500/20 rounded-full animate-ping mb-12 flex items-center justify-center relative">
            <div className="absolute inset-2 border-2 border-cyan-400/40 rounded-full animate-[spin_4s_linear_infinite] border-t-transparent"></div>
            <span className="text-6xl group-hover:scale-125 transition-transform duration-500">⚡</span>
          </div>
          <h1 className="text-3xl font-black tracking-[1em] glow-text animate-pulse italic">STARK_SYSTEMS</h1>
          <p className="mt-4 text-[10px] tracking-[0.5em] opacity-40 uppercase">Initialize Local Intelligence</p>
        </div>
      )}

      {isWorkbenchOpen && <MeasuringWorkbench onClose={() => setIsWorkbenchOpen(false)} />}

      {/* Header with Active Logo & Offline Status */}
      <div className="p-3 md:p-6 flex justify-between items-center hud-border m-3 md:m-4 rounded-xl bg-slate-900/80">
        <div className="flex items-center gap-3 md:gap-5">
          <ArcLogo active={isLoading || isSpeaking || isListening} size={48} />
          
          <div className="flex flex-col">
            <h2 className="text-sm md:text-2xl font-black tracking-widest italic glow-text leading-tight">STARK_CORE_v2</h2>
            <div className="flex items-center gap-2">
              <span className="px-1.5 py-0.5 border border-cyan-500/40 rounded text-[6px] md:text-[8px] font-black bg-cyan-500/10">OFFLINE_ENCLAVE</span>
              <span className={`flex h-1.5 w-1.5 rounded-full ${isListening ? 'bg-red-500 animate-ping' : 'bg-emerald-500 animate-pulse'}`}></span>
              <span className={`text-[7px] md:text-[10px] uppercase font-black tracking-widest ${isListening ? 'text-red-400' : 'text-emerald-500'}`}>
                {isListening ? 'VOICE_SYNC' : 'LOCAL_INTELLIGENCE_ACTIVE'}
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-4 md:gap-8">
          <div className="hidden md:block text-right">
             <div className="text-xl font-bold mono-font tracking-widest">{new Date().toLocaleTimeString()}</div>
             <div className="text-[8px] opacity-40 uppercase tracking-widest">ENCRYPTED_NODE: LOCALHOST::7700</div>
          </div>
          <div className="md:hidden text-right mono-font font-bold text-[10px] text-cyan-500/60">
            {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      </div>

      <div className="flex-grow flex flex-col lg:flex-row gap-4 px-4 md:px-6 overflow-hidden mb-24 lg:mb-6">
        
        {/* Left Graphics Sidebar */}
        <div className="hidden lg:flex flex-col w-72 gap-4 h-full">
          <div className={`hud-border p-6 rounded-xl flex flex-col items-center bg-slate-900/60 transition-all ${isListening ? 'border-red-500' : ''}`}>
            <span className="text-[10px] opacity-40 mb-4 uppercase tracking-[0.4em]">Neural_Viz</span>
            <Visualizer isListening={isListening || isSpeaking} />
          </div>
          
          <div className="hud-border p-6 rounded-xl flex-grow overflow-y-auto bg-slate-900/60">
            <span className="text-[10px] opacity-40 uppercase block mb-4 tracking-[0.4em]">Offline_Telemetry</span>
            <div className="space-y-6">
              {[
                { label: 'LOCAL_CPU', value: stats.cpu, color: 'bg-cyan-500' },
                { label: 'DISK_CACHE', value: stats.memory, color: 'bg-blue-500' },
                { label: 'VOICE_INTENT', value: isListening || isSpeaking ? 95 : 5, color: isListening ? 'bg-red-500' : 'bg-emerald-500' }
              ].map(item => (
                <div key={item.label}>
                  <div className="flex justify-between text-[9px] font-black mb-2">
                    <span>{item.label}</span>
                    <span className="mono-font">{Math.round(item.value)}%</span>
                  </div>
                  <div className="h-1.5 bg-black/40 rounded-full overflow-hidden border border-cyan-500/10">
                    <div className={`h-full ${item.color} shadow-[0_0_10px_currentColor] transition-all duration-1000`} style={{ width: `${item.value}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Central Console */}
        <div className="flex-grow flex flex-col overflow-hidden relative">
          <Terminal 
            messages={messages}
            inputValue={inputValue}
            setInputValue={setInputValue}
            onSubmit={handleSendMessage}
            isLoading={isLoading}
            loadingStep="LOCAL_BRAIN_THINKING"
            groundingSources={{}}
            isListening={isListening}
            onMicClick={toggleListening}
          />

          {pendingUrl && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-lg px-6 animate-slide-up">
              <div className="hud-border p-6 bg-slate-950/90 rounded-2xl flex flex-col gap-4 shadow-[0_0_50px_rgba(34,211,238,0.2)]">
                <div className="flex justify-between items-center border-b border-cyan-500/20 pb-3">
                   <span className="text-[10px] font-black tracking-widest text-cyan-500">ONLINE_GATEWAY_DETECTED</span>
                   <span className="text-[8px] mono-font opacity-40 uppercase">Requesting Bridge to Internet</span>
                </div>
                <button 
                  onClick={handleDeploy}
                  className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 py-4 rounded-xl font-black italic tracking-[0.3em] text-sm shadow-[0_0_30px_rgba(34,211,238,0.5)] active:scale-95 transition-all border-2 border-cyan-300"
                >
                  🚀 GO_ONLINE_NOW
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar */}
        <div className="hidden lg:flex flex-col w-64 gap-4 h-full">
           <div className="hud-border p-6 rounded-xl bg-slate-900/60 flex flex-col h-full">
             <span className="text-[10px] opacity-40 uppercase tracking-[0.4em] mb-6">Local_Protocols</span>
             <div className="flex flex-col gap-3 overflow-y-auto no-scrollbar">
                {QUICK_ACTIONS.map(action => (
                  <button
                    key={action.label}
                    onClick={() => handleSendMessage(action.cmd)}
                    className="p-4 border border-cyan-500/10 bg-cyan-500/5 hover:bg-cyan-500/20 hover:border-cyan-400 transition-all rounded-xl text-left group flex items-center justify-between"
                  >
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black uppercase text-cyan-300 group-hover:text-cyan-400">{action.label}</span>
                      <span className="text-[8px] opacity-30 group-hover:opacity-60">OFFLINE_EXEC</span>
                    </div>
                    <span className="text-xl group-hover:scale-125 transition-transform">{action.icon}</span>
                  </button>
                ))}
             </div>
             <div className="mt-auto pt-6 border-t border-cyan-500/10 text-[8px] opacity-20 text-center tracking-widest uppercase">
               intelligence is local
             </div>
           </div>
        </div>
      </div>

      {/* Mobile Control Deck */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 p-4 bg-slate-900/95 backdrop-blur-3xl border-t-2 border-cyan-500/20 flex flex-col gap-3 z-[100] shadow-[0_-20px_50px_rgba(0,0,0,0.5)]">
        
        {showProtocols && (
          <div className="absolute bottom-full left-4 right-4 mb-4 grid grid-cols-2 gap-3 animate-slide-up origin-bottom">
            {QUICK_ACTIONS.map(action => (
              <button
                key={action.label}
                onClick={() => handleSendMessage(action.cmd)}
                className="p-4 border-2 border-cyan-500/30 bg-slate-900/90 text-left rounded-xl flex items-center justify-between shadow-2xl"
              >
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-cyan-400 uppercase">{action.label}</span>
                  <span className="text-[7px] opacity-40 uppercase">SECURE_RUN</span>
                </div>
                <span className="text-lg">{action.icon}</span>
              </button>
            ))}
          </div>
        )}

        <div className="flex gap-2 h-14">
          <button 
            onClick={toggleListening}
            className={`flex-grow rounded-xl border-2 font-black text-xs tracking-widest transition-all flex items-center justify-center gap-2 ${isListening ? 'bg-red-500 border-red-400 text-white animate-pulse' : 'bg-slate-800 border-cyan-500/30 text-cyan-400'}`}
          >
            {isListening ? '🔴 LISTENING' : '🎙️ VOICE'}
          </button>
          
          <button 
            onClick={() => { setShowProtocols(!showProtocols); setShowKeyboard(false); }}
            className={`flex-grow rounded-xl border-2 font-black text-xs tracking-widest transition-all flex items-center justify-center gap-2 ${showProtocols ? 'bg-cyan-500 border-cyan-300 text-slate-950' : 'bg-slate-800 border-cyan-500/30 text-cyan-400'}`}
          >
            📂 PROTOCOLS
          </button>

          <button 
            onClick={() => { setShowKeyboard(!showKeyboard); setShowProtocols(false); }}
            className={`w-14 h-14 rounded-xl border-2 font-black text-xl transition-all flex items-center justify-center ${showKeyboard ? 'bg-cyan-500 border-cyan-300 text-slate-950' : 'bg-slate-800 border-cyan-500/30 text-cyan-400'}`}
          >
            ⌨️
          </button>
        </div>
        
        {showKeyboard && (
          <div className="mt-2 animate-slide-up origin-bottom">
            <VirtualKeyboard 
              onKeyPress={(k) => setInputValue(v => v + k)} 
              onBackspace={() => setInputValue(v => v.slice(0, -1))} 
              onEnter={handleSendMessage} 
            />
          </div>
        )}
      </div>
      
      <style>{`
        @keyframes slide-up { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        .animate-slide-up { animation: slide-up 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
        .mono-font { font-family: 'JetBrains Mono', monospace; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default App;
