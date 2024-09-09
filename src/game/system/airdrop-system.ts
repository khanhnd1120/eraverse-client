import { With } from "miniplex";
import { world } from "share/G";
import { Entity } from "share/world";

let airdropEntities = world.with("airdrop", "position");
type AirdropEntity = With<Entity, "airdrop" | "position">;

airdropEntities.onEntityAdded.subscribe(onEntityAdded);

export function airdropSystem(delta: number) {}

function onEntityAdded(entity: AirdropEntity) {
  entity.airdrop.serverObject.listen("position", (position: any) => {
    entity.position.set(position.x, position.y, position.z);
    entity.airdrop.position.set(position.x, position.y, position.z);
  });
}
