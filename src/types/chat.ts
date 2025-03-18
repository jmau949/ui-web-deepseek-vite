export type ChatRole = "user" | "system";

export interface ChatMessage {
  id: string;
  content: string;
  role: ChatRole;
  timestamp: Date;
}
