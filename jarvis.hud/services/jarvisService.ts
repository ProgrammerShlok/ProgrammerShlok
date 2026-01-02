
// JARVIS Local Logic Engine - Independent of External AI APIs
export const getJarvisResponse = async (prompt: string, history: any[]) => {
  const query = prompt.toLowerCase().trim();
  
  // Simulated thinking delay for immersion
  await new Promise(resolve => setTimeout(resolve, 800));

  // Intent: Show Photo / Image Search
  if (query.startsWith('show ') || query.includes('photo of') || query.includes('picture of')) {
    const target = query
      .replace('show ', '')
      .replace('photo of ', '')
      .replace('picture of ', '')
      .replace('me a ', '')
      .trim();
    
    return {
      text: `Accessing facial recognition databases and global media streams for visual identification: ${target}. Linking to secure imagery node.`,
      intent: 'SHOW_PHOTO',
      payload: target
    };
  }

  // Intent: Open Website
  if (query.startsWith('open ')) {
    const site = query.replace('open ', '');
    return {
      text: `Opening ${site} now, Sir. Redirecting browser interface.`,
      intent: 'OPEN_WEBSITE',
      payload: site
    };
  }

  // Intent: Measuring Tool
  if (query.includes('measuring tool') || query.includes('ruler') || query.includes('workbench')) {
    return {
      text: "Initializing holographic measuring station. Calibrating grid to 1.0 precision.",
      intent: 'OPEN_MEASURING_TOOL'
    };
  }

  // Intent: Search
  if (query.startsWith('search ') || query.includes('what is') || query.includes('who is')) {
    const searchTerm = query.replace('search ', '').replace('what is ', '').replace('who is ', '');
    return {
      text: `Accessing global datastream for information on "${searchTerm}". Displaying top results from encrypted search channels.`,
      intent: 'GOOGLE_SEARCH',
      payload: searchTerm
    };
  }

  // Intent: Greeting / Identity
  if (query.includes('hello') || query.includes('hi ') || query.includes('morning')) {
    return { text: "Good day, Sir. All systems at peak performance. How can I assist?" };
  }
  
  if (query.includes('who are you')) {
    return { text: "I am JARVIS. A Just A Rather Very Intelligent System. Currently running on local independent neural architecture." };
  }

  // Default
  return { 
    text: "Command received, Sir. Analyzing optimal execution path. You can ask me to 'show photo of [person]' or 'search [topic]'." 
  };
};

export const getJarvisVoice = (text: string) => {
  // Uses browser native SpeechSynthesis for independence
  return new Promise((resolve) => {
    if (!('speechSynthesis' in window)) {
      console.warn("Speech synthesis not supported");
      resolve(null);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Attempt to find a "posh" or "British" sounding voice for JARVIS feel
    const voices = window.speechSynthesis.getVoices();
    const jarvisVoice = voices.find(v => v.name.includes('Google UK English Male') || v.lang === 'en-GB') || voices[0];
    
    if (jarvisVoice) utterance.voice = jarvisVoice;
    utterance.pitch = 0.9;
    utterance.rate = 1.0;
    
    utterance.onend = () => resolve(true);
    window.speechSynthesis.speak(utterance);
  });
};
