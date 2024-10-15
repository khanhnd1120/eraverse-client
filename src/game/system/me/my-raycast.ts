import G from "share/G";
import { Intersection, Object3D, Object3DEventMap, Vector3 } from "three";

export default function myRaycast(entity: any) {
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
  intersect.forEach((inter: any) => {
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
  return { hit };
}
