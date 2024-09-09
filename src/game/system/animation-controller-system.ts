import { With } from "miniplex";
import { world } from "share/G";
import { AnimatorItem, PlayerState } from "share/game-interface";
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
  ["walking_forward", "walking_forward"],
  ["walking_horizontal", "walking_horizontal"],
  ["walking_horizontal", "walking_horizontal"],
];

function canSetArrAnimation(item: AnimatorItem) {
  return (
    !item?.currentArrAnimationItem ||
    item?.currentArrAnimationItem?.canSwitchAnim
  );
}

function animationDirectionMove(entity: PlayerEntity) {
  const player = entity.player;

  let animMoveDirection = WalkAnimationDirection;
  if (player.isRun) {
    animMoveDirection = RunAnimationDirection;
  }
  switch (player.stateTop) {
    case PlayerState.Move:
      if (canSetArrAnimation(entity.animator.items[0])) {
        console.log("dfbjh", entity.animator.items[0].duration);
        entity.animator.items[0].arrAnimation = [
          { anim: "walking_forward", canSwitchAnim: false, loop: false },
          {
            anim: animMoveDirection[player.direction][0],
            canSwitchAnim: true,
            loop: true,
          },
        ];
        entity.animator.items[0].duration = 0;
      }
      break;
    case PlayerState.Attack:
      if (canSetArrAnimation(entity.animator.items[0])) {
        entity.animator.items[0].arrAnimation = [
          { anim: "punch", canSwitchAnim: false, loop: false },
        ];
      }
      break;
    case PlayerState.Jump:
    case PlayerState.Falling:
      if (canSetArrAnimation(entity.animator.items[0])) {
        entity.animator.items[0].arrAnimation = [
          { anim: "fall_idle", canSwitchAnim: false, loop: false },
          { anim: "fall_to_landing", canSwitchAnim: false, loop: false },
        ];
      }
      break;
    case PlayerState.Dance:
      if (player.danceAnim) {
        entity.animator.items[0].nextAnimation = player.danceAnim;
      }
      break;
    case PlayerState.Beaten:
      if (canSetArrAnimation(entity.animator.items[0])) {
        entity.animator.items[0].arrAnimation = [
          { anim: "fall_to_landing", canSwitchAnim: false, loop: false },
          { anim: "stand", canSwitchAnim: false, loop: false },
          { anim: "walking_backward", canSwitchAnim: false, loop: false },
        ];
      }
      break;
    case PlayerState.Idle:
      if (
        canSetArrAnimation(entity.animator.items[0]) &&
        !(
          entity.animator.items[0].currentArrAnimationItem &&
          entity.animator.items[0].currentArrAnimationItem.anim === "idle"
        )
      ) {
        entity.animator.items[0].arrAnimation = [
          {
            anim: "idle",
            canSwitchAnim: true,
            loop: true,
          },
        ];
      }
      break;
  }
  switch (player.stateBottom) {
    case PlayerState.Move:
      if (
        entity.animator.items[1].arrAnimation.length == 0 &&
        entity.animator.items[1].duration <= 0
      ) {
        entity.animator.items[1].arrAnimation = [
          { anim: "walking_forward", canSwitchAnim: false, loop: false },
          {
            anim: animMoveDirection[player.direction][1],
            canSwitchAnim: true,
            loop: true,
          },
        ];
        entity.animator.items[1].duration = 0;
      }
      break;
    case PlayerState.Attack:
      if (
        entity.animator.items[1].arrAnimation.length == 0 &&
        entity.animator.items[1].duration <= 0
      ) {
        entity.animator.items[1].arrAnimation = [
          { anim: "punch", canSwitchAnim: false, loop: false },
        ];
      }
      break;
    case PlayerState.Jump:
    case PlayerState.Falling:
      if (
        entity.animator.items[1].arrAnimation.length == 0 &&
        entity.animator.items[1].duration <= 0
      ) {
        entity.animator.items[1].arrAnimation = [
          { anim: "fall_idle", canSwitchAnim: false, loop: false },
          { anim: "fall_to_landing", canSwitchAnim: false, loop: false },
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
          { anim: "fall_to_landing", canSwitchAnim: false, loop: false },
          { anim: "stand", canSwitchAnim: false, loop: false },
          { anim: "walking_backward", canSwitchAnim: false, loop: false },
        ];
      }
      break;
    case PlayerState.Idle:
      if (
        entity.animator.items[1].arrAnimation.length == 0 &&
        entity.animator.items[1].duration <= 0 &&
        !(
          entity.animator.items[1].currentArrAnimationItem &&
          entity.animator.items[1].currentArrAnimationItem.anim === "idle"
        )
      ) {
        entity.animator.items[1].arrAnimation = [
          {
            anim: "idle",
            canSwitchAnim: true,
            loop: true,
          },
        ];
      }
      break;
  }
  if (
    !entity.animator.items[1].currentArrAnimationItem &&
    entity.animator.items[1].arrAnimation.length === 0
  ) {
    entity.animator.items[1].arrAnimation = [
      {
        anim: "idle",
        canSwitchAnim: true,
        loop: true,
      },
    ];
  }
  if (
    !entity.animator.items[0].currentArrAnimationItem &&
    entity.animator.items[0].arrAnimation.length === 0
  ) {
    entity.animator.items[0].arrAnimation = [
      {
        anim: "idle",
        canSwitchAnim: true,
        loop: true,
      },
    ];
  }
}

function animation(entity: PlayerEntity) {
  animationDirectionMove(entity);
}
