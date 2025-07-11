function ActionButtons({ tableState, currentUserId, tableId, socket }) {
  const me = tableState.players.find((p) => p.player_id === currentUserId);
  if (!me) return null;

  const callAmount = tableState.call_amount || 0;
  const currentBet = me.current_bet || 0;
  const currentPotContribution = me.chips_in_pot || 0;
  const toCall = Math.max(0, callAmount - currentPotContribution);
  const buttons = [];

  console.log("call amount = ", callAmount);
  console.log("toCall = ", toCall);
  console.log("me.chips_in_pot = ", me.chips_in_pot);

  if (callAmount === 0) {
    // אף אחד לא הימר – Check ו־Bet מותרים
    buttons.push(
      <button
        key="check"
        onClick={() =>
          socket.emit("player_action", { table_id: tableId, action: "check" })
        }
      >
        Check
      </button>,
      <button
        key="bet"
        onClick={() => {
          const amount = prompt("כמה אתה רוצה להמר?");
          if (amount) {
            socket.emit("player_action", {
              table_id: tableId,
              action: "bet",
              amount: parseInt(amount),
            });
          }
        }}
      >
        Bet
      </button>
    );
  } else if (toCall === 0) {
    // הימור קיים, והשחקן כבר השווה אותו – Check ו־Raise מותרים
    buttons.push(
      <button
        key="check"
        onClick={() =>
          socket.emit("player_action", { table_id: tableId, action: "check" })
        }
      >
        Check
      </button>,
      <button
        key="raise"
        onClick={() => {
          const amount = prompt("Raise amount:");
          if (amount) {
            socket.emit("player_action", {
              table_id: tableId,
              action: "raise",
              amount: parseInt(amount),
            });
          }
        }}
      >
        Raise
      </button>
    );
  } else {
    // צריך להשוות את ההימור או לפרוש
    buttons.push(
      <button
        key="fold"
        onClick={() =>
          socket.emit("player_action", { table_id: tableId, action: "fold" })
        }
      >
        Fold
      </button>,
      <button
        key="call"
        onClick={() =>
          socket.emit("player_action", { table_id: tableId, action: "call" })
        }
      >
        Call ({toCall})
      </button>,
      <button
        key="raise"
        onClick={() => {
          const amount = prompt("Raise amount:");
          if (amount) {
            socket.emit("player_action", {
              table_id: tableId,
              action: "raise",
              amount: parseInt(amount),
            });
          }
        }}
      >
        Raise
      </button>
    );
  }

  return (
    <div>
      <h3 style={{ color: "red" }}>🎯 תורך!</h3>
      {buttons}
    </div>
  );
}

export default ActionButtons;
