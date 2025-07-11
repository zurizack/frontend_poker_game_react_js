// src/hooks/useSocketEvents.js
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSocket } from "../contexts/SocketContext";
import { updateTableState, setPrivateHand, setCurrentTurn } from "../redux/tableSlice";

const useSocketEvents = () => {
  const socket = useSocket();
  const dispatch = useDispatch();
  const tableId = useSelector((state) => state.table.tableId);
  const userId = useSelector((state) => state.user.id);


  useEffect(() => {
    if (!socket || !tableId || !userId) return;

    // ודא שגם tableId וגם userId זמינים לפני שליחת emit
    if (tableId && userId) {
      socket.emit("join_table", { table_id: tableId });
    }

    const handleTableState = (data) => {
      console.log("📥 table_state received:", data);
      dispatch(updateTableState(data));
      
    };

    const handlePrivateHand = ({ hand }) => {
      dispatch(setPrivateHand(hand));
    };

    const handleTurnChange = ({ player_id }) => {
      dispatch(setCurrentTurn(player_id));
    };

    socket.on("table_state", handleTableState);
    socket.on("private_hand", handlePrivateHand);
    socket.on("turn_change", handleTurnChange);

    return () => {
      socket.off("table_state", handleTableState);
      socket.off("private_hand", handlePrivateHand);
      socket.off("turn_change", handleTurnChange);
    };
  }, [socket, tableId, userId, dispatch]);
};

export default useSocketEvents;
