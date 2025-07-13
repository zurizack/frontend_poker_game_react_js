// src/components/Seat.jsx
import React from "react";
// אם private_hand מיועד להציג את הקלפים הפתוחים של השחקן המקומי, אפשר לייבא אותו כאן
// import PrivateHand from "./PrivateHand";

function Seat({
  seatId,
  playerInSeat,
  seatStyle,
  isCurrentPlayerAtThisSeat,
  currentPlayerSeatExists, // האם המשתמש הנוכחי יושב בכלל?
  onSit,
  onStandUp,
}) {
  const isOccupied = playerInSeat !== null;

  // הלוגיקה של `return null` הוזזה. נציג תמיד את הכיסא וננהל את הכפתורים בפנים.

  return (
    <div
      className="player-seat"
      style={{
        position: "absolute",
        transform: "translate(-50%, -50%)",
        ...seatStyle,
        textAlign: "center",
        fontSize: "12px",
        background: isOccupied
          ? "rgba(46, 204, 113, 0.7)"
          : "rgba(52, 73, 94, 0.7)", // צבע תפוס/פנוי
        border: isCurrentPlayerAtThisSeat
          ? "2px solid #f1c40f"
          : "1px solid #555", // מסגרת אם זה השחקן הנוכחי
        borderRadius: "50%", // עיגול לכיסא
        width: "120px",
        height: "120px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        color: "white",
        boxShadow: "3px 3px 10px rgba(0,0,0,0.5)",
      }}
    >
      {isOccupied ? ( // אם הכיסא תפוס
        <div style={{ padding: "5px" }}>
          <p style={{ margin: "0", fontWeight: "bold" }}>Seat {seatId}</p>
          {/* ✅ הוספת לוגים לאבחון */}
          {console.log(
            `Seat ${seatId}: isOccupied is true. playerInSeat:`,
            playerInSeat
          )}
          {console.log(
            `Seat ${seatId}: playerInSeat.username:`,
            playerInSeat?.username
          )}
          {console.log(
            `Seat ${seatId}: playerInSeat.nickname:`,
            playerInSeat?.nickname
          )}{" "}
          {/* ✅ Check for nickname too */}
          {console.log(
            `Seat ${seatId}: playerInSeat.chips_on_current_table:`,
            playerInSeat?.chips_on_current_table
          )}
          <p style={{ margin: "2px 0 0 0" }}>
            {playerInSeat.nickname || playerInSeat.username || "שחקן"}{" "}
            {/* ✅ Prefer nickname for display */}
          </p>
          <p style={{ margin: "2px 0" }}>
            ({playerInSeat.chips_on_current_table} chips)
          </p>
          {/* הצגת היד הפרטית רק לשחקן הנוכחי בכיסא זה */}
          {isCurrentPlayerAtThisSeat &&
            playerInSeat.hole_cards &&
            playerInSeat.hole_cards.length === 2 && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  marginTop: "5px",
                  gap: "5px",
                }}
              >
                {playerInSeat.hole_cards.map((card, i) => {
                  // נניח שקלף הוא אובייקט { rank: 'K', suit: 's' }
                  const isRed = card.suit === "♥" || card.suit === "♦";
                  return (
                    <div
                      key={i}
                      style={{
                        width: "40px",
                        height: "60px",
                        border: "1px solid #888",
                        borderRadius: "6px",
                        background: "white",
                        color: isRed ? "red" : "black",
                        display: "flex",
                        flexDirection: "column", // כדי שהדרגה והצורה יהיו אחד מעל השני
                        justifyContent: "center",
                        alignItems: "center",
                        fontSize: "18px",
                        fontWeight: "bold",
                        boxShadow: "1px 1px 4px rgba(0,0,0,0.2)",
                      }}
                    >
                      <div>{card.rank}</div>
                      <div style={{ fontSize: "14px" }}>{card.suit}</div>
                    </div>
                  );
                })}
              </div>
            )}
          {/* אם זה לא השחקן הנוכחי אבל הכיסא תפוס, נציג קלפים הפוכים */}
          {!isCurrentPlayerAtThisSeat &&
            isOccupied &&
            playerInSeat.cards_count === 2 && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  marginTop: "5px",
                  gap: "5px",
                }}
              >
                <div
                  className="card-back"
                  style={{
                    width: "40px",
                    height: "60px",
                    background: "blue",
                    borderRadius: "6px",
                  }}
                ></div>
                <div
                  className="card-back"
                  style={{
                    width: "40px",
                    height: "60px",
                    background: "blue",
                    borderRadius: "6px",
                  }}
                ></div>
              </div>
            )}
          {isCurrentPlayerAtThisSeat && (
            <button
              onClick={onStandUp}
              style={{ marginTop: "10px", padding: "5px 10px" }}
            >
              קום
            </button>
          )}
        </div>
      ) : (
        // אם הכיסא פנוי
        <div style={{ padding: "5px" }}>
          <p style={{ margin: "0", fontWeight: "bold" }}>Seat {seatId}</p>
          <p style={{ margin: "2px 0 0 0", opacity: 0.7 }}>פנוי</p>
          {/* הצג כפתור "שב" רק אם השחקן הנוכחי לא יושב בשום מקום */}
          {!currentPlayerSeatExists && (
            <button
              onClick={() => onSit(seatId)}
              style={{ marginTop: "10px", padding: "5px 10px" }}
            >
              שב
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default Seat;
