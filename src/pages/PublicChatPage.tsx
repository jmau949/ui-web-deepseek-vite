import React from "react";
import ChatComponent from "@/components/chat/ChatComponent";
import usePublicChat from "@/hooks/usePublicChat";
import { Loader2, AlertCircle } from "lucide-react";

/**
 * Public chat page accessible without authentication
 * Uses the chat component with public access token
 */
const PublicChatPage: React.FC = () => {
  const { isLoading, error, wsParams, setReconnectTrigger } = usePublicChat();

  // Show loading state while getting the token
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-80px)]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Connecting to chat...</p>
        </div>
      </div>
    );
  }

  // Show error state if token fetch failed
  if (error) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-80px)]">
        <div className="bg-destructive/10 p-6 rounded-md flex flex-col items-center gap-4 max-w-md text-center">
          <AlertCircle className="h-8 w-8 text-destructive" />
          <h2 className="text-lg font-medium">Connection Error</h2>
          <p className="text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  // Handle reconnection
  const handleReconnect = () => {
    setReconnectTrigger((prev: number) => prev + 1);
  };

  // Render the chat component with the websocket parameters
  return (
    <ChatComponent
      wsConnectionParams={wsParams}
      onReconnectNeeded={handleReconnect}
    />
  );
};

export default PublicChatPage;
