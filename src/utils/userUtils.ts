/**
 * Utility functions for working with user data
 */

/**
 * Get user initials from first and last name
 * @param firstName User's first name
 * @param lastName User's last name
 * @returns Uppercase initials (first letter of first name and first letter of last name)
 */
export const getUserInitials = (
  firstName: string,
  lastName: string
): string => {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
};

/**
 * Tailwind background color classes for user avatars
 */
const AVATAR_COLORS = [
  "bg-blue-500",
  "bg-green-500",
  "bg-purple-500",
  "bg-pink-500",
  "bg-yellow-500",
  "bg-red-500",
  "bg-indigo-500",
  "bg-teal-500",
];

/**
 * Generate a deterministic background color based on the user's name
 * This ensures the same user always gets the same color
 *
 * @param name Full name of the user
 * @returns A Tailwind CSS class for the background color
 */
export const getAvatarColor = (name: string): string => {
  // Simple hash function to pick a color
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }

  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
};
