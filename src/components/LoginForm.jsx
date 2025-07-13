// src/components/LoginForm.jsx
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loginUser } from "../redux/userSlice";
import { useNavigate, Link } from "react-router-dom";
import { useSocket } from "../contexts/SocketContext";

import "./AuthForm.css";

function LoginForm() {
  const [inputUsername, setInputUsername] = useState("");
  const [password, setPassword] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { connectSocket } = useSocket();

  const { status, error, username, authenticated } = useSelector(
    (state) => state.user
  );

  useEffect(() => {
    if (authenticated) {
      console.log(
        "User is authenticated, navigating to /home and attempting to connect socket."
      );
      connectSocket();
      navigate("/home");
    }
  }, [authenticated, navigate, connectSocket]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const resultAction = await dispatch(
      loginUser({ username: inputUsername, password })
    );

    if (loginUser.fulfilled.match(resultAction)) {
      console.log("Login successful! Attempting to reconnect socket...");
      connectSocket();
    } else {
      console.error("Login failed or rejected.");
    }
  };

  return (
    <div className="auth-container">
      {/* Welcome Section */}
      <div className="auth-welcome">
        <h1>Welcome to My Poker!</h1>
        <p>Log in to start playing.</p>
      </div>

      {/* Login Section */}
      <div className="auth-form-section">
        <h2>Login</h2>
        <form onSubmit={handleSubmit} className="auth-form">
          <input
            type="text"
            placeholder="Username"
            value={inputUsername}
            onChange={(e) => setInputUsername(e.target.value)}
            className="auth-input"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="auth-input"
            required
          />
          <button type="submit" className="auth-button">
            {status === "loading" ? "Logging in..." : "Log In"}
          </button>

          <p style={{ fontSize: "0.9rem", marginTop: "10px" }}>
            Not registered yet? <Link to="/register">Click here</Link> to sign
            up.
          </p>
        </form>

        {error && <p style={{ color: "red" }}>{error}</p>}
        {/* ✅ Moved comment to a separate line */}
        {authenticated && (
          <p style={{ color: "green" }}>Welcome, {username}!</p>
        )}
      </div>
    </div>
  );
}

export default LoginForm;
