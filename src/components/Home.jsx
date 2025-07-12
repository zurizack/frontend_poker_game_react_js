// src/components/Home.jsx
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { logoutUser } from "../redux/userSlice";
import { useNavigate } from "react-router-dom";
import { checkAuth } from "../redux/userSlice";
import axiosInstance from "../axiosConfig"; // ✅ ייבוא ה-axiosInstance

function Home() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { nickname, authenticated, status } = useSelector(
    (state) => state.user
  );

  const [tables, setTables] = useState([]);
  const [loadingTables, setLoadingTables] = useState(true);

  useEffect(() => {
    if (status === "idle") {
      dispatch(checkAuth());
    }
  }, [dispatch, status]);

  // בדיקת התחברות
  useEffect(() => {
    if (!authenticated) {
      navigate("/");
    }
  }, [authenticated, navigate]);

  // שליפת שולחנות מהשרת
  useEffect(() => {
    // ✅ שינוי כאן: שימוש ב-axiosInstance
    axiosInstance
      .get("/game/tables")
      .then((res) => {
        console.log("Raw response data from axios:", res.data); // Axios מחזיר את הנתונים ב-res.data
        setTables(res.data);
        setLoadingTables(false);
      })
      .catch((err) => {
        console.error("Error loading tables:", err);
        setLoadingTables(false);
      });
  }, []); // אין צורך ב-credentials: "include" כי זה כבר מוגדר ב-axiosInstance

  const handleLogout = () => {
    dispatch(logoutUser());
  };

  const handleOpenTable = (tableId) => {
    navigate(`/table/${tableId}`);
  };

  return (
    <div>
      <h1>ברוך הבא, {nickname}!</h1>
      <button onClick={handleLogout} disabled={status === "loading"}>
        {status === "loading" ? "מתנתק..." : "התנתק"}
      </button>

      <h2>רשימת שולחנות:</h2>
      {loadingTables ? (
        <p>טוען שולחנות...</p>
      ) : (
        <table border="1">
          <thead>
            <tr>
              <th>שם</th>
              <th>מקסימום שחקנים</th>
              <th>Small Blind</th>
              <th>Big Blind</th>
              <th>פעולה</th>
            </tr>
          </thead>
          <tbody>
            {tables.map((table) => (
              <tr key={table.id}>
                <td>{table.name}</td>
                <td>{table.max_players}</td>
                <td>{table.small_blind}</td>
                <td>{table.big_blind}</td>
                <td>
                  <button onClick={() => handleOpenTable(table.id)}>
                    פתח שולחן
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default Home;
