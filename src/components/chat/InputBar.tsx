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
  maxRows = 20,
  autoFocus = true,
  className = "",
  disabled = false,
}) => {
  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Function to adjust textarea height based on content
  const adjustHeight = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    // Reset height temporarily to get the correct scrollHeight
    textarea.style.height = "auto";

    // Get the textarea's base height when empty (one line)
    const baseHeight = 38; // Default approximate height for one line

    // Set the height based on content but cap it according to maxRows
    const maxHeight = baseHeight * maxRows;
    const newHeight = Math.min(textarea.scrollHeight, maxHeight);

    // Only expand if content requires more height than base height
    if (newHeight > baseHeight) {
      textarea.style.height = `${newHeight}px`;
    } else {
      textarea.style.height = `${baseHeight}px`;
    }
  };

  // Adjust height on input change
  useEffect(() => {
    adjustHeight();
  }, [input]);

  // Adjust height on window resize
  useEffect(() => {
    window.addEventListener("resize", adjustHeight);
    return () => {
      window.removeEventListener("resize", adjustHeight);
    };
  }, []);

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
        className="relative border rounded-xl bg-background shadow-sm focus-within:ring-1 focus-within:ring-ring overflow-hidden"
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

        <div className="flex items-center">
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={isSubmitting || disabled}
            className="flex-grow min-h-10 h-10 resize-none py-2.5 pl-3 pr-12 border-0 focus-visible:ring-0 bg-transparent"
            aria-label="Message input"
            style={{ overflow: "hidden" }}
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
            className="absolute right-0 top-0 bottom-0 h-full w-10 rounded-l-none rounded-r-xl flex-shrink-0 flex items-center justify-center"
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            <span className="sr-only">Send</span>
          </Button>
        </div>
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