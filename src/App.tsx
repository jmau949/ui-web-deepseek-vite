import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import RootLayout from "./layouts/RootLayout";
import PrivateRoute from "./components/PrivateRoute";
import AuthenticatedLayout from "./layouts/AuthenticatedLayout";
import { AuthProvider } from "./auth/AuthProvider";
import ErrorBoundary from "./components/ErrorBoundary/ErrorBoundary";
import { Provider } from "react-redux";
import { store, persistor } from "./redux/store";
import { PersistGate } from "redux-persist/integration/react";

// Direct imports instead of lazy loading
import HomePage from "./pages/HomePage";
import PublicChatPage from "./pages/PublicChatPage";
import LoginPage from "./pages/auth/LoginPage";
import SignUpPage from "./pages/auth/SignUpPage";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage";
import ConfirmEmailPage from "./pages/auth/ConfirmEmailPage";
import ResetPasswordPage from "./pages/auth/ResetPasswordPage";
import ContactSupportPage from "./pages/ContactSupportPage";
import NotFoundPage from "./pages/errors/NotFoundPage";

/**
 * Main application component handling routing and global providers
 */
const App: React.FC = () => (
  <ErrorBoundary>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <AuthProvider>
          <Router>
            <RootLayout>
              <Routes>
                {/* Public routes */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignUpPage />} />
                <Route
                  path="/forgot-password"
                  element={<ForgotPasswordPage />}
                />
                <Route path="/confirm-email" element={<ConfirmEmailPage />} />
                <Route path="/reset-password" element={<ResetPasswordPage />} />
                <Route
                  path="/contact-support"
                  element={<ContactSupportPage />}
                />
                {/* Public chat route */}
                <Route path="/chat" element={<PublicChatPage />} />

                {/* Private routes with AuthenticatedLayout */}
                <Route
                  path="/"
                  element={
                    <PrivateRoute>
                      <AuthenticatedLayout>
                        <HomePage />
                      </AuthenticatedLayout>
                    </PrivateRoute>
                  }
                />
                {/* Catch-all route */}
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </RootLayout>
          </Router>
        </AuthProvider>
      </PersistGate>
    </Provider>
  </ErrorBoundary>
);

export default App;
