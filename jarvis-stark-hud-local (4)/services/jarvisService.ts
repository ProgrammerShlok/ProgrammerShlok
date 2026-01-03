
/**
 * JARVIS Local Logic Engine - 100% Independent Node
 * Intelligence is 100% Offline | Deployments are Online
 */

export interface JarvisResult {
  text: string;
  intent: string;
  url?: string;
}

const RESPONSES = {
  PREPARING: [
    "Local core intelligence analyzed the request. Standing by for online deployment, Sir.",
    "Protocol processed via local enclave. Awaiting your authorization to bridge to the web.",
    "Intelligence is local, but the data you seek is external. Ready to deploy the browser node."
  ],
  COMPLETED: [
    "External node synchronized. Connection is stable.",
    "Deployment successful. Returning to local secure mode, Sir.",
    "Link established. I'm keeping our local core shielded."
  ],
  GREETING: [
    "Local Neural Enclave is active and offline, Sir. How can I assist?",
    "Systems reporting nominal. Intelligence is strictly local. Ready for commands.",
    "Secure Link established. Your data is staying on-site today, Sir."
  ],
  UNKNOWN: [
    "That specific command isn't in my local logic cache, Sir.",
    "I've scanned the local database. No matching protocol found for that request.",
    "Command analyzed. My offline brain seems to be missing that specific routine."
  ]
};

const getRandom = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];

export const getJarvisResponse = async (prompt: string): Promise<JarvisResult> => {
  let query = prompt.toLowerCase().trim();
  // Simulate local neural processing
  await new Promise(resolve => setTimeout(resolve, 600)); 

  if (query.startsWith('show me ')) {
    query = query.replace('show me ', '').trim();
  }

  if (query.includes('youtube')) {
    return { text: getRandom(RESPONSES.PREPARING), intent: 'DEPLOY', url: 'https://www.youtube.com' };
  }
  
  if (query.includes('google') || query.includes('search') || prompt.toLowerCase().startsWith('show me')) {
    const term = query.replace(/search |google |find |show me /g, '').trim();
    // Redirect specific terms if needed
    if (term === 'youtube') return { text: getRandom(RESPONSES.PREPARING), intent: 'DEPLOY', url: 'https://www.youtube.com' };
    if (term === 'github') return { text: getRandom(RESPONSES.PREPARING), intent: 'DEPLOY', url: 'https://github.com' };
    
    return { 
      text: getRandom(RESPONSES.PREPARING), 
      intent: 'DEPLOY', 
      url: `https://www.google.com/search?q=${encodeURIComponent(term || 'Stark Industries')}` 
    };
  }
  
  if (query.includes('github')) {
    return { text: getRandom(RESPONSES.PREPARING), intent: 'DEPLOY', url: 'https://github.com' };
  }
  
  if (query.includes('measure') || query.includes('tool') || query.includes('workbench')) {
    return { text: "Initializing local workbench. All measurement data is kept private, Sir.", intent: 'OPEN_TOOL' };
  }
  
  if (query.includes('time')) {
    return { text: `My internal clock shows exactly ${new Date().toLocaleTimeString()}.`, intent: 'INFO' };
  }
  
  if (query.includes('hello') || query.includes('hi') || query.includes('jarvis')) {
    return { text: getRandom(RESPONSES.GREETING), intent: 'INFO' };
  }

  return { text: getRandom(RESPONSES.UNKNOWN), intent: 'UNKNOWN' };
};

export const getJarvisConfirmation = () => getRandom(RESPONSES.COMPLETED);

export const getJarvisVoice = (text: string): Promise<boolean> => {
  return new Promise((resolve) => {
    if (!('speechSynthesis' in window)) return resolve(false);
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();
    
    // Sophisticated Voice Selection (Targeting British Male "AI" style)
    const jarvisVoice = 
      voices.find(v => v.name.includes('Daniel') || v.name.includes('Oliver')) || // macOS/iOS High Quality
      voices.find(v => v.name.includes('Google UK English Male')) || // Chrome
      voices.find(v => v.lang.includes('en-GB') && v.name.toLowerCase().includes('male')) ||
      voices.find(v => v.lang.includes('en-GB')) ||
      voices[0];
    
    if (jarvisVoice) utterance.voice = jarvisVoice;
    
    // Fine-tuned for "Paul Bettany" JARVIS feel
    utterance.pitch = 0.85; // Slightly deeper, more resonant
    utterance.rate = 1.05;  // Slightly more clinical/efficient
    utterance.volume = 1.0;
    
    utterance.onend = () => resolve(true);
    utterance.onerror = () => resolve(false);
    window.speechSynthesis.speak(utterance);
  });
};

export const playJarvisSound = (type: 'boot' | 'wake' | 'deploy' | 'error' = 'wake') => {
  const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  
  if (type === 'boot') {
    osc.frequency.setValueAtTime(440, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.1);
    gain.gain.setValueAtTime(0.1, ctx.currentTime);
  } else if (type === 'deploy') {
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1320, ctx.currentTime + 0.1);
    gain.gain.setValueAtTime(0.1, ctx.currentTime);
  } else {
    osc.frequency.setValueAtTime(660, ctx.currentTime);
    gain.gain.setValueAtTime(0.05, ctx.currentTime);
  }
  
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
  osc.start();
  osc.stop(ctx.currentTime + 0.4);
};
