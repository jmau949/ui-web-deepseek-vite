import { ErrorBoundary as ReactErrorBoundary } from "react-error-boundary";
import DefaultErrorFallback from "./DefaultErrorFallback";
import ErrorLoggingService from "./errorLoggingService";

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

const ErrorBoundary: React.FC<ErrorBoundaryProps> = ({
  children,
  fallback,
}) => {
  return (
    <ReactErrorBoundary
      FallbackComponent={
        fallback ? () => <>{fallback}</> : DefaultErrorFallback
      }
      onError={(error, info) => {
        // Log the error to your error tracking service
        ErrorLoggingService.logError(error, info, {
          source: "react-error-boundary",
        });
      }}
    >
      {children}
    </ReactErrorBoundary>
  );
};

export default ErrorBoundary;
