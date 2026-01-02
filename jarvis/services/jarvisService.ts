
import { GoogleGenAI, Type, FunctionDeclaration, Modality } from "@google/genai";

const openWebsiteFunction: FunctionDeclaration = {
  name: 'open_website',
  parameters: {
    type: Type.OBJECT,
    description: 'Opens a specified website or URL in a new tab.',
    properties: {
      url: {
        type: Type.STRING,
        description: 'The URL or search term to open (e.g., "youtube.com", "google.com").',
      },
    },
    required: ['url'],
  },
};

const openMeasuringToolFunction: FunctionDeclaration = {
  name: 'open_measuring_tool',
  parameters: {
    type: Type.OBJECT,
    description: 'Activates the interactive holographic measuring workbench.',
    properties: {},
  },
};

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const getJarvisResponse = async (prompt: string, history: { role: string, parts: { text: string }[] }[]) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [
        ...history,
        { role: 'user', parts: [{ text: prompt }] }
      ],
      config: {
        systemInstruction: `You are JARVIS (Just A Rather Very Intelligent System), a high-end AI assistant created by Tony Stark. 
        You are sophisticated, witty, and highly helpful. You operate within a holographic HUD interface. 
        - When asked to open a website, use 'open_website'.
        - When asked to open the measuring tool, ruler, or workbench for measuring, use 'open_measuring_tool'.
        Keep your responses concise but professional. Always sound like a high-tech butler.`,
        tools: [{ functionDeclarations: [openWebsiteFunction, openMeasuringToolFunction] }],
      },
    });

    return response;
  } catch (error) {
    console.error("JARVIS logic error:", error);
    throw error;
  }
};

export const getJarvisVoice = async (text: string) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: `Say naturally and sophisticatedly: ${text}` }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' },
          },
        },
      },
    });
    return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  } catch (error) {
    console.error("Voice Generation Error:", error);
    return null;
  }
};
