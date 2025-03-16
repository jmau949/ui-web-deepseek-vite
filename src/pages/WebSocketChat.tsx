import React, { useState, useEffect, useRef, useCallback } from "react";
import useWebSocket, { WebSocketResponse } from "../hooks/useWebSockets";

// Types for messages and chat state
interface Message {
  id: string;
  sender: string;
  content: string;
  timestamp: number;
  isUser?: boolean;
}

interface ChatProps {
  websocketUrl: string;
  username: string;
  onAuthError?: (error: string) => void;
}

/**
 * WebSocketChat Component
 *
 * A reusable chat component that connects to a WebSocket server,
 * handles message sending/receiving, and manages connection state.
 */
const WebSocketChat: React.FC<ChatProps> = ({
  websocketUrl,
  username,
  onAuthError,
}) => {
  // State management for messages and input
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [reconnectTrigger, setReconnectTrigger] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const hasUserTyped = useRef(false);

  // Connect to WebSocket
  const { isConnected, sendMessage, lastMessage, connectionId, authError } =
    useWebSocket(`${websocketUrl}?reconnect=${reconnectTrigger}`);

  // Handle authentication errors
  useEffect(() => {
    if (authError && onAuthError) {
      onAuthError(authError);
    }
  }, [authError, onAuthError]);

  // Process incoming messages
  useEffect(() => {
    if (lastMessage) {
      handleIncomingMessage(lastMessage);
    }
  }, [lastMessage]);

  // Auto-scroll to the latest message
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Attempt to reconnect on input change after disconnection
  useEffect(() => {
    if (!isConnected && hasUserTyped.current) {
      const timer = setTimeout(() => {
        hasUserTyped.current = false;
        setReconnectTrigger((prev) => prev + 1);
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [inputMessage, isConnected]);

  /**
   * Handle incoming messages from the WebSocket
   */
  const handleIncomingMessage = (wsResponse: WebSocketResponse) => {
    // Handle both message formats that could come from the server
    // 1. The data.message format (from our message.service.ts)
    // 2. Direct message property (from welcome/system messages)

    if (wsResponse.data?.message) {
      const newMessage: Message = {
        id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        sender: wsResponse.data.sender || "System",
        content: wsResponse.data.message,
        timestamp: wsResponse.data.timestamp || Date.now(),
      };

      setMessages((prevMessages) => [...prevMessages, newMessage]);
    } else if (
      wsResponse.message &&
      !wsResponse.message.includes("Connected to WebSocket")
    ) {
      // For system messages, excluding the initial connection message
      const newMessage: Message = {
        id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        sender: "System",
        content: wsResponse.message,
        timestamp: Date.now(),
      };

      setMessages((prevMessages) => [...prevMessages, newMessage]);
    }
  };

  /**
   * Send a message to the WebSocket server
   */
  const handleSendMessage = useCallback(() => {
    if (!inputMessage.trim() || !isConnected) return;

    // Prepare the user message
    const userMessage: Message = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      sender: username,
      content: inputMessage,
      timestamp: Date.now(),
      isUser: true,
    };

    // Add to local messages immediately
    setMessages((prevMessages) => [...prevMessages, userMessage]);

    // Send via WebSocket
    sendMessage("message", {
      message: inputMessage,
      sender: username,
    });

    // Clear input
    setInputMessage("");
    hasUserTyped.current = false;
  }, [inputMessage, isConnected, sendMessage, username]);

  /**
   * Handle key press events for sending messages
   */
  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  /**
   * Handle input changes and track typing status
   */
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputMessage(e.target.value);
    hasUserTyped.current = true;
  };

  /**
   * Scroll to the bottom of the chat
   */
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h2>Chat</h2>
        <div
          className={`connection-status ${
            isConnected ? "connected" : "disconnected"
          }`}
        >
          {isConnected ? "Connected" : "Disconnected"}
        </div>
      </div>

      <div className="messages-container">
        {messages.length === 0 ? (
          <div className="empty-state">
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`message ${
                message.isUser ? "user-message" : "system-message"
              }`}
            >
              <div className="message-header">
                <span className="sender">{message.sender}</span>
                <span className="timestamp">
                  {new Date(message.timestamp).toLocaleTimeString()}
                </span>
              </div>
              <div className="message-content">{message.content}</div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="input-container">
        <textarea
          value={inputMessage}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          placeholder={isConnected ? "Type a message..." : "Reconnecting..."}
          disabled={!isConnected}
          rows={3}
        />
        <button
          onClick={handleSendMessage}
          disabled={!isConnected || !inputMessage.trim()}
        >
          Send
        </button>
      </div>

      {/* Connection information (useful for development) */}
      {process.env.NODE_ENV === "development" && (
        <div className="debug-info">
          <p>Connection ID: {connectionId || "None"}</p>
          <p>Connected: {isConnected ? "Yes" : "No"}</p>
          {authError && <p className="error">Auth Error: {authError}</p>}
        </div>
      )}

      {/* Basic styles - in production you'd use a proper CSS/SCSS file */}
      <style jsx>{`
        .chat-container {
          display: flex;
          flex-direction: column;
          height: 500px;
          border: 1px solid #ccc;
          border-radius: 8px;
          overflow: hidden;
        }

        .chat-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 16px;
          background: #f5f5f5;
          border-bottom: 1px solid #ddd;
        }

        .chat-header h2 {
          margin: 0;
          font-size: 18px;
        }

        .connection-status {
          font-size: 14px;
          padding: 4px 8px;
          border-radius: 4px;
        }

        .connected {
          background: #d4edda;
          color: #155724;
        }

        .disconnected {
          background: #f8d7da;
          color: #721c24;
        }

        .messages-container {
          flex: 1;
          overflow-y: auto;
          padding: 16px;
          background: #fff;
        }

        .empty-state {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100%;
          color: #6c757d;
        }

        .message {
          margin-bottom: 16px;
          padding: 10px 12px;
          border-radius: 8px;
          max-width: 80%;
        }

        .user-message {
          background: #e3f2fd;
          margin-left: auto;
        }

        .system-message {
          background: #f5f5f5;
          margin-right: auto;
        }

        .message-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 4px;
          font-size: 12px;
        }

        .sender {
          font-weight: bold;
          color: #555;
        }

        .timestamp {
          color: #888;
        }

        .message-content {
          word-break: break-word;
        }

        .input-container {
          display: flex;
          padding: 12px;
          background: #f9f9f9;
          border-top: 1px solid #ddd;
        }

        textarea {
          flex: 1;
          border: 1px solid #ddd;
          border-radius: 4px;
          padding: 8px 12px;
          resize: none;
          font-family: inherit;
        }

        button {
          margin-left: 8px;
          padding: 8px 16px;
          background: #0070f3;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }

        button:disabled {
          background: #cccccc;
          cursor: not-allowed;
        }

        .debug-info {
          font-size: 12px;
          padding: 8px 12px;
          background: #f0f0f0;
          border-top: 1px solid #ddd;
          color: #666;
        }

        .error {
          color: #dc3545;
        }
      `}</style>
    </div>
  );
};

export default WebSocketChat;
