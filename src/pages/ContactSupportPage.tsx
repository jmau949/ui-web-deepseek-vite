import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";
import { useErrorHandler } from "../hooks/useErrorHandler";
import { submitSupportRequest } from "../api/support/supportService";

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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle, AlertCircle, ArrowLeft } from "lucide-react";

const SUPPORT_CATEGORIES = [
  "Account Access",
  "Technical Issue",
  "Feature Request",
  "Billing",
  "Other",
];

const ContactSupportPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState<boolean>(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [statusMessage, setStatusMessage] = useState<string>("");
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    subject: "",
    message: "",
    category: SUPPORT_CATEGORIES[0],
  });

  const handleError = useErrorHandler({ component: "ContactSupportPage" });

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setStatusMessage("Please enter your name");
      return false;
    }
    if (!formData.email.trim()) {
      setStatusMessage("Please enter your email");
      return false;
    }
    if (!formData.subject.trim()) {
      setStatusMessage("Please enter a subject");
      return false;
    }
    if (!formData.message.trim()) {
      setStatusMessage("Please enter your message");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      setStatus("error");
      return;
    }

    setLoading(true);
    setStatus("idle");
    setStatusMessage("");

    try {
      await submitSupportRequest(formData);
      setStatus("success");
      setStatusMessage(
        "Your support request has been submitted successfully. We'll get back to you shortly."
      );
    } catch (error: any) {
      setStatus("error");
      setStatusMessage(
        error.message || "Failed to submit your request. Please try again."
      );
      handleError(error, "submitSupportRequest");
    } finally {
      setLoading(false);
    }
  };

  const renderStatusIcon = () => {
    switch (status) {
      case "success":
        return (
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
        );
      case "error":
        return <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />;
      default:
        return null;
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Contact Support</CardTitle>
          <CardDescription>How can we help you today?</CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {renderStatusIcon()}

          {/* Status Message */}
          <div
            className={`transition-all duration-300 ${
              statusMessage
                ? "max-h-32 opacity-100"
                : "max-h-0 opacity-0 overflow-hidden"
            }`}
          >
            {statusMessage && (
              <Alert
                variant={status === "error" ? "destructive" : "default"}
                className={
                  status === "success" ? "bg-green-50 border-green-200" : ""
                }
              >
                <AlertDescription>{statusMessage}</AlertDescription>
              </Alert>
            )}
          </div>

          {status !== "success" && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Your name"
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="your.email@example.com"
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  disabled={loading}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {SUPPORT_CATEGORIES.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  placeholder="Brief description of your issue"
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  placeholder="Please describe your issue in detail"
                  className="min-h-[120px]"
                  disabled={loading}
                />
              </div>

              <Button type="submit" disabled={loading} className="w-full">
                {loading ? (
                  <>
                    <Spinner className="mr-2 h-4 w-4" />
                    <span>Submitting...</span>
                  </>
                ) : (
                  "Submit Request"
                )}
              </Button>
            </form>
          )}
        </CardContent>

        <CardFooter className="flex justify-center">
          <Button
            variant="link"
            onClick={() => navigate(-1)}
            className="flex items-center text-sm"
          >
            <ArrowLeft className="mr-1 h-4 w-4" />
            Go Back
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ContactSupportPage;
