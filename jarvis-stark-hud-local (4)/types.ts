
export enum MessageRole {
  USER = 'user',
  JARVIS = 'jarvis',
  SYSTEM = 'system'
}

export interface ChatMessage {
  id: string;
  role: MessageRole;
  text: string;
  timestamp: number;
}

export interface SystemStats {
  cpu: number;
  memory: number;
  network: number;
  aiLoad: number;
}
