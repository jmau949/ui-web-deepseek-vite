import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
  FormLabel,

} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { confirmForgotPassword } from "@/api/user/userService";
import { useErrorHandler } from "@/hooks/useErrorHandler";

const resetPasswordSchema = z
  .object({
    email: z
      .string()
      .min(1, { message: "Email is required" })
      .email({ message: "Please enter a valid email address" }),
    code: z
      .string()
      .min(1, { message: "Verification code is required" })
      .regex(/^\d+$/, { message: "Code must contain only numbers" }),
    password: z
      .string()
      .min(8, { message: "Password must be at least 8 characters" })
      .regex(/[A-Z]/, {
        message: "Password must contain at least one uppercase letter",
      })
      .regex(/[a-z]/, {
        message: "Password must contain at least one lowercase letter",
      })
      .regex(/[0-9]/, { message: "Password must contain at least one number" })
      .regex(/[^A-Za-z0-9]/, {
        message: "Password must contain at least one special character",
      }),
    confirmPassword: z
      .string()
      .min(1, { message: "Please confirm your password" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

const useResetPasswordForm = (defaultEmail: string = "") => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  const form = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      email: defaultEmail,
      code: "",
      password: "",
      confirmPassword: "",
    },
    mode: "onChange",
  });

  const handleError = useErrorHandler({ component: "ResetPasswordPage" });

  const onSubmit = async (data: ResetPasswordFormValues) => {
    setLoading(true);
    setError(null);

    try {
      await confirmForgotPassword({
        email: data.email,
        code: data.code,
        password: data.password,
      });
      setSuccess(true);
    } catch (error: any) {
      const errorCode: string = error.errorCode || "UnknownError";
      let userFriendlyMessage = "Failed to reset password. Please try again.";

      if (
        ["CodeMismatchException", "ExpiredCodeException"].includes(errorCode)
      ) {
        userFriendlyMessage =
          "The verification code is invalid or has expired.";
      } else if (
        ["InvalidPasswordException", "InvalidParameterException"].includes(
          errorCode
        )
      ) {
        userFriendlyMessage =
          "Your password doesn't meet the requirements. Please try a different password.";
      } else if (errorCode === "NetworkError") {
        userFriendlyMessage =
          "Network error. Please check your connection and try again.";
      } else {
        handleError(error, "confirmForgotPassword");
      }

      setError(userFriendlyMessage);
    } finally {
      setLoading(false);
    }
  };

  return { form, loading, error, success, onSubmit };
};

const ResetPasswordPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const email = searchParams.get("email") || "";

  const { form, loading, error, success, onSubmit } =
    useResetPasswordForm(email);
  const codeInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    codeInputRef.current?.focus();
  }, []);

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md">
        <h1 className="mb-4 text-2xl font-bold text-center">
          Reset Your Password
        </h1>

        {success ? (
          <div className="space-y-4">
            <Alert variant="default" className="mb-3">
              <AlertDescription>
                Your password has been successfully reset. You can now log in
                with your new password.
              </AlertDescription>
            </Alert>
            <Button onClick={() => navigate("/login")} className="w-full">
              Go to Login
            </Button>
          </div>
        ) : (
          <>
            <p className="mb-4 text-gray-600">
              Enter the verification code sent to your email along with your new
              password.
            </p>

            {/* Animated Error Message */}
            <div
              className={`transition-all duration-300 ${
                error
                  ? "max-h-32 opacity-100"
                  : "max-h-0 opacity-0 overflow-hidden"
              }`}
            >
              {error && (
                <Alert variant="destructive" className="mb-3">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </div>

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                {["email", "code", "password", "confirmPassword"].map(
                  (fieldName) => (
                    <FormField
                      key={fieldName}
                      control={form.control}
                      name={fieldName as keyof ResetPasswordFormValues}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel htmlFor={fieldName}>
                            {fieldName === "email"
                              ? "Email"
                              : fieldName === "code"
                              ? "Verification Code"
                              : fieldName === "password"
                              ? "New Password"
                              : "Confirm Password"}
                          </FormLabel>
                          <FormControl>
                            <Input
                              id={fieldName}
                              type={
                                fieldName.includes("password")
                                  ? "password"
                                  : "text"
                              }
                              autoComplete={
                                fieldName === "code" ? "one-time-code" : "off"
                              }
                              disabled={
                                loading || (fieldName === "email" && !!email)
                              }
                              {...field}
                              ref={
                                fieldName === "code"
                                  ? (e) => {
                                      field.ref(e);
                                      if (codeInputRef.current !== e)
                                        codeInputRef.current = e;
                                    }
                                  : field.ref
                              }
                            />
                          </FormControl>
                          {/* Animated Error Messages */}
                          <div
                            className={`transition-all duration-300 ${
                              form.formState.errors[
                                fieldName as
                                  | "email"
                                  | "code"
                                  | "password"
                                  | "confirmPassword"
                              ]
                                ? "max-h-16 opacity-100"
                                : "max-h-0 opacity-0 overflow-hidden"
                            }`}
                          >
                            <FormMessage />
                          </div>
                        </FormItem>
                      )}
                    />
                  )
                )}

                <Button
                  type="submit"
                  className="w-full"
                  disabled={loading || !form.formState.isValid}
                >
                  {loading ? (
                    <>
                      <Spinner className="mr-2 h-4 w-4" />
                      <span>Resetting Password...</span>
                    </>
                  ) : (
                    "Reset Password"
                  )}
                </Button>
              </form>
            </Form>

            <div className="mt-4 text-center">
              <p>
                Didn't receive a code?{" "}
                <Link
                  to="/forgot-password"
                  className="text-blue-600 hover:text-blue-800 hover:underline"
                >
                  Request a new code
                </Link>
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ResetPasswordPage;
