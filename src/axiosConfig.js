// src/axiosConfig.js
import axios from "axios";

// קביעת כתובת ה-URL הבסיסית של ה-API בהתבסס על הסביבה.
// בפיתוח (כשאתה מריץ npm start מקומית), process.env.NODE_ENV הוא 'development'.
// בייצור (לאחר 'npm run build' ופריסה ל-Render), process.env.NODE_ENV הוא 'production'.
const API_BASE_URL = process.env.NODE_ENV === 'production'
  ? 'https://poker-game-mknp.onrender.com' // ✅ כתובת ה-URL של הבאקאנד הפרוס שלך ב-Render
  : 'http://localhost:5000'; // ✅ כתובת ה-URL של הבאקאנד המקומי שלך

// יצירת מופע axios עם הגדרות ברירת מחדל
const axiosInstance = axios.create({
  baseURL: API_BASE_URL, // השתמש בכתובת ה-URL הדינמית
  withCredentials: true, // חשוב לשליחת עוגיות/סשן עם בקשות Cross-Origin
  headers: {
    "Content-Type": "application/json", // הגדר JSON כסוג התוכן לבקשות
    Accept: "application/json", // צפה לתגובות JSON
  },
});

export default axiosInstance;