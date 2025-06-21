export type AppState = 'landing' | 'dashboard' | 'authentication' | 'workspace';

export interface Project {
  id: string;
  name: string;
  description: string;
  createdAt: Date;
  authKey: string;
}

export interface ChatMessage {
  id: string;
  senderAddress: string;
  receiverAddress: string;
  text: string;
  timestamp: Date;
  toxicityLevel?: number;
  isEdited?: boolean;
}

export interface ToxicityResult {
  level: number;
  suggestion?: string;
  isHarmful: boolean;
  confidence?: number;
}

export interface FunctionResult {
  id: string;
  function: string;
  params: Record<string, string>;
  result: any;
  timestamp: Date;
}