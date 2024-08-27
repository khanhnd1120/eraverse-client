import G, { world } from "share/G";
import { With } from "miniplex";
import { Entity } from "share/world";
import {
  BoxGeometry,
  EdgesGeometry,
  EquirectangularReflectionMapping,
  Euler,
  LineSegments,
  Mesh,
  MeshStandardMaterial,
  Object3D,
  Object3DEventMap,
  Raycaster,
  Vector3,
} from "three";
import { loadTexture } from "game/help/loader";
import { Capsule, GLTF, TextGeometry } from "three/examples/jsm/Addons.js";
import * as Colyseus from "colyseus.js";
import api from "share/api";
import myState from "share/my-state";
import { asyncScheduler, BehaviorSubject, throttleTime } from "rxjs";
import { Direction } from "share/game-interface";
import Setting from "share/setting";
import assets from "share/assets";
import Constants from "share/game-constant";
import _ from "lodash";
import updateMaterialModel from "share/update-material-model";

let gameScreenEntities = world.with("gameScreen");
type GameEntity = With<Entity, "gameScreen">;

gameScreenEntities.onEntityAdded.subscribe((newEntity: GameEntity) => {
  init(newEntity);
});

gameScreenEntities.onEntityRemoved.subscribe((removedEntity: GameEntity) => {
  dispose(removedEntity);
});

async function init(entity: GameEntity) {
  // setup camera
  G.camera.rotation.order = "YXZ";
  G.camera.position.set(2, 2, 2);
  G.camera.lookAt(new Vector3(0, 0, 0));

  // load map
  let gltf: GLTF = assets.getModel(entity.gameScreen.map);
  myState.reloadMaterial$.subscribe((names: string[]) => {
    gltf.scene.traverse(async (child: any) => {
      updateMaterialModel(child, entity.gameScreen.map, names);
    });
  });
  gltf.scene.scale.copy(new Vector3(10, 10, 10));
  G.physicalGroup.add(gltf.scene);
  let pos: any[] = [];
  pos.forEach((child) => gltf.scene.remove(child));

  // load enviroment
  let texture = await loadTexture("textures/png/skybox.jpg");
  texture.mapping = EquirectangularReflectionMapping;
  G.scene.background = texture;
  G.scene.environment = texture;

  // setup world logic
  G.worldOctree.fromGraphNode(gltf.scene);

  // setup colyseus
  G.client = new Colyseus.Client(entity.gameScreen.server.url);
  G.client.auth.token = api.getToken() || "anonymous";
  let room: any = await G.client.joinOrCreate(entity.gameScreen.roomName, {
    character: entity.gameScreen.character,
  });
  G.setCurrentRoom(room);
  entity.gameScreen.room = room;

  room.state.players.onAdd((player: any, key: any) => {
    onPlayerAdded(entity, player, key);
  });
  room.state.players.onRemove((player: any, key: any) => {
    world.remove(entity.gameScreen.keyEntities[key]);
  });
  myState.loadingGame$.next(false);
}
function onPlayerAdded(entity: GameEntity, player: any, key: string) {
  let room = G.getCurrentRoom();
  const { nameObject, chatBox } = createTextPlayer(player);
  if (key === room.sessionId) {
    //collect event and send to server
    let dataSubscription = [];
    dataSubscription.push(
      myState.position$
        .pipe(throttleTime(50, asyncScheduler, { trailing: true }))
        .subscribe((newPosition: Vector3 | null) => {
          if (newPosition === null) {
            return;
          }
          G.getCurrentRoom().send("position", {
            pos: newPosition,
          });
        })
    );
    dataSubscription.push(
      myState.direction$
        .pipe(throttleTime(50, asyncScheduler, { trailing: true }))
        .subscribe((newDirection: Direction | null) => {
          G.getCurrentRoom().send("direction", {
            direction: newDirection,
          });
        })
    );
    dataSubscription.push(
      myState.cameraRotation$
        .pipe(throttleTime(100, asyncScheduler, { trailing: true }))
        .subscribe((newRotation: Euler | null) => {
          if (newRotation === null) {
            return;
          }
          G.getCurrentRoom().send("rotate", {
            rotation: { x: newRotation.x, y: newRotation.y, z: newRotation.z },
          });
        })
    );
    let meObject = new Object3D<Object3DEventMap>();
    meObject.add(nameObject);
    meObject.add(chatBox);
    meObject.position.set(
      player.position.x,
      player.position.y,
      player.position.z
    );
    let mainObject = new Object3D();
    let secondaryObject = new Object3D();

    meObject.add(mainObject);
    meObject.add(secondaryObject);
    secondaryObject.position.set(0, Setting.getSetting().PLAYER_VIEW, 0);
    mainObject.position.set(0, Setting.getSetting().PLAYER_VIEW, 0);

    const followCameraPosition = new Vector3(0, 0.1, -1.2);
    let followCamera = new Object3D();
    followCamera.position.set(
      followCameraPosition.x,
      followCameraPosition.y,
      followCameraPosition.z
    );
    mainObject.add(followCamera);

    let defaultFollowCam = new Object3D();
    defaultFollowCam.position.set(
      followCameraPosition.x,
      followCameraPosition.y,
      followCameraPosition.z
    );
    mainObject.add(defaultFollowCam);

    let secondaryCamera = new Object3D();
    secondaryCamera.position.set(
      followCameraPosition.x,
      followCameraPosition.y,
      followCameraPosition.z
    );
    secondaryObject.add(secondaryCamera);

    const viewPointPosition = new Vector3(0, 0.1, 2);
    let viewPoint = new Object3D();
    viewPoint.position.set(
      viewPointPosition.x,
      viewPointPosition.y,
      viewPointPosition.z
    );
    mainObject.add(viewPoint);

    let aimPoint = new Object3D();
    aimPoint.position.set(
      -(
        (viewPointPosition.z - followCameraPosition.z) *
          -followCameraPosition.x +
        (-viewPointPosition.x - followCameraPosition.x) *
          -followCameraPosition.z
      ) /
        (viewPointPosition.z - followCameraPosition.z),
      followCameraPosition.y,
      0
    );
    mainObject.add(aimPoint);

    G.particleGroup.add(meObject);
    let e = world.add({
      gameObject: meObject,
      me: {
        onMouseMove: () => {},
        onKeyDown: () => {},
        onKeyUp: () => {},
        onMouseDown: () => {},
        onMouseUp: () => {},
        onPointerLockChange: () => {},
        followCamera,
        secondaryCamera,
        defaultFollowCam,
        aimPoint,
        mainObject,
        secondaryObject,
        viewPoint,
        velocity: new Vector3(),
        collider: new Capsule(
          new Vector3(player.position.x, player.position.y, player.position.z),
          new Vector3(
            player.position.x,
            player.position.y + Setting.getSetting().PLAYER_VIEW,
            player.position.z
          ),
          0.35
        ),
        isOnFloor: false,
        keyStates: {},
        direction: new Vector3(),
        moveForward: 0,
        moveBackward: 0,
        moveLeft: 0,
        moveRight: 0,
      },
      weapon: {
        attackTimer: 0,
        aimRaycaster: new Raycaster(),
      },
      player: {
        stateTop: player.stateTop,
        stateBottom: player.stateBottom,
        direction: player.direction,
        serverObject: player,
        danceAnim: "",
        key,
        nameObject,
        chatBox,
      },
      model: {
        name: "model_female_premium",
        scale: new Vector3(0.1, 0.1, 0.1),
        position: new Vector3(0, 0, 0),
        traverse: (child: any) => {
          if (child.isMesh) {
            const materialId =
              myState.meshMaterial$.value[player.character]?.[child.name];
            if (
              materialId &&
              assets.getMaterials()[materialId] &&
              assets.getMaterials()[materialId].mat
            ) {
              child.material = assets.getMaterials()[materialId].mat;
            }
          }
        },
        parent: meObject,
        modelReady$: new BehaviorSubject<boolean>(false),
      },
      animator: {
        items: [
          {
            model: "female_anim_top",
            currentAnimation: "",
            nextAnimation: "idle",
            clips: _.cloneDeep(Constants.AnimClipModel),
            duration: 0,
            arrAnimation: [],
            currentClip: null,
          },
          {
            model: "female_anim_bottom",
            currentAnimation: "",
            nextAnimation: "idle",
            clips: _.cloneDeep(Constants.AnimClipModel),
            duration: 0,
            arrAnimation: [],
            currentClip: null,
          },
        ],
        ready$: new BehaviorSubject<boolean>(false),
      },
    });
    entity.gameScreen.keyEntities[key] = e;
  } else {
    let playerObject = new Object3D<Object3DEventMap>();
    playerObject.add(nameObject);
    playerObject.add(chatBox);
    playerObject.position.set(
      player.position.x,
      player.position.y,
      player.position.z
    );
    G.physicalGroup.add(playerObject);
    let playerE = world.add({
      gameObject: playerObject,
      position: playerObject.position.clone(),
      model: {
        name: "model_female_premium",
        scale: new Vector3(0.1, 0.1, 0.1),
        position: new Vector3(0, 0, 0),
        traverse: (child: any) => {
          if (child.isMesh) {
            const materialId =
              myState.meshMaterial$.value[player.character]?.[child.name];
            if (
              materialId &&
              assets.getMaterials()[materialId] &&
              assets.getMaterials()[materialId].mat
            ) {
              child.material = assets.getMaterials()[materialId].mat;
            }
            child.userData = { type: "enemy", id: key };
          }
        },
        parent: playerObject,
        modelReady$: new BehaviorSubject<boolean>(false),
      },
      weapon: {
        attackTimer: 0,
        aimRaycaster: new Raycaster(),
      },
      player: {
        stateTop: player.stateTop,
        stateBottom: player.stateBottom,
        direction: player.direction,
        serverObject: player,
        danceAnim: "",
        nameObject,
        chatBox,
      },
      animator: {
        items: [
          {
            model: "female_anim_top",
            currentAnimation: "",
            nextAnimation: "idle",
            clips: _.cloneDeep(Constants.AnimClipModel),
            duration: 0,
            arrAnimation: [],
            currentClip: null,
          },
          {
            model: "female_anim_bottom",
            currentAnimation: "",
            nextAnimation: "idle",
            clips: _.cloneDeep(Constants.AnimClipModel),
            duration: 0,
            arrAnimation: [],
            currentClip: null,
          },
        ],
        ready$: new BehaviorSubject<boolean>(false),
      },
    });
    entity.gameScreen.keyEntities[key] = playerE;
  }
}

function dispose(entity: GameEntity) {
  entity.gameScreen.room?.leave(true);
  G.getCurrentRoom().leave();
}

function createTextPlayer(player: any) {
  const nameObject = new Object3D();
  nameObject.position.set(0, Setting.getSetting().PLAYER_VIEW + 0.1, 0);
  const name = assets.createNeonLightText(player.name.slice(0, 10));
  nameObject.add(name);

  const chatBox = new Object3D();
  chatBox.position.set(0, Setting.getSetting().PLAYER_VIEW + 0.2, 0);
  const geometry = new BoxGeometry(0.6, 0.05, 0.01);
  const edges = new EdgesGeometry(geometry);
  const line = new LineSegments(edges, assets.getNeonTextMaterial());
  line.position.set(0, 0, 0);
  chatBox.add(line);

  const contentGeometry = new BoxGeometry(0.6, 0.05, 0.01);
  const content = new Mesh(
    contentGeometry,
    new MeshStandardMaterial({
      color: 0x00ffff,
      emissive: 0x00ffff,
      emissiveIntensity: 1,
      metalness: 0.5,
      roughness: 0.1,
      opacity: 0.2,
      transparent: true,
    })
  );
  chatBox.add(content);
  chatBox.visible = false;

  return {
    chatBox,
    nameObject,
  };
}
export function gameScreenSystem(delta: number) {}
