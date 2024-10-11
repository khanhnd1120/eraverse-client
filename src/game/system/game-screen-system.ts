import G, { world } from "share/G";
import { With } from "miniplex";
import { Entity } from "share/world";
import {
  AnimationMixer,
  Box3,
  BufferAttribute,
  BufferGeometry,
  EquirectangularReflectionMapping,
  Euler,
  Mesh,
  Object3D,
  Object3DEventMap,
  Points,
  PointsMaterial,
  PositionalAudio,
  Raycaster,
  Vector3,
} from "three";
import { loadTexture } from "game/help/loader";
import {
  Capsule,
  GLTF,
  SkeletonUtils,
  TextGeometry,
} from "three/examples/jsm/Addons.js";
import * as Colyseus from "colyseus.js";
import api from "share/api";
import myState from "share/my-state";
import { asyncScheduler, BehaviorSubject, throttleTime } from "rxjs";
import { Direction, NotificationType } from "share/game-interface";
import Setting from "share/setting";
import assets from "share/assets";
import Constants from "share/game-constant";
import _ from "lodash";
import updateMaterialModel from "share/update-material-model";
import utils from "game/help/utils";

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
  G.mapScene = gltf.scene;
  myState.reloadMaterial$.subscribe((names: string[]) => {
    gltf.scene.traverse(async (child: any) => {
      child.userData = {
        ...child.userData,
        worldPosition: child.getWorldPosition(new Vector3()),
      };
      updateMaterialModel(child, entity.gameScreen.map, names);
    });
  });
  // setup SFX
  gltf.scene.traverse(async (child: any) => {
    if (child.name === "Island001") {
      myState.reloadSound$.subscribe((name: string) => {
        if (name !== "bg1") return;
        if (assets.getSound("bg1")) {
          let sound = new PositionalAudio(G.audioListener);
          sound.setBuffer(assets.getSound("bg1"));
          sound.setLoop(true);
          sound.play();
          child.add(sound);
          sound.position.set(0, 0, 0);
        }
      });
    }
  });
  gltf.scene.scale.copy(new Vector3(10, 10, 10));
  G.physicalGroup.add(gltf.scene);
  let pos: any[] = [];
  pos.forEach((child) => gltf.scene.remove(child));

  // load characters
  let code = "FEMALE_02";
  let anim = "idle";
  const character = SkeletonUtils.clone(
    assets.getModel(Constants.CharacterData[code].model).scene
  );
  character.scale.set(0.5, 0.5, 0.5);
  myState.reloadMaterial$.subscribe((names: string[]) => {
    character.traverse((child: any) => {
      updateMaterialModel(child, code, names);
    });
  });
  myState.reloadMaterial$.next(
    Object.keys(myState.meshMaterial$.value[code]).map(
      (key: any) => myState.meshMaterial$.value[code][key]
    )
  );
  let animBottom = assets.getModel(Constants.CharacterData[code].anim_top);
  let animTop = assets.getModel(Constants.CharacterData[code].anim_bottom);
  const mixer = new AnimationMixer(character);
  let idleBottom = mixer.clipAction(
    animBottom.animations.find((a) => a.name == anim)
  );
  let idleTop = mixer.clipAction(
    animTop.animations.find((a) => a.name == anim)
  );
  idleBottom.reset().setEffectiveTimeScale(1).setEffectiveWeight(1).play();
  idleTop.reset().setEffectiveTimeScale(1).setEffectiveWeight(1).play();
  let parent = new Object3D();
  parent.add(character);
  parent.position.set(-8.9, 3.2, -2.5);
  G.scene.add(parent);
  // const positions = combineBuffer(character.scene, "position");
  // createMesh(parent, positions, 0.5, 0, 0, 0, "#B1008D");
  let fpsInterval = 1000 / 30;
  let lastFrameTime = performance.now();
  function loop(currentTime: number) {
    let elapsedTime = currentTime - lastFrameTime;

    if (elapsedTime > fpsInterval) {
      lastFrameTime = currentTime - (elapsedTime % fpsInterval);
      parent.rotation.y += 0.01;
      mixer.update(1 / 60);
    }
    requestAnimationFrame(loop);
  }

  requestAnimationFrame(loop);

  // load enviroment
  let environment = await loadTexture("textures/png/V4.png");
  environment.mapping = EquirectangularReflectionMapping;
  G.scene.background = environment;
  G.scene.environment = environment;

  // setup world logic
  G.worldOctree.fromGraphNode(gltf.scene);

  // setup colyseus
  G.client = new Colyseus.Client(entity.gameScreen.server.url);
  G.client.auth.token = api.getToken() || "anonymous";
  let room: any = await G.client.joinOrCreate(entity.gameScreen.roomName, {});
  room.onMessage("notification", (mess: any) => {
    myState.notification$.next({
      type: NotificationType.Default,
      ...mess,
    });
  });
  G.setCurrentRoom(room);
  entity.gameScreen.room = room;

  room.onLeave((code: any) => {
    myState.notification$.next({
      type: NotificationType.Disconnect,
    });
    G.setCurrentRoom(null);
  });

  room.state.players.onAdd((player: any, key: any) => {
    onPlayerAdded(entity, player, key);
  });
  room.state.players.onRemove((player: any, key: any) => {
    world.remove(entity.gameScreen.keyEntities[key]);
  });
  room.state.airdrops.onAdd((airdrop: any, key: any) => {
    onAirdropAdded(entity, airdrop, key);
  });
  room.state.airdrops.onRemove((airdrop: any, key: any) => {
    world.remove(entity.gameScreen.airdropEntities[key]);
  });
  setTimeout(() => {
    myState.loadingGame$.next(false);
    G.getCurrentRoom()?.send("analytic", {
      fps: G.getFps(),
      numberModel: assets.getCountModel(),
    });
    setInterval(() => {
      G.getCurrentRoom()?.send("analytic", {
        fps: G.getFps(),
        numberModel: assets.getCountModel(),
      });
    }, 300000);
  }, 5000);
}
function onPlayerAdded(entity: GameEntity, player: any, key: string) {
  let room = G.getCurrentRoom();
  let model = player.character.model;
  const { nameObject, chatBox } = createTextPlayer(player);
  if (key === room.sessionId) {
    //collect event and send to server
    let dataSubscription = [];
    dataSubscription.push(
      myState.position$
        .pipe(throttleTime(200, asyncScheduler, { trailing: true }))
        .subscribe((newPosition: Vector3 | null) => {
          if (newPosition === null) {
            return;
          }
          G.getCurrentRoom()?.send("position", {
            pos: newPosition,
          });
        })
    );
    dataSubscription.push(
      myState.direction$
        .pipe(throttleTime(500, asyncScheduler, { trailing: true }))
        .subscribe((newDirection: Direction | null) => {
          G.getCurrentRoom()?.send("direction", {
            direction: newDirection,
          });
        })
    );
    dataSubscription.push(
      myState.cameraRotation$
        .pipe(throttleTime(200, asyncScheduler, { trailing: true }))
        .subscribe((newRotation: Euler | null) => {
          if (newRotation === null) {
            return;
          }
          G.getCurrentRoom()?.send("rotate", {
            rotation: { x: newRotation.x, y: newRotation.y, z: newRotation.z },
          });
        })
    );
    dataSubscription.push(
      myState.isRun$
        .pipe(throttleTime(100, asyncScheduler, { trailing: true }))
        .subscribe((isRun: boolean) => {
          if (isRun === null) {
            return;
          }
          G.getCurrentRoom().send("updatePlayer", {
            isRun,
          });
        })
    );
    myState.listSkin$.next(player.characters);
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
    secondaryObject.position.set(0, 0.3, 0);
    mainObject.position.set(0, 0.3, 0);

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
        isOnFloor: false,
        character: player.character,
        id: player.id,
      },
      model: {
        name: Constants.CharacterData[model].model,
        scale: Constants.CharacterData[model].scale,
        position: new Vector3(0, 0, 0),
        traverse: (child: any) => {
          updateMaterialModel(child, model, assets.getMeshNameByCode(model));
          myState.reloadMaterial$.subscribe((names: string[]) => {
            const playerData = world
              .with("player")
              .entities.filter((entity) => entity.player.id === player.id);
            if (playerData && playerData[0]) {
              updateMaterialModel(
                child,
                playerData[0].player.character.model,
                names
              );
            }
          });
        },
        parent: meObject,
        modelReady$: new BehaviorSubject<boolean>(false),
      },
      animator: {
        items: [
          {
            model: Constants.CharacterData[model].anim_top,
            currentAnimation: "",
            nextAnimation: "idle",
            clips: _.cloneDeep(Constants.AnimClipModel),
            duration: 0,
            arrAnimation: [],
            currentClip: null,
            currentArrAnimationItem: null,
          },
          {
            model: Constants.CharacterData[model].anim_bottom,
            currentAnimation: "",
            nextAnimation: "idle",
            clips: _.cloneDeep(Constants.AnimClipModel),
            duration: 0,
            arrAnimation: [],
            currentClip: null,
            currentArrAnimationItem: null,
          },
        ],
        ready$: new BehaviorSubject<boolean>(false),
      },
      playerSound: {
        bodySoundTop: new PositionalAudio(G.audioListener),
        bodySoundBottom: new PositionalAudio(G.audioListener),
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
        name: Constants.CharacterData[model].model,
        scale: Constants.CharacterData[model].scale,
        position: new Vector3(0, 0, 0),
        traverse: (child: any) => {
          updateMaterialModel(child, model, assets.getMeshNameByCode(model), {
            type: "enemy",
            id: key,
          });
          myState.reloadMaterial$.subscribe((names: string[]) => {
            const playerData = world
              .with("player")
              .entities.filter((entity) => entity.player.id === player.id);
            if (playerData && playerData[0]) {
              updateMaterialModel(
                child,
                playerData[0].player.character.model,
                names,
                {
                  type: "enemy",
                  id: key,
                }
              );
            }
          });
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
        isOnFloor: false,
        character: player.character,
        id: player.id,
      },
      animator: {
        items: [
          {
            model: Constants.CharacterData[model].anim_top,
            currentAnimation: "",
            nextAnimation: "idle",
            clips: _.cloneDeep(Constants.AnimClipModel),
            duration: 0,
            arrAnimation: [],
            currentClip: null,
            currentArrAnimationItem: null,
          },
          {
            model: Constants.CharacterData[model].anim_bottom,
            currentAnimation: "",
            nextAnimation: "idle",
            clips: _.cloneDeep(Constants.AnimClipModel),
            duration: 0,
            arrAnimation: [],
            currentClip: null,
            currentArrAnimationItem: null,
          },
        ],
        ready$: new BehaviorSubject<boolean>(false),
      },
      playerSound: {
        bodySoundTop: new PositionalAudio(G.audioListener),
        bodySoundBottom: new PositionalAudio(G.audioListener),
      },
    });
    entity.gameScreen.keyEntities[key] = playerE;
  }
}

function onAirdropAdded(entity: GameEntity, airdrop: any, key: string) {
  let airdropObject = new Object3D<Object3DEventMap>();
  airdropObject.position.set(
    airdrop.position.x,
    airdrop.position.y,
    airdrop.position.z
  );
  G.physicalGroup.add(airdropObject);
  let e = world.add({
    gameObject: airdropObject,
    position: airdropObject.position.clone(),
    airdrop: {
      serverObject: airdrop,
      status: airdrop.status,
      amount: airdrop.amount,
      rewardType: airdrop.rewardType,
      id: airdrop.id,
      position: airdropObject.position.clone(),
      collider: new Box3(
        airdropObject.position.clone().add(new Vector3(-0.4, -1.2, -0.3)),
        airdropObject.position.clone().add(new Vector3(0.4, -0.8, 0.3))
      ),
    },
    model: {
      name: "airdrop",
      scale: new Vector3(0.01, 0.01, 0.01),
      position: new Vector3(0, 0, 0),
      parent: airdropObject,
      modelReady$: new BehaviorSubject<boolean>(false),
      traverse: (child: any) => {
        updateMaterialModel(
          child,
          airdrop.model,
          assets.getMeshNameByCode(airdrop.model)
        );
        myState.reloadMaterial$.subscribe((names: string[]) => {
          updateMaterialModel(child, airdrop.model, names);
        });
      },
    },
  });
  entity.gameScreen.airdropEntities[key] = e;
}

function dispose(entity: GameEntity) {
  entity.gameScreen.room?.leave(true);
  G.getCurrentRoom().leave();
}

function createTextPlayer(player: any) {
  const nameObject = new Object3D();
  nameObject.position.set(0, Setting.getSetting().PLAYER_VIEW + 0.1, 0);
  const name = new TextGeometry(player.name.slice(0, 10), {
    font: assets.getFont("agency"),
    size: 0.02,
    height: 0.005,
    curveSegments: 1,
    bevelThickness: 0,
    bevelSize: 0,
    bevelSegments: 0,
  });
  name.center();
  nameObject.add(new Mesh(name, assets.getNeonTextMaterial()));
  return {
    chatBox: utils.createPanelText(),
    nameObject,
  };
}
export function gameScreenSystem(delta: number) {}

function createMesh(
  parent: Object3D,
  positions: BufferAttribute,
  scale: number,
  x: number,
  y: number,
  z: number,
  color: string
) {
  const geometry = new BufferGeometry();
  geometry.setAttribute("position", positions.clone());
  geometry.setAttribute("initialPosition", positions.clone());

  // geometry.attributes.position.setUsage(DynamicDrawUsage);

  const clones = [
    [6000, 0, -4000],
    [5000, 0, 0],
    [4000, 0, 2000],
    [1000, 0, 5000],
    [1000, 0, -5000],
    [0, 0, 0],
    [-4000, 0, 1000],
    [-5000, 0, -5000],
  ];

  for (let i = 0; i < clones.length; i++) {
    let mesh = new Points(geometry, new PointsMaterial({ size: 0.01, color }));
    mesh.scale.x = mesh.scale.y = mesh.scale.z = scale;

    mesh.position.x = x + clones[i][0];
    mesh.position.y = y + clones[i][1];
    mesh.position.z = z + clones[i][2];
    parent.add(mesh);
  }
}
function combineBuffer(model: any, bufferName: any) {
  let count = 0;

  model.traverse(function (child: any) {
    if (child.isMesh) {
      const buffer = child.geometry.attributes[bufferName];

      count += buffer.array.length;
    }
  });

  const combined = new Float32Array(count);

  let offset = 0;

  model.traverse(function (child: any) {
    if (child.isMesh) {
      const buffer = child.geometry.attributes[bufferName];

      combined.set(buffer.array, offset);
      offset += buffer.array.length;
    }
  });

  return new BufferAttribute(combined, 3);
}
