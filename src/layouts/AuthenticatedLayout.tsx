import React, { ReactNode } from "react";
import Navbar from "../components/Navbar";

interface AuthenticatedLayoutProps {
  children: ReactNode;
}

/**
 * Layout component for authenticated pages
 * Includes the navigation bar and wraps authenticated content
 */
const AuthenticatedLayout: React.FC<AuthenticatedLayoutProps> = ({
  children,
}) => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      {children}
    </div>
  );
};

export default AuthenticatedLayout;
