// src/axiosConfig.js

import axios from "axios";

// Create an axios instance with default configuration
const axiosInstance = axios.create({
  baseURL: "http://localhost:5000", // Backend server URL
  withCredentials: true, // Important for sending cookies/session with requests
  headers: {
    "Content-Type": "application/json", // Set JSON as the content type for requests
    Accept: "application/json", // Expect JSON responses
  },
});

export default axiosInstance;
