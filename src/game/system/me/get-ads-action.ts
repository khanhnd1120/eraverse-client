import utils from "game/help/utils";
import { With } from "miniplex";
import G from "share/G";
import { AdsBoard, ConfigKey } from "share/game-interface";
import Setting from "share/setting";
import { Entity } from "share/world";
import { Vector3 } from "three";
import myRaycast from "./my-raycast";
import myState from "share/my-state";

type MeEntity = With<Entity, "me" | "player">;
export default function getAdsAction(entity: MeEntity) {
  if (!G.mapScene) {
    return;
  }
  if (entity.me.tutorialData["airdrop"]) {
    if (myState.tutorialAction$.value?.ads) {
      myState.tutorialAction$.next({
        ...myState.tutorialAction$.value,
        ads: false,
      });
    }
    return;
  }
  let viewPointPosition = entity.me.viewPoint.getWorldPosition(new Vector3());
  if (!entity.me.tutorialData["ads"]) {
    entity.me.tutorialData["ads"] = {
      viewPointPosition,
      isCal: false,
    };
    return;
  }
  const oldViewPos = entity.me.tutorialData["ads"].viewPointPosition;
  if (
    Math.abs(viewPointPosition.x - oldViewPos.x) < 0.01 &&
    Math.abs(viewPointPosition.y - oldViewPos.y) < 0.01 &&
    Math.abs(viewPointPosition.z - oldViewPos.z) < 0.01
  ) {
    if (entity.me.tutorialData["ads"].isCal) {
      return;
    }
    if (new Date().getTime() - entity.me.tutorialData["ads"].time < 2600) {
      return;
    }
    // calculate raycast
    const { hit } = myRaycast(entity);
    let target = hit.object;
    const adsBoard = Setting.getConfig(ConfigKey.ADS_BOARD) as AdsBoard;
    const adsData = adsBoard[target.name];
    const adsIndex = target.userData.adsIndex;

    if (adsData && adsData[adsIndex] && adsData[adsIndex].actions) {
      const id = `${target.name}_${adsIndex}`;
      entity.me.tutorialData["ads"] = {
        viewPointPosition,
        isCal: true,
        ...adsData[adsIndex],
        id,
        time: new Date().getTime(),
      };
      myState.tutorialAction$.next({
        ...myState.tutorialAction$.value,
        ads: true,
      });
    } else {
      myState.tutorialAction$.next({
        ...myState.tutorialAction$.value,
        ads: false,
      });
    }
    entity.me.tutorialData["ads"].isCal = true;
    return;
  }
  if (myState.tutorialAction$.value?.ads) {
    myState.tutorialAction$.next({
      ...myState.tutorialAction$.value,
      ads: false,
    });
  }
  entity.me.tutorialData["ads"] = {
    viewPointPosition,
    isCal: false,
  };
}
