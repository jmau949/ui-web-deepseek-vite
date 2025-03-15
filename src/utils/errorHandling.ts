export const logError = (error: unknown, customMessage: string = ""): void => {
  console.error(customMessage, error);
  // Add custom error logging for production, such as sending logs to a logging service (e.g., Sentry, Datadog)
};

export const notifyAdmin = (message: string, error: unknown): void => {
  console.log("Notify admin: ", message, error);
  // Implement your notification logic here (e.g., sending alerts to monitoring tools like CloudWatch)
};
