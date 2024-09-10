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
  ["walking_backward", "walking_backward"],
  ["walking_left", "walking_left"],
  ["walking_right", "walking_right"],
];

function canSetArrAnimation(item: AnimatorItem) {
  return (
    !item?.currentArrAnimationItem ||
    item?.currentArrAnimationItem?.canSwitchAnimInstantly
  );
}

function animationDirectionMove(entity: PlayerEntity) {
  const player = entity.player;

  let animMoveDirection = WalkAnimationDirection;
  let midleMove = "walking_forward";
  if (player.isRun) {
    animMoveDirection = RunAnimationDirection;
    midleMove = "run_forward";
  }
  entity.animator.items.map((item, index) => {
    switch ([player.stateTop, player.stateBottom][index]) {
      case PlayerState.Move:
        if (
          canSetArrAnimation(item) &&
          !(
            item.currentArrAnimationItem &&
            item.currentArrAnimationItem.anim ===
              animMoveDirection[player.direction][index]
          )
        ) {
          let nextAnim = animMoveDirection[player.direction][index];
          item.arrAnimation = [];
          if (nextAnim !== midleMove && item.currentAnimation !== midleMove) {
            item.arrAnimation.push({
              anim: midleMove,
              canSwitchAnimInstantly: false,
              duration: 0.8,
            });
          }
          item.arrAnimation.push({
            anim: animMoveDirection[player.direction][index],
            canSwitchAnimInstantly: true,
          });
        }
        break;
      case PlayerState.Attack:
        if (canSetArrAnimation(item)) {
          item.arrAnimation = [
            { anim: "punch", canSwitchAnimInstantly: false },
          ];
        }
        break;
      case PlayerState.Jump:
      case PlayerState.Falling:
        if (canSetArrAnimation(item)) {
          item.arrAnimation = [
            { anim: "fall_idle", canSwitchAnimInstantly: false },
            {
              anim: "fall_to_landing",
              canSwitchAnimInstantly: false,
            },
          ];
        }
        break;
      case PlayerState.Dance:
        if (
          player.danceAnim &&
          canSetArrAnimation(item) &&
          !(
            item.currentArrAnimationItem &&
            item.currentArrAnimationItem.anim === player.danceAnim
          )
        ) {
          item.arrAnimation = [
            {
              anim: player.danceAnim,
              canSwitchAnimInstantly: true,
            },
          ];
        } else {
          if (
            !player.danceAnim &&
            canSetArrAnimation(item) &&
            !(
              item.currentArrAnimationItem &&
              item.currentArrAnimationItem.anim === "idle"
            )
          ) {
            item.arrAnimation = [
              {
                anim: "idle",
                canSwitchAnimInstantly: true,
              },
            ];
          }
        }
        break;
      case PlayerState.Beaten:
        if (canSetArrAnimation(item)) {
          item.arrAnimation = [
            {
              anim: "die",
              canSwitchAnimInstantly: false,
            },
            { anim: "stand", canSwitchAnimInstantly: false },
            {
              anim: "walking_backward",
              canSwitchAnimInstantly: false,
            },
          ];
        }
        break;
      case PlayerState.Idle:
        if (
          canSetArrAnimation(item) &&
          !(
            item.currentArrAnimationItem &&
            item.currentArrAnimationItem.anim === "idle"
          )
        ) {
          item.arrAnimation = [
            {
              anim: "idle",
              canSwitchAnimInstantly: true,
            },
          ];
        }
        break;
    }
  });
}

function animation(entity: PlayerEntity) {
  animationDirectionMove(entity);
}
