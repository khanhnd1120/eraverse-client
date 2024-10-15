import { With } from "miniplex";
import addPlayerState from "share/add-player-state";
import G, { world } from "share/G";
import { PlayerState } from "share/game-interface";
import Setting from "share/setting";
import { Entity } from "share/world";
import {
  Raycaster,
} from "three";
import { myRaycast } from "./me";

let weaponEntities = world.with("me", "weapon", "player");
type WeaponEntity = With<Entity, "me" | "weapon" | "player">;

export default function weaponSystem(delta: number) {
  for (const weapon of weaponEntities) {
    updateWeapon(weapon, delta);
  }
}

function updateWeapon(entity: WeaponEntity, delta: number) {
  // init data
  if (!entity.weapon) {
    entity.weapon = {
      aimRaycaster: new Raycaster(),
    };
  }
  if (!entity.weapon.attackTimer) {
    entity.weapon.attackTimer = 0;
  }

  // update attack timer
  if (entity.weapon.attackTimer > 0) {
    entity.weapon.attackTimer -= delta;
  }

  // check start attack
  let isPressAttack = entity.me.keyStates["LEFTMOUSE"];
  // start attack
  if (isPressAttack && entity.weapon.attackTimer <= 0) {
    entity.weapon.attackTimer = Setting.getSetting().CHARACTER_ATTACK_SPEED;
    entity.player = addPlayerState(PlayerState.Attack, entity.player);
    checkHit(entity);
  }
  // attack finish
  if (
    !isPressAttack &&
    entity.weapon.attackTimer <= 0 &&
    entity.player.stateTop == PlayerState.Attack
  ) {
    // entity.player = removePlayerState(PlayerState.Attack, entity.player);
  }
}

function checkHit(entity: WeaponEntity) {
  const { hit } = myRaycast(entity);
  let distance = hit.distance;
  let target = hit.object;
  if (target.userData.type === "enemy" && distance < 2) {
    G.getCurrentRoom().send("attack", {
      target: target.userData.id,
    });
  }
}
