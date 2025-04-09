import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

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
    <div className={cn("relative w-full", className)}>
      <form
        onSubmit={handleSubmit}
        className="flex w-full gap-2 items-end relative border rounded-xl bg-background shadow-sm focus-within:ring-1 focus-within:ring-ring overflow-hidden"
      >
        {/* Feature buttons - currently non-functional but add visual appeal
        <div className="flex items-center pl-3 gap-1.5">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
            disabled={isSubmitting || disabled}
          >
            <Smile className="h-4 w-4" />
            <span className="sr-only">Emoji</span>
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
            disabled={isSubmitting || disabled}
          >
            <PaperclipIcon className="h-4 w-4" />
            <span className="sr-only">Attach</span>
          </Button>
        </div> */}

        <Textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          rows={rows}
          disabled={isSubmitting || disabled}
          className="flex-grow min-h-10 resize-none p-3 border-0 focus-visible:ring-0 bg-transparent"
          aria-label="Message input"
        />

        {/* Voice input button - non-functional but adds visual appeal */}
        {/* <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-10 w-10 mr-0.5 text-muted-foreground hover:text-foreground"
          disabled={isSubmitting || disabled || !!input.trim()}
        >
          <Mic className="h-4 w-4" />
          <span className="sr-only">Voice input</span>
        </Button> */}

        <Button
          type="submit"
          disabled={!input.trim() || isSubmitting || disabled}
          size="icon"
          className="h-10 w-10 mr-2 aspect-square"
        >
          {isSubmitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
          <span className="sr-only">Send</span>
        </Button>
      </form>

      {/* Helper text */}
      <div className="text-[0.65rem] mt-1.5 text-muted-foreground text-center">
        <span>
          Press{" "}
          <kbd className="px-1.5 py-0.5 rounded-md border border-input bg-background text-xs">
            Enter
          </kbd>{" "}
          to send,{" "}
          <kbd className="px-1.5 py-0.5 rounded-md border border-input bg-background text-xs">
            Shift+Enter
          </kbd>{" "}
          for new line
        </span>
      </div>
    </div>
  );
};