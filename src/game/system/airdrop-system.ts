import { With } from "miniplex";
import G, { world } from "share/G";
import { AirdropStatus } from "share/game-interface";
import { Entity } from "share/world";
import TWEEN from "@tweenjs/tween.js";
import { Easing } from "three/examples/jsm/libs/tween.module.js";
import { Vector3 } from "three";

let airdropEntities = world.with("airdrop", "position");
type AirdropEntity = With<Entity, "airdrop" | "position">;

airdropEntities.onEntityAdded.subscribe(onEntityAdded);

export function airdropSystem(delta: number) {}

function onEntityAdded(entity: AirdropEntity) {
  entity.airdrop.serverObject.listen("position", (position: any) => {
    // translate collider
    entity.airdrop.collider.translate(
      new Vector3(position.x, position.y, position.z).sub(
        entity.position.clone()
      )
    );
    entity.position.set(position.x, position.y, position.z);
    entity.airdrop.position.set(position.x, position.y, position.z);
  });
  entity.airdrop.serverObject.listen("status", (status: any) => {
    entity.airdrop.status = status;
    if (status === AirdropStatus.Ready) {
      hideParachute(entity);
    }
    if (status === AirdropStatus.Claimed) {
      entity.gameObject.traverse((child: any) => {
        if (child.material) {
          child.material = child.material.clone();
          child.material.transparent = true;
          child.material.needsUpdate = true;
          new TWEEN.Tween(child.material)
            .to({ opacity: 0 }, 1000)
            .easing(Easing.Quadratic.Out)
            .start();
        }
      });
    }
  });
}

function hideParachute(entity: AirdropEntity) {
  entity.gameObject.traverse((child: any) => {
    if (child.name === "parachute") {
      child.material = child.material.clone();
      child.material.transparent = true;
      child.material.needsUpdate = true;
      setTimeout(() => {
        new TWEEN.Tween(child.material)
          .to({ opacity: 0 }, 1000)
          .easing(Easing.Quadratic.Out)
          .start();
        new TWEEN.Tween(child.scale)
          .to({ x: 18, z: 18 }, 1000)
          .easing(Easing.Quadratic.Out)
          .start();
      }, 500);
    }
  });
}
