
/**
 * JARVIS Local Logic Engine - Strictly Offline Browser Logic
 */

export interface JarvisResult {
  text: string;
  intent: string;
  url?: string;
}

const RESPONSES = {
  GREETING: [
    "Systems online. How can I assist you, Sir?",
    "Local neural buffers nominal. Ready for input.",
    "Secure connection established. Awaiting your command."
  ],
  UNKNOWN: [
    "I'm afraid that protocol is unrecognized, Sir.",
    "Logic processing failed to match that sequence.",
    "Command cache empty for that request."
  ],
  TIME: () => `The time is ${new Date().toLocaleTimeString()}.`,
  DATE: () => `Today's date is ${new Date().toLocaleDateString()}.`
};

const getRandom = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];

let globalAudioCtx: AudioContext | null = null;

/**
 * Aggressively unlocks audio for mobile browsers.
 * Must be called inside a user-initiated event (click/touchstart).
 */
export const unlockAudio = async () => {
  if (!globalAudioCtx) {
    globalAudioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 44100 });
  }
  
  if (globalAudioCtx.state === 'suspended') {
    await globalAudioCtx.resume();
  }
  
  // Play a silent buffer to kick-start the AudioContext on iOS
  const buffer = globalAudioCtx.createBuffer(1, 1, 22050);
  const node = globalAudioCtx.createBufferSource();
  node.buffer = buffer;
  node.connect(globalAudioCtx.destination);
  node.start(0);

  // Prime speechSynthesis for mobile
  if (window.speechSynthesis) {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance("");
    utterance.volume = 0;
    window.speechSynthesis.speak(utterance);
  }
};

export const getJarvisResponse = async (prompt: string): Promise<JarvisResult> => {
  const query = prompt.toLowerCase().trim();
  const words = query.split(/\s+/);
  
  // --- WEB SEARCH & YOUTUBE ---
  
  if (query.startsWith('show me ')) {
    const term = query.replace('show me ', '').trim();
    return {
      text: `Opening visual databanks for ${term}. Visualizing results in your external gateway.`,
      intent: 'DEPLOY',
      url: `https://www.google.com/search?tbm=isch&q=${encodeURIComponent(term)}`
    };
  }

  if (query.startsWith('play ')) {
    const song = query.replace('play ', '').trim();
    return {
      text: `Locating primary stream for ${song} on YouTube. Deployment sequence ready.`,
      intent: 'DEPLOY',
      url: `https://www.youtube.com/results?search_query=${encodeURIComponent(song + " song")}`
    };
  }

  if (query.startsWith('search ') || query.includes('google ') || query.includes('chrome ')) {
    const term = query.replace('search ', '').replace('google ', '').replace('chrome ', '').trim();
    return {
      text: `Querying global databanks for ${term}. Opening Chrome gateway.`,
      intent: 'DEPLOY',
      url: `https://www.google.com/search?q=${encodeURIComponent(term)}`
    };
  }

  if (query.startsWith('open ')) {
    const site = query.replace('open ', '').trim();
    if (site === 'youtube') return { text: "Opening YouTube interface.", intent: 'DEPLOY', url: 'https://www.youtube.com' };
    if (site === 'pen') return { text: "Activating local annotation buffer.", intent: 'OPEN_PEN' };
    if (site === 'measure' || site === 'measuring') return { text: "Deploying precision metric scanner.", intent: 'OPEN_MEASURE' };
    
    if (site.includes('.')) return { text: `Navigating to ${site}.`, intent: 'DEPLOY', url: site.startsWith('http') ? site : `https://${site}` };
    return { text: `Deploying search protocol for ${site}.`, intent: 'DEPLOY', url: `https://www.google.com/search?q=${encodeURIComponent(site)}` };
  }

  if (words.includes('measure') || words.includes('calculate') || words.includes('ruler')) {
    return { text: "Precision metric scanner active. Measuring sensors enabled.", intent: 'OPEN_MEASURE' };
  }
  
  if (words.includes('pen') || words.includes('draw') || words.includes('annotate')) {
    return { text: "Visual annotation buffer frame deployed.", intent: 'OPEN_PEN' };
  }

  if (words.includes('time')) return { text: RESPONSES.TIME(), intent: 'INFO' };
  if (words.includes('date')) return { text: RESPONSES.DATE(), intent: 'INFO' };
  if (words.includes('hello') || words.includes('hi')) return { text: getRandom(RESPONSES.GREETING), intent: 'INFO' };
  
  return { text: getRandom(RESPONSES.UNKNOWN), intent: 'UNKNOWN' };
};

export const getJarvisVoice = (text: string): Promise<boolean> => {
  return new Promise((resolve) => {
    if (!window.speechSynthesis) { resolve(false); return; }
    window.speechSynthesis.cancel();
    
    const utterance = new SynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();
    
    // Improved voice priority for female mobile assistants
    const assistantVoice = 
      voices.find(v => v.name.includes('Fiona')) || 
      voices.find(v => v.name.includes('Google UK English Female')) || 
      voices.find(v => v.name.includes('Martha')) ||
      voices.find(v => v.name.includes('British') && (v.name.includes('Female') || v.name.includes('Woman'))) ||
      voices.find(v => v.lang.startsWith('en-GB') && v.name.includes('Female')) ||
      voices.find(v => v.name.includes('Female')) ||
      voices[0];

    if (assistantVoice) utterance.voice = assistantVoice;
    utterance.pitch = 1.05;
    utterance.rate = 1.0;
    utterance.volume = 1.0;
    
    utterance.onend = () => resolve(true);
    utterance.onerror = () => resolve(false);
    
    window.speechSynthesis.speak(utterance);
  });
};

// Wrapper for speech synthesis to handle potential issues on some browsers
class SynthesisUtterance extends SpeechSynthesisUtterance {
  constructor(text: string) {
    super(text);
  }
}

export const playJarvisSound = (type: string = 'wake') => {
  if (!globalAudioCtx || globalAudioCtx.state === 'suspended') return;
  const now = globalAudioCtx.currentTime;
  
  if (type === 'boot') {
    const frequencies = [110, 164.81, 220]; 
    const masterGain = globalAudioCtx.createGain();
    masterGain.connect(globalAudioCtx.destination);
    masterGain.gain.setValueAtTime(0, now);
    masterGain.gain.linearRampToValueAtTime(0.2, now + 0.1);
    masterGain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
    frequencies.forEach((freq) => {
      const osc = globalAudioCtx!.createOscillator();
      const g = globalAudioCtx!.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, now);
      osc.frequency.exponentialRampToValueAtTime(freq * 4, now + 0.8);
      g.gain.setValueAtTime(0.1, now);
      osc.connect(g);
      g.connect(masterGain);
      osc.start(now);
      osc.stop(now + 1.2);
    });
  } else {
    const osc = globalAudioCtx.createOscillator();
    const gain = globalAudioCtx.createGain();
    osc.connect(gain);
    gain.connect(globalAudioCtx.destination);
    osc.frequency.setValueAtTime(type === 'deploy' ? 880 : 660, now);
    gain.gain.setValueAtTime(0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
    osc.start(now);
    osc.stop(now + 0.3);
  }
};
