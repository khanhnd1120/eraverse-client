import assets from "./assets";
import myState from "./my-state";

export default function updateMaterialModel(
  child: any,
  name: string,
  names: string[]
) {
  if (child.isMesh) {
    const materialId = myState.meshMaterial$.value[name]?.[child.name];
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
      const material = assets.requestMaterial(materialId);
      if (material) {
        child.material = material;
      }
      return;
    }
    if (
      names &&
      names.includes(materialId) &&
      assets.getMaterials()[materialId] &&
      assets.getMaterials()[materialId].mat
    ) {
      // reapply material
      child.material = assets.getMaterials()[materialId].mat;
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
