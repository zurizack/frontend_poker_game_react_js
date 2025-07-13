// src/contexts/SocketContext.js
import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { io } from 'socket.io-client';
import { useSelector } from 'react-redux';

const SocketContext = createContext(null);

// Define Socket.IO server URL based on environment
const SOCKET_SERVER_URL = process.env.NODE_ENV === 'production'
  ? 'https://poker-game-mknp.onrender.com' // ✅ Your deployed backend URL on Render
  : 'http://localhost:5000'; // ✅ Your local backend URL

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  // Assuming authToken is stored in Redux state if needed for Socket.IO authentication
  const authToken = useSelector((state) => state.user.authToken); // Ensure this path is correct

  // Function to create or reconnect the socket
  const connectSocket = useCallback(() => {
    if (socket) {
      // If an old socket instance exists, disconnect it first
      socket.disconnect();
    }
    
    const newSocket = io(SOCKET_SERVER_URL, { // ✅ Use the dynamic URL
      withCredentials: true, // Important for sending cookies/session with cross-origin requests
      transports: ['websocket'], // Prefer WebSocket for better performance and reliability
      auth: { token: authToken } // Pass authentication token if your Socket.IO server requires it
    });
    
    setSocket(newSocket);
    console.log(`Attempting to connect Socket.IO to: ${SOCKET_SERVER_URL}...`);
  }, [socket, authToken]); // Depend on current socket instance and authToken

  // Disconnect on component unmount
  useEffect(() => {
    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [socket]); // Only runs when the socket object changes

  // Automatically connect on first render if no socket exists
  useEffect(() => {
    if (!socket) {
      connectSocket();
    }
  }, [socket, connectSocket]); // Depend on socket and connectSocket

  return (
    // Expose socket and connectSocket through the context
    <SocketContext.Provider value={{ socket, connectSocket }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  return useContext(SocketContext);
};
