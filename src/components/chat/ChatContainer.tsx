import React, { useEffect, useRef } from "react";
import { MessageBubble } from "@/components/chat/MessageBubble";
import { ChatMessage } from "@/types/chat";

interface ChatContainerProps {
  messages: ChatMessage[];
}

export const ChatContainer: React.FC<ChatContainerProps> = ({ messages }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="space-y-4">
      {messages.length === 0 ? (
        <div className="text-center text-muted-foreground">
          Start a conversation by typing a message below
        </div>
      ) : (
        messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))
      )}
      {/* Empty div at the end to scroll to */}
      <div ref={messagesEndRef} />
    </div>
  );
};
