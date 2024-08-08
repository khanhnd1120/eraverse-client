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
    e.gameObject.position.lerp(e.position, 0.2);
  }
}
function onPositionAdded(e: PositionEntity) {}
function onPositionRemoved(e: PositionEntity) {}
