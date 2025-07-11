// src/components/Table.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useSocket } from "../contexts/SocketContext";
import { useSelector, useDispatch } from "react-redux";
import { checkAuth } from "../redux/userSlice";
import { fetchTableInfo } from "../redux/tableSlice";

import ActionButtons from "./ActionButtons";
import Seat from "./Seat"; // נייבא את ה-Seat המתוקן
import CommunityCardsDisplay from "./CommunityCardsDisplay";
import PotDisplay from "./PotDisplay";
import TableInfoDisplay from "./TableInfoDisplay";

import "./Table.css";

function Table() {
  const { id: tableId } = useParams();
  const { socket } = useSocket();
  const dispatch = useDispatch();

  const [tableState, setTableState] = useState(null);
  const [currentPlayerSeat, setCurrentPlayerSeat] = useState(null); // זה יהיה מספר הכיסא אם יושב, או null אם עומד/לא בשולחן
  const currentUserId = useSelector((state) => state.user.userId);
  const nickname = useSelector((state) => state.user.nickname);
  const authStatus = useSelector((state) => state.user.status);
  const isAuthenticated = useSelector((state) => state.user.authenticated);
  const tableInfo = useSelector((state) => state.table.tableInfo);

  const currentUserIdString = currentUserId ? String(currentUserId) : null;

  useEffect(() => {
    console.log("Table.jsx: currentUserId from Redux:", currentUserId);
    console.log("Table.jsx: currentUserIdString:", currentUserIdString);
  }, [currentUserId, currentUserIdString]);

  useEffect(() => {
    if (authStatus === "idle") {
      dispatch(checkAuth());
    }
  }, [dispatch, authStatus]);

  useEffect(() => {
    if (tableId) {
      dispatch(fetchTableInfo(tableId));
    }
  }, [dispatch, tableId]);

  useEffect(() => {
    if (!socket || !isAuthenticated || currentUserIdString === null) {
      console.log(
        "Socket effect skipped. currentUserIdString:",
        currentUserIdString,
        "isAuthenticated:",
        isAuthenticated
      );
      return;
    }

    socket.emit("join_table", { table_id: tableId });

    const handleFullGameState = (data) => {
      console.log("Table.jsx: Full game state received (raw):", data);

      const allPlayersById = new Map();

      // הוספת שחקנים יושבים מתוך data.players (שהוא מערך)
      Object.values(data.players).forEach((player) => {
        if (player) {
          allPlayersById.set(String(player.id), player); // וודא שה-ID הוא סטרינג
        }
      });

      // הוספת צופים מתוך data.viewers (שהוא מערך)
      data.viewers.forEach((viewer) => {
        allPlayersById.set(String(viewer.id), viewer); // וודא שה-ID הוא סטרינג
      });

      // נמצא את השחקן הנוכחי מתוך המפה הכוללת
      // currentUserIdString אמור להיות זמין בסקופ זה (לדוגמה, מ-localStorage או context)
      const selfPlayer = allPlayersById.get(currentUserIdString);

      // עדכן את currentPlayerSeat: מספר הכיסא אם יושב, אחרת null
      const newCurrentPlayerSeat =
        selfPlayer &&
        typeof selfPlayer.seat_number_on_current_table !== "undefined"
          ? selfPlayer.seat_number_on_current_table
          : null;
      setCurrentPlayerSeat(newCurrentPlayerSeat);
      console.log("Table.jsx: currentPlayerSeat found:", newCurrentPlayerSeat);

      // ✅ תיקון: בונים אובייקט processedSeats בצורה נכונה
      // אתחול כל הכיסאות ל-null
      const processedSeats = {};
      for (let i = 1; i <= data.max_players; i++) {
        processedSeats[i] = null;
      }

      // ממלאים את הכיסאות בשחקנים היושבים
      data.players.forEach((player) => {
        if (player && typeof player.seat_number_on_current_table === "number") {
          processedSeats[player.seat_number_on_current_table] = player;
        }
      });

      // עדכן את ה-tableState עם הנתונים החדשים
      setTableState({
        ...data,
        seats: processedSeats, // המבנה המעובד של הכיסאות
      });
    };

    const handleSocketError = ({ message }) => {
      console.error("שגיאת סוקט מהשרת:", message);
      alert(`Error: ${message}`);
    };

    const handleJoinSuccess = (data) => {
      console.log("handleJoinSuccess: ", data);
      // כאן אפשר לעדכן סטטוס הצטרפות או להציג הודעה
    };

    const handleSeatSuccess = (data) => {
      console.log("handleJoinSuccess: ", data);
      // כאן אפשר לעדכן סטטוס הצטרפות או להציג הודעה
    };

    const handleTableUpdate = (data) => {
      // שינוי ל-message במקום msg
      console.log("handleTableUpdate: ", data);
    };

    // השרת שולח table_update, וה-handleFullGameState אמור לטפל בו.
    // אם table_update ו-full_game_state הם אותו דבר, השאר רק אחד.
    // לפי הבקאנד שלך, full_game_state נשלח עם כל המידע.
    // ה-handleTableUpdate למטה נראה כמו פונקציה ריקה. נשתמש ב-handleFullGameState.
    socket.on("seat_success", handleSeatSuccess);
    socket.on("join_success", handleJoinSuccess);
    socket.on("table_update", handleFullGameState); // נשתמש בזה לאירוע עדכון כללי
    socket.on("full_table_state", handleFullGameState); // אם יש הבדל, צריך להבין אותו. כרגע מניח שהם זהים.

    socket.on("error", handleSocketError);

    return () => {
      socket.off("table_update", handleFullGameState);
      socket.off("seat_success", handleSeatSuccess);
      socket.off("join_success", handleJoinSuccess);
      socket.off("full_table_state", handleFullGameState);
      socket.off("error", handleSocketError);
    };
  }, [socket, tableId, isAuthenticated, currentUserIdString]); // תלויות: parsedCurrentUserId השתנה ל-currentUserIdString

  const handleSit = (seatId) => {
    if (
      !socket ||
      !isAuthenticated ||
      currentUserIdString === null || // שינוי ל-currentUserIdString
      !nickname
    )
      return;
    const buyInAmount = 1000;
    console.log(
      `Table.jsx: Sending 'player_take_a_seat' for table: ${tableId}, seat: ${seatId}, buy-in: ${buyInAmount}, userId: ${currentUserIdString}, nickname: ${nickname}`
    ); // שינוי ל-currentUserIdString
    socket.emit("player_take_a_seat", {
      table_id: tableId,
      seat: seatId,
      buy_in_amount: buyInAmount,
    });
  };

  const handleStandUp = () => {
    if (!socket || !isAuthenticated || currentUserIdString === null) return; // שינוי ל-currentUserIdString
    console.log(
      `Table.jsx: Sending 'player_standup' for table: ${tableId}, userId: ${currentUserIdString}`
    ); // שינוי ל-currentUserIdString
    socket.emit("player_standup", {
      table_id: tableId,
      user_id: currentUserIdString, // שינוי ל-currentUserIdString
    });
  };

  if (authStatus === "loading" || authStatus === "idle") {
    return <p>🔄 טוען נתוני התחברות...</p>;
  }

  if (!isAuthenticated) {
    return <p>🔒 עליך להתחבר כדי לשחק.</p>;
  }

  if (!tableState || !tableInfo) {
    return <p>טוען את מצב הטבלה...</p>;
  }

  const seatPositionsByMaxPlayers = {
    6: [
      { top: "10%", left: "50%" },
      { top: "30%", left: "85%" },
      { top: "70%", left: "85%" },
      { top: "90%", left: "50%" },
      { top: "70%", left: "15%" },
      { top: "30%", left: "15%" },
    ],
  };

  const seatPositions = seatPositionsByMaxPlayers[tableState.max_players] || [];

  // נצטרך גם לזהות את השחקן העומד אם הוא קיים, כדי להעביר ל-Seat
  const selfPlayerInSeat = Object.values(tableState.seats).find(
    (p) => p && String(p.id) === currentUserIdString // לוודא השוואת סטרינגים
  );

  const selfPlayerAsSpectator = tableState.viewers.find(
    (s) => s && String(s.id) === currentUserIdString // לוודא השוואת סטרינגים
  );

  const selfPlayer = selfPlayerInSeat || selfPlayerAsSpectator;
  const isCurrentPlayerStanding = selfPlayer && !selfPlayerInSeat;

  return (
    <div className="poker-table-wrapper">
      {/* לולאה על כל המושבים האפשריים */}
      {Array.from({ length: tableState.max_players }, (_, i) => i + 1).map(
        (seatId) => {
          const seatStyle = seatPositions[seatId - 1] || {};
          // playerInThisSeat יכיל את אובייקט השחקן או null
          const playerInThisSeat = tableState.seats[String(seatId)]; // וודא גישה עם סטרינג

          return (
            <Seat
              key={seatId}
              seatId={seatId}
              playerInSeat={playerInThisSeat} // אובייקט השחקן היושב או null
              seatStyle={seatStyle}
              // האם השחקן הנוכחי יושב בכיסא זה?
              isCurrentPlayerAtThisSeat={
                playerInThisSeat &&
                String(playerInThisSeat.id) === currentUserIdString
              }
              // האם השחקן הנוכחי יושב בכלל (כדי להחליט על הצגת כפתור "שב")
              currentPlayerSeatExists={currentPlayerSeat !== null}
              // העבר את מידע ה-selfPlayer כדי לדעת אם הוא "עומד"
              selfPlayer={selfPlayer}
              onSit={handleSit}
              onStandUp={handleStandUp}
            />
          );
        }
      )}
      {/* אזור נוסף לשחקנים "עומדים" או "צופים" אם רוצים להציג אותם בנפרד */}
      {isCurrentPlayerStanding &&
        selfPlayer && ( // וודא ש-selfPlayer קיים
          <div
            style={{
              position: "absolute",
              bottom: "10px",
              left: "10px",
              background: "rgba(0,0,0,0.5)",
              padding: "10px",
              borderRadius: "5px",
              color: "white",
            }}
          >
            <p>אתה עומד ליד השולחן: {selfPlayer.nickname}</p>
            {/* נניח ש-stack קיים גם עבור צופים אם זה רלוונטי */}
            {selfPlayer.stack !== undefined && (
              <p>צ'יפים: {selfPlayer.stack}</p>
            )}
          </div>
        )}
      {/* רשימת צופים - אם רוצים להציג אותה */}
      {tableState.spectators_list && tableState.spectators_list.length > 0 && (
        <div className="spectator-list-display">
          <h3>צופים ({tableState.spectators_list.length}):</h3>
          <ul>
            {tableState.spectators_list.map((s) => (
              <li key={s.id}>{s.nickname}</li>
            ))}
          </ul>
        </div>
      )}
      {tableState.current_turn_player_id === currentUserIdString && ( // שינוי ל-currentUserIdString
        <div
          style={{
            position: "absolute",
            bottom: "20px",
            right: "20px",
            zIndex: 10,
          }}
        >
          <ActionButtons
            tableState={tableState}
            currentUserId={currentUserIdString} // שינוי ל-currentUserIdString
            tableId={tableId}
            socket={socket}
          />
        </div>
      )}
      {/* עדכון שמות המאפיינים בהתאם ל-JSON החדש */}
      <PotDisplay potAmount={tableState.pot} />{" "}
      {/* שינוי מ-current_pot ל-pot */}
      <CommunityCardsDisplay communityCards={tableState.community_cards} />
      <TableInfoDisplay
        tableName={tableInfo.name || tableId}
        smallBlind={tableInfo.small_blind}
        bigBlind={tableInfo.big_blind}
        maxPlayers={tableInfo.max_players}
      />
    </div>
  );
}

export default Table;
