export type ChatRole = "user" | "system" | "error" | "info";

export interface ChatMessage {
  id: string;
  content: string;
  role: ChatRole;
  timestamp: Date;
  isStreaming?: boolean;
  isThinking?: boolean;
  parentMessageId?: string;
  isFailed?: boolean;
  isRetrying?: boolean;
  metadata?: {
    model?: string;
    tokens?: {
      prompt?: number;
      completion?: number;
      total?: number;
    };
    latency?: number;
    userId?: string;
    threadId?: string;
    tags?: string[];
  };
}

export interface ChatSession {
  id: string;
  title: string;
  lastMessageTimestamp: Date;
  messages: ChatMessage[];
}
