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
  const [rows, setRows] = useState(1);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea based on content
  useEffect(() => {
    if (textareaRef.current) {
      // First, handle line breaks - this is simple and reliable
      const lineBreakRows = input.split("\n").length;

      if (lineBreakRows > 1) {
        // If we have line breaks, use them directly
        setRows(Math.min(lineBreakRows, maxRows));
        return;
      }

      // For single line content, only expand if it's long enough to likely wrap
      // This is a simple heuristic that avoids DOM manipulation
      const CHARS_PER_LINE = 50; // Estimated chars that fit in a line

      if (input.length > CHARS_PER_LINE) {
        // Reset height to measure scrollHeight accurately
        textareaRef.current.style.height = "auto";

        // Get the scrollHeight and lineHeight
        const scrollHeight = textareaRef.current.scrollHeight;
        const lineHeight =
          parseInt(getComputedStyle(textareaRef.current).lineHeight) || 20;

        // Calculate rows
        const calculatedRows = Math.ceil(scrollHeight / lineHeight);
        setRows(Math.min(calculatedRows, maxRows));
      } else {
        // Short content stays at 1 row
        setRows(1);
      }
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
            rows={rows}
            disabled={isSubmitting || disabled}
            className="flex-grow min-h-10 resize-none py-2.5 pl-3 pr-12 border-0 focus-visible:ring-0 bg-transparent"
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