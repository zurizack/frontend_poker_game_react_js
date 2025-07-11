// src/components/PotDisplay.jsx
import React from "react";

function PotDisplay({ potAmount }) {
  console.log("PotDisplay: Received potAmount prop:", potAmount);
  console.log("PotDisplay: Type of potAmount prop:", typeof potAmount);

  const displayAmount =
    potAmount &&
    typeof potAmount === "object" &&
    potAmount.hasOwnProperty("total_pot_amount")
      ? potAmount.total_pot_amount
      : potAmount;

  console.log("PotDisplay: Calculated displayAmount:", displayAmount);
  console.log("PotDisplay: Type of displayAmount:", typeof displayAmount);

  // ✅ תיקון: נציג את הקופה כל עוד יש ערך מספרי.
  // נחזיר null רק אם הנתון אינו מוגדר, אינו מספר, או אינו מספר חוקי (NaN).
  if (typeof displayAmount !== "number" || isNaN(displayAmount)) {
    console.warn(
      "PotDisplay: displayAmount is not a valid number, returning null.",
      displayAmount
    );
    return null;
  }

  return (
    <div
      className="pot-display"
      style={{
        position: "absolute",
        top: "40%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        fontSize: "18px",
        fontWeight: "bold",
        color: "#f1c40f",
        background: "rgba(0,0,0,0.6)",
        padding: "6px 12px",
        borderRadius: "8px",
        zIndex: 6,
      }}
    >
      💰 Pot: {displayAmount}
    </div>
  );
}

export default PotDisplay;
