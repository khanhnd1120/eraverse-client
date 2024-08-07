import _ from "lodash";
import myState from "share/my-state";
import { Color, Euler, MeshPhysicalMaterial, Vector2 } from "three";

export default function loadMaterial() {
  myState.material$.subscribe((material) => {
    const tmp = _.cloneDeep(material);
    let isChanged = false;
    Object.keys(tmp).map((key) => {
      if (tmp[key].mat) {
        return;
      }
      isChanged = true;
      const materialData = tmp[key].data;
      delete materialData.metadata;
      const mat = new MeshPhysicalMaterial(materialData);

      const dataMat = _.cloneDeep(materialData);
      if (dataMat.normalMap && myState.texture$.value[dataMat.normalMap]) {
        mat.normalMap = myState.texture$.value[dataMat.normalMap].texture;
      }
      if (
        dataMat.roughnessMap &&
        myState.texture$.value[dataMat.roughnessMap]
      ) {
        mat.roughnessMap = myState.texture$.value[dataMat.roughnessMap].texture;
      }
      if (
        dataMat.metalnessMap &&
        myState.texture$.value[dataMat.metalnessMap]
      ) {
        mat.metalnessMap = myState.texture$.value[dataMat.metalnessMap].texture;
      }
      if (dataMat.emissiveMap && myState.texture$.value[dataMat.emissiveMap]) {
        mat.emissiveMap = myState.texture$.value[dataMat.emissiveMap].texture;
      }
      if (dataMat.map && myState.texture$.value[dataMat.map]) {
        mat.map = myState.texture$.value[dataMat.map].texture;
      }
      // mat.clearcoat = 0.3;
      mat.clearcoatRoughness = 0;
      mat.ior = 1.45;
      mat.thickness = 0;
      Object.keys(dataMat).map((property) => {
        if (property in mat) {
          if (
            [
              "map",
              "emissiveMap",
              "metalnessMap",
              "roughnessMap",
              "normalMap",
              "metadata",
            ].includes(property)
          ) {
            return;
          }
          if (
            ![
              "color",
              "emissive",
              "normalScale",
              "envMapRotation",
              "blendColor",
              "attenuationColor",
              "specularColor",
              "emissive",
              "sheenColor",
            ].includes(property)
          ) {
            // @ts-ignore
            mat[property] = materialData[property];
          }
          if (property == "emissive") {
            mat.emissive = new Color(materialData[property]);
          }
          if (
            [
              "color",
              "blendColor",
              "attenuationColor",
              "specularColor",
              "emissive",
              "sheenColor",
            ].includes(property)
          ) {
            // @ts-ignore
            mat[property] = new Color(materialData[property]);
          }
          if (property == "envMapRotation") {
            mat[property] = new Euler(
              materialData[property][0],
              materialData[property][1],
              materialData[property][2],
              materialData[property][3]
            );
          }
          if (property == "normalScale") {
            mat[property] = new Vector2(
              materialData[property][0],
              materialData[property][1]
            );
          }
        }
      });
      tmp[key].mat = mat;
    });
    if (isChanged) {
      myState.material$.next(tmp);
    }
  });
  myState.texture$.subscribe((texture) => {
    if (!texture || !myState.material$.value) return;
    let isChange = false;
    Object.keys(myState.material$.value).map((key) => {
      let materialData = myState.material$.value[key];
      if (materialData.mat) {
        if (
          // @ts-ignore
          !materialData.mat.normalMap &&
          materialData.data.normalMap &&
          texture[materialData.data.normalMap]
        ) {
          // @ts-ignore
          materialData.mat.normalMap =
            texture[materialData.data.normalMap].texture;
          isChange = true;
        }
        if (
          // @ts-ignore
          !materialData.mat.roughnessMap &&
          materialData.data.roughnessMap &&
          texture[materialData.data.roughnessMap]
        ) {
          // @ts-ignore
          materialData.mat.roughnessMap =
            texture[materialData.data.roughnessMap].texture;
          isChange = true;
        }
        if (
          // @ts-ignore
          !materialData.mat.metalnessMap &&
          materialData.data.metalnessMap &&
          texture[materialData.data.metalnessMap]
        ) {
          // @ts-ignore
          materialData.mat.metalnessMap =
            texture[materialData.data.metalnessMap].texture;
          isChange = true;
        }
        if (
          // @ts-ignore
          !materialData.mat.emissiveMap &&
          materialData.data.emissiveMap &&
          texture[materialData.data.emissiveMap]
        ) {
          // @ts-ignore
          materialData.mat.emissiveMap =
            texture[materialData.data.emissiveMap].texture;
          isChange = true;
        }
        if (
          // @ts-ignore
          !materialData.mat.map &&
          materialData.data.map &&
          texture[materialData.data.map]
        ) {
          // @ts-ignore
          materialData.mat.map = texture[materialData.data.map].texture;
          isChange = true;
        }
        return;
      }
    });
    if (isChange) {
      myState.material$.next(myState.material$.value);
    }
  });
}
