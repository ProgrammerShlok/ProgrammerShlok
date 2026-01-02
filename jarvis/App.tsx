
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ChatMessage, MessageRole, SystemStats } from './types';
import { getJarvisResponse, getJarvisVoice } from './services/jarvisService';
import Visualizer from './components/Visualizer';
import VirtualKeyboard from './components/VirtualKeyboard';
import Terminal from './components/Terminal';
import MeasuringWorkbench from './components/MeasuringWorkbench';

// Audio decoding utilities
function decodeBase64(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

const App: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init-1',
      role: MessageRole.JARVIS,
      text: 'Good morning, Sir. All systems are operational. Workbench is ready for measurement.',
      timestamp: Date.now(),
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState('IDLE');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isWorkbenchOpen, setIsWorkbenchOpen] = useState(false);
  const [stats, setStats] = useState<SystemStats>({
    cpu: 12,
    memory: 45,
    network: 1.2,
    aiLoad: 5
  });

  const audioContextRef = useRef<AudioContext | null>(null);

  const playVoice = async (base64Audio: string) => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      }
      
      const ctx = audioContextRef.current;
      if (ctx.state === 'suspended') {
        await ctx.resume();
      }

      setIsSpeaking(true);
      const audioBytes = decodeBase64(base64Audio);
      const audioBuffer = await decodeAudioData(audioBytes, ctx, 24000, 1);
      
      const source = ctx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(ctx.destination);
      source.onended = () => setIsSpeaking(false);
      source.start();
    } catch (err) {
      console.error("Playback error:", err);
      setIsSpeaking(false);
    }
  };

  // Simulate dynamic stats
  useEffect(() => {
    const interval = setInterval(() => {
      setStats(prev => ({
        cpu: Math.min(100, Math.max(0, prev.cpu + (Math.random() - 0.5) * 5)),
        memory: Math.min(100, Math.max(0, prev.memory + (Math.random() - 0.5) * 2)),
        network: Math.max(0, prev.network + (Math.random() - 0.5) * 0.1),
        aiLoad: Math.min(100, Math.max(0, prev.aiLoad + (Math.random() - 0.5) * 3))
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
    setLoadingStep('QUERY_PARSING');

    try {
      const history = messages.map(m => ({
        role: m.role === MessageRole.USER ? 'user' : 'model',
        parts: [{ text: m.text }]
      }));

      setLoadingStep('NEURAL_SYNTHESIS');
      const result = await getJarvisResponse(userMsg.text, history);
      let responseText = '';
      
      // Handle tool calls
      if (result.functionCalls && result.functionCalls.length > 0) {
        setLoadingStep('EXECUTING_PROTOCOL');
        for (const fc of result.functionCalls) {
          if (fc.name === 'open_website') {
            const url = (fc.args as any).url;
            const fullUrl = url.startsWith('http') ? url : `https://${url}`;
            window.open(fullUrl, '_blank');
            responseText = `As you wish, Sir. Executing browser launch for ${url}.`;
          } else if (fc.name === 'open_measuring_tool') {
            setIsWorkbenchOpen(true);
            responseText = "Initializing measuring station and pen-input interface. Calibrating holographic grid now.";
          }
        }
      } else {
        responseText = result.text || 'I apologize, Sir. My cognitive processors encountered a momentary lapse.';
      }

      const jarvisMsg: ChatMessage = {
        id: Date.now().toString(),
        role: MessageRole.JARVIS,
        text: responseText,
        timestamp: Date.now(),
      };
      
      setMessages(prev => [...prev, jarvisMsg]);
      setIsLoading(false);
      setLoadingStep('IDLE');

      // Voice generation
      setLoadingStep('VOCAL_ENCODING');
      const base64Audio = await getJarvisVoice(responseText);
      if (base64Audio) {
        await playVoice(base64Audio);
      }
      setLoadingStep('IDLE');

    } catch (error) {
      console.error(error);
      const errorMsg: ChatMessage = {
        id: Date.now().toString(),
        role: MessageRole.SYSTEM,
        text: 'ERROR: NETWORK_LINK_FAILURE. JARVIS OFFLINE.',
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, errorMsg]);
      setIsLoading(false);
      setLoadingStep('RECOVERY_MODE');
    }
  }, [inputValue, isLoading, messages]);

  const handleKeyPress = (key: string) => setInputValue(prev => prev + key);
  const handleBackspace = () => setInputValue(prev => prev.slice(0, -1));

  return (
    <div className="h-screen w-screen p-4 md:p-8 flex flex-col gap-6 relative overflow-hidden text-cyan-400">
      
      {/* Measuring Tool Overlay */}
      {isWorkbenchOpen && (
        <MeasuringWorkbench onClose={() => setIsWorkbenchOpen(false)} />
      )}

      {/* Background Workbench Measuring Lines */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
         <div className="absolute top-1/2 left-0 w-full h-[1px] bg-cyan-500 shadow-[0_0_15px_cyan]"></div>
         <div className="absolute top-0 left-1/2 w-[1px] h-full bg-cyan-500 shadow-[0_0_15px_cyan]"></div>
         <div className="absolute top-[10%] left-0 w-full ruler-x"></div>
         <div className="absolute bottom-[10%] left-0 w-full ruler-x"></div>
         <div className="absolute top-[51%] left-2 text-[9px] font-bold">X: 0.00</div>
         <div className="absolute top-2 left-[51%] text-[9px] font-bold">Y: 0.00</div>
      </div>

      <div className="flex justify-between items-start z-10">
        <div className="flex flex-col">
          <h1 className="text-2xl font-black tracking-tighter glow-text italic">STARK HUD v.4.5</h1>
          <div className="flex gap-4 text-[10px] font-bold tracking-widest opacity-60">
            <span>SECURE_LINK: ACTIVE</span>
            <span className={isSpeaking ? 'text-green-400 animate-pulse' : ''}>VOICE_LINK: {isSpeaking ? 'TRANSMITTING' : 'IDLE'}</span>
            <span className="text-yellow-500">MODE: WORKBENCH_READY</span>
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
            <div className={isSpeaking ? 'scale-110 transition-transform duration-300' : ''}>
              <Visualizer />
            </div>
            {isSpeaking && (
               <div className="mt-2 text-[10px] text-green-400 font-bold animate-pulse tracking-widest">TRANSMITTING VOCAL DATA...</div>
            )}
          </div>

          <div className="hud-border rounded-xl p-4 flex-grow space-y-4">
            <h2 className="text-xs uppercase tracking-[0.3em] opacity-70 mb-2 border-b border-cyan-500/20 pb-1">System Diagnostics</h2>
            {[
              { label: 'CPU Load', value: stats.cpu, color: 'bg-cyan-500' },
              { label: 'Neural Buffer', value: stats.memory, color: 'bg-blue-500' },
              { label: 'Voice Processor', value: isSpeaking ? 92 : stats.aiLoad, color: 'bg-purple-500' }
            ].map(item => (
              <div key={item.label} className="space-y-1">
                <div className="flex justify-between text-[10px] uppercase tracking-wider">
                  <span>{item.label}</span>
                  <span>{Math.round(item.value)}%</span>
                </div>
                <div className="w-full h-1 bg-cyan-950 rounded-full overflow-hidden border border-cyan-500/10">
                  <div 
                    className={`h-full ${item.color} shadow-[0_0_8px_currentColor] transition-all duration-500`}
                    style={{ width: `${item.value}%` }}
                  ></div>
                </div>
              </div>
            ))}
            <div className="pt-4 mt-4 border-t border-cyan-500/10 flex flex-col gap-1">
               <div className="text-[9px] uppercase opacity-40">Active Tasks</div>
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
          />
        </div>

        <div className="w-full lg:w-1/3 flex flex-col gap-6 justify-end">
          <div className="hud-border p-4 rounded-xl flex flex-col gap-2 bg-cyan-950/10">
             <div className="text-[10px] uppercase opacity-60 tracking-widest mb-2 border-b border-cyan-500/10 pb-1">Quick Macros</div>
             <div className="grid grid-cols-2 gap-2">
               <button onClick={() => setInputValue('OPEN MEASURING TOOL')} className="text-[10px] text-left border border-cyan-500/40 p-2 bg-cyan-500/10 hover:bg-cyan-500/30 transition rounded uppercase font-black text-white shadow-lg">START MEASURING</button>
               <button onClick={() => setInputValue('OPEN YOUTUBE')} className="text-[10px] text-left border border-cyan-500/20 p-2 hover:bg-cyan-500/10 transition rounded uppercase font-bold">Launch YouTube</button>
               <button onClick={() => setInputValue('SYNC CLOCK')} className="text-[10px] text-left border border-cyan-500/20 p-2 hover:bg-cyan-500/10 transition rounded uppercase font-bold">Sync Clock</button>
               <button onClick={() => setInputValue('RUN DIAGNOSTIC')} className="text-[10px] text-left border border-cyan-500/20 p-2 hover:bg-cyan-500/10 transition rounded uppercase font-bold">Run Diagnostic</button>
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
        <span>Stark Industries // Workbench UI Overlay</span>
        <span>Build Rev: 2025.05.02-X</span>
      </div>
    </div>
  );
};

export default App;
