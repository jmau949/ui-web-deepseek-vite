import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Loader2 } from "lucide-react";

interface InputBarProps {
  onSubmit: (message: string) => void;
  placeholder?: string;
  isSubmitting?: boolean;
  maxRows?: number;
  autoFocus?: boolean;
  className?: string;
  disabled?: boolean;
}

export const InputBar: React.FC<InputBarProps> = ({
  onSubmit,
  placeholder = "Type a message...",
  isSubmitting = false,
  maxRows = 5,
  autoFocus = true,
  className = "",
  disabled = false,
}) => {
  const [input, setInput] = useState("");
  const [rows, setRows] = useState(1);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea based on content
  useEffect(() => {
    if (textareaRef.current) {
      const lineCount = input.split("\n").length;
      const newRows = Math.min(Math.max(1, lineCount), maxRows);
      setRows(newRows);
    }
  }, [input, maxRows]);

  // Auto-focus the textarea on component mount
  useEffect(() => {
    if (autoFocus && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [autoFocus]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedInput = input.trim();
    if (trimmedInput && !isSubmitting && !disabled) {
      onSubmit(trimmedInput);
      setInput("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Submit on Enter, but allow Shift+Enter for new line
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={`flex w-full gap-2 items-end ${className}`}
    >
      <Textarea
        ref={textareaRef}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        rows={rows}
        disabled={isSubmitting || disabled}
        className="flex-grow min-h-10 resize-none p-3"
        aria-label="Message input"
      />
      <Button
        type="submit"
        disabled={!input.trim() || isSubmitting || disabled}
        className="h-10 px-4"
      >
        {isSubmitting ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Send className="h-4 w-4" />
        )}
        <span className="sr-only">Send</span>
      </Button>
    </form>
  );
};