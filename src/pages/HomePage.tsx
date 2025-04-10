import React, { useState, useEffect, useRef, useCallback } from "react";
import { ChatContainer } from "@/components/chat/ChatContainer";
import { InputBar } from "@/components/chat/InputBar";
import { ChatMessage } from "@/types/chat";
import useWebSocket from "../hooks/useWebSockets";
import { useAuth } from "@/auth/AuthProvider";
import { AlertCircle, ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";

// Define your WebSocket server URL
const WS_URL = import.meta.env.VITE_WS_URL;

const HomePage: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputStarted, setInputStarted] = useState<boolean>(false);
  const [reconnectTrigger, setReconnectTrigger] = useState(0);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const hasUserTyped = useRef(false);
  const activeMessageId = useRef<string | null>(null);
  const lastMessageWasUser = useRef(false);
  const insideThinkTag = useRef(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  // Username could come from auth context or props in a real app
  const username = user.email;

  // Initialize WebSocket connection with reconnect support
  const { isConnected, sendMessage, lastMessage, connectionId, authError } =
    useWebSocket(`${WS_URL}?reconnect=${reconnectTrigger}`);

  // Handle authentication errors
  useEffect(() => {
    if (authError) {
      console.error("WebSocket authentication error:", authError);
      // You might want to show an error message or redirect to login
    }
  }, [authError]);

  // Process incoming messages from the WebSocket
  useEffect(() => {
    if (lastMessage) {
      handleIncomingMessage(lastMessage);
    }
  }, [lastMessage]);

  // Remove the interval checks and simplify
  useEffect(() => {
    // This effect ensures that when no message is being streamed (activeMessageId is null),
    // we turn off streaming for all messages correctly
    const hasStreamingMessages = messages.some(
      (msg) => msg.isStreaming === true
    );
    const activeMessageExists = activeMessageId.current !== null;

    if (!activeMessageExists && hasStreamingMessages) {
      console.log(
        "No active message but found streaming messages - fixing state"
      );
      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg.isStreaming ? { ...msg, isStreaming: false } : msg
        )
      );
    }
  }, [messages]);

  // Effect to ensure streaming stops when websocket disconnects
  useEffect(() => {
    if (!isConnected) {
      // Clear any active message
      activeMessageId.current = null;

      // Clear any streaming state on all messages
      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg.isStreaming ? { ...msg, isStreaming: false } : msg
        )
      );
    }
  }, [isConnected]);

  // Attempt to reconnect on input change after disconnection
  useEffect(() => {
    if (!isConnected && hasUserTyped.current) {
      const timer = setTimeout(() => {
        hasUserTyped.current = false;
        setReconnectTrigger((prev) => prev + 1);
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [isConnected]);

  // Add scroll detection
  useEffect(() => {
    const checkScroll = () => {
      if (!chatContainerRef.current) return;

      const { scrollTop, scrollHeight, clientHeight } =
        chatContainerRef.current;
      // Show scroll button when not at bottom
      const isAtBottom = scrollHeight - scrollTop - clientHeight < 100;
      setShowScrollButton(!isAtBottom);
    };

    const container = chatContainerRef.current;
    if (container) {
      container.addEventListener("scroll", checkScroll);
      // Also check on resize
      window.addEventListener("resize", checkScroll);

      return () => {
        container.removeEventListener("scroll", checkScroll);
        window.removeEventListener("resize", checkScroll);
      };
    }
  }, [inputStarted]);

  const scrollToBottom = () => {
    chatContainerRef.current?.scrollTo({
      top: chatContainerRef.current.scrollHeight,
      behavior: "smooth",
    });
  };

  // Debug function to log message streaming states
  const logMessageStates = (msgs: ChatMessage[]) => {
    console.log("Current message streaming states:");
    msgs.forEach((msg) => {
      if (msg.isStreaming) {
        console.log(
          `Message ${msg.id.substring(0, 8)}: isStreaming=${msg.isStreaming}`
        );
      }
    });
  };

  /**
   * Handle incoming messages from the WebSocket
   */
  const handleIncomingMessage = (wsResponse: any) => {
    if (!wsResponse) return;

    // Check for error responses
    if (wsResponse.data?.error === true) {
      console.error("WebSocket error response:", wsResponse.data);

      // Create a friendly error message
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        content:
          "🤖 Friendly update! Our GPUs are taking a scheduled nap from 12am-9am Central Time, or they might turned off due to high demand. We're keeping costs down by being smart about when our engines run. Please check back in a bit! ✨",
        role: "system",
        timestamp: new Date(),
        isStreaming: false,
        isError: true,
      };

      // Add to messages
      setMessages((prev) => [...prev, errorMessage]);

      // Clear any active streaming message
      activeMessageId.current = null;

      return;
    }

    // Process for text message chunks
    if (typeof wsResponse.data?.text === "string") {
      const isComplete = !!wsResponse.data.isComplete;
      let text = wsResponse.data.text || "";

      // IMPORTANT: Force update all messages to not streaming when complete is received
      if (isComplete && activeMessageId.current) {
        // First update the active message directly to stop streaming
        setMessages((prevMessages) =>
          prevMessages.map((msg) =>
            msg.id === activeMessageId.current
              ? { ...msg, isStreaming: false }
              : msg
          )
        );
        console.log(
          `Explicitly setting message ${activeMessageId.current.substring(
            0,
            8
          )} to not streaming`
        );

        // Also mark that there's no active message
        activeMessageId.current = null;

        // Skip rest of processing if we just got an empty completion message
        if (!text) {
          return;
        }
      }

      // Process think tags
      let thinkContent = "";
      let hasThinkTag = false;
      let thinkEnded = false;

      if (text.includes("<think>")) {
        hasThinkTag = true;
        const parts = text.split("<think>");
        text = parts[0];
        thinkContent = parts[1] || "";
        insideThinkTag.current = true;
      }

      if (text.includes("</think>")) {
        hasThinkTag = true;
        thinkEnded = true;
        const parts = text.split("</think>");
        // If there was content before the </think>, it's part of the think content
        if (insideThinkTag.current) {
          thinkContent += parts[0];
          text = parts.slice(1).join("</think>");
        } else {
          // If </think> appears without a preceding <think> in this chunk
          text = parts.slice(1).join("</think>");
        }
        // We reached the end of a think section
        insideThinkTag.current = false;
      } else if (insideThinkTag.current) {
        // We're in the middle of a think tag
        thinkContent += text;
        text = "";
      }

      // Handle think messages - either show the latest content or remove when finished
      if ((hasThinkTag || insideThinkTag.current) && !thinkEnded) {
        // Use a delayed update approach to prevent rapid flickering of content
        setTimeout(() => {
          setMessages((prevMessages) => {
            // Find any existing thinking message
            const existingThinkingMessage = prevMessages.find(
              (msg) => msg.isThinking
            );

            // First, remove any previous thinking messages
            const messagesWithoutThinking = prevMessages.filter(
              (msg) => !msg.isThinking
            );

            // If we have think content to display and we're inside a think tag
            if (thinkContent.trim() && insideThinkTag.current) {
              let finalThinkContent = thinkContent.trim();

              // If there's an existing thinking message, append to it instead of replacing
              if (existingThinkingMessage) {
                // Start with existing content
                finalThinkContent = existingThinkingMessage.content;

                // Only append new content if it's not already included
                if (
                  thinkContent.trim() &&
                  !finalThinkContent.includes(thinkContent.trim())
                ) {
                  // Add a line break for better readability
                  finalThinkContent += finalThinkContent
                    ? "\n\n" + thinkContent.trim()
                    : thinkContent.trim();

                  // Keep a reasonable number of characters to prevent excessive growth
                  // while maintaining readability
                  if (finalThinkContent.length > 1000) {
                    // Keep most recent content with enough context
                    const lines = finalThinkContent.split("\n");
                    if (lines.length > 15) {
                      // Keep the last 15 lines for context
                      finalThinkContent =
                        "...\n\n" + lines.slice(-15).join("\n");
                    }
                  }
                }
              }

              // Create new message or update existing one
              const newId =
                activeMessageId.current ||
                `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
              activeMessageId.current = newId;

              const newMessage: ChatMessage = {
                id: newId,
                content: finalThinkContent,
                role: "system",
                timestamp: new Date(),
                isStreaming: true,
                isThinking: true,
              };

              return [...messagesWithoutThinking, newMessage];
            }

            return messagesWithoutThinking;
          });
        }, 100); // Small delay to batch updates and reduce flickering
      }

      // When we encounter </think>, make sure to remove all thinking messages
      if (thinkEnded) {
        console.log("Think ended - removing thinking messages");
        setMessages((prevMessages) => {
          const messagesWithoutThinking = prevMessages.filter(
            (msg) => !msg.isThinking
          );
          return messagesWithoutThinking;
        });
      }

      // Skip empty chunks
      if (!text && !isComplete) {
        console.log("Skipping empty or think-only chunk");
        return;
      }

      console.log(
        `Message chunk: "${text.substring(0, 20)}..." - Complete: ${isComplete}`
      );

      setMessages((prevMessages) => {
        // If the last message was from a user, or no active message,
        // then this is the start of a new AI response
        const needNewAIMessage =
          lastMessageWasUser.current || !activeMessageId.current;

        if (needNewAIMessage) {
          // Don't create an empty message
          if (!text && isComplete) {
            console.log("Skipping empty final message");
            return prevMessages;
          }

          // Create a new message ID for this response
          const newId = `msg-${Date.now()}-${Math.random()
            .toString(36)
            .substr(2, 9)}`;
          activeMessageId.current = newId;
          lastMessageWasUser.current = false;

          const newMessage: ChatMessage = {
            id: newId,
            content: text,
            role: "system",
            timestamp: new Date(),
            isStreaming: !isComplete,
          };

          console.log(
            "Creating new AI message after user message, isStreaming:",
            !isComplete
          );

          // If this is a complete one-chunk message, clear the active message
          if (isComplete) {
            activeMessageId.current = null;
          }

          const updatedMessages = [...prevMessages, newMessage];
          if (isComplete) {
            // Additional check for debugging
            logMessageStates(updatedMessages);
          }
          return updatedMessages;
        } else {
          // Find the active AI message to update
          const activeMessageIndex = prevMessages.findIndex(
            (msg) => msg.id === activeMessageId.current
          );

          if (activeMessageIndex === -1) {
            // If we can't find the active message, only create a new one if we have text
            if (!text) {
              console.log("Skipping empty message (no active message found)");
              return prevMessages;
            }

            const newId = `msg-${Date.now()}-${Math.random()
              .toString(36)
              .substr(2, 9)}`;
            activeMessageId.current = newId;

            const newMessage: ChatMessage = {
              id: newId,
              content: text,
              role: "system",
              timestamp: new Date(),
              isStreaming: !isComplete,
            };

            console.log(
              "Creating new AI message (fallback), isStreaming:",
              !isComplete
            );

            if (isComplete) {
              activeMessageId.current = null;
            }

            const updatedMessages = [...prevMessages, newMessage];
            if (isComplete) {
              logMessageStates(updatedMessages);
            }
            return updatedMessages;
          }

          // Update the existing message with the new chunk, only if text is non-empty
          if (text || !isComplete) {
            const updatedMessages = [...prevMessages];
            updatedMessages[activeMessageIndex] = {
              ...updatedMessages[activeMessageIndex],
              content: text
                ? updatedMessages[activeMessageIndex].content + text
                : updatedMessages[activeMessageIndex].content,
              isStreaming: !isComplete,
            };

            console.log(
              "Updating existing AI message, new length:",
              updatedMessages[activeMessageIndex].content.length,
              "isStreaming:",
              !isComplete
            );

            // If this is the end of the stream, clear the active message
            if (isComplete) {
              activeMessageId.current = null;
              logMessageStates(updatedMessages);
            }

            return updatedMessages;
          }

          // For empty completion messages, just update the streaming state
          if (isComplete) {
            const updatedMessages = [...prevMessages];
            updatedMessages[activeMessageIndex] = {
              ...updatedMessages[activeMessageIndex],
              isStreaming: false,
            };
            activeMessageId.current = null;

            console.log("Marking message as complete (empty final chunk)");
            logMessageStates(updatedMessages);

            return updatedMessages;
          }

          return prevMessages;
        }
      });

      setInputStarted(true);
    }
    // For non-streaming system messages (errors, notifications, etc.)
    else if (
      wsResponse.text &&
      !wsResponse.text.includes("Connected to WebSocket")
    ) {
      console.log("System message:", wsResponse.text);

      // Simple think tag handling for system messages
      let messageText = wsResponse.text;
      let thinkTagStart = messageText.indexOf("<think>");
      let thinkTagEnd = messageText.indexOf("</think>");

      // Keep removing think tag content until no more think tags are found
      while (
        thinkTagStart !== -1 &&
        thinkTagEnd !== -1 &&
        thinkTagEnd > thinkTagStart
      ) {
        messageText =
          messageText.substring(0, thinkTagStart) +
          messageText.substring(thinkTagEnd + 8); // 8 is length of "</think>"

        thinkTagStart = messageText.indexOf("<think>");
        thinkTagEnd = messageText.indexOf("</think>");
      }

      // Skip empty messages after removing think content
      if (!messageText.trim()) {
        console.log(
          "Skipping empty system message after removing think content"
        );
        return;
      }

      const systemMessage: ChatMessage = {
        id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        content: messageText.trim(),
        role: "system",
        timestamp: new Date(),
        isStreaming: false, // Ensure system messages are never streaming
      };

      setMessages((prev) => [...prev, systemMessage]);
      setInputStarted(true);
    }
  };

  /**
   * Send a message to the WebSocket server
   */
  const handleSubmit = useCallback(
    (message: string) => {
      if (!message.trim() || !isConnected) return;

      // Mark that the last message was from a user,
      // so the next AI response creates a new message bubble
      lastMessageWasUser.current = true;

      // Clear any active streaming message and reset think tag state
      activeMessageId.current = null;
      insideThinkTag.current = false;

      // Prepare the user message
      const userMessage: ChatMessage = {
        id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        content: message,
        role: "user",
        timestamp: new Date(),
        isStreaming: false, // User messages are never streaming
      };

      // Add to local messages immediately
      setMessages((prevMessages) => [...prevMessages, userMessage]);
      setInputStarted(true);

      // Set typing state for reconnection logic
      hasUserTyped.current = true;

      // Send via WebSocket
      sendMessage("message", {
        message: message,
        sender: username,
        connectionId: connectionId,
      });
    },
    [isConnected, sendMessage, username, connectionId]
  );

  // Directly implement a strong cleanup effect that runs on every render to fix any stuck streaming messages
  useEffect(() => {
    // Run this check on every message update
    if (messages.length > 0) {
      // If we have no active message but some messages are marked as streaming, fix them
      const shouldFixMessages =
        !activeMessageId.current && messages.some((msg) => msg.isStreaming);

      if (shouldFixMessages) {
        console.log("Forced cleanup of streaming states");
        setMessages((prevMessages) =>
          prevMessages.map((msg) =>
            msg.isStreaming ? { ...msg, isStreaming: false } : msg
          )
        );
      }
    }
  }, [messages]);

  return (
    <div className="flex flex-col h-[calc(100vh-80px)]">
      {/* Connection and error status notifications */}
      {authError && (
        <div className="bg-destructive/10 p-2 text-center text-destructive flex items-center justify-center gap-2">
          <AlertCircle className="h-4 w-4" />
          {authError}
        </div>
      )}

      {/* Main chat area */}
      <div className="flex flex-col h-full">
        {!inputStarted ? (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="w-full max-w-xl p-4">
              <InputBar
                onSubmit={handleSubmit}
                disabled={!isConnected}
                autoFocus={true}
                className="w-full"
              />
            </div>
          </div>
        ) : (
          <div className="flex flex-col h-full">
            <div
              ref={chatContainerRef}
              className="flex-1 overflow-y-auto px-4 relative scroll-smooth"
            >
              <div className="container mx-auto max-w-4xl py-4">
                <ChatContainer messages={messages} />
              </div>

              {/* Scroll to bottom button */}
              {showScrollButton && (
                <Button
                  className="absolute bottom-4 right-6 h-10 w-10 rounded-full shadow-md"
                  onClick={scrollToBottom}
                  aria-label="Scroll to bottom"
                >
                  <ArrowDown className="h-5 w-5" />
                </Button>
              )}
            </div>
            <div className="w-full bg-background border-t">
              <div className="container mx-auto max-w-4xl p-4">
                <InputBar
                  onSubmit={handleSubmit}
                  disabled={!isConnected}
                  autoFocus={true}
                  className="w-full"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;
