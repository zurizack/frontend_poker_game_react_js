// src/components/CommunityCardsDisplay.jsx
import React from "react";

function CommunityCardsDisplay({ communityCards }) {
  if (!communityCards || communityCards.length === 0) {
    return null; // אל תציג אם אין קלפי קהילה
  }

  return (
    <div
      className="community-cards"
      style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        display: "flex",
        gap: "8px",
        zIndex: 5,
      }}
    >
      {communityCards.map((card, index) => {
        const isRed = card.suit === "♥" || card.suit === "♦";
        return (
          <div
            key={index}
            style={{
              width: "60px",
              height: "90px",
              border: "1px solid #888",
              borderRadius: "8px",
              background: "white",
              color: isRed ? "red" : "black",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              fontSize: "24px",
              fontWeight: "bold",
              boxShadow: "2px 2px 6px rgba(0,0,0,0.2)",
            }}
          >
            {card.rank}
            {card.suit}
          </div>
        );
      })}
    </div>
  );
}

export default CommunityCardsDisplay;
