import utils from "game/help/utils";
import { With } from "miniplex";
import G from "share/G";
import { AdsBoard, ConfigKey } from "share/game-interface";
import Setting from "share/setting";
import { Entity } from "share/world";
import { Vector3 } from "three";

type MeEntity = With<Entity, "me" | "player">;
export default function getAdsAction(entity: MeEntity) {
  if (!G.mapScene) {
    return;
  }
  let nearestAds: any = null;
  let minDistantAds = 10000;
  const adsBoard = Setting.getConfig(ConfigKey.ADS_BOARD) as AdsBoard;

  G.mapScene.traverse((child: any) => {
    const adsData = adsBoard[child.name];
    const adsIndex = child.userData.adsIndex;
    if (
      child.userData &&
      child.userData.worldPosition &&
      adsData &&
      adsData[adsIndex] &&
      adsData[adsIndex].actions
    ) {
      let distance = Math.max(
        Math.abs(child.userData.worldPosition.x - entity.gameObject.position.x),
        Math.abs(child.userData.worldPosition.z - entity.gameObject.position.z)
      );
      if (distance < minDistantAds && distance < 1) {
        minDistantAds = distance;
        nearestAds = {
          ...adsData[adsIndex],
          id: `${child.name}_${adsIndex}`,
          position: child.userData.worldPosition,
        };
      }
    }
  });

  let isRemoveOldAir = false;
  let isNewAir = false;
  if (nearestAds) {
    if (nearestAds.id !== entity.me.tutorialData["ads"]?.id) {
      isRemoveOldAir = true;
      isNewAir = true;
    }
  } else {
    isRemoveOldAir = true;
  }

  if (isRemoveOldAir) {
    // remove tag open ads
    if (entity.me.tutorial["ads"]) {
      entity.me.tutorial["ads"].visible = false;
      entity.me.tutorialData["ads"] = null;
    }
  }
  if (isNewAir) {
    // add new tag open air
    if (!entity.me.tutorial["ads"]) {
      entity.me.tutorial["ads"] = utils.createPanelText({
        width: 0.2,
      });
      entity.me.tutorial["ads"].add(utils.createLineText3D("PRESS E"));
      G.particleGroup.add(entity.me.tutorial["ads"]);
    }
    entity.me.tutorial["ads"].position.copy(nearestAds.position);
    entity.me.tutorial["ads"].position.setY(
      entity.me.tutorial["ads"].position.y + 0.5
    );
    entity.me.tutorial["ads"].visible = true;
    let camPosition = entity.me.followCamera.getWorldPosition(new Vector3());
    if (entity.me.keyStates["RIGHTMOUSE"]) {
      camPosition = entity.me.secondaryCamera.getWorldPosition(new Vector3());
    }
    entity.me.tutorial["ads"].lookAt(camPosition);
    entity.me.tutorialData["ads"] = nearestAds;
  }
}
