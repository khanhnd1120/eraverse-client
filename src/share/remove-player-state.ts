import G from "./G";
import { PlayerState, PlayerWorldType } from "./game-interface";
import myState from "./my-state";

export default function removePlayerState(
  state: PlayerState,
  player: PlayerWorldType,
  top: boolean = true,
  bottom: boolean = true
) {
  if (!player) {
    return;
  }
  if (state == PlayerState.Idle) {
    return player;
  }
  let updatedState: { stateTop: PlayerState; stateBottom: PlayerState };
  switch (state) {
    case PlayerState.Move:
    case PlayerState.Dance:
    case PlayerState.Jump:
    case PlayerState.Falling:
    case PlayerState.Beaten:
      updatedState = removeDefault(player, state);
      break;
    case PlayerState.Attack:
      updatedState = removeAttack(player);
      break;
  }
  const { stateTop, stateBottom } = updatedState;
  let isChange = false;
  if (player.stateTop !== stateTop || player.stateBottom !== stateBottom) {
    isChange = true;
  }
  if (isChange) {
    let changeData: any = {};
    if (top) {
      changeData.stateTop = stateTop;
    }
    if (bottom) {
      changeData.stateBottom = stateBottom;
    }
    player = {
      ...player,
      ...changeData,
    };
    G.getCurrentRoom().send("state", {
      stateBottom: player.stateBottom,
      stateTop: player.stateTop,
    });
  }
  return player;
}

function removeAttack(player: PlayerWorldType) {
  let tmpTop, tmpBottom: PlayerState;
  switch (player.stateTop) {
    case PlayerState.Move:
    case PlayerState.Beaten:
    case PlayerState.Jump:
    case PlayerState.Falling:
      tmpTop = player.stateTop;
      break;
    default:
      tmpTop = PlayerState.Idle;
      break;
  }
  switch (player.stateBottom) {
    case PlayerState.Move:
    case PlayerState.Beaten:
    case PlayerState.Jump:
    case PlayerState.Falling:
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

function removeDefault(player: PlayerWorldType, state: PlayerState) {
  let tmpTop, tmpBottom: PlayerState;
  if (state == PlayerState.Dance) {
    myState.danceAnim$.next("");
  }
  switch (player.stateTop) {
    case state:
      tmpTop = PlayerState.Idle;
      break;
    default:
      tmpTop = player.stateTop;
      break;
  }
  switch (player.stateBottom) {
    case state:
      tmpBottom = PlayerState.Idle;
      break;
    default:
      tmpBottom = player.stateBottom;
      break;
  }

  return {
    stateTop: tmpTop,
    stateBottom: tmpBottom,
  };
}
