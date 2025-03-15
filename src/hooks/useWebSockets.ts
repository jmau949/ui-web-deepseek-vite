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
  authenticated?: boolean;
}

interface UseWebSocketOptions {
  url: string;
  authToken?: string; // JWT token for authentication
  getAuthToken?: () => Promise<string>; // Function to retrieve auth token
  onAuthError?: (error: string) => void; // Callback for auth errors
  autoReconnect?: boolean; // Whether to automatically reconnect
  reconnectInterval?: number; // Time between reconnect attempts (ms)
  verifyAuth?: boolean; // Whether to send a verification message after connection
}

interface UseWebSocketReturn {
  socket: WebSocket | null;
  isConnected: boolean;
  isAuthenticated: boolean;
  sendMessage: (action: string, data?: any) => void;
  lastMessage: WebSocketResponse | null;
  connectionId: string | null;
  error: string | null;
  connect: () => void;
  disconnect: () => void;
}

/**
 * Custom hook to create and manage an authenticated WebSocket connection.
 * Provides methods for sending messages and handling responses.
 *
 * @param options - Configuration options for the WebSocket connection
 * @returns Object containing the socket, connection status, send function, and more
 */
const useWebSocket = (options: UseWebSocketOptions): UseWebSocketReturn => {
  const {
    url,
    authToken,
    getAuthToken,
    onAuthError,
    autoReconnect = true,
    reconnectInterval = 3000,
    verifyAuth = true,
  } = options;

  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [lastMessage, setLastMessage] = useState<WebSocketResponse | null>(
    null
  );
  const [connectionId, setConnectionId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const reconnectTimeoutRef = useRef<number | null>(null);
  const authTimeoutRef = useRef<number | null>(null);
  const socketRef = useRef<WebSocket | null>(null);

  // Clear any pending timeouts
  const clearTimeouts = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      window.clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (authTimeoutRef.current) {
      window.clearTimeout(authTimeoutRef.current);
      authTimeoutRef.current = null;
    }
  }, []);

  // Close the current socket connection
  const closeConnection = useCallback(() => {
    if (socketRef.current && socketRef.current.readyState < 2) {
      // 0 = CONNECTING, 1 = OPEN
      socketRef.current.close();
    }
  }, []);

  // Disconnect and clean up
  const disconnect = useCallback(() => {
    clearTimeouts();
    closeConnection();
    setIsConnected(false);
    setIsAuthenticated(false);
    setSocket(null);
    socketRef.current = null;
  }, [clearTimeouts, closeConnection]);

  // Function to create a new WebSocket connection
  const connect = useCallback(async () => {
    // Clean up any existing connections
    disconnect();

    // Reset error state
    setError(null);

    try {
      // Get auth token if needed
      let token = authToken;
      if (!token && getAuthToken) {
        try {
          token = await getAuthToken();
        } catch (err) {
          const errorMsg = "Failed to get authentication token";
          setError(errorMsg);
          if (onAuthError) onAuthError(errorMsg);
          return;
        }
      }

      if (!token) {
        const errorMsg = "Authentication token is required";
        setError(errorMsg);
        if (onAuthError) onAuthError(errorMsg);
        return;
      }

      // Append token as query parameter
      const fullUrl = url.includes("?")
        ? `${url}&token=${encodeURIComponent(token)}`
        : `${url}?token=${encodeURIComponent(token)}`;

      console.log(`Connecting to WebSocket server at ${url} (with auth token)`);

      // Create WebSocket connection
      const ws = new WebSocket(fullUrl);
      socketRef.current = ws;

      // Set authentication verification timeout
      if (verifyAuth) {
        authTimeoutRef.current = window.setTimeout(() => {
          if (!isAuthenticated && socketRef.current) {
            const errorMsg = "WebSocket authentication timeout";
            setError(errorMsg);
            if (onAuthError) onAuthError(errorMsg);
            closeConnection();
          }
        }, 5000); // 5 second timeout for authentication
      }

      ws.onopen = () => {
        console.log("WebSocket connection established");
        setIsConnected(true);
        setSocket(ws);

        // Send verification message to confirm authentication
        if (verifyAuth) {
          ws.send(JSON.stringify({ action: "verify" }));
        }
      };

      ws.onclose = (event) => {
        console.log(`WebSocket disconnected: ${event.code} ${event.reason}`);
        setIsConnected(false);
        setIsAuthenticated(false);
        setSocket(null);
        socketRef.current = null;

        // If we were never authenticated, this is likely an auth failure
        if (!isAuthenticated && event.code === 1000) {
          const errorMsg = "Authentication failed";
          setError(errorMsg);
          if (onAuthError) onAuthError(errorMsg);
        }

        // Attempt to reconnect after a delay if autoReconnect is enabled
        if (autoReconnect) {
          reconnectTimeoutRef.current = window.setTimeout(() => {
            console.log("Attempting to reconnect...");
            connect();
          }, reconnectInterval);
        }
      };

      ws.onerror = (error) => {
        console.error("WebSocket error:", error);
        setError("WebSocket connection error");
      };

      ws.onmessage = (event) => {
        try {
          const response = JSON.parse(event.data) as WebSocketResponse;
          console.log("Received message:", response);

          // Handle authentication confirmation
          if (response.authenticated) {
            setIsAuthenticated(true);
            clearTimeouts(); // Clear the auth timeout
          }

          // Store connection ID from welcome message
          if (response.connectionId) {
            setConnectionId(response.connectionId);
          }

          // Handle authentication errors
          if (response.error && response.error.includes("auth")) {
            setError(response.error);
            if (onAuthError) onAuthError(response.error);
          }

          setLastMessage(response);
        } catch (error) {
          console.error("Error parsing WebSocket message:", error);
        }
      };
    } catch (error) {
      console.error("Error creating WebSocket:", error);
      setError("Failed to create WebSocket connection");

      // Attempt to reconnect after a delay if autoReconnect is enabled
      if (autoReconnect) {
        reconnectTimeoutRef.current = window.setTimeout(() => {
          console.log("Attempting to reconnect...");
          connect();
        }, reconnectInterval);
      }
    }
  }, [
    url,
    authToken,
    getAuthToken,
    onAuthError,
    autoReconnect,
    reconnectInterval,
    verifyAuth,
    disconnect,
    closeConnection,
    clearTimeouts,
    isAuthenticated,
  ]);

  // Send a message through the WebSocket
  const sendMessage = useCallback(
    (action: string, data?: any) => {
      if (socket && isConnected) {
        const message: WebSocketMessage = { action, data };
        socket.send(JSON.stringify(message));
      } else {
        console.warn("Cannot send message: WebSocket is not connected");
      }
    },
    [socket, isConnected]
  );

  // Set up the WebSocket connection
  useEffect(() => {
    connect();

    // Clean up on unmount
    return () => {
      disconnect();
    };
  }, [url, authToken]); // Reconnect when URL or auth token changes

  return {
    socket,
    isConnected,
    isAuthenticated,
    sendMessage,
    lastMessage,
    connectionId,
    error,
    connect,
    disconnect,
  };
};

export default useWebSocket;
