import React, { useState } from "react";
import { ChatContainer } from "@/components/chat/ChatContainer";
import { InputBar } from "@/components/chat/InputBar";
import { ChatMessage } from "@/types/chat";

const HomePage: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputStarted, setInputStarted] = useState<boolean>(false);

  const handleSubmit = (message: string) => {
    if (!message.trim()) return;

    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: message,
      role: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputStarted(true);

    // Simulate AI response (in a real app, this would be an API call)
    setTimeout(() => {
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: `AI response to: ${message}`,
        role: "assistant",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMessage]);
    }, 1000);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-129px)]">
      {!inputStarted ? (
        <div className="flex flex-col items-center justify-center h-full">
          <div className="w-full max-w-xl p-4">
            <InputBar onSubmit={handleSubmit} />
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
              <InputBar onSubmit={handleSubmit} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;