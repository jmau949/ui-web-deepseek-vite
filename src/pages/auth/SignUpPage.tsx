import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../auth/AuthProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { signupUser } from "../../api/user/userService";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useErrorHandler } from "@/hooks/useErrorHandler";

const signupSchema = z
  .object({
    firstName: z
      .string()
      .min(1, { message: "First name is required" })
      .max(50, { message: "First name must be less than 50 characters" }),
    lastName: z
      .string()
      .min(1, { message: "Last name is required" })
      .max(50, { message: "Last name must be less than 50 characters" }),
    email: z
      .string()
      .min(1, { message: "Email is required" })
      .email({ message: "Please enter a valid email address" }),
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

const useSignupForm = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [signupError, setSignupError] = useState(null);
  const { user } = useAuth();

  const form = useForm({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
    mode: "onChange",
  });

  // Watch password fields to trigger validation when either changes
  const password = form.watch("password");
  const confirmPassword = form.watch("confirmPassword");

  // Trigger validation on the confirmPassword field whenever password changes
  useEffect(() => {
    if (confirmPassword) {
      form.trigger("confirmPassword");
    }
  }, [password, confirmPassword, form]);

  useEffect(() => {
    if (user) navigate("/");
  }, [user, navigate]);

  const COMMON_ERROR_CODES = [
    "UsernameExistsException",
    "InvalidPasswordException",
    "InvalidParameterException",
    "TooManyRequestsException",
    "LimitExceededException",
  ];
  const handleError = useErrorHandler({ component: "SignUpPage" });
  const onSubmit = async (data: {
    email: string;
    firstName: string;
    lastName: string;
    password: string;
  }) => {
    setLoading(true);
    setSignupError(null);
    try {
      const userData = {
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        password: data.password,
      };
      await signupUser(userData);
      navigate("/confirm-email", {
        state: { email: data.email },
      });
    } catch (error: any) {
      setSignupError(error.message || "An unexpected error occurred");
      if (!COMMON_ERROR_CODES.includes(error.errorCode)) {
        handleError(error, "signupUser");
      }
    } finally {
      setLoading(false);
    }
  };

  return { form, loading, signupError, onSubmit };
};

const SignUpPage = () => {
  const { form, loading, signupError, onSubmit } = useSignupForm();
  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md">
        <h1 className="mb-6 text-2xl font-bold text-center">
          Create an Account
        </h1>

        {/* Animated error alert */}
        <div
          className={`transition-all duration-300 ${
            signupError
              ? "max-h-32 opacity-100"
              : "max-h-0 opacity-0 overflow-hidden"
          }`}
        >
          {signupError && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{signupError}</AlertDescription>
            </Alert>
          )}
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {[
              "firstName",
              "lastName",
              "email",
              "password",
              "confirmPassword",
            ].map((fieldName) => (
              <FormField
                key={fieldName}
                control={form.control}
                // @ts-ignore
                name={fieldName as keyof typeof signupSchema.shape}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {fieldName === "firstName"
                        ? "First Name"
                        : fieldName === "lastName"
                        ? "Last Name"
                        : fieldName === "email"
                        ? "Email"
                        : fieldName === "password"
                        ? "Password"
                        : "Confirm Password"}
                    </FormLabel>
                    <FormControl>
                      <Input
                        type={
                          fieldName.toLowerCase().includes("password")
                            ? "password"
                            : "text"
                        }
                        {...field}
                      />
                    </FormControl>
                    {/* Animated error messages */}
                    <div
                      className={`transition-all duration-300 ${
                        form.formState.errors[
                          fieldName as
                            | "firstName"
                            | "lastName"
                            | "email"
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
            ))}
            <Button
              type="submit"
              className="w-full"
              disabled={loading || !form.formState.isValid}
            >
              {loading ? "Creating account..." : "Sign Up"}
            </Button>
          </form>
        </Form>

        <div className="mt-6 text-center">
          <p>
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-blue-600 hover:text-blue-800 hover:underline"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;