// src/components/LoginForm.jsx
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loginUser } from "../redux/userSlice";
import { useNavigate, Link } from "react-router-dom";
import { useSocket } from "../contexts/SocketContext"; // <--- ייבוא חדש!

import "./AuthForm.css";

function LoginForm() {
  const [inputNickname, setInputNickname] = useState("");
  const [password, setPassword] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { connectSocket } = useSocket(); // <--- קבלת הפונקציה מהקונטקסט

  const { status, error, nickname, authenticated } = useSelector(
    (state) => state.user
  );

  useEffect(() => {
    if (authenticated) {
      // אם כבר מאומת, נווט לדף הבית.
      // חשוב לוודא שה-socket מתחבר מחדש גם אם מגיעים לדף ה-home כשהוא כבר מאומת (לדוגמה, אחרי רענון דף).
      // ניתן לעשות זאת ב-App.js או בקומפוננטת ה-layout הראשית.
      console.log(
        "User is authenticated, navigating to /home and attempting to connect socket."
      );
      connectSocket(); // <--- קריאה לחיבור סוקט ברגע שהמשתמש מאומת
      navigate("/home");
    }
  }, [authenticated, navigate, connectSocket]); // הוסף connectSocket לתלויות

  const handleSubmit = async (e) => {
    // הפוך ל-async
    e.preventDefault();
    const resultAction = await dispatch(
      loginUser({ nickname: inputNickname, password })
    ); // המתן לתוצאה

    if (loginUser.fulfilled.match(resultAction)) {
      // אם ה-login הצליח (status 200)
      console.log("Login successful! Attempting to reconnect socket...");
      // *** זה השלב הקריטי: חיבור מחדש של הסוקט לאחר ה-login ***
      connectSocket(); // <--- קריאה לחיבור סוקט לאחר שה-HTTP login הצליח
      // הניווט כבר יטופל ב-useEffect למעלה
    } else {
      console.error("Login failed or rejected.");
      // טיפול בשגיאת לוגין (הודעה למשתמש וכו')
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
            placeholder="Nickname"
            value={inputNickname}
            onChange={(e) => setInputNickname(e.target.value)}
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
        {authenticated && (
          <p style={{ color: "green" }}>Welcome, {nickname}!</p>
        )}
      </div>
    </div>
  );
}

export default LoginForm;
