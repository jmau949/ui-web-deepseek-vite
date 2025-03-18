import React from "react";
import { useAuth } from "../auth/AuthProvider";
import { UserMenu } from "./UserMenu";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Simplified navbar with model selector on the left and logout on the right
 * Using shadcn components
 */
const Navbar: React.FC = () => {
  const { user, logout } = useAuth();

  // The currently selected model
  const selectedModel = "Deepseek-r1";

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
        <div>
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
