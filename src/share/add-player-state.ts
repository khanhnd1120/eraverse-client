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
    case PlayerState.Jump:
      updatedState = switchJump(player);
      break;
    case PlayerState.Falling:
      updatedState = switchFalling(player);
      break;
    case PlayerState.Attack:
      updatedState = switchAttack(player);
      break;
    case PlayerState.Dance:
      updatedState = switchDance(player);
      break;
    case PlayerState.Beaten:
      updatedState = {
        stateTop: PlayerState.Beaten,
        stateBottom: PlayerState.Beaten,
      };
      break;
  }
  const { stateTop, stateBottom } = updatedState;
  let isChange = false;
  if (player.stateTop !== stateTop || player.stateBottom !== stateBottom) {
    isChange = true;
  }
  if (isChange) {
    player = {
      ...player,
      stateTop,
      stateBottom,
    };
    G.getCurrentRoom().send("state", {
      stateBottom: player.stateBottom,
      stateTop: player.stateTop,
    });
  }
  return player;
}

function switchDance(player: PlayerWorldType) {
  let tmpTop, tmpBottom: PlayerState;
  switch (player.stateTop) {
    case PlayerState.Beaten:
      tmpTop = player.stateTop;
      break;
    default:
      tmpTop = PlayerState.Dance;
      break;
  }
  switch (player.stateBottom) {
    case PlayerState.Beaten:
      tmpBottom = player.stateBottom;
      break;
    default:
      tmpBottom = PlayerState.Dance;
      break;
  }

  return {
    stateTop: tmpTop,
    stateBottom: tmpBottom,
  };
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
    case PlayerState.Move:
    case PlayerState.Jump:
    case PlayerState.Falling:
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

function switchJump(player: PlayerWorldType) {
  let tmpTop, tmpBottom: PlayerState;
  switch (player.stateTop) {
    case PlayerState.Idle:
    case PlayerState.Dance:
    case PlayerState.Move:
      tmpTop = PlayerState.Jump;
      break;
    default:
      tmpTop = player.stateTop;
      break;
  }
  switch (player.stateBottom) {
    case PlayerState.Idle:
    case PlayerState.Dance:
    case PlayerState.Move:
      tmpBottom = PlayerState.Jump;
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

function switchFalling(player: PlayerWorldType) {
  let tmpTop, tmpBottom: PlayerState;
  switch (player.stateTop) {
    case PlayerState.Idle:
    case PlayerState.Dance:
      tmpTop = PlayerState.Falling;
      break;
    default:
      tmpTop = player.stateTop;
      break;
  }
  switch (player.stateBottom) {
    case PlayerState.Idle:
    case PlayerState.Dance:
      tmpBottom = PlayerState.Falling;
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

function switchMove(player: PlayerWorldType) {
  let tmpTop, tmpBottom: PlayerState;
  switch (player.stateTop) {
    case PlayerState.Idle:
    case PlayerState.Dance:
    case PlayerState.Jump:
    case PlayerState.Falling:
      tmpTop = PlayerState.Move;
      break;
    default:
      tmpTop = player.stateTop;
      break;
  }
  switch (player.stateBottom) {
    case PlayerState.Idle:
    case PlayerState.Dance:
    case PlayerState.Jump:
    case PlayerState.Falling:
      tmpBottom = PlayerState.Move;
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
