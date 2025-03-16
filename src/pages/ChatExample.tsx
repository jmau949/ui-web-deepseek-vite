import React, { useState } from "react";
import WebSocketChat from "./WebSocketChat";

/**
 * Example component showing how to use the WebSocketChat component
 */
const ChatExample: React.FC = () => {
  const [username, setUsername] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Handle authentication errors from the WebSocket connection
  const handleAuthError = (error: string) => {
    console.error("Authentication error:", error);
    setIsLoggedIn(false);

    // In a real app, you'd redirect to login or show a notification
    alert(`Authentication failed: ${error}. Please log in again.`);
  };

  // Handle login form submission
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim()) {
      setIsLoggedIn(true);
    }
  };

  return (
    <div className="chat-example">
      <h1>WebSocket Chat Example</h1>

      {!isLoggedIn ? (
        <div className="login-form">
          <h2>Enter your username to start chatting</h2>
          <form onSubmit={handleLogin}>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Your username"
              required
            />
            <p className="auth-info">
              Using JWT token from HTTP-only cookie for authentication
            </p>
            <button type="submit">Join Chat</button>
          </form>
        </div>
      ) : (
        <div className="chat-wrapper">
          <p>
            Logged in as: <strong>{username}</strong>
          </p>
          <WebSocketChat
            websocketUrl="ws://localhost:3000"
            username={username}
            onAuthError={handleAuthError}
          />
          <button
            className="logout-button"
            onClick={() => setIsLoggedIn(false)}
          >
            Logout
          </button>
        </div>
      )}

      {/* Basic styles - in production you'd use a proper CSS/SCSS file */}
      <style>{`
        .chat-example {
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
            Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
        }

        h1 {
          text-align: center;
          color: #333;
        }

        .login-form {
          max-width: 400px;
          margin: 40px auto;
          padding: 20px;
          border: 1px solid #ddd;
          border-radius: 8px;
          text-align: center;
        }

        .login-form h2 {
          margin-top: 0;
          font-size: 20px;
          color: #444;
        }

        .login-form input {
          width: 100%;
          padding: 10px;
          margin-bottom: 15px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 16px;
        }

        .auth-info {
          font-size: 14px;
          color: #666;
          margin-bottom: 15px;
        }

        .login-form button {
          padding: 10px 20px;
          background: #0070f3;
          color: white;
          border: none;
          border-radius: 4px;
          font-size: 16px;
          cursor: pointer;
        }

        .login-form button:hover {
          background: #0051a8;
        }

        .chat-wrapper {
          margin: 20px 0;
        }

        .logout-button {
          margin-top: 10px;
          padding: 8px 16px;
          background: #dc3545;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }

        .logout-button:hover {
          background: #bd2130;
        }
      `}</style>
    </div>
  );
};

export default ChatExample;
