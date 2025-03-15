import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import {
  loginUser,
  fetchCurrentUser,
  logoutUser,
} from "../api/user/userService";

interface AuthContextType {
  user: any | null;
  loading: boolean;
  authChecked: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

// Create the authentication context with a default value of undefined.
// The context will be used to share auth state and functions with child components.
const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

// The AuthProvider component wraps its children with AuthContext.Provider.
// It manages authentication state and provides login and logout functionalities.
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  // State variable to hold the current user's information; null if no user is logged in.
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  // State variable to track if the initial authentication check with the server has been completed.
  const [authChecked, setAuthChecked] = useState<boolean>(false);

  // useEffect runs after the component mounts to perform the initial authentication check.
  useEffect(() => {
    // Attempt to retrieve a cached user from localStorage for immediate UI feedback.
    const cachedUser = localStorage.getItem("cachedUser");
    if (cachedUser) {
      try {
        // Parse the cached JSON and update the user state.
        setUser(JSON.parse(cachedUser));
        // Note: We don't stop the loading state here because we still need to verify with the server.
      } catch (e) {
        // If the cached data is corrupt or invalid, remove it from localStorage.
        localStorage.removeItem("cachedUser");
      }
    }

    // Define an asynchronous function to fetch the current user from the server.
    const loadUser = async () => {
      try {
        // Call the API to fetch the current user's data.
        const currentUser = await fetchCurrentUser();
        // Update the user state with the fetched data (or null if not authenticated).
        setUser(currentUser);
        if (currentUser) {
          // If user data is available, cache it in localStorage for quicker access in the future.
          localStorage.setItem("cachedUser", JSON.stringify(currentUser));
        } else {
          // Remove cached data if the user is not authenticated.
          localStorage.removeItem("cachedUser");
        }
      } catch (error) {
        // On error (e.g., network failure), clear any user state and cached data.
        setUser(null);
        localStorage.removeItem("cachedUser");
      } finally {
        // Regardless of success or error, update loading and authChecked flags.
        setLoading(false);
        setAuthChecked(true);
      }
    };

    // Execute the asynchronous function to load the user.
    loadUser();
  }, []); // The empty dependency array ensures this effect runs only once on mount.


  const login = async (email: string, password: string) => {
    // Set loading to true to indicate the login process has started.
    setLoading(true);
    try {
      // Call the API to log in the user with the given credentials.
      await loginUser({ email, password });
      // After a successful login, fetch the current user data from the server.
      const currentUser = await fetchCurrentUser();
      if (!currentUser) {
        // If no user data is returned, throw an error.
        throw new Error("User data not returned after login.");
      }
      // Update the user state with the current user information.
      setUser(currentUser);
      // Cache the user data in localStorage for faster subsequent loads.
      localStorage.setItem("cachedUser", JSON.stringify(currentUser));
    } catch (error) {
      // Log any error that occurs during login and rethrow it to be handled by the caller.
      console.error("login error", error);
      throw error;
    } finally {
      // Set loading to false once the login process is complete (whether successful or not).
      setLoading(false);
    }
  };

  // Define the logout function to sign out the current user.
  const logout = async () => {
    // Set loading to true to indicate the logout process has started.
    setLoading(true);
    try {
      // Call the API to log out the user.
      await logoutUser();
      // Clear the user state after a successful logout.
      setUser(null);
      // Remove any cached user data from localStorage.
      localStorage.removeItem("cachedUser");
    } catch (error) {
      // Log any error that occurs during logout.
      console.error("Logout failed:", error);
    } finally {
      // Set loading to false once the logout process is complete.
      setLoading(false);
    }
  };

  // Return the AuthContext.Provider component that passes down the auth state and functions.
  // Any child component wrapped with AuthProvider can access this context.
  return (
    <AuthContext.Provider value={{ user, loading, authChecked, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to access the authentication context.
// It ensures that the hook is used within a valid AuthProvider context.
export const useAuth = (): AuthContextType => {
  // Use the React hook to consume the authentication context.
  const context = useContext(AuthContext);
  // If the context is not defined, it means the hook is being used outside of an AuthProvider.
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  // Return the context which includes the user, loading state, auth check flag, and auth functions.
  return context;
};
