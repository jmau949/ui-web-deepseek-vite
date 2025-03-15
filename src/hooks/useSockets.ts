import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

interface UseSocketReturn {
  socket: Socket | null;
  isConnected: boolean;
}

/**
 * Custom hook to create and manage a Socket.io connection.
 * Incorporates request ID from session storage for correlation with API requests.
 *
 * @param url - The URL of the Socket.io server.
 * @returns The socket instance and connection status.
 */
const useSocket = (url: string): UseSocketReturn => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);

  useEffect(() => {
    // Get the lastRequestId from session storage
    const lastRequestId = sessionStorage.getItem('lastRequestId');
    
    const socketInstance: Socket = io(url, {
      withCredentials: true,
      extraHeaders: {
        // Include the X-Request-Id header if available
        'X-Request-Id': lastRequestId || ''
      },
    });

    socketInstance.on("connect", () => {
      console.log("Socket connected:", socketInstance.id, "with requestId:", lastRequestId);
      setIsConnected(true);
    });

    socketInstance.on("disconnect", () => {
      console.log("Socket disconnected");
      setIsConnected(false);
    });

    socketInstance.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [url]);

  return { socket, isConnected };
};

export default useSocket;