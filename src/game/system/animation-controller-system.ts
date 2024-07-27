import { With } from "miniplex";
import { world } from "share/G";
import { PlayerState } from "share/game-interface";
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
  ["run_right", "run_right"],
  ["run_left", "run_left"],
];
const JumpAnimationDirection = [
  [],
  ["jump_forward", "jump_forward"],
  ["jump_backward", "jump_backward"],
  ["jump_right", "jump_right"],
  ["jump_left", "jump_left"],
];

function animationDirectionMove(entity: PlayerEntity) {
  const soldier = entity.player;

  entity.animator.items[1].nextAnimation = "idle";
  entity.animator.items[0].nextAnimation = "idle";
  if (soldier.state === PlayerState.Move) {
    // run
    entity.animator.items[1].nextAnimation =
      RunAnimationDirection[soldier.direction][1];
    entity.animator.items[0].nextAnimation =
      RunAnimationDirection[soldier.direction][0];
  }
  if (soldier.state === PlayerState.Jump) {
    entity.animator.items[1].nextAnimation =
      JumpAnimationDirection[soldier.direction][1];
    entity.animator.items[0].nextAnimation =
      JumpAnimationDirection[soldier.direction][0];
  }
}

function animation(entity: PlayerEntity) {
  const soldier = entity.player;
  animationDirectionMove(entity);
}
