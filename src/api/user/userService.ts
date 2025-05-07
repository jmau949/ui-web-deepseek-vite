import { api } from "../api";
import { handleApiError } from "@/lib/utils";
import {User, LoginCredentials} from '../../types/user'

// Define types for user authentication


// Login a user with validations and cookie-based authentication
export const loginUser = async ({
  email,
  password,
}: LoginCredentials): Promise<User> => {
  try {
    const response = await api.post<{ user: User }>(
      "/api/v1/users/login",
      { user: { email, password } },
      { withCredentials: true }
    );
    return response.data.user;
  } catch (error: any) {

    handleApiError(error, "Login failed. Please try again later.");
    throw error;
  }
};

// Register a new user
export const signupUser = async (userData: Partial<User>): Promise<User> => {
  try {
    const response = await api.post<{ user: User }>(
      "/api/v1/users",
      { user: userData },
      { withCredentials: true }
    );
    return response.data.user;
  } catch (error: any) {
    handleApiError(error, "Signup failed. Please try again later.");
    throw error;
  }
};

//confirm user after sign up
export const confirmUserAfterSignUp = async (
  email: string,
  confirmationCode: string
): Promise<void> => {
  try {
    await api.post<{ user: User }>(
      "/api/v1/users/confirm",
      {
        user: {
          email,
          confirmationCode,
        },
      },
      { withCredentials: true }
    );

    return;
  } catch (error: any) {
    handleApiError(error, "Confirmation failed. Please try again later.");
  }
};

// Update a user's profile
export const updateUser = async (userData: Partial<User>): Promise<User> => {
  try {
    const response = await api.put<{ user: User }>(
      "/api/v1/users",
      { user: userData },
      { withCredentials: true }
    );
    return response.data.user;
  } catch (error: any) {
    handleApiError(error, "Update failed. Please try again later.");
    throw error;
  }
};

// Logout a user (removes the auth cookie)
export const logoutUser = async (): Promise<void> => {
  try {
    await api.post("/api/v1/users/logout", {}, { withCredentials: true });
  } catch (error: any) {
    throw error;
  }
};

// Fetch the current user session
export const fetchCurrentUser = async (): Promise<User | null> => {
  try {
    const { data } = await api.get<{ user: User }>("/api/v1/users/me", {
      withCredentials: true,
    });
    return data?.user || null;
  } catch (error: any) {
    return null;
  }
};

export const forgotPassword = async (
  userData: Partial<User>
): Promise<void> => {
  try {
    await api.post(
      "/api/v1/users/forgot-password",
      { user: userData },
      { withCredentials: true }
    );
  } catch (error: any) {
    handleApiError(error, "Password reset failed. Please try again later.");
  }
};

export const resendConfirmationCode = async (email: string): Promise<void> => {
  try {
    await api.post(
      "/api/v1/users/resend-confirmation-code",
      { user: { email } },
      { withCredentials: true }
    );
  } catch (error: any) {
    handleApiError(
      error,
      "Resend confirmation code failed. Please try again later."
    );
  }
};

export const confirmForgotPassword = async (
  userData: Partial<User>
): Promise<void> => {
  try {
    await api.post(
      "/api/v1/users/confirm-forgot-password",
      { user: userData },
      { withCredentials: true }
    );
  } catch (error: any) {
    handleApiError(
      error,
      "Password reset confirmation failed. Please try again later."
    );
  }
};



export const refreshToken = async (): Promise<void> => {
  try {
    await api.post(
      "/api/v1/users/refresh-token",
      {},
      { withCredentials: true }
    );
  } catch (error: any) {
    handleApiError(error, "Token refresh failed. Please try again later.");
  }
};

export const sendEmailSupportMessage = async (
  message: string,
  email: string
): Promise<void> => {
  try {
    await api.post(
      "/api/v1/users/support",
      {
        message: message,
        email: email,
      },
      { withCredentials: true }
    );
  } catch (error: any) {
    handleApiError(error, "Token refresh failed. Please try again later.");
  }
};
