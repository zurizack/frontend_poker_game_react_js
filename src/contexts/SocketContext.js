// src/contexts/SocketContext.js
import { createContext, useContext, useEffect, useState, useCallback } from 'react'; // הוסף useCallback
import { io } from 'socket.io-client';
import { useSelector } from 'react-redux';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const authToken = useSelector((state) => state.user.authToken);

  // פונקציה ליצירת חיבור או חיבור מחדש
  const connectSocket = useCallback(() => {
    if (socket) {
      // אם קיים סוקט ישן, נתק אותו קודם
      socket.disconnect();
    }
    const newSocket = io('http://localhost:5000', {
      withCredentials: true,
      transports: ['websocket'],
      auth: { token: authToken }
    });
    setSocket(newSocket);
    console.log("Attempting to connect Socket.IO...");
  }, [socket]); // תלוי במופע הסוקט הנוכחי

  // ניתוק בעת ניתוק הקומפוננטה
  useEffect(() => {
    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [socket]); // מופעל רק כאשר אובייקט ה-socket משתנה

  // ניתן להתחבר בהתחלה או כאשר קוראים ל-connectSocket במפורש
  // אופציה 1: להתחבר אוטומטית בפעם הראשונה
  useEffect(() => {
    if (!socket) { // אם אין סוקט בכלל, צור אחד
      connectSocket();
    }
  }, [socket, connectSocket]); // תלוי ב-socket וב-connectSocket


  return (
    // חשוב לחשוף את connectSocket דרך ה-context!
    <SocketContext.Provider value={{ socket, connectSocket }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  return useContext(SocketContext);
};