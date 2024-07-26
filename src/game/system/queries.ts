/** @format */

import { With } from "miniplex";
import { world } from "share/G";
import assets from "share/assets";
import { Entity } from "share/world";
import { SkeletonUtils } from "three/examples/jsm/Addons.js";
let gameObjectEntities = world.with("gameObject");
type GameObjectEntity = With<Entity, "gameObject">;
let modelEntities = world.with("gameObject", "model");
type ModelEntity = With<Entity, "gameObject" | "model">;

export const queries = {
  gameObjectEntities,
  modelEntities,
};
export default function initComponent() {
  gameObjectEntities.onEntityAdded.subscribe(onGameObjectAdded);
  gameObjectEntities.onEntityRemoved.subscribe(onGameObjectRemoved);
  modelEntities.onEntityAdded.subscribe(onModelAdded);
  modelEntities.onEntityRemoved.subscribe(onModelRemoved);
}
function onGameObjectAdded(entity: GameObjectEntity) {}
function onGameObjectRemoved(entity: GameObjectEntity) {
  entity.gameObject.removeFromParent();
}
function onModelAdded(entity: ModelEntity) {
  entity.model.object = SkeletonUtils.clone(
    assets.getModel(entity.model.name).scene
  );
  entity.model.object.scale.copy(entity.model.scale);

  if (entity.model.parent) {
    entity.model.parent.add(entity.model.object);
  } else {
    entity.gameObject.add(entity.model.object);
  }
  if (entity.model.rotation) {
    entity.model.object.rotation.set(
      entity.model.rotation.x,
      entity.model.rotation.y,
      entity.model.rotation.z
    );
  }
  if (entity.model.material) {
    entity.model.object.traverse((child: any) => {
      if (child.isMesh) {
        child.material = entity.model.material;
      }
    });
  }
  if (entity.model.position) {
    entity.model.object.position.copy(entity.model.position);
  }
  if (entity.model.traverse) {
    entity.model.object.traverse(entity.model.traverse);
  }
  if (entity.model.modelReady$) {
    entity.model.modelReady$.next(true);
  }
}
function onModelRemoved(entity: ModelEntity) {
  entity.gameObject.remove(entity.model.object);
}
