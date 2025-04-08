import React, { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { ChatMessage } from "@/types/chat";
import ReactMarkdown from "react-markdown";
import { User, Bot } from "lucide-react";

interface MessageBubbleProps {
  message: ChatMessage;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.role === "user";
  // Force component to re-render when streaming state changes by using a ref to track previous state
  const isStreamingRef = useRef(message.isStreaming);
  const [, forceUpdate] = useState({});

  // Use useEffect to force re-render only when streaming state changes
  useEffect(() => {
    if (isStreamingRef.current !== message.isStreaming) {
      isStreamingRef.current = message.isStreaming;
      forceUpdate({});
    }
  }, [message.isStreaming]);

  // Get a definitive value of isStreaming for this render cycle
  const isStreaming = Boolean(message.isStreaming);

  return (
    <div
      className={cn(
        "flex gap-3 my-4 animate-in fade-in duration-200",
        isUser ? "flex-row-reverse" : "flex-row"
      )}
      data-streaming={isStreaming ? "true" : "false"}
    >
      {/* Avatar */}
      <div
        className={cn(
          "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center",
          isUser ? "bg-primary" : "bg-accent"
        )}
      >
        {isUser ? (
          <User className="h-4 w-4 text-primary-foreground" />
        ) : (
          <Bot className="h-4 w-4 text-accent-foreground" />
        )}
      </div>

      {/* Message content */}
      <div
        className={cn(
          "relative max-w-[calc(100%-3rem)] p-4 rounded-xl shadow-sm",
          isUser
            ? "bg-primary text-primary-foreground rounded-tr-none"
            : "bg-card border border-border text-card-foreground rounded-tl-none"
        )}
      >
        {/* Triangle pointer */}
        <div
          className={cn(
            "absolute top-0 w-3 h-3 overflow-hidden",
            isUser ? "-right-2" : "-left-2"
          )}
        >
          <div
            className={cn(
              "absolute transform rotate-45 w-4 h-4",
              isUser
                ? "bg-primary -left-2"
                : "bg-card border border-border -right-2"
            )}
          />
        </div>

        {/* Content */}
        <div className="flex flex-col">
          {isUser ? (
            <p className="break-words">{message.content}</p>
          ) : (
            <div className="markdown-content prose-sm max-w-none break-words">
              <ReactMarkdown>{message.content}</ReactMarkdown>
            </div>
          )}

          {/* Only show typing indicator when actively streaming and only within this render cycle */}
          {isStreaming && (
            <div
              className="typing-indicator mt-2"
              data-testid="typing-indicator"
            >
              <span className="dot"></span>
              <span className="dot"></span>
              <span className="dot"></span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
