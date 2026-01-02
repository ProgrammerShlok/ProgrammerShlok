
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
    
    const url = `https://www.google.com/search?tbm=isch&q=${encodeURIComponent(target)}`;
    return {
      text: `Accessing facial recognition databases and global media streams for visual identification: ${target}. Linking to secure imagery node.`,
      intent: 'SHOW_PHOTO',
      payload: target,
      url: url
    };
  }

  // Intent: Open Website
  if (query.startsWith('open ')) {
    let site = query.replace('open ', '').trim();
    if (site === 'google') site = 'google.com';
    if (site === 'youtube') site = 'youtube.com';
    const url = site.startsWith('http') ? site : `https://${site.includes('.') ? site : site + '.com'}`;
    return {
      text: `Opening ${site} now, Sir. Redirecting browser interface to external node.`,
      intent: 'OPEN_WEBSITE',
      payload: site,
      url: url
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
    const searchTerm = query.replace('search ', '').replace('what is ', '').replace('who is ', '').trim();
    const url = `https://www.google.com/search?q=${encodeURIComponent(searchTerm)}`;
    return {
      text: `Accessing global datastream for information on "${searchTerm}". Displaying top results from encrypted search channels.`,
      intent: 'GOOGLE_SEARCH',
      payload: searchTerm,
      url: url
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
    text: "Command received, Sir. Analyzing optimal execution path. You can ask me to 'show photo of [person]', 'open [site]', or 'search [topic]'." 
  };
};

export const getJarvisVoice = (text: string) => {
  return new Promise((resolve) => {
    if (!('speechSynthesis' in window)) {
      console.warn("Speech synthesis not supported");
      resolve(null);
      return;
    }

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();
    const jarvisVoice = voices.find(v => v.name.includes('Google UK English Male') || v.lang === 'en-GB') || voices[0];
    
    if (jarvisVoice) utterance.voice = jarvisVoice;
    utterance.pitch = 0.95;
    utterance.rate = 1.05;
    
    utterance.onend = () => resolve(true);
    utterance.onerror = () => resolve(false);
    window.speechSynthesis.speak(utterance);
  });
};
