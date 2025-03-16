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
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 container mx-auto p-4 md:p-6">{children}</main>
    </div>
  );
};

export default AuthenticatedLayout;
