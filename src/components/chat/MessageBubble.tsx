import React, { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { ChatMessage } from "@/types/chat";
import ReactMarkdown from "react-markdown";
import { User, Bot, BrainCircuit, AlertCircle } from "lucide-react";

// Define keyframes for the subtle flashing effect
const thinkingAnimation = `@keyframes think-flash {
  0% { opacity: 0.9; }
  50% { opacity: 1; }
  100% { opacity: 0.9; }
}`;

interface MessageBubbleProps {
  message: ChatMessage;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.role === "user";
  const isThinking = Boolean(message.isThinking);
  const isError = Boolean(message.isError);
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
    <>
      {/* Add the keyframes for the animation */}
      {isThinking && <style>{thinkingAnimation}</style>}

      <div
        className={cn(
          "flex gap-3 my-4 animate-in fade-in duration-200",
          isUser ? "flex-row-reverse" : "flex-row"
        )}
        data-streaming={isStreaming ? "true" : "false"}
        data-thinking={isThinking ? "true" : "false"}
        data-error={isError ? "true" : "false"}
      >
        {/* Avatar */}
        <div
          className={cn(
            "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center",
            isUser
              ? "bg-primary"
              : isThinking
              ? "bg-slate-500"
              : isError
              ? "bg-amber-400"
              : "bg-accent"
          )}
        >
          {isUser ? (
            <User className="h-4 w-4 text-primary-foreground" />
          ) : isThinking ? (
            <BrainCircuit className="h-4 w-4 text-slate-50" />
          ) : isError ? (
            <AlertCircle className="h-4 w-4 text-amber-950" />
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
              : isThinking
              ? "bg-slate-100 border border-slate-300 text-slate-800 rounded-tl-none w-[500px] min-h-[120px]"
              : isError
              ? "bg-amber-50 border border-amber-200 text-amber-900 rounded-tl-none"
              : "bg-card border border-border text-card-foreground rounded-tl-none"
          )}
          style={
            isThinking
              ? {
                  animation: "think-flash 3s ease-in-out infinite",
                }
              : undefined
          }
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
                  : isThinking
                  ? "bg-slate-100 border border-slate-300 -right-2"
                  : isError
                  ? "bg-amber-50 border border-amber-200 -right-2"
                  : "bg-card border border-border -right-2"
              )}
              style={
                isThinking
                  ? {
                      animation: "think-flash 3s ease-in-out infinite",
                    }
                  : undefined
              }
            />
          </div>

          {/* Content */}
          <div className="flex flex-col">
            {isThinking && (
              <div className="text-sm text-slate-700 font-semibold mb-3 flex items-center border-b border-slate-200 pb-2">
                <BrainCircuit className="h-4 w-4 mr-2 text-slate-600" />
                <span className="mr-1">AI is thinking...</span>
                <span className="inline-flex">
                  <span className="animate-pulse mx-0.5 delay-0">.</span>
                  <span className="animate-pulse mx-0.5 animation-delay-200">
                    .
                  </span>
                  <span className="animate-pulse mx-0.5 animation-delay-400">
                    .
                  </span>
                </span>
              </div>
            )}
            {isUser ? (
              <p className="break-words">{message.content}</p>
            ) : (
              <div
                className={cn(
                  "markdown-content prose-sm max-w-none break-words",
                  isThinking && "text-slate-700",
                  isError && "text-amber-900 font-medium"
                )}
              >
                {isThinking ? (
                  <div className="thinking-content">{message.content}</div>
                ) : (
                  <ReactMarkdown>{message.content}</ReactMarkdown>
                )}
              </div>
            )}

            {/* Only show typing indicator when actively streaming and only within this render cycle */}
            {isStreaming && !isThinking && (
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
    </>
  );
};
