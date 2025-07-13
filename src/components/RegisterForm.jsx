// src/components/RegisterForm.jsx
import React, { useState, useEffect } from "react"; // ✅ Import useEffect
import { useDispatch, useSelector } from "react-redux";
import { registerUser, clearRegistrationMessage } from "../redux/userSlice"; // ✅ Import clearRegistrationMessage
import { useNavigate, Link } from "react-router-dom";
import "./AuthForm.css";

/**
 * RegisterForm component allows new users to create an account.
 * It manages form state, dispatches registration action,
 * and redirects the user to the home page upon successful registration.
 */
function RegisterForm() {
  // Initialize form data state with empty fields
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    username: "",
    nickname: "",
    password: "",
    birth_date: "",
  });

  const dispatch = useDispatch();
  const navigate = useNavigate();
  // Select user status, error messages, authentication status, and registrationMessage from redux store
  const { status, error, authenticated, registrationMessage } = useSelector(
    (state) => state.user
  ); // ✅ Get registrationMessage

  /**
   * Updates the form data state when any input changes.
   * Uses the input's name attribute as the key.
   */
  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  /**
   * Handles form submission by preventing default behavior,
   * then dispatching the registerUser action with the current form data.
   */
  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(registerUser(formData));
  };

  /**
   * useEffect hook to navigate to '/home' if the user is authenticated.
   * This runs whenever 'authenticated' or 'navigate' changes.
   */
  useEffect(() => {
    if (authenticated) {
      navigate("/home");
    }
  }, [authenticated, navigate]);

  // ✅ New useEffect for registration feedback and redirect
  useEffect(() => {
    if (status === "succeeded" && registrationMessage) {
      // Registration successful
      alert(registrationMessage); // Display success message
      dispatch(clearRegistrationMessage()); // Clear message after display
      navigate("/"); // Redirect to login page
    } else if (status === "failed" && registrationMessage) {
      // Registration failed, display error
      alert(registrationMessage); // Display error message
      dispatch(clearRegistrationMessage()); // Clear message after display
    }
    // Clean up message on component unmount or when status changes
    return () => {
      dispatch(clearRegistrationMessage());
    };
  }, [status, registrationMessage, navigate, dispatch]); // Add dependencies

  return (
    <div className="auth-container">
      <div className="auth-welcome">
        <h1>Welcome to My Poker!</h1>
        <p>Create a new account to start playing.</p>
      </div>

      <div className="auth-form-section">
        <h2>Register</h2>
        <form onSubmit={handleSubmit} className="auth-form">
          <input
            type="text"
            name="first_name"
            placeholder="First Name"
            value={formData.first_name}
            onChange={handleChange}
            className="auth-input"
            required
          />
          <input
            type="text"
            name="last_name"
            placeholder="Last Name"
            value={formData.last_name}
            onChange={handleChange}
            className="auth-input"
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            className="auth-input"
            required
          />
          <input
            type="text"
            name="username"
            placeholder="Username (for login)"
            value={formData.username}
            onChange={handleChange}
            className="auth-input"
            required
          />
          <input
            type="text"
            name="nickname"
            placeholder="Nickname (display name)"
            value={formData.nickname}
            onChange={handleChange}
            className="auth-input"
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            className="auth-input"
            required
          />
          <input
            type="date"
            name="birth_date"
            value={formData.birth_date}
            onChange={handleChange}
            className="auth-input"
            required
          />

          <button
            type="submit"
            className="auth-button"
            disabled={status === "loading"}
          >
            {status === "loading" ? "Registering..." : "Register"}
          </button>

          <p style={{ fontSize: "0.9rem", marginTop: "10px" }}>
            Already registered? <Link to="/">Login here</Link>
          </p>
        </form>

        {/* ✅ Display error message from registrationMessage if status is failed */}
        {/* The general 'error' state is still useful for other thunks */}
        {/* {error && <p style={{ color: 'red' }}>{error}</p>} */}
      </div>
    </div>
  );
}

export default RegisterForm;
