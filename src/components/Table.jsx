// src/components/Table.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useSocket } from "../contexts/SocketContext";
import { useSelector, useDispatch } from "react-redux";
import { checkAuth } from "../redux/userSlice";
import { fetchTableInfo } from "../redux/tableSlice";

import ActionButtons from "./ActionButtons";
import Seat from "./Seat"; // Import the Seat component
import CommunityCardsDisplay from "./CommunityCardsDisplay";
import PotDisplay from "./PotDisplay";
import TableInfoDisplay from "./TableInfoDisplay";

import "./Table.css";

function Table() {
  const { id: tableId } = useParams();
  const { socket } = useSocket();
  const dispatch = useDispatch();

  const [tableState, setTableState] = useState(null);
  const [currentPlayerSeat, setCurrentPlayerSeat] = useState(null); // This will be the seat number if seated, or null if standing/not at table
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

      // Add seated players from data.seats (which is an array of seat objects)
      if (data.seats && Array.isArray(data.seats)) {
        data.seats.forEach((seat) => {
          if (seat && seat.player_data) {
            allPlayersById.set(String(seat.player_data.id), seat.player_data);
          }
        });
      }

      // Add viewers from data.viewers (which is an array)
      data.viewers.forEach((viewer) => {
        allPlayersById.set(String(viewer.id), viewer); // Ensure ID is a string
      });

      // Find the current player from the comprehensive map
      const selfPlayer = allPlayersById.get(currentUserIdString);

      // Update currentPlayerSeat: seat number if seated, otherwise null
      // Check if selfPlayer exists and has a seat_number_on_current_table
      const newCurrentPlayerSeat =
        selfPlayer &&
        typeof selfPlayer.seat_number_on_current_table === "number"
          ? selfPlayer.seat_number_on_current_table
          : null;
      setCurrentPlayerSeat(newCurrentPlayerSeat);
      console.log("Table.jsx: currentPlayerSeat found:", newCurrentPlayerSeat);

      // ✅ FIX: Directly set tableState with the received data.
      // The 'seats' property in 'data' is already an array of seat objects from the backend.
      setTableState({
        ...data,
        // No need to re-process 'seats' here, just use the array as is.
        // The rendering logic will find the correct seat object by seatId.
      });
    };

    const handleSocketError = ({ message }) => {
      console.error("Socket error from server:", message);
      // alert(`Error: ${message}`); // Avoid using alert() in production apps
    };

    const handleJoinSuccess = (data) => {
      console.log("handleJoinSuccess: ", data);
      // Here you can update join status or display a message
    };

    const handleSeatSuccess = (data) => {
      console.log("handleSeatSuccess: ", data);
      // Here you can update seat status or display a message
    };

    // The server sends table_update, and handleFullGameState should handle it.
    socket.on("seat_success", handleSeatSuccess);
    socket.on("join_success", handleJoinSuccess);
    socket.on("table_update", handleFullGameState); // Use this for general table updates
    socket.on("full_table_state", handleFullGameState); // If there's a difference, it needs to be understood. Currently assuming they are similar.

    socket.on("error", handleSocketError);

    return () => {
      socket.off("table_update", handleFullGameState);
      socket.off("seat_success", handleSeatSuccess);
      socket.off("join_success", handleJoinSuccess);
      socket.off("full_table_state", handleFullGameState);
      socket.off("error", handleSocketError);
    };
  }, [socket, tableId, isAuthenticated, currentUserIdString]);

  const handleSit = (seatId) => {
    if (
      !socket ||
      !isAuthenticated ||
      currentUserIdString === null ||
      !nickname
    )
      return;
    const buyInAmount = 1000;
    console.log(
      `Table.jsx: Sending 'player_take_a_seat' for table: ${tableId}, seat: ${seatId}, buy-in: ${buyInAmount}, userId: ${currentUserIdString}, nickname: ${nickname}`
    );
    socket.emit("player_take_a_seat", {
      table_id: tableId,
      seat: seatId,
      buy_in_amount: buyInAmount,
    });
  };

  const handleStandUp = () => {
    if (!socket || !isAuthenticated || currentUserIdString === null) return;
    console.log(
      `Table.jsx: Sending 'player_standup' for table: ${tableId}, userId: ${currentUserIdString}`
    );
    socket.emit("player_standup", {
      table_id: tableId,
      user_id: currentUserIdString,
    });
  };

  if (authStatus === "loading" || authStatus === "idle") {
    return <p>🔄 Loading connection data...</p>;
  }

  if (!isAuthenticated) {
    return <p>🔒 You must be logged in to play.</p>;
  }

  if (!tableState || !tableInfo) {
    return <p>Loading table state...</p>;
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

  // We also need to identify the standing player if they exist, to pass to Seat
  const selfPlayerInSeat = tableState.seats.find(
    (seat) =>
      seat &&
      seat.player_data &&
      String(seat.player_data.id) === currentUserIdString
  )?.player_data; // Get the player_data directly

  const selfPlayerAsSpectator = tableState.viewers.find(
    (s) => s && String(s.id) === currentUserIdString
  );

  const selfPlayer = selfPlayerInSeat || selfPlayerAsSpectator;
  const isCurrentPlayerStanding = selfPlayer && !selfPlayerInSeat;

  return (
    <div className="poker-table-wrapper">
      {/* Loop over all possible seats */}
      {Array.from({ length: tableState.max_players }, (_, i) => i + 1).map(
        (seatId) => {
          const seatStyle = seatPositions[seatId - 1] || {};
          // Find the specific seat object from the tableState.seats array
          // The backend sends an array of seat objects, each with a 'seat_number' and 'player_data' (if occupied)
          const seatData = tableState.seats.find(
            (seat) => seat && seat.seat_number === seatId
          );

          // playerInThisSeat will contain the player's data object or null
          const playerInThisSeat = seatData ? seatData.player_data : null;

          return (
            <Seat
              key={seatId}
              seatId={seatId}
              playerInSeat={playerInThisSeat} // Pass the player object or null
              seatStyle={seatStyle}
              // Is the current player seated at this specific seat?
              isCurrentPlayerAtThisSeat={
                playerInThisSeat &&
                String(playerInThisSeat.id) === currentUserIdString
              }
              // Does the current player occupy any seat at all? (to decide on showing "Sit" button)
              currentPlayerSeatExists={currentPlayerSeat !== null}
              // Pass selfPlayer info to know if they are "standing"
              selfPlayer={selfPlayer}
              onSit={handleSit}
              onStandUp={handleStandUp}
            />
          );
        }
      )}
      {/* Additional area for "standing" or "spectator" players if you want to display them separately */}
      {isCurrentPlayerStanding &&
        selfPlayer && ( // Ensure selfPlayer exists
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
            <p>You are standing at the table: {selfPlayer.nickname}</p>
            {/* Assuming stack exists for spectators if relevant */}
            {selfPlayer.stack !== undefined && <p>Chips: {selfPlayer.stack}</p>}
          </div>
        )}
      {/* Spectator list - if you want to display it */}
      {tableState.viewers &&
        tableState.viewers.length > 0 && ( // Changed from spectators_list to viewers
          <div className="spectator-list-display">
            <h3>Spectators ({tableState.viewers.length}):</h3>
            <ul>
              {tableState.viewers.map((s) => (
                <li key={s.id}>{s.nickname}</li>
              ))}
            </ul>
          </div>
        )}
      {tableState.current_turn_player_id === currentUserIdString && (
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
            currentUserId={currentUserIdString}
            tableId={tableId}
            socket={socket}
          />
        </div>
      )}
      {/* Update property names according to the new JSON */}
      <PotDisplay potAmount={tableState.pot_size} />{" "}
      {/* Changed from pot to pot_size */}
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
