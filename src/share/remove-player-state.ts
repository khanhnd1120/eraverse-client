import G from "./G";
import { PlayerState, PlayerWorldType } from "./game-interface";

export default function removePlayerState(
  state: PlayerState,
  player: PlayerWorldType
) {
  if (!player) {
    return;
  }
  let updatedState: { stateTop: PlayerState; stateBottom: PlayerState };
  switch (state) {
    case PlayerState.Attack:
      updatedState = removeAttack(player);
      break;
  }
  const { stateTop, stateBottom } = updatedState;
  player = {
    ...player,
    stateTop,
    stateBottom,
  };
  G.getCurrentRoom().send("state", {
    stateBottom: player.stateBottom,
    stateTop: player.stateTop,
  });
  return player;
}

function removeAttack(player: PlayerWorldType) {
  let tmpTop, tmpBottom: PlayerState;
  switch (player.stateTop) {
    case PlayerState.Beaten:
      case PlayerState.Idle:
      tmpTop = player.stateTop;
      break;
    default:
      tmpTop = PlayerState.Idle;
      break;
  }
  switch (player.stateBottom) {
    case PlayerState.Beaten:
    case PlayerState.Idle:
      tmpBottom = player.stateBottom;
      break;
    default:
      tmpBottom = PlayerState.Idle;
      break;
  }

  return {
    stateTop: tmpTop,
    stateBottom: tmpBottom,
  };
}
