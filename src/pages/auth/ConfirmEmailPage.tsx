import { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useAuth } from "../../auth/AuthProvider";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CheckCircle, AlertCircle, Clock, RefreshCw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  confirmUserAfterSignUp,
  logoutUser,
  resendConfirmationCode,
} from "@/api/user/userService";
import { useErrorHandler } from "@/hooks/useErrorHandler";

const ConfirmEmailPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState<boolean>(false);
  const [resendLoading, setResendLoading] = useState<boolean>(false);
  const [verificationStatus, setVerificationStatus] = useState<
    "pending" | "success" | "error"
  >("pending");
  const [statusMessage, setStatusMessage] = useState<string>("");
  const [confirmationCode, setConfirmationCode] = useState<string>("");
  const location = useLocation();
  const email = location.state?.email || "";

  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  const handleError = useErrorHandler({ component: "ConfirmEmailPage" });

  const handleVerifyEmail = async () => {
    if (!confirmationCode.trim()) {
      setStatusMessage("Please enter the verification code");
      return;
    }

    setLoading(true);
    setStatusMessage("");

    try {
      await confirmUserAfterSignUp(email, confirmationCode);
      setVerificationStatus("success");
      setStatusMessage("Your email has been verified successfully!");
      setTimeout(() => navigate("/login"), 2000);
    } catch (error: any) {
      setVerificationStatus("error");

      if (error.code === "CodeMismatchException") {
        setStatusMessage("Invalid verification code. Please try again.");
      } else if (error.code === "ExpiredCodeException") {
        setStatusMessage(
          "Verification code has expired. Please request a new one."
        );
      } else if (error.code === "UserNotFoundException") {
        setStatusMessage("User Not Found");
      } else {
        setStatusMessage(
          error.message || "An error occurred during verification"
        );
        handleError(error, "confirmUserAfterSignUp");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    setResendLoading(true);
    setStatusMessage("");

    try {
      await resendConfirmationCode(email);
      setStatusMessage("A new verification code has been sent to your email.");
    } catch (error: any) {
      setVerificationStatus("error");

      if (error.code === "LimitExceededException") {
        setStatusMessage("Too many attempts. Please try again later.");
      } else {
        setStatusMessage(
          error.message || "Failed to resend verification code."
        );
      }
    } finally {
      setResendLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
      navigate("/login");
    } catch (error) {
      console.error("Logout error", error);
    }
  };

  const renderStatusIcon = () => {
    switch (verificationStatus) {
      case "success":
        return (
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
        );
      case "error":
        return <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />;
      default:
        return <Clock className="h-16 w-16 text-blue-500 mx-auto mb-4" />;
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">
            Verify Your Email
          </CardTitle>
          {email && (
            <CardDescription>
              We've sent a verification code to {email}
            </CardDescription>
          )}
        </CardHeader>

        <CardContent className="space-y-4">
          {renderStatusIcon()}

          {/* Animated Status Message */}
          <div
            className={`transition-all duration-300 ${
              statusMessage
                ? "max-h-32 opacity-100"
                : "max-h-0 opacity-0 overflow-hidden"
            }`}
          >
            {statusMessage && (
              <Alert
                variant={
                  verificationStatus === "error" ? "destructive" : "default"
                }
                className={
                  verificationStatus === "success"
                    ? "bg-green-50 border-green-200"
                    : ""
                }
              >
                <AlertDescription>{statusMessage}</AlertDescription>
              </Alert>
            )}
          </div>

          <div className="text-center space-y-2">
            <p className="text-gray-600">
              Please check your email inbox and enter the verification code
              below.
            </p>
            <p className="text-sm text-gray-500">
              If you don't see the email, check your spam folder.
            </p>
          </div>

          <div className="space-y-3">
            <div className="space-y-1">
              <Label htmlFor="verification-code">Verification Code</Label>
              <Input
                id="verification-code"
                type="text"
                placeholder="Enter verification code"
                value={confirmationCode}
                onChange={(e) => setConfirmationCode(e.target.value)}
              />
            </div>

            <Button
              onClick={handleVerifyEmail}
              disabled={loading || !confirmationCode.trim()}
              className="w-full"
            >
              {loading ? (
                <>
                  <Spinner className="mr-2 h-4 w-4" />
                  <span>Verifying...</span>
                </>
              ) : (
                "Verify Email"
              )}
            </Button>

            <Button
              onClick={handleResendVerification}
              disabled={resendLoading}
              variant="outline"
              className="w-full flex items-center justify-center"
            >
              {resendLoading ? (
                <>
                  <Spinner className="mr-2 h-4 w-4" />
                  <span>Sending...</span>
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  <span>Resend verification code</span>
                </>
              )}
            </Button>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col">
          <div className="text-center w-full text-sm text-gray-500">
            <Button variant="link" onClick={handleLogout} className="text-sm">
              Use a different account
            </Button>
            <span className="mx-2">•</span>
            <Link
              to="/contact-support"
              className="text-blue-600 hover:text-blue-800 hover:underline text-sm"
            >
              Need help?
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ConfirmEmailPage;
