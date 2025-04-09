import { useEffect, useState, useRef, useCallback } from "react";

// Define message types for our WebSocket API
export interface WebSocketMessage {
  action: string;
  data?: any;
}

export interface WebSocketResponse {
  message?: string;
  data?: any;
  error?: string;
  connectionId?: string;
}

interface UseWebSocketReturn {
  socket: WebSocket | null;
  isConnected: boolean;
  sendMessage: (action: string, data?: any) => void;
  lastMessage: WebSocketResponse | null;
  connectionId: string | null;
  authError: string | null;
}

// Global singleton to ensure only one WebSocket connection is created
// This is the key fix to prevent duplicate connections
let globalSocket: WebSocket | null = null;
let globalConnectionId: string | null = null;
let connectionAttemptInProgress = false;

/**
 * Custom hook to create and manage a WebSocket connection.
 * Provides methods for sending messages and handling responses.
 *
 * @param url - The URL of the WebSocket server (ws:// or wss://)
 * @returns Object containing the socket, connection status, send function, and last received message
 */
const useWebSocket = (url: string): UseWebSocketReturn => {
  const [isConnected, setIsConnected] = useState<boolean>(
    globalSocket?.readyState === WebSocket.OPEN
  );
  const [lastMessage, setLastMessage] = useState<WebSocketResponse | null>(null);
  const [connectionId, setConnectionId] = useState<string | null>(globalConnectionId);
  const [authError, setAuthError] = useState<string | null>(null);
  const reconnectTimeoutRef = useRef<number | null>(null);
  const connectionTimeoutRef = useRef<number | null>(null);
  
  // Reference to track if this instance has registered its handlers
  const handlersRegisteredRef = useRef<boolean>(false);

  // Clear any previous reconnection attempts
  const clearReconnectTimeout = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      window.clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
  }, []);

  // Clear connection timeout
  const clearConnectionTimeout = useCallback(() => {
    if (connectionTimeoutRef.current) {
      window.clearTimeout(connectionTimeoutRef.current);
      connectionTimeoutRef.current = null;
    }
  }, []);

  // Function to create a new WebSocket connection
  const connectWebSocket = useCallback(() => {
    // Prevent multiple simultaneous connection attempts
    if (connectionAttemptInProgress) {
      console.log("Connection attempt already in progress, skipping");
      return;
    }
    
    // If we already have a global socket that's open or connecting, use it
    if (globalSocket && (globalSocket.readyState === WebSocket.OPEN || 
                         globalSocket.readyState === WebSocket.CONNECTING)) {
      console.log("Using existing global WebSocket connection");
      return;
    }
    
    connectionAttemptInProgress = true;
    clearReconnectTimeout();
    clearConnectionTimeout();
    setAuthError(null);

    try {
      console.log(`Connecting to WebSocket server at ${url}`);
      const ws = new WebSocket(url);
      globalSocket = ws;

      // Set a timeout to detect auth failures
      connectionTimeoutRef.current = window.setTimeout(() => {
        // If we're still in connecting state after 5 seconds, likely an auth issue
        if (ws.readyState === 0) {
          console.error("WebSocket connection timeout - possible authentication failure");
          setAuthError("Authentication failed. Please log in again.");
          ws.close();
        }
        connectionAttemptInProgress = false;
      }, 5000);

      ws.onopen = () => {
        console.log("WebSocket connected");
        clearConnectionTimeout();
        setIsConnected(true);
        connectionAttemptInProgress = false;
      };

      ws.onclose = (event) => {
        clearConnectionTimeout();
        console.log(`WebSocket disconnected: ${event.code} ${event.reason}`);
        setIsConnected(false);
        globalSocket = null;
        globalConnectionId = null;
        setConnectionId(null);
        connectionAttemptInProgress = false;
        
        console.log("WebSocket closed with code:", event.code, "reason:", event.reason);
        
        // WebSocket close codes: https://developer.mozilla.org/en-US/docs/Web/API/CloseEvent/code
        if (event.code === 1000) {
          console.log("Normal closure");
        } else if (event.code === 1006) {
          console.log("Abnormal closure - likely server-side issue");
        } else if (event.code === 1008) {
          console.log("Policy violation - likely auth issues");
        }

        // Authentication errors are typically code 1000 (normal closure) or 1006 (abnormal closure)
        // but with API Gateway, we need to look for specific patterns
        if ((event.code === 1000 || event.code === 1006) && !isConnected) {
          console.error("Connection closed before fully established - likely auth failure");
          setAuthError("Authentication failed. Please log in again.");
        } else if (event.code !== 1000) {
          // Not a normal closure
          // Attempt to reconnect after a delay for non-auth errors
          reconnectTimeoutRef.current = window.setTimeout(() => {
            console.log("Attempting to reconnect...");
            connectWebSocket();
          }, 3000);
        }
      };

      ws.onerror = (error) => {
        console.error("WebSocket error:", error);
        connectionAttemptInProgress = false;
      };

      ws.onmessage = (event) => {
        try {
          const response = JSON.parse(event.data) as WebSocketResponse;
          console.log("Received message:", response);

          // If this is the welcome message, store the connection ID
          if (response.message === "Connected" && response.connectionId) {
            setConnectionId(response.connectionId);
            globalConnectionId = response.connectionId;
          }

          // Look for auth-related error messages
          if (
            response.error &&
            (response.error.includes("auth") ||
              response.error.includes("token") ||
              response.error.includes("unauthorized"))
          ) {
            setAuthError(response.error);
          }

          setLastMessage(response);
        } catch (error) {
          console.error("Error parsing WebSocket message:", error);
        }
      };
    } catch (error) {
      console.error("Error creating WebSocket:", error);
      clearConnectionTimeout();
      connectionAttemptInProgress = false;

      // Attempt to reconnect after a delay
      reconnectTimeoutRef.current = window.setTimeout(() => {
        console.log("Attempting to reconnect...");
        connectWebSocket();
      }, 3000);
    }
  }, [url, clearReconnectTimeout, clearConnectionTimeout, isConnected]);

  // Send a message through the WebSocket
  const sendMessage = useCallback(
    (action: string, data?: any) => {
      if (globalSocket && globalSocket.readyState === WebSocket.OPEN) {
        const message: WebSocketMessage = { action, data };
        globalSocket.send(JSON.stringify(message));
      } else {
        console.warn("Cannot send message: WebSocket is not connected");
      }
    },
    []
  );

  // Set up the WebSocket connection
  useEffect(() => {
    // If we already have handlers registered, don't add more
    if (handlersRegisteredRef.current) {
      return;
    }
    
    // If we already have a global socket, just update our state
    if (globalSocket) {
      if (globalSocket.readyState === WebSocket.OPEN) {
        setIsConnected(true);
        setConnectionId(globalConnectionId);
      }
    } else {
      // Otherwise connect
      connectWebSocket();
    }
    
    handlersRegisteredRef.current = true;

    // Clean up on unmount - but only close the socket if this is the last subscriber
    return () => {
      clearReconnectTimeout();
      clearConnectionTimeout();
      handlersRegisteredRef.current = false;
      
      // We could implement a reference counting system here to close the socket
      // when no components are using it, but that's more complex
      // For now, we'll let the socket persist until page refresh
    };
  }, [url, connectWebSocket, clearReconnectTimeout, clearConnectionTimeout]);

  return {
    socket: globalSocket,
    isConnected,
    sendMessage,
    lastMessage,
    connectionId,
    authError,
  };
};

export default useWebSocket;