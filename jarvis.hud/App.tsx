
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
      text: 'Local Core Online. All STARK systems independent and secure. Waiting for your command, Sir.',
      timestamp: Date.now(),
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState('IDLE');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isWorkbenchOpen, setIsWorkbenchOpen] = useState(false);
  const [stats, setStats] = useState<SystemStats>({
    cpu: 8,
    memory: 32,
    network: 0.1,
    aiLoad: 2
  });

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

  const handleSendMessage = useCallback(async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: MessageRole.USER,
      text: inputValue,
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsLoading(true);
    setLoadingStep('LOCAL_PROCESSING');

    try {
      // Logic Processing
      const result = await getJarvisResponse(userMsg.text, []);
      
      setLoadingStep('EXECUTING_LOGIC');
      
      const jarvisMsg: ChatMessage = {
        id: Date.now().toString(),
        role: MessageRole.JARVIS,
        text: result.text,
        timestamp: Date.now(),
      };
      
      setMessages(prev => [...prev, jarvisMsg]);

      // Execute Intents
      if (result.intent === 'OPEN_WEBSITE' && result.payload) {
        const url = result.payload.includes('.') ? result.payload : `${result.payload}.com`;
        window.open(`https://${url}`, '_blank');
      } else if (result.intent === 'OPEN_MEASURING_TOOL') {
        setIsWorkbenchOpen(true);
      } else if (result.intent === 'GOOGLE_SEARCH' && result.payload) {
        window.open(`https://www.google.com/search?q=${encodeURIComponent(result.payload)}`, '_blank');
      } else if (result.intent === 'SHOW_PHOTO' && result.payload) {
        setLoadingStep('VISUAL_IDENTIFICATION');
        window.open(`https://www.google.com/search?tbm=isch&q=${encodeURIComponent(result.payload)}`, '_blank');
      }

      setIsLoading(false);
      setLoadingStep('IDLE');

      // Voice Playback (Native)
      setIsSpeaking(true);
      await getJarvisVoice(result.text);
      setIsSpeaking(false);

    } catch (error) {
      console.error(error);
      setIsLoading(false);
      setLoadingStep('ERROR');
    }
  }, [inputValue, isLoading, messages]);

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
          <h1 className="text-2xl font-black tracking-tighter glow-text italic">STARK HUD v.5.0 [LOCAL_CORE]</h1>
          <div className="flex gap-4 text-[10px] font-bold tracking-widest opacity-60">
            <span>CORE: INDEPENDENT</span>
            <span className={isSpeaking ? 'text-green-400 animate-pulse' : ''}>VOICE: {isSpeaking ? 'ACTIVE' : 'IDLE'}</span>
            <span className="text-cyan-400">NET: STANDBY</span>
          </div>
        </div>
        <div className="text-right flex flex-col items-end">
          <div className="text-xl font-bold tracking-widest">{new Date().toLocaleTimeString()}</div>
          <div className="text-[10px] opacity-60 uppercase">{new Date().toDateString()}</div>
        </div>
      </div>

      <div className="flex-grow flex flex-col lg:flex-row gap-6 z-10 overflow-hidden">
        
        <div className="w-full lg:w-1/4 flex flex-col gap-6">
          <div className={`hud-border rounded-xl p-4 flex flex-col items-center transition-all duration-500 ${isSpeaking ? 'border-cyan-400 shadow-[0_0_30px_rgba(34,211,238,0.4)]' : ''}`}>
            <h2 className="text-xs uppercase tracking-[0.3em] mb-4 opacity-70">Core Status</h2>
            <Visualizer />
            {isSpeaking && (
               <div className="mt-2 text-[10px] text-green-400 font-bold animate-pulse tracking-widest uppercase">Synthesizing Voice</div>
            )}
          </div>

          <div className="hud-border rounded-xl p-4 flex-grow space-y-4">
            <h2 className="text-xs uppercase tracking-[0.3em] opacity-70 mb-2 border-b border-cyan-500/20 pb-1">System Load</h2>
            {[
              { label: 'Local Neural', value: stats.cpu, color: 'bg-cyan-500' },
              { label: 'System Cache', value: stats.memory, color: 'bg-blue-500' },
              { label: 'I/O Stream', value: stats.network * 10, color: 'bg-purple-500' }
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
            <div className="pt-4 mt-4 border-t border-cyan-500/10 flex flex-col gap-1">
               <div className="text-[9px] uppercase opacity-40">Process Monitor</div>
               <div className="text-[10px] text-cyan-300 flex items-center gap-2">
                 <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse"></div>
                 {loadingStep}
               </div>
            </div>
          </div>
        </div>

        <div className="flex-grow flex flex-col h-full overflow-hidden">
          <Terminal 
            messages={messages}
            inputValue={inputValue}
            setInputValue={setInputValue}
            onSubmit={handleSendMessage}
            isLoading={isLoading}
            loadingStep={loadingStep}
            groundingSources={{}}
          />
        </div>

        <div className="w-full lg:w-1/3 flex flex-col gap-6 justify-end">
          <div className="hud-border p-4 rounded-xl flex flex-col gap-2 bg-cyan-950/10">
             <div className="text-[10px] uppercase opacity-60 tracking-widest mb-2 border-b border-cyan-500/10 pb-1">Quick Launch</div>
             <div className="grid grid-cols-2 gap-2">
               <button onClick={() => setInputValue('SHOW PHOTO OF TONY STARK')} className="text-[10px] text-left border border-cyan-500/40 p-2 bg-cyan-500/10 hover:bg-cyan-500/30 transition rounded uppercase font-bold text-white shadow-lg">SHOW_PERSON</button>
               <button onClick={() => setInputValue('OPEN MEASURING TOOL')} className="text-[10px] text-left border border-cyan-500/20 p-2 hover:bg-cyan-500/10 transition rounded uppercase font-bold">START_MEASURING</button>
               <button onClick={() => setInputValue('OPEN YOUTUBE')} className="text-[10px] text-left border border-cyan-500/20 p-2 hover:bg-cyan-500/10 transition rounded uppercase font-bold">OPEN_YOUTUBE</button>
               <button onClick={() => setInputValue('SEARCH LATEST TECH')} className="text-[10px] text-left border border-cyan-500/20 p-2 hover:bg-cyan-500/10 transition rounded uppercase font-bold">WEB_SEARCH</button>
             </div>
          </div>
          
          <VirtualKeyboard 
            onKeyPress={handleKeyPress}
            onBackspace={handleBackspace}
            onEnter={handleSendMessage}
          />
        </div>
      </div>

      <div className="z-10 flex justify-between items-center text-[9px] font-bold opacity-30 uppercase tracking-[0.5em]">
        <span>Stark Industries // Local Neural Core</span>
        <span>Independent Mode Active</span>
      </div>
    </div>
  );
};

export default App;
