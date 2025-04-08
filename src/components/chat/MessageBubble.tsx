import React from "react";
import { cn } from "@/lib/utils";
import { ChatMessage } from "@/types/chat";
import ReactMarkdown from "react-markdown";

interface MessageBubbleProps {
  message: ChatMessage;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.role === "user";

  return (
    <div className={cn("flex my-4", isUser ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-md p-4 rounded-lg shadow-sm",
          isUser
            ? "bg-primary text-primary-foreground rounded-tr-none"
            : "bg-muted text-muted-foreground rounded-tl-none"
        )}
      >
        {isUser ? (
          <p className="break-words">{message.content}</p>
        ) : (
          <div className="markdown-content prose prose-sm dark:prose-invert max-w-none break-words">
            <ReactMarkdown>{message.content}</ReactMarkdown>
          </div>
        )}
        {message.isStreaming && (
          <span className="cursor-blink inline-block w-2 h-4 bg-primary/50 ml-1" />
        )}
      </div>
    </div>
  );
};
