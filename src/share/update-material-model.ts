import assets from "./assets";
import createVideoMaterial from "./create-video-material";
import { AdsBoard, AdsType, ConfigKey } from "./game-interface";
import myState from "./my-state";
import rotateMesh from "./rotate-mesh";
import Setting from "./setting";

export default function updateMaterialModel(
  child: any,
  name: string,
  names: string[]
) {
  if (child.isMesh) {
    const adsBoard = Setting.getConfig(ConfigKey.ADS_BOARD) as AdsBoard;
    const rotateMeshData = Setting.getConfig(ConfigKey.ROTATE_MESH);

    if (
      rotateMeshData &&
      rotateMeshData[name] &&
      rotateMeshData[name][child.name]
    ) {
      rotateMesh(child);
    }

    let materialId = myState.meshMaterial$.value[name]?.[child.name];
    let adsIndex = -1;
    let nextAdsIndex = -1;
    let isAds = false;
    if (adsBoard && adsBoard[child.name]) {
      adsIndex =
        child.userData.adsIndex == undefined ? -1 : child.userData.adsIndex;
      adsIndex += 1;
      if (adsIndex >= adsBoard[child.name].length) {
        adsIndex = 0;
      }

      nextAdsIndex = adsIndex + 1;
      if (nextAdsIndex >= adsBoard[child.name].length) {
        nextAdsIndex = 0;
      }

      materialId = adsBoard[child.name][adsIndex].id;
      isAds = true;
    }

    child.castShadow = true;
    child.receiveShadow = true;
    if (!materialId) {
      return;
    }

    if (
      !(
        assets.getMaterials()[materialId] &&
        assets.getMaterials()[materialId].mat
      )
    ) {
      // first load material
      if (isAds) {
        let material;
        switch (adsBoard[child.name][adsIndex].type) {
          case AdsType.Video:
            material = createVideoMaterial({
              ...adsBoard[child.name][adsIndex],
              force: false,
              name: materialId,
            });
            break;
          case AdsType.Banner:
            if (!assets.getMaterials()[materialId]) {
              const matData = adsBoard[child.name][adsIndex];
              assets.setMaterialData(materialId, {
                uuid: materialId,
                map: matData.src,
                isShader: adsBoard[child.name][adsIndex].isShader,
                typeShader: adsBoard[child.name][adsIndex].typeShader,
                colorShader: adsBoard[child.name][adsIndex].colorShader,
              });
              assets.setTextureData(matData.src, {
                url: matData.src,
              });
              material = assets.requestMaterial(materialId);
            }
            break;
        }
        if (material) {
          child.material = material;
          child.userData.adsIndex = adsIndex;
          resetVideo(materialId);
          if (nextAdsIndex !== adsIndex) {
            setTimeout(() => {
              myState.reloadMaterial$.next([
                adsBoard[child.name][nextAdsIndex].id,
              ]);
            }, adsBoard[child.name][adsIndex].time);
          }
        }
        return;
      } else {
        const material = assets.requestMaterial(materialId);
        if (material) {
          child.material = material;
        }
        return;
      }
    }
    if (
      names &&
      names.includes(materialId) &&
      assets.getMaterials()[materialId] &&
      assets.getMaterials()[materialId].mat
    ) {
      // reapply material
      child.material = assets.getMaterials()[materialId].mat;
      if (isAds) {
        child.userData.adsIndex = adsIndex;
        resetVideo(materialId);
        if (nextAdsIndex !== adsIndex) {
          setTimeout(() => {
            myState.reloadMaterial$.next([
              adsBoard[child.name][nextAdsIndex].id,
            ]);
          }, adsBoard[child.name][adsIndex].time);
        }
      }
      return;
    }
  }
  if (child.isGroup) {
    child.children.map((obj: any) => {
      obj.traverse((childObj: any) => {
        updateMaterialModel(childObj, name, names);
      });
    });
  }
}

function resetVideo(id: string) {
  const video = document.getElementById(id);
  if (video) {
    // @ts-ignore
    video.currentTime = 0;
    const isPlaying =
      // @ts-ignore
      // @ts-ignore
      video.currentTime > 0 &&
      // @ts-ignore
      !video.paused &&
      // @ts-ignore
      !video.ended &&
      // @ts-ignore
      video.readyState > video.HAVE_CURRENT_DATA;

    if (!isPlaying) {
      // @ts-ignore
      video.play();
    }
  }
}
