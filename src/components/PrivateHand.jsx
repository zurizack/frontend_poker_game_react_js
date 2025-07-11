// components/PrivateHand.jsx
function PrivateHand({ hand }) {
  if (!hand || hand.length === 0) return null;
  console.log("the hand : ", hand);

  return (
    <div>
      <h3>🃏 היד שלך:</h3>
      <div style={{ display: "flex", gap: "10px" }}>
        {hand.map((card, i) => {
          const isRed = card.includes("♥") || card.includes("♦");
          return (
            <div
              key={i}
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
              {card}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default PrivateHand;
