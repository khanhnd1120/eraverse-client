import _ from "lodash";
import { combineLatest } from "rxjs";
import { MaterialConfigData, TextureConfigData } from "share/game-interface";
import myState from "share/my-state";
import { Color, MeshPhysicalMaterial, Vector2 } from "three";

export default function loadMaterial() {
  combineLatest([myState.texture$, myState.material$]).subscribe(
    ([texture, material]: [TextureConfigData, MaterialConfigData]) => {
      if (!texture || !material) return;
      Object.keys(material).map((key) => {
        if (material[key].mat) {
          // @ts-ignore
          material[key].mat.normalMap =
            texture[material[key].data.normalMap].texture;
          // @ts-ignore
          material[key].mat.roughnessMap =
            texture[material[key].data.roughnessMap].texture;
          // @ts-ignore
          material[key].mat.metalnessMap =
            texture[material[key].data.metalnessMap].texture;
          // @ts-ignore
          material[key].mat.emissiveMap =
            texture[material[key].data.emissiveMap].texture;
          // @ts-ignore
          material[key].mat.map = texture[material[key].data.map].texture;
          return;
        }
        const mat = new MeshPhysicalMaterial(material[key].data);

        const dataMat = _.cloneDeep(material[key].data);
        mat.normalMap = texture[dataMat.normalMap].texture;
        mat.roughnessMap = texture[dataMat.roughnessMap].texture;
        mat.metalnessMap = texture[dataMat.metalnessMap].texture;
        mat.emissiveMap = texture[dataMat.emissiveMap].texture;
        mat.map = texture[dataMat.map].texture;
        mat.clearcoat = 0.3;
        mat.clearcoatRoughness = 0.25;
        mat.ior = 1.2;
        mat.thickness = 10.0;
        Object.keys(dataMat).map((property) => {
          if (property in mat) {
            if (!["color", "emissive", "normalScale"].includes(property)) {
              // @ts-ignore
              mat[property] = material[key].data[property];
            }
            if (property == "emissive") {
              mat.emissive = new Color(material[key].data[property]);
            }
            if (property == "color") {
              mat.color = new Color(material[key].data[property]);
            }
            if (property == "normalScale") {
              mat[property] = new Vector2(
                material[key].data[property][0],
                material[key].data[property][1]
              );
            }
          }
        });
        material[key].mat = mat;
      });
    }
  );
}
