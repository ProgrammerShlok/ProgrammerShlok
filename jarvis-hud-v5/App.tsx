
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
      text: 'Local Core Online. Say "Jarvis" or tap the microphone to engage. All STARK systems independent and secure.',
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
    cpu: 8,
    memory: 32,
    network: 0.1,
    aiLoad: 2
  });

  const recognitionRef = useRef<any>(null);

  // Initialize Speech Recognition
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

      recognitionRef.current.onerror = (event: any) => {
        setIsListening(false);
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
    const activationMsg: ChatMessage = {
      id: `act-${Date.now()}`,
      role: MessageRole.SYSTEM,
      text: '--- VOICE INTERFACE ACTIVATED: AWAITING INPUT ---',
      timestamp: Date.now(),
    };
    setMessages(prev => [...prev, activationMsg]);
    getJarvisVoice("I am listening, Sir.");
  };

  const stopListeningAction = () => {
    setIsListening(false);
  };

  // Dynamic stats simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setStats(prev => ({
        cpu: Math.min(100, Math.max(0, prev.cpu + (Math.random() - 0.5) * 3)),
        memory: Math.min(100, Math.max(0, prev.memory + (Math.random() - 0.5) * 1)),
        network: Math.max(0, prev.network + (Math.random() - 0.5) * 0.05),
        aiLoad: Math.min(100, Math.max(0, prev.aiLoad + (Math.random() - 0.5) * 2))
      }));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleSendMessage = useCallback(async (textOverride?: string) => {
    const messageText = textOverride || inputValue;
    if (!messageText.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: MessageRole.USER,
      text: messageText,
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsLoading(true);
    setLoadingStep('LOCAL_PROCESSING');
    setPendingUrl(null); // Clear previous pending URLs

    try {
      const result = await getJarvisResponse(messageText, []);
      setLoadingStep('EXECUTING_LOGIC');
      
      const jarvisMsg: ChatMessage = {
        id: Date.now().toString(),
        role: MessageRole.JARVIS,
        text: result.text,
        timestamp: Date.now(),
      };
      
      setMessages(prev => [...prev, jarvisMsg]);

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
      console.error(error);
      setIsLoading(false);
      setLoadingStep('ERROR');
    }
  }, [inputValue, isLoading]);

  const handleQuickAction = (cmd: string) => {
    setInputValue(cmd.toUpperCase());
  };

  const handleOpenPendingUrl = () => {
    if (pendingUrl) {
      window.open(pendingUrl, '_blank');
      setPendingUrl(null);
    }
  };

  const handleKeyPress = (key: string) => setInputValue(prev => prev + key);
  const handleBackspace = () => setInputValue(prev => prev.slice(0, -1));

  return (
    <div className="h-screen w-screen p-4 md:p-8 flex flex-col gap-6 relative overflow-hidden text-cyan-400">
      
      {isWorkbenchOpen && (
        <MeasuringWorkbench onClose={() => setIsWorkbenchOpen(false)} />
      )}

      {/* Background Grid */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
         <div className="absolute top-1/2 left-0 w-full h-[1px] bg-cyan-500 shadow-[0_0_15px_cyan]"></div>
         <div className="absolute top-0 left-1/2 w-[1px] h-full bg-cyan-500 shadow-[0_0_15px_cyan]"></div>
         <div className="absolute top-[10%] left-0 w-full ruler-x"></div>
         <div className="absolute bottom-[10%] left-0 w-full ruler-x"></div>
      </div>

      <div className="flex justify-between items-start z-10">
        <div className="flex flex-col">
          <h1 className="text-2xl font-black tracking-tighter glow-text italic">STARK HUD v.5.9 [PERMISSION_LINK]</h1>
          <div className="flex gap-4 text-[10px] font-bold tracking-widest opacity-60">
            <span>CORE: INDEPENDENT</span>
            <span className={isSpeaking ? 'text-green-400 animate-pulse' : ''}>VOICE: {isSpeaking ? 'ACTIVE' : 'IDLE'}</span>
            <span className={isListening ? 'text-cyan-400 animate-pulse' : ''}>MIC: {isListening ? 'LISTENING' : 'READY'}</span>
          </div>
        </div>
        <div className="text-right flex flex-col items-end">
          <div className="text-xl font-bold tracking-widest">{new Date().toLocaleTimeString()}</div>
          <div className="text-[10px] opacity-60 uppercase">{new Date().toDateString()}</div>
        </div>
      </div>

      <div className="flex-grow flex flex-col lg:flex-row gap-6 z-10 overflow-hidden">
        
        <div className="w-full lg:w-1/4 flex flex-col gap-6 h-full overflow-hidden">
          <div className={`hud-border rounded-xl p-4 flex flex-col items-center transition-all duration-500 ${isSpeaking || isListening ? 'border-cyan-400 shadow-[0_0_30px_rgba(34,211,238,0.4)]' : ''}`}>
            <h2 className="text-xs uppercase tracking-[0.3em] mb-4 opacity-70 text-center">Neural Reactor</h2>
            <Visualizer />
            
            <button 
              onClick={() => isListening ? stopListeningAction() : startListeningAction()}
              className={`mt-4 p-4 rounded-full border-2 transition-all duration-300 relative group ${
                isListening 
                  ? 'bg-cyan-500/20 border-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.6)] animate-pulse' 
                  : 'bg-black/40 border-cyan-500/30 hover:border-cyan-400 hover:bg-cyan-500/10'
              }`}
            >
              <svg className={`w-6 h-6 ${isListening ? 'text-cyan-300' : 'text-cyan-500/50'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-20a3 3 0 00-3 3v8a3 3 0 006 0V5a3 3 0 00-3-3z"></path>
              </svg>
            </button>

            {isSpeaking && <div className="mt-6 text-[10px] text-green-400 font-bold animate-pulse tracking-widest uppercase">Synthesizing</div>}
            {isListening && <div className="mt-2 text-[10px] text-cyan-300 font-bold animate-pulse tracking-widest uppercase">Listening...</div>}
          </div>

          <div className="hud-border rounded-xl p-4 flex-grow space-y-4 overflow-y-auto custom-scrollbar">
            <h2 className="text-xs uppercase tracking-[0.3em] opacity-70 mb-2 border-b border-cyan-500/20 pb-1">System Health</h2>
            {[
              { label: 'Neural Link', value: stats.cpu, color: 'bg-cyan-500' },
              { label: 'Voice Response', value: isListening || isSpeaking ? 85 : 12, color: 'bg-blue-500' },
              { label: 'Neural Buffer', value: stats.aiLoad, color: 'bg-purple-500' }
            ].map(item => (
              <div key={item.label} className="space-y-1">
                <div className="flex justify-between text-[10px] uppercase tracking-wider">
                  <span>{item.label}</span>
                  <span>{Math.round(item.value)}%</span>
                </div>
                <div className="w-full h-1 bg-cyan-950 rounded-full overflow-hidden border border-cyan-500/10">
                  <div className={`h-full ${item.color} shadow-[0_0_8px_currentColor] transition-all duration-500`} style={{ width: `${item.value}%` }}></div>
                </div>
              </div>
            ))}

            {/* Permission Button for Voice Browser Opening */}
            {pendingUrl && (
              <div className="mt-6 p-4 border border-cyan-400 bg-cyan-400/10 rounded-lg animate-pulse shadow-[0_0_20px_rgba(34,211,238,0.3)]">
                <p className="text-[10px] uppercase font-bold text-center mb-3">Browser Result Ready</p>
                <button 
                  onClick={handleOpenPendingUrl}
                  className="w-full py-3 bg-cyan-500 text-black font-black uppercase text-xs tracking-tighter hover:bg-white transition-colors flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  ENGAGE_EXTERNAL_NODE
                </button>
                <p className="text-[8px] opacity-50 italic text-center mt-2">Manual authentication required to open browser</p>
              </div>
            )}
          </div>
        </div>

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

        <div className="w-full lg:w-1/3 flex flex-col gap-6 justify-end">
          <div className="hud-border p-4 rounded-xl flex flex-col gap-2 bg-cyan-950/10">
             <div className="text-[10px] uppercase opacity-60 tracking-widest mb-2 border-b border-cyan-500/10 pb-1">Quick Launch CMD</div>
             <div className="grid grid-cols-2 gap-2">
               <button onClick={() => handleQuickAction('show photo of Tony Stark')} className="text-[10px] text-left border border-cyan-500/40 p-2 bg-cyan-500/10 hover:bg-cyan-500/30 transition rounded uppercase font-bold text-white shadow-lg">IMAGE_SCAN</button>
               <button onClick={() => handleQuickAction('open measuring tool')} className="text-[10px] text-left border border-cyan-500/20 p-2 hover:bg-cyan-500/10 transition rounded uppercase font-bold">CALIBRATION</button>
               <button onClick={() => handleQuickAction('open youtube')} className="text-[10px] text-left border border-cyan-500/20 p-2 hover:bg-cyan-500/10 transition rounded uppercase font-bold">STARK_NET</button>
               <button onClick={() => handleQuickAction('search news')} className="text-[10px] text-left border border-cyan-500/20 p-2 hover:bg-cyan-500/10 transition rounded uppercase font-bold">DATA_SEARCH</button>
             </div>
          </div>
          
          <VirtualKeyboard 
            onKeyPress={handleKeyPress}
            onBackspace={handleBackspace}
            onEnter={() => handleSendMessage()}
          />
        </div>
      </div>

      <div className="z-10 flex justify-between items-center text-[9px] font-bold opacity-30 uppercase tracking-[0.5em]">
        <span>Stark Industries // Secure Link Ready</span>
        <span>Hybrid Neural Core Active</span>
      </div>
    </div>
  );
};

export default App;
