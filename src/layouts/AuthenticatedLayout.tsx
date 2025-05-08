import React, { ReactNode } from "react";
// import Navbar from "../components/Navbar"; // Navbar will be in RootLayout

interface AuthenticatedLayoutProps {
  children: ReactNode;
}

/**
 * Layout component for authenticated pages
 * Wraps authenticated content. Navbar is handled by RootLayout.
 */
const AuthenticatedLayout: React.FC<AuthenticatedLayoutProps> = ({
  children,
}) => {
  return (
    <div className="min-h-screen flex flex-col">
      {/* <Navbar /> */}
      {children}
    </div>
  );
};

export default AuthenticatedLayout;
