import { With } from "miniplex";
import addPlayerState from "share/add-player-state";
import { world } from "share/G";
import { PlayerState } from "share/game-interface";
import removePlayerState from "share/remove-player-state";
import Setting from "share/setting";
import { Entity } from "share/world";

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
    entity.weapon = {};
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
  }
  // attack finish
  if (
    !isPressAttack &&
    entity.weapon.attackTimer <= 0 &&
    entity.player.stateTop == PlayerState.Attack
  ) {
    entity.player = removePlayerState(PlayerState.Attack, entity.player);
  }
}
