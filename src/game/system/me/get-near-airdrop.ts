import utils from "game/help/utils";
import { With } from "miniplex";
import G, { world } from "share/G";
import { AirdropStatus } from "share/game-interface";
import { Entity } from "share/world";
import { Vector3 } from "three";

type AirdropEntity = With<Entity, "airdrop">;
type MeEntity = With<Entity, "me" | "player">;
let airdropEntities = world.with("airdrop");

export default function getNearAirdrop(entity: MeEntity) {
  let nearestAirdrop: AirdropEntity = null;
  let minDistantAirdrop = 10000;
  for (const airdropData of airdropEntities) {
    if (airdropData.airdrop.status !== AirdropStatus.Ready) {
      continue;
    }
    let distance = Math.max(
      Math.abs(airdropData.airdrop.position.x - entity.gameObject.position.x),
      Math.abs(airdropData.airdrop.position.z - entity.gameObject.position.z)
    );
    if (distance < minDistantAirdrop && distance < 1) {
      minDistantAirdrop = distance;
      nearestAirdrop = airdropData;
    }
  }
  // check remove old airdop
  let isRemoveOldAir = false;
  let isNewAir = false;
  if (nearestAirdrop) {
    if (nearestAirdrop.airdrop.id !== entity.me.tutorialData["airdrop"]?.id) {
      isRemoveOldAir = true;
      isNewAir = true;
    }
  } else {
    isRemoveOldAir = true;
  }
  if (!entity.me.tutorial) {
    entity.me.tutorial = {};
  }
  if (!entity.me.tutorialData) {
    entity.me.tutorialData = {};
  }
  if (isRemoveOldAir) {
    // remove tag open airdrop
    if (entity.me.tutorial["airdrop"]) {
      entity.me.tutorial["airdrop"].visible = false;
      entity.me.tutorialData["airdrop"] = null;
    }
  }
  if (isNewAir) {
    // add new tag open air
    if (!entity.me.tutorial["airdrop"]) {
      entity.me.tutorial["airdrop"] = utils.createPanelText({
        width: 0.2,
      });
      entity.me.tutorial["airdrop"].add(utils.createLineText3D("PRESS E"));
      G.particleGroup.add(entity.me.tutorial["airdrop"]);
    }
    entity.me.tutorial["airdrop"].position.copy(
      nearestAirdrop.airdrop.position
    );
    entity.me.tutorial["airdrop"].position.setY(
      entity.me.tutorial["airdrop"].position.y + 0.5
    );
    entity.me.tutorial["airdrop"].visible = true;
    let camPosition = entity.me.followCamera.getWorldPosition(new Vector3());
    if (entity.me.keyStates["RIGHTMOUSE"]) {
      camPosition = entity.me.secondaryCamera.getWorldPosition(new Vector3());
    }
    entity.me.tutorial["airdrop"].lookAt(camPosition);
    entity.me.tutorialData["airdrop"] = nearestAirdrop.airdrop;
  }
}
