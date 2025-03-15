// src/sentry.ts
import * as Sentry from "@sentry/react";

export function initSentry(): void {
  // Only initialize Sentry in production to avoid noise during development
  if (import.meta.env.PROD) {
    Sentry.init({
      // Your Sentry DSN (Data Source Name) from your Sentry project settings
      dsn: import.meta.env.VITE_SENTRY_DSN,

      // The environment name helps you distinguish between different environments
      environment: import.meta.env.MODE,

      // Set a release identifier to track which version of your app an error came from
      release: import.meta.env.VITE_APP_VERSION || "1.0.0",

      // Controls what percentage of users will send events (1.0 = 100%)
      // This enables performance monitoring
      tracesSampleRate: 0.2,

      // Controls what percentage of profiles to collect
      profilesSampleRate: 0.1,

      // Custom logic for filtering events
      beforeSend(event, hint) {
        const error = hint?.originalException;
        if (error && typeof error === "object" && "message" in error) {
          // Example: ignore "Network request failed" errors
          const message = (error as { message: unknown }).message;
          if (
            typeof message === "string" &&
            message.includes("Network request failed")
          ) {
            return null;
          }
        }
        return event;
      },

      // Set to 'debug' during implementation to see verbose logs
      debug: false,

      // The newer Sentry versions handle integrations automatically
      // You don't need to specify BrowserTracing explicitly
    });
  } else {
    console.log("Sentry disabled in development mode");
  }
}
