// src/services/authService.js
import axios from "../axiosConfig";

/**
 * Registers a new user by sending user data to the backend.
 * @param {Object} userData - The registration data (e.g., name, email, password).
 * @returns {Promise<Object>} - Response data from the server.
 */
const register = async (userData) => {
  const res = await axios.post("/auth/register", userData);
  return res.data;
};

/**
 * Logs in a user with provided credentials.
 * @param {Object} credentials - The login credentials (e.g., nickname/email and password).
 * @returns {Promise<Object>} - Response data from the server.
 */
const login = async (credentials) => {
  const res = await axios.post("/auth/login", credentials);
  return res.data;
};

/**
 * Checks whether the current user is authenticated.
 * @returns {Promise<Object>} - Authentication status and user info.
 */
const checkAuth = async () => {
  const res = await axios.get("/game/check_auth");
  return res.data;
};

/**
 * Logs out the current user.
 * @returns {Promise<Object>} - Response data confirming logout.
 */
const logout = async () => {
  const res = await axios.post("/auth/logout");
  return res.data;
};

export default {
  login,
  checkAuth,
  logout,
  register,
};
