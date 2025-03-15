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
      const errorObj =
        error instanceof Error ? error : new Error(String(error));

      // Extract request ID from the error response if available
      let requestId;

      if (error && typeof error === "object" && "response" in error) {
        // For Axios errors
        // @ts-ignore
        requestId = error.response?.headers?.["x-request-id"];
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