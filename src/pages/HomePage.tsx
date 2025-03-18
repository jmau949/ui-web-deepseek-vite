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
    // Handle both message formats that could come from the server
    if (wsResponse.data?.message) {
      const newMessage: ChatMessage = {
        id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        content: wsResponse.data.message,
        role: "system",
        timestamp: new Date(wsResponse.data.timestamp || Date.now()),
      };

      setMessages((prevMessages) => [...prevMessages, newMessage]);
      setInputStarted(true);
    } else if (
      wsResponse.message &&
      !wsResponse.message.includes("Connected to WebSocket")
    ) {
      // For system messages, excluding the initial connection message
      const newMessage: ChatMessage = {
        id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        content: wsResponse.message,
        role: "system",
        timestamp: new Date(),
      };

      setMessages((prevMessages) => [...prevMessages, newMessage]);
      setInputStarted(true);
    }
  };

  /**
   * Send a message to the WebSocket server
   */
  const handleSubmit = useCallback(
    (message: string) => {
      if (!message.trim() || !isConnected) return;

      // Could add loading state here if needed
      // setIsSubmitting(true);

      // Prepare the user message
      const userMessage: ChatMessage = {
        id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
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
              placeholder="Send a message..."
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
                placeholder="Send a message..."
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
