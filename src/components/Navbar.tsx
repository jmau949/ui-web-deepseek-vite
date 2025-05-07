import React, { useState } from "react";
import { useAuth } from "../auth/AuthProvider";
import { UserMenu } from "./UserMenu";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { sendEmailSupportMessage } from "../api/user/userService";

/**
 * Simplified navbar with model selector on the left and logout on the right
 * Using shadcn components
 */
const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState(user?.email || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // The currently selected model
  const selectedModel = "Deepseek-r1";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setIsSubmitting(true);
    try {
      // Call the support message API
      await sendEmailSupportMessage(message, email);
    } catch (error) {
      // Log error but don't show to user - behave as if successful
      console.error("Failed to submit feedback:", error);
    } finally {
      // Reset form and close dropdown regardless of success/failure
      setMessage("");
      setIsSubmitting(false);
      setIsOpen(false);
    }
  };

  return (
    <header className="w-full bg-background border-b border-border sticky top-0 z-50">
      <nav className="px-4 py-3 md:px-6 md:py-4 flex justify-between items-center">
        {/* Model dropdown menu using shadcn components - left aligned */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2">
              {selectedModel}
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem className="font-medium">
              Deepseek-r1
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User menu with logout - right aligned */}
        <div className="flex items-center gap-4">
          <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Share Your Thoughts
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 p-4">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Your email (optional)"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">
                    Message <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="message"
                    placeholder="Share your feedback..."
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="min-h-24"
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSubmitting || !message.trim()}
                >
                  {isSubmitting ? "Sending..." : "Submit"}
                </Button>
              </form>
            </DropdownMenuContent>
          </DropdownMenu>

          <UserMenu
            firstName={user.firstName}
            lastName={user.lastName}
            onLogout={logout}
          />
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
