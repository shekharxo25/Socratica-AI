
export type Role = 'user' | 'assistant' | 'system';

export interface MessagePart {
  text?: string;
  image?: string; // base64
}

export interface Message {
  id: string;
  role: Role;
  parts: MessagePart[];
  timestamp: number;
  isThinking?: boolean;
}

export interface TutorConfig {
  thinkingBudget: number;
}
