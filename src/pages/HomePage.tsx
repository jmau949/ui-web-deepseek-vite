import React from "react";
import ChatComponent from "@/components/chat/ChatComponent";
import { useAuth } from "@/auth/AuthProvider";
import usePrivateChat from "@/hooks/usePrivateChat";
import { Loader2, AlertCircle } from "lucide-react";

const HomePage: React.FC = () => {
  const { user } = useAuth();
  const { isLoading, error, wsParams, setReconnectTrigger } = usePrivateChat();

  // The username comes from the authenticated user's email
  const username = user.email;

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

  // Allow automatic reconnect when needed
  const handleReconnect = () => {
    setReconnectTrigger((prev: number) => prev + 1);
  };

  return (
    <ChatComponent
      username={username}
      wsConnectionParams={wsParams}
      onReconnectNeeded={handleReconnect}
    />
  );
};

export default HomePage;
