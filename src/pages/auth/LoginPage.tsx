import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../auth/AuthProvider";
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
import { useErrorHandler } from "@/hooks/useErrorHandler";

const loginSchema = z.object({
  email: z
    .string()
    .min(1, { message: "Email is required" })
    .email({ message: "Please enter a valid email address" }),
  password: z
    .string()
    .min(1, { message: "Password is required" })
    .min(6, { message: "Password must be at least 6 characters" }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const useLoginForm = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const { user, login } = useAuth();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
    mode: "onChange",
  });

  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  const handleError = useErrorHandler({ component: "LoginPage" });
  const commonErrorCodes = [
    "UserNotConfirmedException",
    "PasswordResetRequiredException",
    "NotAuthorizedException",
    "UserNotFoundException",
  ];

  const onSubmit = async (data: LoginFormValues) => {
    setLoading(true);
    setLoginError(null);
    try {
      await login(data.email, data.password);
      navigate("/");
    } catch (error: any) {
      if (error?.message?.includes("User not confirmed")) {
        navigate("/confirm-email", { state: { email: data.email } });
        return;
      }
      if (error?.message?.includes("Password reset required")) {
        navigate("/reset-password", { state: { email: data.email } });
        return;
      }
      setLoginError(error.message || "An unexpected error occurred");

      if (error.errorCode && !commonErrorCodes.includes(error.errorCode)) {
        handleError(error, "login");
      }
    } finally {
      setLoading(false);
    }
  };

  return {
    form,
    loading,
    loginError,
    onSubmit,
  };
};

const LoginPage: React.FC = () => {
  const { form, loading, loginError, onSubmit } = useLoginForm();
  const emailInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    emailInputRef.current?.focus();
  }, []);

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md">
        <h1 className="mb-4 text-2xl font-bold text-center">Sign In</h1>

        {/* Animated Error Message */}
        <div
          className={`transition-all duration-300 ${
            loginError
              ? "max-h-32 opacity-100"
              : "max-h-0 opacity-0 overflow-hidden"
          }`}
        >
          {loginError && (
            <Alert variant="destructive" className="mb-3">
              <AlertDescription>{loginError}</AlertDescription>
            </Alert>
          )}
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="email">Email</FormLabel>
                  <FormControl>
                    <Input
                      id="email"
                      type="email"
                      autoComplete="email"
                      disabled={loading}
                      {...field}
                      ref={(e) => {
                        field.ref(e);
                        if (emailInputRef.current !== e) {
                          emailInputRef.current = e;
                        }
                      }}
                    />
                  </FormControl>
                  {/* Animated Error Message */}
                  <div
                    className={`transition-all duration-300 ${
                      form.formState.errors.email
                        ? "max-h-16 opacity-100"
                        : "max-h-0 opacity-0 overflow-hidden"
                    }`}
                  >
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <div className="flex justify-between items-center">
                    <FormLabel htmlFor="password">Password</FormLabel>
                    <Link
                      to="/forgot-password"
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <FormControl>
                    <Input
                      id="password"
                      type="password"
                      autoComplete="current-password"
                      disabled={loading}
                      {...field}
                    />
                  </FormControl>
                  {/* Animated Error Message */}
                  <div
                    className={`transition-all duration-300 ${
                      form.formState.errors.password
                        ? "max-h-16 opacity-100"
                        : "max-h-0 opacity-0 overflow-hidden"
                    }`}
                  >
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full"
              disabled={loading || !form.formState.isValid}
            >
              {loading ? (
                <>
                  <Spinner className="mr-2 h-4 w-4" />
                  <span>Signing in...</span>
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>
        </Form>

        <div className="mt-4 text-center">
          <p>
            Don't have an account?{" "}
            <Link to="/signup" className="text-blue-600 hover:text-blue-800">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
