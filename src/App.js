// src/app.js
import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useDispatch } from "react-redux";
import { checkAuth } from "./redux/userSlice";
import { SocketProvider } from './contexts/SocketContext';
import useSocketEvents from './hooks/useSocketEvents';

import LoginForm from "./components/LoginForm";
import Home from "./components/Home";
import RegisterForm from './components/RegisterForm';
import Table from './components/Table';

function App() {
  const dispatch = useDispatch();
  useSocketEvents();

  useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch]);

  return (
    <SocketProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LoginForm />} />
          <Route path="/home" element={<Home />} />
          <Route path="/register" element={<RegisterForm />} />
          <Route path="/table/:id" element={<Table />} />
        </Routes>
      </BrowserRouter>
    </SocketProvider>
  );
}

export default App;
