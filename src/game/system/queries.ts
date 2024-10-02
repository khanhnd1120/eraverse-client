/** @format */

import { With } from "miniplex";
import { world } from "share/G";
import addPlayerState from "share/add-player-state";
import assets from "share/assets";
import Constants from "share/game-constant";
import { PlayerState } from "share/game-interface";
import myState from "share/my-state";
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
  loadModel(entity);
  if (entity.player) {
    entity.player.serverObject.listen("character", (characterData: any) => {
      let character = characterData.model;
      if (entity.player.character !== character) {
        entity.player.character = character;
        let newModel = Constants.CharacterData[character].model;
        if (newModel !== entity.model.name) {
          entity.model.name = Constants.CharacterData[character].model;
          if (entity.model.parent) {
            entity.model.parent.remove(entity.model.object);
          } else {
            entity.gameObject.remove(entity.model.object);
          }
          loadModel(entity);
        } else {
          entity.player.character = character;
          myState.reloadMaterial$.next(
            Object.keys(myState.meshMaterial$.value[character]).map(
              (key: any) => myState.meshMaterial$.value[character][key]
            )
          );
        }
        entity.player = addPlayerState(PlayerState.Jump, entity.player);
      }
    });
  }
}
function loadModel(entity: ModelEntity) {
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
