import { useState, useEffect, useCallback } from "react";
import { getWsToken } from "@/api/websocket/websocketService";

interface UsePrivateChatReturn {
  isLoading: boolean;
  error: string | null;
  wsParams: string;
  reconnectTrigger: number;
  setReconnectTrigger: React.Dispatch<React.SetStateAction<number>>;
}

/**
 * Custom hook to handle private chat authentication
 * Fetches a WebSocket token and provides connection parameters with reconnect capability
 */
const usePrivateChat = (): UsePrivateChatReturn => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [wsParams, setWsParams] = useState<string>("");
  const [reconnectTrigger, setReconnectTrigger] = useState<number>(0);

  const fetchToken = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Get the WebSocket token for authenticated access
      const token = await getWsToken();
      setWsParams(`token=${token}&reconnect=${reconnectTrigger}`);
    } catch (err: any) {
      console.error("Failed to get WebSocket token:", err);
      setError("Unable to connect to chat. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  }, [reconnectTrigger]);

  // Fetch token on component mount and when reconnect is triggered
  useEffect(() => {
    fetchToken();
  }, [fetchToken, reconnectTrigger]);

  return {
    isLoading,
    error,
    wsParams,
    reconnectTrigger,
    setReconnectTrigger,
  };
};

export default usePrivateChat;
