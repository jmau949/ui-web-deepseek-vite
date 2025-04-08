import React, { useState, useEffect, useRef, useCallback } from "react";
import { ChatContainer } from "@/components/chat/ChatContainer";
import { InputBar } from "@/components/chat/InputBar";
import { ChatMessage } from "@/types/chat";
import useWebSocket from "../hooks/useWebSockets";
import { useAuth } from "@/auth/AuthProvider";

// Define your WebSocket server URL
const WS_URL = import.meta.env.VITE_WS_URL;

const HomePage: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputStarted, setInputStarted] = useState<boolean>(false);
  const [reconnectTrigger, setReconnectTrigger] = useState(0);
  const hasUserTyped = useRef(false);
  const activeMessageId = useRef<string | null>(null);
  const lastMessageWasUser = useRef(false);
  const insideThinkTag = useRef(false);
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

  /**
   * Handle incoming messages from the WebSocket
   */
  const handleIncomingMessage = (wsResponse: any) => {
    if (!wsResponse) return;

    console.log("Handling websocket response:", JSON.stringify(wsResponse));

    // Process for text message chunks
    if (typeof wsResponse.data?.text === "string") {
      const isComplete = !!wsResponse.data.isComplete;
      let text = wsResponse.data.text || "";

      // Process think tags
      if (text.includes("<think>")) {
        insideThinkTag.current = true;
        // Keep only the text before the <think> tag
        text = text.split("<think>")[0].trim();
      }

      if (insideThinkTag.current) {
        if (text.includes("</think>")) {
          insideThinkTag.current = false;
          // Keep only the text after the </think> tag
          text = text.split("</think>").slice(1).join("</think>").trim();
        } else {
          // Inside a think tag, don't add any text
          text = "";
        }
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

          console.log("Creating new AI message after user message");

          // If this is a complete one-chunk message, clear the active message
          if (isComplete) {
            activeMessageId.current = null;
          }

          return [...prevMessages, newMessage];
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

            console.log("Creating new AI message (fallback)");

            if (isComplete) {
              activeMessageId.current = null;
            }

            return [...prevMessages, newMessage];
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
              updatedMessages[activeMessageIndex].content.length
            );

            // If this is the end of the stream, clear the active message
            if (isComplete) {
              activeMessageId.current = null;
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

  return (
    <div className="flex flex-col h-[calc(100vh-129px)]">
      {!isConnected && (
        <div className="bg-yellow-100 p-2 text-center text-yellow-800">
          Connecting to chat server...
        </div>
      )}

      {authError && (
        <div className="bg-red-100 p-2 text-center text-red-800">
          {authError}
        </div>
      )}

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
          <div className="flex-1 overflow-y-auto px-4">
            <div className="container mx-auto max-w-4xl py-4">
              <ChatContainer messages={messages} />
            </div>
          </div>
          <div className="w-full bg-background">
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
  );
};

export default HomePage;
