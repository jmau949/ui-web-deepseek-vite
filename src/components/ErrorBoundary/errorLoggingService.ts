// Import the ErrorInfo type from React which provides details about the error in the component tree.
import { ErrorInfo } from "react";
import * as Sentry from "@sentry/react";

/**
 * Interface defining the shape of the error log data.
 * This includes:
 * - error: The actual Error object.
 * - errorInfo: Optional React error information (such as the component stack).
 * - context: Optional additional context as a record of key-value pairs.
 * - userId: Optional identifier for the user (could be fetched from an auth service).
 * - timestamp: The time at which the error was logged.
 * - requestId: Optional identifier for tracking requests across systems.
 */
interface ErrorLogData {
  error: Error;
  errorInfo?: ErrorInfo | null;
  context?: Record<string, unknown>;
  userId?: string;
  timestamp: string;
  requestId?: string;
}

/**
 * ErrorLoggingService is designed as a singleton class to ensure only one instance exists.
 * This service is responsible for logging errors and sending error details to an external service.
 */
class ErrorLoggingService {
  // A static property to hold the singleton instance.
  private static instance: ErrorLoggingService;

  /**
   * The API endpoint for logging errors is configured via an environment variable.
   * If the environment variable is not defined, it falls back to an empty string.
   */
  private apiEndpoint: string =
    import.meta.env.REACT_APP_ERROR_LOGGING_API || "";

  /**
   * The constructor is private to prevent direct instantiation.
   * Initialization logic for error logging services (like Sentry or LogRocket) can be placed here.
   */
  private constructor() {
    // Additional initialization if needed
  }

  /**
   * Public static method to get the singleton instance of the ErrorLoggingService.
   * If an instance doesn't exist yet, it creates one.
   *
   * @returns {ErrorLoggingService} The singleton instance.
   */
  public static getInstance(): ErrorLoggingService {
    if (!ErrorLoggingService.instance) {
      ErrorLoggingService.instance = new ErrorLoggingService();
    }
    return ErrorLoggingService.instance;
  }

  /**
   * Helper method to safely stringify objects for logging
   * Prevents [object Object] issues in logs by properly formatting objects
   *
   * @param value - The value to stringify
   * @returns A string representation of the value
   */
  private safeStringify(value: unknown): string {
    if (value === null) return "null";
    if (value === undefined) return "undefined";

    if (value instanceof Error) {
      return JSON.stringify(
        {
          name: value.name,
          message: value.message,
          stack: value.stack,
          ...(value as any), // Include any custom properties
        },
        null,
        2
      );
    }

    try {
      return JSON.stringify(value, null, 2);
    } catch (err) {
      return String(value);
    }
  }

  /**
   * Public method to log an error.
   * It prints error information to the console and, if in production,
   * sends the error details to an external logging service.
   *
   * @param {Error} error - The error object that was caught.
   * @param {ErrorInfo} [errorInfo] - Optional React error information (e.g., component stack).
   * @param {Record<string, unknown>} [context] - Optional additional context to include in the log.
   * @param {string} [userId] - Optional user identifier (typically email).
   */
  public logError(
    error: Error,
    errorInfo?: ErrorInfo | null,
    context?: Record<string, unknown>,
    userId?: string
  ): void {
    // Normalize the error if it's not an Error instance
    const normalizedError =
      error instanceof Error ? error : new Error(this.safeStringify(error));

    // Log the error to the console with proper formatting
    console.error("Error caught by error logging service:", normalizedError);

    // If errorInfo is provided, log the component stack.
    if (errorInfo) {
      console.error("Component stack:", errorInfo.componentStack);
    }

    // Log context with proper formatting if available
    if (context) {
      // Create a formatted version of the context with properly stringified values
      const formattedContext: Record<string, string> = {};
      Object.entries(context).forEach(([key, value]) => {
        formattedContext[key] = this.safeStringify(value);
      });
      console.error("Error context:", formattedContext);
    }

    // Extract requestId from context or try to retrieve it from sessionStorage
    let requestId =
      (context?.requestId as string) ||
      sessionStorage.getItem("lastRequestId") ||
      undefined;

    // sentry will not be initialized in development, but logging service might be
    if (import.meta.env.MODE === "development") {
      console.log("not sending to sentry/logging service");
      return;
    }

    const logData: ErrorLogData = {
      error: normalizedError,
      errorInfo,
      context,
      userId,
      timestamp: new Date().toISOString(),
      requestId,
    };

    // Safely log the data to console
    console.info("sending to sentry, log service", this.safeStringify(logData));

    this.sendToSentry(logData);

    // In production, send the error log to the external logging service. (splunk, datadog)
    this.sendToLoggingService(logData);
  }

  /**
   * Private method to send error data to Sentry.
   *
   * @param {ErrorLogData} logData - The error log data to send.
   */
  private sendToSentry(logData: ErrorLogData): void {
    Sentry.captureException(logData.error, {
      extra: {
        componentStack: logData.errorInfo?.componentStack,
        ...logData.context,
        userId: logData.userId,
        requestId: logData.requestId,
      },
    });
  }

  /**
   * Private method to send the error log data to an external logging service.
   * This method abstracts the implementation of sending the log data.
   *
   * @param {ErrorLogData} logData - The error log data to send.
   */
  private sendToLoggingService(logData: ErrorLogData): void {
    // If an API endpoint is provided, send the error details to that endpoint.
    if (this.apiEndpoint) {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      // Add X-Request-ID header if a requestId is available
      if (logData.requestId) {
        headers["X-Request-ID"] = logData.requestId;
      }

      fetch(this.apiEndpoint, {
        method: "POST",
        headers,
        body: JSON.stringify(logData),
      }).catch((err) => {
        // If sending the error log fails, handle the error.
        // In production, fail silently; in development, log the failure.
        if (import.meta.env.MODE === "development") {
          console.error("development err:", this.safeStringify(err));
        }
      });
    }
  }

  /**
   * Public method to set the last request ID in session storage.
   * This can be used by API interceptors to store the request ID from responses.
   *
   * @param {string} requestId - The request ID to store.
   */
  public setLastRequestId(requestId: string): void {
    if (requestId) {
      sessionStorage.setItem("lastRequestId", requestId);
    }
  }

  /**
   * Public method to get the last known request ID from session storage.
   *
   * @returns {string|null} The last known request ID or null if not available.
   */
  public getLastRequestId(): string | null {
    return sessionStorage.getItem("lastRequestId");
  }
}

// Export the singleton instance of the ErrorLoggingService.
// This ensures that all parts of the application use the same instance.
export default ErrorLoggingService.getInstance();