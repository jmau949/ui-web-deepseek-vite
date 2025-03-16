import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { UserMenu } from "./UserMenu";
import { useAuth } from "../auth/AuthProvider";

/**
 * Simple navbar with mobile-first design, navigation links, and user avatar dropdown
 */
const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuth();

  const navItems = [
    { name: "Home", path: "/" },
    { name: "Chat", path: "/chat" },
  ];

  return (
    <header className="w-full bg-background border-b border-border sticky top-0 z-50">
      <nav className="px-4 py-3 md:px-6 md:py-4 flex justify-between items-center">
        {/* Logo */}
        <div className="font-bold text-lg">AppLogo</div>

        {/* Mobile menu button */}
        <button
          className="md:hidden p-2 text-foreground"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle navigation menu"
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Desktop navigation links */}
        <div className="hidden md:flex items-center gap-6">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "font-medium hover:text-primary transition-colors",
                location.pathname === item.path
                  ? "text-primary"
                  : "text-foreground"
              )}
            >
              {item.name}
            </Link>
          ))}
        </div>

        {/* User avatar and dropdown - visible on desktop */}
        <div className="hidden md:block">
          <UserMenu
            firstName={user.firstName}
            lastName={user.lastName}
            onLogout={logout}
          />
        </div>
      </nav>

      {/* Mobile navigation menu */}
      {isMenuOpen && (
        <div className="md:hidden p-4 bg-background border-t border-border animate-in slide-in-from-top">
          <div className="space-y-4">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "block py-2 font-medium hover:text-primary transition-colors",
                  location.pathname === item.path
                    ? "text-primary"
                    : "text-foreground"
                )}
                onClick={() => setIsMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            <div className="pt-4 border-t border-border">
              <UserMenu
                firstName={user.firstName}
                lastName={user.lastName}
                onLogout={() => {
                  logout();
                  setIsMenuOpen(false);
                }}
                isMobile
              />
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
