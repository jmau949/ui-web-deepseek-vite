import React, { useRef } from "react";
import { MessageBubble } from "@/components/chat/MessageBubble";
import { ChatMessage } from "@/types/chat";
import { Bot } from "lucide-react";

interface ChatContainerProps {
  messages: ChatMessage[];
}

export const ChatContainer: React.FC<ChatContainerProps> = ({ messages }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Group messages by date
  const groupMessagesByDate = (msgs: ChatMessage[]) => {
    const groups: Record<string, ChatMessage[]> = {};

    msgs.forEach((message) => {
      const dateKey = new Date(message.timestamp).toLocaleDateString();
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(message);
    });

    return groups;
  };

  const messageGroups = groupMessagesByDate(messages);

  return (
    <div className="space-y-6 pb-4">
      {messages.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full py-10 text-center">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Bot className="h-8 w-8 text-primary" />
          </div>
          <h3 className="text-lg font-medium text-foreground mb-1">
            DeepSeek AI Assistant
          </h3>
          <p className="text-muted-foreground max-w-md">
            Start a conversation by typing a message below. I'm here to help
            with any questions you might have.
          </p>
        </div>
      ) : (
        Object.entries(messageGroups).map(([date, dateMessages]) => (
          <div key={date} className="space-y-2">
            <div className="relative py-1">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t"></span>
              </div>
              <div className="relative flex justify-center">
                <span className="bg-background px-2 text-xs text-muted-foreground">
                  {new Date(date).toDateString() === new Date().toDateString()
                    ? "Today"
                    : date}
                </span>
              </div>
            </div>

            {dateMessages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
          </div>
        ))
      )}

      {/* Keep the reference div but don't automatically scroll to it */}
      <div ref={messagesEndRef} />
    </div>
  );
};
