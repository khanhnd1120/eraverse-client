import G from "./G";
import { PlayerState, PlayerWorldType } from "./game-interface";

export default function addPlayerState(
  newState: PlayerState,
  player: PlayerWorldType
) {
  if (!player) {
    return;
  }
  let updatedState: { stateTop: PlayerState; stateBottom: PlayerState };
  switch (newState) {
    case PlayerState.Move:
      updatedState = switchMove(player);
      break;
    case PlayerState.Attack:
      updatedState = switchAttack(player);
      break;
  }
  const { stateTop, stateBottom } = updatedState;
  let isChange = false;
  if (player.stateTop !== stateTop || player.stateBottom !== stateBottom) {
    isChange = true;
  }
  player = {
    ...player,
    stateTop,
    stateBottom,
  };
  if (isChange) {
    G.getCurrentRoom().send("state", {
      stateBottom: player.stateBottom,
      stateTop: player.stateTop,
    });
  }
  return player;
}

function switchAttack(player: PlayerWorldType) {
  let tmpTop, tmpBottom: PlayerState;
  switch (player.stateTop) {
    case PlayerState.Beaten:
      tmpTop = player.stateTop;
      break;
    default:
      tmpTop = PlayerState.Attack;
      break;
  }
  switch (player.stateBottom) {
    case PlayerState.Beaten:
    case PlayerState.Idle:
      tmpBottom = player.stateBottom;
      break;
    default:
      tmpBottom = PlayerState.Attack;
      break;
  }

  return {
    stateTop: tmpTop,
    stateBottom: tmpBottom,
  };
}
function switchMove(player: PlayerWorldType) {
  let tmpTop, tmpBottom: PlayerState;
  switch (player.stateTop) {
    case PlayerState.Idle:
      tmpTop = PlayerState.Move;
      break;
    default:
      tmpTop = player.stateTop;
      break;
  }
  switch (player.stateBottom) {
    default:
      tmpBottom = PlayerState.Move;
      break;
  }
  return {
    stateTop: tmpTop,
    stateBottom: tmpBottom,
  };
}
