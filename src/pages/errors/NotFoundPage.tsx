import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

const NotFoundPage: React.FC = () => {
  return (
    <div className="flex items-center justify-center h-screen bg-gray-100 dark:bg-gray-900">
      <Card className="w-full max-w-lg p-6 shadow-lg border border-gray-200 dark:border-gray-700">
        <CardContent className="flex flex-col items-center text-center">
          <AlertCircle className="w-16 h-16 text-red-500 dark:text-red-400" />
          <h1 className="mt-4 text-4xl font-bold text-gray-800 dark:text-white">
            404 - Page Not Found
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-300">
            The page you're looking for doesn't exist or has been moved.
          </p>
          <Button asChild className="mt-6">
            <Link to="/">Go Back Home</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotFoundPage;
