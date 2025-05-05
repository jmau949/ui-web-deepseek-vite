import { useCallback } from "react";
import { useAuth } from "../auth/AuthProvider";
import errorLoggingService from "../components/ErrorBoundary/errorLoggingService";

type ErrorContext = Record<string, unknown>;

/**
 * Custom hook for handling errors consistently across the application.
 * It logs errors to an external service and includes request IDs for tracing.
 *
 * @param {ErrorContext} [defaultContext] - Optional default context data to include in all error logs.
 * @returns {(error: unknown, operation?: string, additionalContext?: ErrorContext) => Error}
 */
export const useErrorHandler = (defaultContext?: ErrorContext) => {
  const { user } = useAuth();
  const userEmail = user?.email || "unknown";

  /**
   * Handles and logs errors by converting them to a standard format
   * and sending them to an error logging service with request ID tracking.
   *
   * @param {unknown} error - The error encountered (can be any type).
   * @param {string} [operation] - A label or name for the operation where the error occurred.
   * @param {ErrorContext} [additionalContext] - Additional metadata related to the error.
   * @returns {Error} - Returns the normalized error object.
   */
  const handleError = useCallback(
    (error: unknown, operation?: string, additionalContext?: ErrorContext) => {
      // Create meaningful error message for different error types
      let errorMessage: string;
      let originalError: unknown = error;
      let errorData: Record<string, unknown> = {};

      // Handle different error types
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (error && typeof error === "object") {
        if ("message" in error && typeof error.message === "string") {
          errorMessage = error.message;
        } else if (
          "response" in error &&
          error.response &&
          typeof error.response === "object"
        ) {
          // Handle Axios errors
          if ("data" in error.response) {
            if (typeof error.response.data === "string") {
              errorMessage = error.response.data;
            } else if (
              typeof error.response.data === "object" &&
              error.response.data !== null
            ) {
              // Extract error message from API response
              errorMessage =
                (error.response.data as any).message ||
                (error.response.data as any).error ||
                JSON.stringify(error.response.data);
              errorData.responseData = error.response.data;
            } else {
              errorMessage = `API error with status ${
                (error as any).response.status
              }`;
            }
          } else {
            errorMessage = `API error with status ${
              (error as any).response.status
            }`;
          }
          errorData.status = (error as any).response.status;
        } else {
          // Stringified objects like [object Object]
          try {
            errorMessage = JSON.stringify(error);
          } catch {
            errorMessage = String(error);
          }
        }
      } else {
        errorMessage = String(error);
      }

      // Create normalized error object
      const errorObj = error instanceof Error ? error : new Error(errorMessage);

      // Add the error data to the error object for reference
      if (Object.keys(errorData).length > 0) {
        (errorObj as any).errorData = errorData;
      }

      // Store the original error if it wasn't an Error instance
      if (!(error instanceof Error)) {
        (errorObj as any).originalError = originalError;
      }

      // Extract request ID from the error response if available
      let requestId;

      if (error && typeof error === "object" && "response" in error) {
        // For Axios errors
        requestId = (error as any).response?.headers?.["x-request-id"];
      }

      // Fall back to the last known request ID from session storage if not in the response
      if (!requestId) {
        requestId = sessionStorage.getItem("lastRequestId");
      }

      // Merge the default context, additional context, operation metadata, and request ID
      const context = {
        ...defaultContext,
        ...additionalContext,
        operation,
        requestId: requestId || "unknown",
        errorData,
      };

      // Log the error to the external service with request ID for tracing
      errorLoggingService.logError(errorObj, null, context, userEmail);

      // Attach the request ID to the error object for UI display
      if (requestId) {
        (errorObj as any).requestId = requestId;
      }

      return errorObj;
    },
    [defaultContext, userEmail]
  );

  return handleError;
};