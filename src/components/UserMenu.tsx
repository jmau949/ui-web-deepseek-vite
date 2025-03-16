import React from "react";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getUserInitials, getAvatarColor } from "../utils/userUtils";

interface UserMenuProps {
  firstName: string;
  lastName: string;
  onLogout: () => void;
  isMobile?: boolean;
}

/**
 * User menu component displaying user initials in an avatar
 * Used in both mobile and desktop views
 */
export const UserMenu: React.FC<UserMenuProps> = ({
  firstName,
  lastName,
  onLogout,
  isMobile,
}) => {
  const initials = getUserInitials(firstName, lastName);
  const fullName = `${firstName} ${lastName}`;
  const avatarColor = getAvatarColor(fullName);

  if (isMobile) {
    return (
      <div className="flex items-center gap-3">
        <div
          className={`h-8 w-8 rounded-full ${avatarColor} text-white flex items-center justify-center font-medium text-sm`}
        >
          {initials}
        </div>
        <div className="flex-1">
          <div className="font-medium">{fullName}</div>
        </div>
        <Button
          variant="destructive"
          size="sm"
          onClick={onLogout}
          className="gap-1"
        >
          <LogOut size={16} />
          <span>Logout</span>
        </Button>
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={`h-9 w-9 rounded-full ${avatarColor} text-white flex items-center justify-center`}
          aria-label="User menu"
        >
          <span className="font-medium text-sm">{initials}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <div className="px-2 py-1.5 text-sm font-medium text-muted-foreground">
          {fullName}
        </div>
        <DropdownMenuItem
          onClick={onLogout}
          className="text-destructive focus:text-destructive"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Logout</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
