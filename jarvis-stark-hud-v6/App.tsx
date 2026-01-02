
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
      text: 'Local Core Online. All STARK HUD modules synchronized for PC Desktop interface. Awaiting command, Sir.',
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
  const [stats, setStats] = useState<SystemStats>({
    cpu: 12,
    memory: 45,
    network: 1.2,
    aiLoad: 5
  });

  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[event.results.length - 1][0].transcript.trim().toLowerCase();
        
        if (!isListening && (transcript === 'jarvis' || transcript.startsWith('jarvis'))) {
          const command = transcript.replace('jarvis', '').trim();
          if (command) {
            handleSendMessage(command);
          } else {
            startListeningAction();
          }
          return;
        }

        if (isListening) {
          handleSendMessage(transcript);
          stopListeningAction();
        }
      };

      recognitionRef.current.onend = () => {
        if (!isLoading) {
          try { recognitionRef.current.start(); } catch(e) {}
        }
      };

      try { recognitionRef.current.start(); } catch(e) {}
    }

    return () => {
      if (recognitionRef.current) recognitionRef.current.stop();
    };
  }, [isLoading, isListening]);

  const startListeningAction = () => {
    setIsListening(true);
    setMessages(prev => [...prev, {
      id: `act-${Date.now()}`,
      role: MessageRole.SYSTEM,
      text: '*** VOICE INTERFACE INITIALIZED: STARK_REC_v2 ***',
      timestamp: Date.now(),
    }]);
    getJarvisVoice("Listening, Sir.");
  };

  const stopListeningAction = () => setIsListening(false);

  const handleKeyPress = useCallback((key: string) => {
    setInputValue(prev => prev + key);
  }, []);

  const handleBackspace = useCallback(() => {
    setInputValue(prev => prev.slice(0, -1));
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setStats(prev => ({
        cpu: Math.min(100, Math.max(5, prev.cpu + (Math.random() - 0.5) * 5)),
        memory: Math.min(100, Math.max(30, prev.memory + (Math.random() - 0.5) * 2)),
        network: Math.max(0.1, prev.network + (Math.random() - 0.5) * 0.5),
        aiLoad: Math.min(100, Math.max(2, prev.aiLoad + (Math.random() - 0.5) * 3))
      }));
    }, 1500);
    return () => clearInterval(interval);
  }, []);

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
    setPendingUrl(null); 

    try {
      const result = await getJarvisResponse(messageText, []);
      
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: MessageRole.JARVIS,
        text: result.text,
        timestamp: Date.now(),
      }]);

      if (result.url) {
        setPendingUrl(result.url);
      } else if (result.intent === 'OPEN_MEASURING_TOOL') {
        setIsWorkbenchOpen(true);
      }

      setIsLoading(false);
      setLoadingStep('IDLE');

      setIsSpeaking(true);
      await getJarvisVoice(result.text);
      setIsSpeaking(false);

    } catch (error) {
      setIsLoading(false);
      setLoadingStep('ERROR');
    }
  }, [inputValue, isLoading]);

  const handleQuickAction = (cmd: string) => setInputValue(cmd.toUpperCase());
  const handleOpenPendingUrl = () => {
    if (pendingUrl) {
      window.open(pendingUrl, '_blank');
      setPendingUrl(null);
    }
  };

  return (
    <div className="h-screen w-screen p-6 flex flex-col gap-6 relative overflow-hidden text-cyan-400">
      
      {isWorkbenchOpen && <MeasuringWorkbench onClose={() => setIsWorkbenchOpen(false)} />}

      {/* Header Bar */}
      <div className="flex justify-between items-center z-10 hud-border px-6 py-3 rounded-xl bg-slate-900/80">
        <div className="flex items-center gap-6">
          <div className="flex flex-col">
            <h1 className="text-2xl font-black tracking-tighter glow-text italic leading-none">STARK_HUD_X1</h1>
            <span className="text-[10px] tracking-[0.6em] opacity-40 uppercase">Desktop Virtualization Active</span>
          </div>
          <div className="h-8 w-[1px] bg-cyan-500/20"></div>
          <div className="flex gap-4 text-[11px] font-bold">
            <div className="flex flex-col">
              <span className="opacity-30 text-[8px]">CONNECTION</span>
              <span className="text-green-400">ENCRYPTED_LINK_08</span>
            </div>
            <div className="flex flex-col">
              <span className="opacity-30 text-[8px]">MODE</span>
              <span className="text-cyan-400">INDEPENDENT</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-8">
          <div className="text-right">
            <div className="text-2xl font-bold tracking-widest mono-font">{new Date().toLocaleTimeString()}</div>
            <div className="text-[10px] opacity-40 uppercase tracking-widest">{new Date().toDateString()}</div>
          </div>
          <div className="w-12 h-12 rounded-full border border-cyan-500/30 flex items-center justify-center bg-cyan-500/5">
             <div className="w-8 h-8 rounded-full border-t-2 border-cyan-400 animate-spin"></div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-grow flex gap-6 z-10 overflow-hidden">
        
        {/* Left Panel: Vitals & Core */}
        <div className="w-80 flex flex-col gap-6 h-full flex-shrink-0">
          <div className="hud-border rounded-xl p-6 flex flex-col items-center bg-slate-900/60 flex-shrink-0 relative overflow-hidden">
            <h2 className="text-[10px] uppercase tracking-[0.4em] mb-6 opacity-60">Neural Core Alpha</h2>
            
            <div className="relative group">
              <Visualizer />
              {pendingUrl && (
                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center backdrop-blur-md bg-slate-950/60 rounded-full border border-cyan-400/50 p-2 animate-[pulse_2s_infinite]">
                  <p className="text-[8px] font-black uppercase tracking-[0.3em] text-white mb-2 shadow-black text-center">Protocol<br/>Override</p>
                  <button 
                    onClick={handleOpenPendingUrl}
                    className="w-28 h-28 rounded-full bg-cyan-500 text-black font-black uppercase text-[10px] flex items-center justify-center text-center leading-tight tracking-tighter hover:bg-white hover:text-cyan-600 transition-all shadow-[0_0_40px_rgba(34,211,238,0.9)] active:scale-90 border-4 border-white/20"
                  >
                    DEPLOY<br/>LINK
                  </button>
                  <p className="text-[7px] opacity-60 mt-2 font-bold text-cyan-300">USER_GESTURE_REQ</p>
                </div>
              )}
            </div>

            <button 
              onClick={() => isListening ? stopListeningAction() : startListeningAction()}
              className={`mt-6 p-5 rounded-full border-2 transition-all duration-300 ${
                isListening 
                  ? 'bg-cyan-500/20 border-cyan-400 shadow-[0_0_30px_rgba(34,211,238,0.4)] animate-pulse' 
                  : 'bg-black/40 border-cyan-500/30 hover:border-cyan-400'
              }`}
            >
              <svg className={`w-8 h-8 ${isListening ? 'text-cyan-300' : 'text-cyan-500/50'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-20a3 3 0 00-3 3v8a3 3 0 006 0V5a3 3 0 00-3-3z"></path>
              </svg>
            </button>
            <div className="mt-4 text-[9px] uppercase tracking-widest font-bold opacity-40">
              {isListening ? 'Awaiting Audio Stream' : 'Voice Input Standby'}
            </div>
          </div>

          <div className="hud-border rounded-xl p-6 flex-grow flex flex-col gap-6 overflow-y-auto custom-scrollbar bg-slate-900/60">
            <h2 className="text-[10px] uppercase tracking-[0.4em] opacity-60 border-b border-cyan-500/10 pb-2">System Telemetry</h2>
            {[
              { label: 'Neural Throughput', value: stats.cpu, color: 'bg-cyan-500' },
              { label: 'Voice Processor', value: isListening || isSpeaking ? 92 : 0, color: 'bg-blue-500' },
              { label: 'Memory Buffer', value: stats.memory, color: 'bg-purple-500' },
              { label: 'Grid Stability', value: stats.aiLoad, color: 'bg-emerald-500' }
            ].map(item => (
              <div key={item.label} className="space-y-2">
                <div className="flex justify-between text-[10px] uppercase tracking-wider font-bold">
                  <span>{item.label}</span>
                  <span className="mono-font">{Math.round(item.value)}%</span>
                </div>
                <div className="w-full h-1.5 bg-black/40 rounded-full overflow-hidden border border-cyan-500/5">
                  <div className={`h-full ${item.color} shadow-[0_0_10px_currentColor] transition-all duration-700`} style={{ width: `${item.value}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Center Panel: Primary Terminal */}
        <div className="flex-grow flex flex-col h-full overflow-hidden">
          <Terminal 
            messages={messages}
            inputValue={inputValue}
            setInputValue={setInputValue}
            onSubmit={() => handleSendMessage()}
            isLoading={isLoading}
            loadingStep={loadingStep}
            groundingSources={{}}
          />
        </div>

        {/* Right Panel: Controls & Tech */}
        <div className="w-96 flex flex-col gap-6 h-full flex-shrink-0">
          <div className="hud-border p-6 rounded-xl flex flex-col gap-4 bg-slate-900/60">
             <div className="text-[10px] uppercase opacity-60 tracking-[0.4em] border-b border-cyan-500/10 pb-2">Command Palette</div>
             <div className="grid grid-cols-2 gap-3">
               {[
                 { label: 'IMAGE_SCAN', cmd: 'show photo of Tony Stark', icon: '📷' },
                 { label: 'CALIBRATION', cmd: 'open measuring tool', icon: '📐' },
                 { label: 'MEDIA_STREAM', cmd: 'open youtube', icon: '📺' },
                 { label: 'DATA_NET', cmd: 'search latest science news', icon: '🌐' },
                 { label: 'CORE_SYNC', cmd: 'hi jarvis', icon: '🤖' },
                 { label: 'SYSTEM_ID', cmd: 'who are you', icon: '🆔' }
               ].map(btn => (
                 <button 
                   key={btn.label}
                   onClick={() => handleQuickAction(btn.cmd)}
                   className="text-[9px] text-left border border-cyan-500/20 p-3 bg-cyan-500/5 hover:bg-cyan-500/20 transition-all rounded-lg uppercase font-black flex items-center gap-2 group"
                 >
                   <span className="opacity-40 group-hover:opacity-100 transition-opacity">{btn.icon}</span>
                   <span>{btn.label}</span>
                 </button>
               ))}
             </div>
          </div>

          <div className="flex-grow flex flex-col justify-end">
            <VirtualKeyboard 
              onKeyPress={handleKeyPress}
              onBackspace={handleBackspace}
              onEnter={() => handleSendMessage()}
            />
          </div>
        </div>
      </div>

      {/* Footer System Line */}
      <div className="z-10 flex justify-between items-center px-4 py-2 border-t border-cyan-500/10 text-[10px] font-bold opacity-40 uppercase tracking-[0.6em]">
        <div className="flex gap-10">
          <span>STARK_INDUSTRIES_GLOBAL_NETWORK</span>
          <span>LOCATION: ENCRYPTED_PROXY_NODE</span>
        </div>
        <div className="flex gap-6">
          <span className="text-cyan-400">FPS: 60.0</span>
          <span>STATUS: ALL_SYSTEMS_GO</span>
        </div>
      </div>
    </div>
  );
};

export default App;
