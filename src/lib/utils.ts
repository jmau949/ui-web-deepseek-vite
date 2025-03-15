import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Handles API errors and transforms them into a consistent format
 * @param error The caught error object
 * @param defaultMessage Default message to use if no specific error message is found
 * @returns A structured error object or throws a generic Error
 */
export const handleApiError = (error: any, defaultMessage: string): never => {
  // Check if there's an error structure in the response
  if (error.response?.data) {
    // Preserve the error structure
    const apiError = error.response.data;
    throw {
      message: apiError.error || defaultMessage,
      errorCode: apiError.errorCode || "UnknownError",
    };
  }

  // Fallback to generic error
  throw new Error(defaultMessage);
};