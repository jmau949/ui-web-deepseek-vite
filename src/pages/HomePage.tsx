import React, { useState } from "react";
import MetaTags from "../components/MetaTags";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";

const HomePage: React.FC = () => {
  const [inputValue, setInputValue] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);

  const handleInputFocus = () => {
    setIsExpanded(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
  };

  const handleSubmit = () => {
    if (inputValue.trim()) {
      console.log("Submitted:", inputValue);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
      <MetaTags title="AI Assistant" description="Your personal AI assistant" />

      <main className="flex flex-col items-center justify-center flex-1 w-full px-4 py-12">
        <div className="w-full max-w-4xl mx-auto text-center space-y-6">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-50 sm:text-5xl">
            How can I help?
          </h1>
          <div className="w-full">
            <Card className="w-full p-4 shadow-md">
              <div className="relative w-full">
                <Textarea
                  placeholder="Message..."
                  value={inputValue}
                  onChange={handleInputChange}
                  onFocus={handleInputFocus}
                  onKeyDown={handleKeyDown}
                  className={`w-full border-0 shadow-none resize-none focus:ring-0 ${
                    isExpanded ? "min-h-40" : "min-h-20"
                  } transition-all duration-200`}
                />
                <Button
                  className="absolute right-4 bottom-4 rounded-full w-10 h-10 p-0"
                  onClick={handleSubmit}
                  disabled={!inputValue.trim()}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M22 2L11 13"></path>
                    <path d="M22 2L15 22L11 13L2 9L22 2Z"></path>
                  </svg>
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default HomePage;
