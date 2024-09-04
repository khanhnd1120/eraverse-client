import { With } from "miniplex";
import addPlayerState from "share/add-player-state";
import G, { world } from "share/G";
import { PlayerState } from "share/game-interface";
import removePlayerState from "share/remove-player-state";
import Setting from "share/setting";
import { Entity } from "share/world";
import {
  Intersection,
  Object3D,
  Object3DEventMap,
  Raycaster,
  Vector3,
} from "three";

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
  let aimPosition = entity.me.aimPoint.getWorldPosition(new Vector3());
  let viewPointPosition = entity.me.viewPoint.getWorldPosition(new Vector3());
  entity.weapon.aimRaycaster.ray.origin.copy(aimPosition);
  entity.weapon.aimRaycaster.ray.direction.copy(
    viewPointPosition.sub(aimPosition).normalize()
  );
  let intersect = entity.weapon.aimRaycaster.intersectObjects(
    G.physicalGroup.children,
    true
  );
  let hit: Intersection<Object3D<Object3DEventMap>>;
  intersect.forEach((inter) => {
    if (
      !hit &&
      (inter.object.type == "Mesh" || inter.object.type == "SkinnedMesh")
    ) {
      hit = inter;
    }
  });
  if (!hit) {
    return {};
  }
  let distance = hit.distance;
  let target = hit.object;
  if (target.userData.type === "enemy" && distance < 2) {
    G.getCurrentRoom().send("attack", {
      target: target.userData.id,
    });
  }
}
