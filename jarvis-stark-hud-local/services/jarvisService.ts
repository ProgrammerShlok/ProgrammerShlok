
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
  if (query.includes('open youtube')) {
    return {
      text: "Accessing media grid. Deploying YouTube node, Sir.",
      intent: 'OPEN_WEBSITE',
      url: 'https://www.youtube.com'
    };
  }

  // Intent: Visual Data Visualization
  if (query.startsWith('show ') || query.includes('photo') || query.includes('picture')) {
    const target = query.replace(/show |me a |photo of |picture of |the /g, '').trim();
    return {
      text: `Scanning global archives for visual data on ${target || 'requested subject'}. Rendering now.`,
      intent: 'SHOW_PHOTO',
      url: `https://www.google.com/search?tbm=isch&q=${encodeURIComponent(target || 'stark industries')}`
    };
  }

  // Intent: Global Grid Search
  if (query.startsWith('search ') || query.includes('what is') || query.includes('google')) {
    const term = query.replace(/search |what is |google |look up /g, '').trim();
    return {
      text: `Querying the global information network for "${term}". Authorization confirmed.`,
      intent: 'GOOGLE_SEARCH',
      url: `https://www.google.com/search?q=${encodeURIComponent(term)}`
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
  if (query.includes('who are you')) {
    return { 
      text: "I am J.A.R.V.I.S., a Just A Rather Very Intelligent System. Currently operating on a secure local neural node.",
      intent: 'DEFAULT'
    };
  }

  if (query.includes('hello') || query.includes('hi ') || query.includes('hey')) {
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
 * Uses the browser's native SpeechSynthesis API for zero-latency response.
 */
export const getJarvisVoice = (text: string): Promise<boolean> => {
  return new Promise((resolve) => {
    if (!('speechSynthesis' in window)) {
      console.warn("Speech synthesis not supported on this device.");
      resolve(false);
      return;
    }

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Attempt to find a JARVIS-like voice (English UK Male)
    const voices = window.speechSynthesis.getVoices();
    const jarvisVoice = 
      voices.find(v => v.lang === 'en-GB' && v.name.toLowerCase().includes('male')) ||
      voices.find(v => v.lang.includes('en-GB')) ||
      voices.find(v => v.name.toLowerCase().includes('male')) ||
      voices[0];

    if (jarvisVoice) {
      utterance.voice = jarvisVoice;
    }

    utterance.pitch = 0.9; // Slightly lower for a cooler, sophisticated tone
    utterance.rate = 1.05;  // Slightly faster for efficiency
    utterance.volume = 1;

    utterance.onend = () => resolve(true);
    utterance.onerror = () => {
      console.error("Speech synthesis error occurred.");
      resolve(false);
    };

    window.speechSynthesis.speak(utterance);
  });
};
