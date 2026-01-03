
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ChatMessage, MessageRole } from './types';
import { 
  getJarvisResponse, 
  getJarvisVoice, 
  playJarvisSound, 
  unlockAudio 
} from './services/jarvisService';
import Visualizer from './components/Visualizer';
import VirtualKeyboard from './components/VirtualKeyboard';
import Terminal from './components/Terminal';
import MeasuringWorkbench from './components/MeasuringWorkbench';
import PenTool from './components/PenTool';
import ArcLogo from './components/ArcLogo';
import FileManager from './components/FileManager';

const QUICK_ACTIONS = [
  { label: 'YOUTUBE', cmd: 'OPEN YOUTUBE', icon: '📺' },
  { label: 'PLAY_SONG', cmd: 'PLAY ', icon: '🎵' },
  { label: 'SEARCH', cmd: 'SEARCH ', icon: '🌐' },
  { label: 'SHOW_ME', cmd: 'SHOW ME ', icon: '🖼️' },
  { label: 'ARCHIVE', cmd: 'OPEN_ARCHIVE', icon: '📁' },
  { label: 'PEN_TOOL', cmd: 'OPEN PEN', icon: '🖋️' },
  { label: 'MEASURE', cmd: 'OPEN MEASURE', icon: '📐' },
];

type ActiveOverlay = 'pen' | 'measure' | 'archive' | null;

const WorkingStatus: React.FC = () => (
  <div className="hud-border p-4 rounded-xl bg-slate-900/40 flex flex-col gap-2">
    <span className="text-[10px] opacity-40 uppercase tracking-[0.3em] mb-1">System_Working_Log</span>
    <div className="space-y-1.5">
      {[
        { label: 'NEURAL_LINK', status: 'ACTIVE', color: 'text-emerald-400' },
        { label: 'LOGIC_CORE', status: 'LOCAL_OFFLINE', color: 'text-cyan-400' },
        { label: 'VOICE_ENGINE', status: 'SYNTH_FEMALE', color: 'text-emerald-400' },
        { label: 'ENCRYPTION', status: 'AES_256', color: 'text-cyan-400' },
        { label: 'PRECISION', status: '99.98%', color: 'text-emerald-400' },
      ].map((item, i) => (
        <div key={i} className="flex justify-between items-center text-[8px] tracking-widest uppercase border-b border-cyan-500/5 pb-1">
          <span className="opacity-60">{item.label}</span>
          <span className={`${item.color} font-black`}>{item.status}</span>
        </div>
      ))}
    </div>
  </div>
);

const App: React.FC = () => {
  const [hasStarted, setHasStarted] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [activeOverlay, setActiveOverlay] = useState<ActiveOverlay>(null);
  const [pendingUrl, setPendingUrl] = useState<string | null>(null);
  const [showKeyboard, setShowKeyboard] = useState(false);
  const [selectedItemData, setSelectedItemData] = useState<any>(null);
  const [savedItems, setSavedItems] = useState<any[]>(() => {
    const saved = localStorage.getItem('jarvis_archive');
    return saved ? JSON.parse(saved) : [];
  });
  
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    localStorage.setItem('jarvis_archive', JSON.stringify(savedItems));
  }, [savedItems]);

  const handleSaveToArchive = (item: any) => {
    setSavedItems(prev => [item, ...prev]);
    playJarvisSound('deploy');
  };

  const handleOpenFromArchive = (item: any) => {
    unlockAudio();
    setSelectedItemData(item);
    setActiveOverlay(item.type === 'measurement' ? 'measure' : 'pen');
  };

  const handleSendMessage = useCallback(async (textOverride?: string) => {
    const text = (textOverride || inputValue).trim();
    if (!text || isLoading) return;

    // Mobile gesture unlock
    await unlockAudio();

    if (text === 'OPEN_ARCHIVE') {
      setActiveOverlay('archive');
      setInputValue('');
      return;
    }

    setMessages(prev => [...prev, { id: Date.now().toString(), role: MessageRole.USER, text, timestamp: Date.now() }]);
    setInputValue('');
    setIsLoading(true);
    playJarvisSound();

    const result = await getJarvisResponse(text);
    setMessages(prev => [...prev, { id: 'jarvis-'+Date.now(), role: MessageRole.JARVIS, text: result.text, timestamp: Date.now() }]);
    setIsLoading(false);

    if (result.intent === 'OPEN_PEN') {
      setSelectedItemData(null);
      setActiveOverlay('pen');
    } else if (result.intent === 'OPEN_MEASURE') {
      setSelectedItemData(null);
      setActiveOverlay('measure');
    }
    
    if (result.url) setPendingUrl(result.url);

    setIsSpeaking(true);
    await getJarvisVoice(result.text);
    setIsSpeaking(false);
  }, [inputValue, isLoading]);

  const startSystem = async () => {
    await unlockAudio();
    setHasStarted(true);
    playJarvisSound('boot');
    const welcome = "Stark Tactical Interface initialized. Local systems reporting nominal. How can I help, Sir?";
    setMessages([{ id: 'init', role: MessageRole.JARVIS, text: welcome, timestamp: Date.now() }]);
    
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.onresult = (e: any) => {
        handleSendMessage(e.results[0][0].transcript);
        setIsListening(false);
      };
      recognitionRef.current.onerror = () => setIsListening(false);
    }
    
    setIsSpeaking(true);
    await getJarvisVoice(welcome);
    setIsSpeaking(false);
  };

  const toggleListening = () => {
    unlockAudio();
    if (isListening) {
      setIsListening(false);
      recognitionRef.current?.stop();
    } else {
      setIsListening(true);
      playJarvisSound();
      try { recognitionRef.current?.start(); } catch (e) {}
    }
  };

  const handleKeyboardToggle = () => {
    unlockAudio();
    setShowKeyboard(!showKeyboard);
  };

  const handleVirtualKeyPress = (k: string) => {
    unlockAudio();
    setInputValue(v => v + k);
  };

  const isOverlayActive = activeOverlay !== null;

  return (
    <div className="fixed inset-0 flex flex-col bg-slate-950 text-cyan-400 font-['Orbitron'] overflow-hidden">
      {!hasStarted && (
        <div onClick={startSystem} className="fixed inset-0 z-[200] bg-slate-950 flex flex-col items-center justify-center cursor-pointer p-6">
          <div className="w-32 h-32 border-4 border-cyan-500/40 rounded-full animate-ping mb-12 flex items-center justify-center">
            <span className="text-4xl text-cyan-400">⚡</span>
          </div>
          <h1 className="text-2xl md:text-4xl font-black tracking-widest italic glow-text animate-pulse uppercase">Initialise_Stark_Core</h1>
          <p className="mt-4 text-[10px] opacity-40 uppercase tracking-[0.5em]">Tap to Authorise</p>
        </div>
      )}

      {/* Tools & Archive Overlay Screens */}
      {activeOverlay === 'pen' && (
        <PenTool 
          onClose={() => setActiveOverlay(null)} 
          onSave={handleSaveToArchive} 
          initialImage={selectedItemData?.image} 
        />
      )}
      {activeOverlay === 'measure' && (
        <MeasuringWorkbench 
          onClose={() => setActiveOverlay(null)} 
          onSave={handleSaveToArchive} 
          initialData={selectedItemData}
        />
      )}
      {activeOverlay === 'archive' && (
        <FileManager 
          items={savedItems} 
          onClose={() => setActiveOverlay(null)} 
          onClear={() => setSavedItems([])} 
          onItemClick={handleOpenFromArchive}
        />
      )}

      <div className={`flex flex-col h-full p-2 md:p-4 transition-all duration-700 ${isOverlayActive ? 'blur-3xl scale-95 opacity-50' : 'blur-0 scale-100 opacity-100'}`}>
        {/* Header */}
        <header className="hud-border p-3 md:p-4 mb-3 rounded-xl bg-slate-900/80 flex justify-between items-center z-20">
          <div className="flex items-center gap-4">
            <div className="hidden md:block">
              <ArcLogo active={isLoading || isSpeaking || isListening} size={40} />
            </div>
            <div>
              <h2 className="text-sm md:text-xl font-black italic tracking-widest glow-text uppercase leading-none mb-1">JARVIS</h2>
              <span className="text-[8px] md:text-[10px] text-emerald-400 font-bold uppercase tracking-widest">Local_Enclave_Secure</span>
            </div>
          </div>
          <div className="text-right text-[8px] md:text-xs opacity-50 uppercase tracking-widest leading-none">
            {new Date().toLocaleTimeString()}<br/><span className="hidden sm:inline">OFFLINE_NODES_ACTIVE</span>
          </div>
        </header>

        {/* Content Container */}
        <div className="flex-grow flex flex-col lg:flex-row gap-3 overflow-hidden mb-[180px] md:mb-0 min-h-0">
          
          {/* Visualizer & Working Status (Left Desktop) */}
          <div className="hidden lg:flex flex-col w-72 gap-3">
            <div className="hud-border p-6 rounded-xl bg-slate-900/60 flex flex-col items-center justify-center">
              <span className="text-[10px] opacity-40 uppercase tracking-[0.3em] mb-4">Neural_Visual_Core</span>
              <Visualizer isListening={isListening || isSpeaking} />
            </div>
            <WorkingStatus />
          </div>

          {/* Terminal (Center) */}
          <div className="flex-grow flex flex-col min-h-0 relative hud-border rounded-xl p-4 bg-slate-900/40">
            <Terminal 
              messages={messages} 
              inputValue={inputValue} 
              setInputValue={setInputValue} 
              onSubmit={handleSendMessage} 
              isLoading={isLoading} 
              loadingStep="LOCAL_EXEC" 
              isListening={isListening}
              onMicClick={toggleListening}
            />
            
            {pendingUrl && (
              <div className="absolute inset-x-2 bottom-4 md:inset-x-10 md:bottom-10 p-4 hud-border bg-slate-950/95 rounded-2xl border-2 border-cyan-400 animate-slide-up z-50 shadow-[0_0_50px_rgba(34,211,238,0.3)]">
                <p className="text-[9px] font-bold mb-3 tracking-widest uppercase text-cyan-500">Deploying Visual Gate: {pendingUrl}</p>
                <button 
                  onClick={() => { window.open(pendingUrl!, '_blank'); setPendingUrl(null); playJarvisSound('deploy'); }}
                  className="w-full bg-cyan-500 text-slate-950 py-3 rounded-xl font-black italic tracking-widest uppercase text-xs active:scale-95 transition-all shadow-[0_0_15px_rgba(34,211,238,0.5)]"
                >
                  Confirm_Protocol_Deployment
                </button>
              </div>
            )}
          </div>

          {/* Command Matrix (Right Desktop) */}
          <div className="hidden lg:flex flex-col w-72 gap-4">
            <div className="hud-border p-6 rounded-xl bg-slate-900/60 shadow-[0_0_20px_rgba(34,211,238,0.1)] overflow-y-auto custom-scrollbar">
               <span className="text-[10px] opacity-40 uppercase tracking-[0.3em] mb-4 block">Command_Matrix</span>
               <div className="grid grid-cols-1 gap-2">
                 {QUICK_ACTIONS.map(a => (
                   <button 
                    key={a.label} 
                    onClick={() => {
                      if (a.label === 'PLAY_SONG' || a.label === 'SEARCH' || a.label === 'SHOW_ME') { 
                        setInputValue(a.cmd); 
                        handleKeyboardToggle(); 
                      }
                      else handleSendMessage(a.cmd);
                    }} 
                    className="p-3 bg-cyan-500/10 border border-cyan-500/20 rounded-xl text-left hover:bg-cyan-500/30 transition-all font-bold text-[10px] uppercase flex items-center gap-3 group"
                   >
                     <span className="text-lg group-hover:scale-125 transition-transform">{a.icon}</span>
                     <span>{a.label}</span>
                   </button>
                 ))}
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Interaction - Tactical Input HUD */}
      {!isOverlayActive && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 p-3 pb-[env(safe-area-inset-bottom,1.5rem)] bg-slate-900/98 backdrop-blur-2xl border-t border-cyan-500/30 flex flex-col gap-3 z-[100] animate-slide-up shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
          <div className="flex items-center justify-between px-2 mb-1 overflow-hidden gap-3">
             <div className="flex-grow flex flex-col justify-center">
                <div className="flex items-center gap-2 mb-1">
                  <div className={`w-2 h-2 rounded-full ${isListening ? 'bg-red-500 animate-pulse' : 'bg-cyan-500 opacity-40'}`}></div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-cyan-400 leading-none">STARK_MOBILE_CORE</span>
                </div>
                {/* Tactical input proxy to prevent OS keyboard popup */}
                <div 
                   onClick={() => handleKeyboardToggle()}
                   className="h-9 bg-slate-950/80 border border-cyan-500/40 rounded-lg flex items-center px-3 text-[10px] uppercase font-bold text-cyan-500/80 overflow-hidden"
                >
                  {inputValue || "Enter Logic Command..."}
                  <span className="w-1.5 h-4 bg-cyan-400 ml-1 animate-pulse"></span>
                </div>
             </div>
             
             <div className="grid grid-cols-3 gap-1 flex-shrink-0">
               {QUICK_ACTIONS.slice(0, 3).map(a => (
                 <button key={a.label} onClick={() => handleSendMessage(a.cmd)} className="p-2.5 bg-slate-800/50 border border-cyan-500/20 rounded-xl active:bg-cyan-500/40 text-lg">{a.icon}</button>
               ))}
               <button onClick={() => { unlockAudio(); setActiveOverlay('archive'); }} className="p-2.5 bg-slate-800/50 border border-cyan-500/20 rounded-xl active:bg-cyan-500/40 text-lg">📁</button>
               <button onClick={() => handleSendMessage('OPEN PEN')} className="p-2.5 bg-slate-800/50 border border-cyan-500/20 rounded-xl active:bg-cyan-500/40 text-lg">🖋️</button>
               <button onClick={() => handleSendMessage('OPEN MEASURE')} className="p-2.5 bg-slate-800/50 border border-cyan-500/20 rounded-xl active:bg-cyan-500/40 text-lg">📐</button>
             </div>
          </div>

          <div className="flex gap-2 h-14">
            <button 
              onClick={toggleListening}
              className={`flex-[3] rounded-2xl border-2 font-black text-[10px] tracking-[0.2em] transition-all flex items-center justify-center gap-3 ${isListening ? 'bg-red-600 border-red-400 text-white animate-pulse shadow-[0_0_20px_red]' : 'bg-slate-800 border-cyan-500/30 text-cyan-400'}`}
            >
              <span className="text-2xl">{isListening ? '⏹️' : '🎙️'}</span>
              <span>DEPLOY_VOICE</span>
            </button>
            <button 
              onClick={handleKeyboardToggle}
              className={`flex-1 rounded-2xl border-2 flex items-center justify-center text-xl transition-all ${showKeyboard ? 'bg-cyan-500 border-cyan-300 text-slate-950 shadow-[0_0_15px_cyan]' : 'bg-slate-800 border-cyan-500/30 text-cyan-400'}`}
            >
              {showKeyboard ? '⌨️' : 'ABC'}
            </button>
          </div>
          
          {showKeyboard && (
            <div className="animate-slide-up pb-2">
              <VirtualKeyboard 
                onKeyPress={handleVirtualKeyPress} 
                onBackspace={() => { unlockAudio(); setInputValue(v => v.slice(0, -1)); }} 
                onEnter={() => handleSendMessage()} 
              />
            </div>
          )}
        </div>
      )}

      <style>{`
        @keyframes slide-up { from { transform: translateY(10px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        .animate-slide-up { animation: slide-up 0.3s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default App;
