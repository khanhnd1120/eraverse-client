import { With } from "miniplex";
import addPlayerState from "share/add-player-state";
import { world } from "share/G";
import { PlayerState } from "share/game-interface";
import myState from "share/my-state";
import removePlayerState from "share/remove-player-state";
import { Entity } from "share/world";

let playerEntities = world.with("player", "position");
type PlayerEntity = With<Entity, "player" | "position">;

playerEntities.onEntityAdded.subscribe(onEntityAdded);

export function playerSystem(delta: number) {}

function onEntityAdded(entity: PlayerEntity) {
  entity.player.serverObject.listen("position", (position: any) => {
    entity.position.set(position.x, position.y, position.z);
  });

  entity.player.serverObject.listen("rotation", (rotation: any) => {
    entity.gameObject.rotation.y = rotation.y;
  });
  entity.player.serverObject.listen("direction", (direction: any) => {
    entity.player.direction = direction;
  });
  entity.player.serverObject.listen("stateTop", (stateTop: any) => {
    entity.player.stateTop = stateTop;
  });
  entity.player.serverObject.listen("stateBottom", (stateBottom: any) => {
    entity.player.stateBottom = stateBottom;
  });
  entity.player.serverObject.listen("danceAnim", (danceAnim: any) => {
    entity.player.danceAnim = danceAnim;
  });
  entity.player.serverObject.listen("isRun", (isRun: any) => {
    entity.player.isRun = isRun;
  });  
}
