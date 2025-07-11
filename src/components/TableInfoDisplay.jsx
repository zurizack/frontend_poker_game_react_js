// src/components/TableInfoDisplay.jsx
import React from "react";

function TableInfoDisplay({ tableName, smallBlind, bigBlind, maxPlayers }) {
  return (
    <div
      className="table-info-display"
      style={{
        position: "absolute",
        top: "65%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        fontSize: "12px",
        color: "#fff",
        background: "rgba(0, 0, 0, 0.5)",
        padding: "6px 12px",
        borderRadius: "8px",
        textAlign: "center",
        zIndex: 4,
      }}
    >
      <div>🪑 Table: {tableName}</div>
      <div>
        💵 Blinds: {smallBlind}/{bigBlind}
      </div>
      <div>👥 Max Players: {maxPlayers}</div>
    </div>
  );
}

export default TableInfoDisplay;
