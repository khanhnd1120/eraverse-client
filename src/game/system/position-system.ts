/** @format */

import { With } from "miniplex";
import { world } from "share/G";
import { Entity } from "share/world";
let positionEntities = world.with("position", "gameObject");
type PositionEntity = With<Entity, "position" | "gameObject">;
positionEntities.onEntityAdded.subscribe(onPositionAdded);
positionEntities.onEntityRemoved.subscribe(onPositionRemoved);
const SMALL_NUMBER = 0.01;
export function positionSystem(delta: number) {
  for (let e of positionEntities) {
    onPositionUpdate(e, delta);
  }
}
function onPositionUpdate(e: PositionEntity, delta: number) {
  if (
    e.position.x === e.gameObject.position.x &&
    e.position.y === e.gameObject.position.y &&
    e.position.z === e.gameObject.position.z
  ) {
    return;
  }
  let distance = e.position.distanceTo(e.gameObject.position);
  if (distance < SMALL_NUMBER) {
    e.gameObject.position.copy(e.position);
  } else {
    // let old = e.gameObject.position.clone();
    // e.gameObject.position.clone().lerp(e.position, 0.05).x
    if (e.airdrop) {
      e.gameObject.position.lerp(e.position, 0.2);
    } else {
      e.gameObject.position.set(
        e.gameObject.position.clone().lerp(e.position, 0.05).x,
        e.gameObject.position.clone().lerp(e.position, 0.2).y,
        e.gameObject.position.clone().lerp(e.position, 0.05).z
      );
    }
  }
}
function onPositionAdded(e: PositionEntity) {}
function onPositionRemoved(e: PositionEntity) {}
