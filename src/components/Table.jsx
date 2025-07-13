// src/components/Table.jsx
import React, { useState, useEffect } from "react";
import Seat from "./Seat";
import pokerTableDesktop from "../assets/images/poker_table.png"; // ייבוא תמונה למחשב
import pokerTableMobile from "../assets/images/poker_table_for_mobile.png"; // ייבוא תמונה לטלפון (השם שציינת)

function Table({
  players,
  communityCards,
  pot,
  tableInfo,
  spectators,
  onSit,
  onStandUp,
  currentPlayerId,
  currentPlayerSeatId,
  isCurrentPlayerSitting,
  onCall,
  onFold,
  onRaise,
}) {
  const [currentTableImage, setCurrentTableImage] = useState("");

  // פונקציה לבחירת התמונה הנכונה לפי רוחב המסך
  const updateBackgroundImage = () => {
    // נקודת שבירה: אם רוחב המסך קטן מ-768 פיקסלים, נניח שזה מובייל
    // ניתן לשנות את 768px לנקודת שבירה אחרת אם תרצה
    if (window.innerWidth < 768) {
      setCurrentTableImage(pokerTableMobile);
    } else {
      setCurrentTableImage(pokerTableDesktop);
    }
  };

  useEffect(() => {
    // הגדרת התמונה הראשונית בעת טעינת הקומפוננטה
    updateBackgroundImage();

    // הוספת Event Listener לשינוי גודל החלון
    // זה יגרום לתמונה להתעדכן אוטומטית אם המשתמש משנה את גודל החלון
    window.addEventListener("resize", updateBackgroundImage);

    // ניקוי ה-Event Listener בעת הסרת הקומפוננטה כדי למנוע דליפות זיכרון
    return () => window.removeEventListener("resize", updateBackgroundImage);
  }, []); // ריצה רק פעם אחת בעת טעינת הקומפוננטה (כמו componentDidMount)

  // הגדרות מיקום למושבים (אחוזים ביחס לשולחן)
  // מיקומים אלו מותאמים לשולחן עגול/אליפטי
  const seatPositions = {
    1: { top: "10%", left: "50%" }, // למעלה אמצע
    2: { top: "25%", left: "85%" }, // ימין למעלה
    3: { top: "75%", left: "85%" }, // ימין למטה
    4: { top: "90%", left: "50%" }, // למטה אמצע
    5: { top: "75%", left: "15%" }, // שמאל למטה
    6: { top: "25%", left: "15%" }, // שמאל למעלה
  };

  // מציאת השחקן הנוכחי לפי ה-ID שלו
  const currentPlayer = players.find(
    (player) => player.user_id === currentPlayerId
  );

  return (
    <div
      className="poker-table-wrapper"
      style={{
        backgroundImage: `url(${currentTableImage})`, // הגדרת תמונת הרקע הדינמית
        backgroundSize: "cover", // התמונה תכסה את כל השטח של האלמנט
        backgroundPosition: "center", // התמונה תמורכז בתוך האלמנט
        backgroundRepeat: "no-repeat", // התמונה לא תחזור על עצמה
      }}
    >
      {/* Community Cards Display - קלפי קהילה במרכז השולחן */}
      <div className="community-cards-display">
        {communityCards.map((card, index) => {
          const isRed = card.suit === "♥" || card.suit === "♦"; // קביעת צבע הקלף
          return (
            <div
              key={index}
              className="community-card"
              style={{ color: isRed ? "red" : "black" }}
            >
              <div>{card.rank}</div> {/* דרגת הקלף (A, K, Q, J, 10...) */}
              <div style={{ fontSize: "0.7em" }}>{card.suit}</div>{" "}
              {/* צורת הקלף (♠, ♥, ♦, ♣) */}
            </div>
          );
        })}
      </div>

      {/* Pot Display - תצוגת הקופה הנוכחית */}
      <div className="pot-display">Pot: ${pot}</div>

      {/* Table Info Display - מידע כללי על השולחן */}
      <div className="table-info-display">
        <h3>Table Info</h3>
        <p>Game ID: {tableInfo.game_id}</p>
        <p>Small Blind: ${tableInfo.small_blind}</p>
        <p>Big Blind: ${tableInfo.big_blind}</p>
        <p>Current Bet: ${tableInfo.current_bet}</p>
        <p>Dealer Seat: {tableInfo.dealer_seat_id}</p>
        <p>Current Player Turn: {tableInfo.current_player_turn_seat_id}</p>
        <p>Round Name: {tableInfo.round_name}</p>
      </div>

      {/* Spectator List Display - רשימת צופים */}
      <div className="spectator-list-display">
        <h3>Spectators ({spectators.length})</h3>
        <ul>
          {spectators.map((spectator, index) => (
            <li key={index}>{spectator.nickname || spectator.username}</li>
          ))}
        </ul>
      </div>

      {/* Render Seats - רינדור המושבים סביב השולחן */}
      {Object.entries(seatPositions).map(([seatId, style]) => {
        // מציאת השחקן שיושב במושב הנוכחי
        const playerInSeat = players.find(
          (player) => player.seat_id === parseInt(seatId)
        );
        // בדיקה אם השחקן הנוכחי שלנו יושב במושב זה
        const isCurrentPlayerAtThisSeat =
          currentPlayer && currentPlayer.seat_id === parseInt(seatId);

        return (
          <Seat
            key={seatId}
            seatId={parseInt(seatId)}
            playerInSeat={playerInSeat}
            seatStyle={style}
            isCurrentPlayerAtThisSeat={isCurrentPlayerAtThisSeat}
            currentPlayerSeatExists={isCurrentPlayerSitting}
            onSit={onSit}
            onStandUp={onStandUp}
          />
        );
      })}

      {/* Action Buttons - כפתורי פעולה (רק לשחקן הנוכחי) */}
      {isCurrentPlayerSitting && (
        <div className="action-buttons-container">
          <button onClick={onFold}>Fold</button>
          <button onClick={onCall}>Call</button>
          <button onClick={onRaise}>Raise</button>
        </div>
      )}
    </div>
  );
}

export default Table;
