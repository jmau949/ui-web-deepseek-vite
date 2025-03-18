export type ChatRole = "user" | "assistant";

export interface ChatMessage {
  id: string;
  content: string;
  role: ChatRole;
  timestamp: Date;
}
