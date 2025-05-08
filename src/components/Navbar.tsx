import React, { useState, useEffect } from "react";
import { useAuth } from "../auth/AuthProvider";
import { UserMenu } from "./UserMenu";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, MessageSquare, LogIn, Home, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { sendEmailSupportMessage } from "../api/user/userService";
import { Link, useLocation } from "react-router-dom";

/**
 * Simplified navbar with model selector on the left and user actions on the right.
 * Now always visible, with conditional rendering for authenticated users.
 */
const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [desktopMenuOpen, setDesktopMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileDropdownOpen, setMobileDropdownOpen] = useState(false);

  const isLoginPage = location.pathname === "/login";

  useEffect(() => {
    if (user) {
      setEmail(user.email || "");
    } else {
      setEmail("");
    }
  }, [user]);

  const selectedModel = "Deepseek-r1";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setIsSubmitting(true);
    try {
      await sendEmailSupportMessage(message, email);
    } catch (error) {
      console.error("Failed to submit feedback:", error);
    } finally {
      setMessage("");
      setIsSubmitting(false);
      setDesktopMenuOpen(false);
      setMobileDropdownOpen(false);
    }
  };

  // Navigation button based on current location
  const NavButton = () => {
    // If user is logged in, show user menu instead
    if (user) {
      return (
        <UserMenu
          firstName={user.firstName}
          lastName={user.lastName}
          onLogout={logout}
        />
      );
    }

    // If on login page, show Home button
    if (isLoginPage) {
      return (
        <Button asChild variant="outline">
          <Link to="/">
            <Home className="mr-2 h-4 w-4" /> Home
          </Link>
        </Button>
      );
    }

    // Otherwise show Login button
    return (
      <Button asChild variant="outline">
        <Link to="/login">
          <LogIn className="mr-2 h-4 w-4" /> Login
        </Link>
      </Button>
    );
  };

  // Mobile navigation button
  const MobileNavButton = () => {
    // If user is logged in, show logout button
    if (user) {
      return (
        <Button variant="outline" className="w-full" onClick={() => logout()}>
          Logout ({user.firstName})
        </Button>
      );
    }

    // If on login page, show Home button
    if (isLoginPage) {
      return (
        <Button asChild variant="outline" className="w-full">
          <Link to="/">
            <Home className="mr-2 h-4 w-4" /> Home
          </Link>
        </Button>
      );
    }

    // Otherwise show Login button
    return (
      <Button asChild variant="outline" className="w-full">
        <Link to="/login">
          <LogIn className="mr-2 h-4 w-4" /> Login
        </Link>
      </Button>
    );
  };

  return (
    <header className="w-full bg-background border-b border-border sticky top-0 z-50">
      <nav className="px-3 py-2 md:px-6 md:py-4 flex flex-wrap justify-between items-center">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="flex items-center gap-1 text-sm md:text-base md:gap-2 px-2 md:px-3"
            >
              {selectedModel}
              <ChevronDown className="h-3 w-3 md:h-4 md:w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem className="font-medium">
              Deepseek-r1
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="sm"
          className="md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-4">
          <DropdownMenu
            open={desktopMenuOpen}
            onOpenChange={setDesktopMenuOpen}
          >
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
                    disabled={!!user}
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

          <NavButton />
        </div>

        {/* Mobile Menu (Conditional Render) */}
        {mobileMenuOpen && (
          <div className="w-full mt-2 flex flex-col gap-2 md:hidden">
            <DropdownMenu
              open={mobileDropdownOpen}
              onOpenChange={setMobileDropdownOpen}
            >
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full flex items-center justify-center gap-2"
                >
                  <MessageSquare className="h-4 w-4" />
                  Share Your Thoughts
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-[calc(100vw-2rem)] p-4 max-w-80"
              >
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="mobile-email">Email</Label>
                    <Input
                      id="mobile-email"
                      type="email"
                      placeholder="Your email (optional)"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={!!user}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="mobile-message">
                      Message <span className="text-red-500">*</span>
                    </Label>
                    <Textarea
                      id="mobile-message"
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

            <MobileNavButton />
          </div>
        )}
      </nav>
    </header>
  );
};

export default Navbar;
