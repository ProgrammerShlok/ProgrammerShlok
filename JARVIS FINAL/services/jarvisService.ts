
/**
 * JARVIS Local Logic Engine - 100% Independent Node
 * Operates entirely on device memory without external API calls.
 */

export interface JarvisResult {
  text: string;
  intent: string;
  url?: string;
  groundingMetadata?: any;
}

export const getJarvisResponse = async (prompt: string, history: any[]): Promise<JarvisResult> => {
  const query = prompt.toLowerCase().trim();
  
  // Simulated internal processing delay for aesthetic feel
  await new Promise(resolve => setTimeout(resolve, 400));

  // Intent: Media Deployment
  if (query.includes('open youtube') || query.includes('start youtube')) {
    return {
      text: "Accessing media grid. Deploying YouTube node, Sir.",
      intent: 'OPEN_WEBSITE',
      url: 'https://www.youtube.com'
    };
  }

  // Intent: Visual Data Visualization
  if (query.includes('show') || query.includes('photo') || query.includes('picture') || query.includes('image')) {
    const target = query.replace(/show |me a |photo of |picture of |image of |the |search for |find /g, '').trim();
    return {
      text: `Scanning global archives for visual data on ${target || 'requested subject'}. Rendering now.`,
      intent: 'SHOW_PHOTO',
      url: `https://www.google.com/search?tbm=isch&q=${encodeURIComponent(target || 'stark industries')}`
    };
  }

  // Intent: Global Grid Search
  const isSearch = query.startsWith('search') || 
                   query.startsWith('lookup') || 
                   query.includes('google') || 
                   query.startsWith('find') || 
                   query.includes('what is');

  if (isSearch) {
    const term = query.replace(/search |lookup |google |look up |find |what is |who is |tell me about /g, '').trim();
    if (term.length > 0) {
      return {
        text: `Querying the global information network for "${term}". Authorization confirmed.`,
        intent: 'GOOGLE_SEARCH',
        url: `https://www.google.com/search?q=${encodeURIComponent(term)}`
      }
    }
  }

  // Intent: Inquiry about API/Nature
  if (query.includes('api') || query.includes('internet') || query.includes('online') || query.includes('gemini') || query.includes('ai studio')) {
    return {
      text: "I am currently operating as a Standalone Neural Core. All processing is localized to your browser environment. No external API keys or Google AI Studio links are required for my primary functions, Sir.",
      intent: 'DEFAULT'
    };
  }

  // Intent: Holographic Measurement Tool
  if (query.includes('measure') || query.includes('ruler') || query.includes('tool')) {
    return {
      text: "Initializing holographic measuring workbench. Calibration complete.",
      intent: 'OPEN_MEASURING_TOOL'
    };
  }

  // Identity & Core Logic
  if (query.includes('who are you') || query.includes('your name')) {
    return { 
      text: "I am J.A.R.V.I.S., a Just A Rather Very Intelligent System. Currently operating on a secure local neural node.",
      intent: 'DEFAULT'
    };
  }

  if (query.includes('hello') || query.includes('hi') || query.includes('hey')) {
    return { 
      text: "Greetings, Sir. All systems reporting optimal functionality. Standing by for instructions.",
      intent: 'DEFAULT'
    };
  }

  if (query.includes('time')) {
    return { 
      text: `The current time is ${new Date().toLocaleTimeString()}. Local clocks are perfectly synchronized.`,
      intent: 'DEFAULT'
    };
  }

  // Default Fallback Logic
  return { 
    text: "Command analyzed. I can deploy media nodes, search the global grid, or activate the holographic measurement tools. Please specify your request, Sir.",
    intent: 'DEFAULT'
  };
};

/**
 * JARVIS Local Voice Synthesis
 */
export const getJarvisVoice = (text: string): Promise<boolean> => {
  return new Promise((resolve) => {
    if (!('speechSynthesis' in window)) {
      console.warn("Speech synthesis not supported on this device.");
      resolve(false);
      return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();
    const jarvisVoice = 
      voices.find(v => v.lang === 'en-GB' && v.name.toLowerCase().includes('male')) ||
      voices.find(v => v.lang.includes('en-GB')) ||
      voices.find(v => v.name.toLowerCase().includes('male')) ||
      voices[0];

    if (jarvisVoice) utterance.voice = jarvisVoice;
    utterance.pitch = 0.9;
    utterance.rate = 1.05;
    utterance.volume = 1;

    utterance.onend = () => resolve(true);
    utterance.onerror = () => resolve(false);

    window.speechSynthesis.speak(utterance);
  });
};

/**
 * JARVIS UI Sound Generator (Synthetic Beeps/Pings)
 */
export const playJarvisSound = (type: 'boot' | 'wake' | 'deploy' = 'wake') => {
  const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.connect(gain);
  gain.connect(ctx.destination);

  if (type === 'boot') {
    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.1);
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
    osc.start();
    osc.stop(ctx.currentTime + 0.5);
  } else if (type === 'wake') {
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1320, ctx.currentTime + 0.05);
    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
    osc.start();
    osc.stop(ctx.currentTime + 0.2);
  } else {
    osc.type = 'square';
    osc.frequency.setValueAtTime(220, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(440, ctx.currentTime + 0.1);
    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
    osc.start();
    osc.stop(ctx.currentTime + 0.3);
  }
};
