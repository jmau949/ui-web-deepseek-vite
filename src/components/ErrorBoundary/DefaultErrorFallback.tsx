import React from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

interface DefaultErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

const DefaultErrorFallback: React.FC<DefaultErrorFallbackProps> = ({
  error,
  resetErrorBoundary,
}) => {
  return (
    <div className="flex items-center justify-center min-h-screen p-6 bg-gradient-to-br from-red-50 to-gray-100">
      <Card className="w-full max-w-md shadow-lg border border-gray-200">
        <CardHeader className="border-b border-gray-200 pb-4">
          <CardTitle className="text-2xl font-bold text-destructive">
            Oops! Something went wrong.
          </CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            An unexpected error has occurred.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 p-6">
          <div className="bg-red-50 p-4 rounded-md border border-red-200">
            <pre className="whitespace-pre-wrap break-words text-sm text-red-600">
              {error.message}
            </pre>
          </div>
          <Button
            onClick={resetErrorBoundary}
            className="w-full hover:bg-destructive/90 transition-colors"
          >
            Try Again
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default DefaultErrorFallback;
