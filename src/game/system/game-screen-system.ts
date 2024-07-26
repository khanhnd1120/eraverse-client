import G, { world } from "share/G";
import { With } from "miniplex";
import { Entity } from "share/world";
import {
  EquirectangularReflectionMapping,
  Euler,
  LoopOnce,
  Object3D,
  Object3DEventMap,
  Vector3,
} from "three";
import { loadGltf, loadTexture } from "game/help/loader";
import { Capsule, GLTF } from "three/examples/jsm/Addons.js";
import * as Colyseus from "colyseus.js";
import api from "share/api";
import myState from "share/my-state";
import { asyncScheduler, BehaviorSubject, throttleTime } from "rxjs";
import { Direction } from "share/game-interface";
import Setting from "share/setting";

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
  let gltf: GLTF = await loadGltf(entity.gameScreen.map);
  G.physicalGroup.add(gltf.scene);
  let pos: any[] = [];
  pos.forEach((child) => gltf.scene.remove(child));

  // load enviroment
  let texture = await loadTexture("FpLUaV5aMAAZz3i.jfif");
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
}
function onPlayerAdded(entity: GameEntity, player: any, key: string) {
  let room = G.getCurrentRoom();
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
    meObject.position.set(
      player.position.x,
      player.position.y,
      player.position.z
    );
    let weaponObject = new Object3D<Object3DEventMap>();
    let mainObject = new Object3D();

    meObject.add(mainObject);
    mainObject.position.set(0, Setting.getSetting().PLAYER_VIEW + 0.2, 0);

    let followCamera = new Object3D();
    followCamera.position.set(-0.6, 0.5, -3);
    mainObject.add(followCamera);

    let defaultFollowCam = new Object3D();
    defaultFollowCam.position.set(-0.6, 0.5, -3);
    mainObject.add(defaultFollowCam);

    let viewPoint = new Object3D();
    viewPoint.position.set(-1, 0.5, 2);
    mainObject.add(viewPoint);

    let aimPoint = new Object3D();
    aimPoint.position.set(-((2 + 3) * 0.6 + (1 - 0.6) * 3) / (2 + 3), 0.5, 0);
    mainObject.add(aimPoint);

    meObject.add(weaponObject);
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
        defaultFollowCam,
        aimPoint,
        mainObject,
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
      player: {
        state: player.state,
        direction: player.direction,
        serverObject: player,
      },
      model: {
        name: "soldier",
        scale: new Vector3(0.6, 0.6, 0.6),
        position: new Vector3(0, 0, 0),
        traverse: (child: any) => {
          if (child.isMesh) {
            const materialId =
              myState.meshMaterial$.value[player.character]?.[child.name];
            if (materialId) {
              child.material = myState.material$.value[materialId].mat;
            }
          }
        },
        parent: meObject,
        modelReady$: new BehaviorSubject<boolean>(false),
      },
      animator: {
        items: [
          {
            model: "soldier_top",
            currentAnimation: "",
            nextAnimation: "idle",
            clips: [
              { name: "die", clampWhenFinished: true, loop: LoopOnce },
              { name: "aim_to_down", clampWhenFinished: true, loop: LoopOnce },
              { name: "down_to_aim", clampWhenFinished: true, loop: LoopOnce },
              { name: "climb_up" },
              { name: "climb_down" },
              { name: "climb_up_finish" },
              { name: "fire" },
              { name: "grenade_throw" },
              { name: "idle" },
              { name: "jump_backward" },
              { name: "jump_forward" },
              { name: "jump_left" },
              { name: "jump_right" },
              { name: "pistol_fire" },
              { name: "pistol_idle" },
              { name: "pistol_run_horizontal" },
              { name: "pistol_run_vertical" },
              { name: "reload" },
              { name: "roll_horizontal", timeScale: 1.6 },
              { name: "roll_backward", timeScale: 2 },
              { name: "roll_forward", timeScale: 2.1 },
              { name: "run_backward" },
              { name: "run_forward" },
              { name: "run_left" },
              { name: "run_right" },
              { name: "stabbing" },
              { name: "use_bandage", clampWhenFinished: true, loop: LoopOnce },
            ],
          },
          {
            model: "soldier_bottom",
            currentAnimation: "",
            nextAnimation: "idle",
            clips: [
              { name: "die", clampWhenFinished: true, loop: LoopOnce },
              { name: "aim_to_down", clampWhenFinished: true, loop: LoopOnce },
              { name: "down_to_aim", clampWhenFinished: true, loop: LoopOnce },
              { name: "climb_up" },
              { name: "climb_down" },
              { name: "climb_up_finish" },
              { name: "fire" },
              { name: "grenade_throw" },
              { name: "idle" },
              { name: "jump_backward" },
              { name: "jump_forward" },
              { name: "jump_left" },
              { name: "jump_right" },
              { name: "pistol_fire" },
              { name: "pistol_idle" },
              { name: "pistol_run_horizontal" },
              { name: "pistol_run_vertical" },
              { name: "reload" },
              { name: "roll_horizontal", timeScale: 1.6 },
              { name: "roll_backward", timeScale: 2 },
              { name: "roll_forward", timeScale: 2.1 },
              { name: "run_backward" },
              { name: "run_forward" },
              { name: "run_left" },
              { name: "run_right" },
              { name: "stabbing" },
              { name: "use_bandage", clampWhenFinished: true, loop: LoopOnce },
            ],
          },
        ],
        ready$: new BehaviorSubject<boolean>(false),
      },
    });
    entity.gameScreen.keyEntities[key] = e;
  } else {
    let playerObject = new Object3D<Object3DEventMap>();
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
        name: "soldier",
        scale: new Vector3(0.6, 0.6, 0.6),
        position: new Vector3(0, 0, 0),
        traverse: (child: any) => {
          if (child.isMesh) {
            const materialId =
              myState.meshMaterial$.value[player.character]?.[child.name];
            if (materialId) {
              child.material = myState.material$.value[materialId].mat;
            }
            child.userData = { type: "enemy", id: key };
          }
        },
        parent: playerObject,
        modelReady$: new BehaviorSubject<boolean>(false),
      },
      player: {
        state: player.state,
        direction: player.direction,
        serverObject: player,
      },
      animator: {
        items: [
          {
            model: "soldier_top",
            currentAnimation: "",
            nextAnimation: "idle",
            clips: [
              { name: "die", clampWhenFinished: true, loop: LoopOnce },
              { name: "aim_to_down", clampWhenFinished: true, loop: LoopOnce },
              { name: "down_to_aim", clampWhenFinished: true, loop: LoopOnce },
              { name: "climb_up" },
              { name: "climb_down" },
              { name: "climb_up_finish" },
              { name: "fire" },
              { name: "grenade_throw" },
              { name: "idle" },
              { name: "jump_backward" },
              { name: "jump_forward" },
              { name: "jump_left" },
              { name: "jump_right" },
              { name: "pistol_fire" },
              { name: "pistol_idle" },
              { name: "pistol_run_horizontal" },
              { name: "pistol_run_vertical" },
              { name: "reload" },
              { name: "roll_horizontal", timeScale: 1.6 },
              { name: "roll_backward", timeScale: 2 },
              { name: "roll_forward", timeScale: 2.1 },
              { name: "run_backward" },
              { name: "run_forward" },
              { name: "run_left" },
              { name: "run_right" },
              { name: "stabbing" },
              { name: "use_bandage", clampWhenFinished: true, loop: LoopOnce },
            ],
          },
          {
            model: "soldier_bottom",
            currentAnimation: "",
            nextAnimation: "idle",
            clips: [
              { name: "die", clampWhenFinished: true, loop: LoopOnce },
              { name: "aim_to_down", clampWhenFinished: true, loop: LoopOnce },
              { name: "down_to_aim", clampWhenFinished: true, loop: LoopOnce },
              { name: "climb_up" },
              { name: "climb_down" },
              { name: "climb_up_finish" },
              { name: "fire" },
              { name: "grenade_throw" },
              { name: "idle" },
              { name: "jump_backward" },
              { name: "jump_forward" },
              { name: "jump_left" },
              { name: "jump_right" },
              { name: "pistol_fire" },
              { name: "pistol_idle" },
              { name: "pistol_run_horizontal" },
              { name: "pistol_run_vertical" },
              { name: "reload" },
              { name: "roll_horizontal", timeScale: 1.6 },
              { name: "roll_backward", timeScale: 2 },
              { name: "roll_forward", timeScale: 2.1 },
              { name: "run_backward" },
              { name: "run_forward" },
              { name: "run_left" },
              { name: "run_right" },
              { name: "stabbing" },
              { name: "use_bandage", clampWhenFinished: true, loop: LoopOnce },
            ],
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
export function gameScreenSystem(delta: number) {}
