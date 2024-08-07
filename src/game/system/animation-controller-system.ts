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
  ["run_left", "run_left"],
  ["run_right", "run_right"],
];

function animationDirectionMove(entity: PlayerEntity) {
  const player = entity.player;

  entity.animator.items[1].nextAnimation = "idle";
  entity.animator.items[0].nextAnimation = "idle";

  switch (player.stateTop) {
    case PlayerState.Move:
      entity.animator.items[0].nextAnimation =
        RunAnimationDirection[player.direction][0];
      break;
    case PlayerState.Attack:
      entity.animator.items[0].nextAnimation = "punch";
      break;
  }
  switch (player.stateBottom) {
    case PlayerState.Move:
      entity.animator.items[1].nextAnimation =
        RunAnimationDirection[player.direction][1];
      break;
    case PlayerState.Attack:
      entity.animator.items[1].nextAnimation = "punch";
      break;
  }
}

function animation(entity: PlayerEntity) {
  animationDirectionMove(entity);
}
