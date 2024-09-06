import { With } from "miniplex";
import { world } from "share/G";
import { PlayerState } from "share/game-interface";
import myState from "share/my-state";
import { Entity } from "share/world";

let playerEntities = world.with("player");
type PlayerEntity = With<Entity, "player">;
playerEntities.onEntityAdded.subscribe((entity: PlayerEntity) => {
  init(entity);
});
playerEntities.onEntityRemoved.subscribe((entity: PlayerEntity) => {});

export function animationControllerSystem(delta: number) {
  for (const entity of playerEntities) {
    animation(entity);
  }
}

async function init(entity: PlayerEntity) {}

const RunAnimationDirection = [
  [],
  ["run_forward", "run_forward"],
  ["run_backward", "run_backward"],
  ["run_left", "run_left"],
  ["run_right", "run_right"],
];
const WalkAnimationDirection = [
  [],
  ["walking_forward", "walking_forward"],
  ["walking_backward", "walking_backward"],
  ["walking_left", "walking_left"],
  ["walking_right", "walking_right"],
];

function animationDirectionMove(entity: PlayerEntity) {
  const player = entity.player;

  entity.animator.items[1].nextAnimation = "idle";
  entity.animator.items[0].nextAnimation = "idle";
  let animMoveDirection = WalkAnimationDirection;
  if (player.isRun) {
    animMoveDirection = RunAnimationDirection;
  }
  switch (player.stateTop) {
    case PlayerState.Move:
      entity.animator.items[0].nextAnimation =
        animMoveDirection[player.direction][0];
      break;
    case PlayerState.Attack:
      if (
        entity.animator.items[0].arrAnimation.length == 0 &&
        entity.animator.items[0].duration <= 0
      ) {
        entity.animator.items[0].arrAnimation = ["punch"];
      }
      break;
    case PlayerState.Jump:
    case PlayerState.Falling:
      if (
        entity.animator.items[0].arrAnimation.length == 0 &&
        entity.animator.items[0].duration <= 0
      ) {
        entity.animator.items[0].arrAnimation = [
          "fall_idle",
          "fall_to_landing",
        ];
      }
      break;
    case PlayerState.Dance:
      if (player.danceAnim) {
        entity.animator.items[0].nextAnimation = player.danceAnim;
      }
      break;
    case PlayerState.Beaten:
      if (
        entity.animator.items[0].arrAnimation.length == 0 &&
        entity.animator.items[0].duration <= 0
      ) {
        entity.animator.items[0].arrAnimation = [
          "die",
          "stand",
          "walking_backward",
        ];
      }
      break;
  }
  switch (player.stateBottom) {
    case PlayerState.Move:
      entity.animator.items[1].nextAnimation =
        animMoveDirection[player.direction][1];
      break;
    case PlayerState.Attack:
      if (
        entity.animator.items[1].arrAnimation.length == 0 &&
        entity.animator.items[1].duration <= 0
      ) {
        entity.animator.items[1].arrAnimation = ["punch"];
      }
      break;
    case PlayerState.Jump:
    case PlayerState.Falling:
      if (
        entity.animator.items[1].arrAnimation.length == 0 &&
        entity.animator.items[1].duration <= 0
      ) {
        entity.animator.items[1].arrAnimation = [
          "fall_idle",
          "fall_to_landing",
        ];
      }
      break;
    case PlayerState.Dance:
      if (player.danceAnim) {
        entity.animator.items[1].nextAnimation = player.danceAnim;
      }
      break;
    case PlayerState.Beaten:
      if (
        entity.animator.items[1].arrAnimation.length == 0 &&
        entity.animator.items[1].duration <= 0
      ) {
        entity.animator.items[1].arrAnimation = [
          "die",
          "stand",
          "walking_backward",
        ];
      }
      break;
  }
}

function animation(entity: PlayerEntity) {
  animationDirectionMove(entity);
}
