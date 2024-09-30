import utils from "game/help/utils";
import { With } from "miniplex";
import addPlayerState from "share/add-player-state";
import G, { world } from "share/G";
import { AirdropStatus, Direction, PlayerState } from "share/game-interface";
import myState from "share/my-state";
import removePlayerState from "share/remove-player-state";
import Setting from "share/setting";
import { Entity } from "share/world";
import { Euler, Line3, MathUtils, Vector3 } from "three";
import { Capsule } from "three/examples/jsm/Addons.js";

const _PI_2 = Math.PI / 2;
const STEPS_PER_FRAME = 5;

let meEntities = world.with("me", "player");
let airdropEntities = world.with("airdrop");
type AirdropEntity = With<Entity, "airdrop">;
type MeEntity = With<Entity, "me" | "player">;
meEntities.onEntityAdded.subscribe(onEntityAdded);
meEntities.onEntityRemoved.subscribe(onEntityRemoved);

export function meSystem(delta: number) {
  for (const me of meEntities) {
    updateMe(me, delta);
  }
}

function updateMe(entity: MeEntity, delta: number) {
  if (myState.loadingGame$.value) {
    return;
  }
  G.mePlayer = entity;
  if (!entity.model.object) {
    return;
  }
  controls(entity, delta);
  updatePlayer(entity, delta);
  playerRigidBody(entity, delta);
  teleportPlayerIfOob(entity);
}
function teleportPlayerIfOob(entity: MeEntity) {
  if (
    entity.gameObject.position.y < -1 &&
    ![PlayerState.Falling, PlayerState.Jump].includes(entity.player.stateBottom)
  ) {
    // case falling
    entity.player = addPlayerState(PlayerState.Falling, entity.player);
  }
  if (entity.gameObject.position.y >= -25) {
    return;
  }
  let collider = entity.me.collider as Capsule;
  collider.start.set(0, 5, 0);
  collider.end.set(0, 5.75, 0);
  collider.radius = 0.35;
  G.camera.rotation.set(0, 0, 0);
}
function playerRigidBody(entity: MeEntity, delta: number) {
  let stepTime = Math.min(0.05, delta) / STEPS_PER_FRAME;
  for (let i = 0; i < STEPS_PER_FRAME; i++) {
    updatePlayerRigidBodyStep(entity, stepTime);
  }
  let pos = entity.me.collider.start.clone();
  pos.y -= entity.me.collider.radius;
  entity.gameObject.position.copy(pos);
}
function updatePlayerRigidBodyStep(entity: MeEntity, deltaTime: number) {
  let damping = Math.exp(-1.5 * deltaTime) - 1;

  if (!entity.player.isOnFloor) {
    entity.me.velocity.y -= Setting.getSetting().GRAVITY * deltaTime;
    damping *= 0.1;
  }

  entity.me.velocity.addScaledVector(entity.me.velocity, damping);

  // logic move
  const deltaPosition = entity.me.velocity.clone().multiplyScalar(deltaTime);
  entity.me.collider.translate(deltaPosition);

  // check collision with map
  const result = G.worldOctree.capsuleIntersect(entity.me.collider);

  entity.player.isOnFloor = false;

  if (result) {
    entity.player.isOnFloor = result.normal.y > 0;

    if (!entity.player.isOnFloor) {
      entity.me.velocity.addScaledVector(
        result.normal,
        -result.normal.dot(entity.me.velocity)
      );
    }
    entity.me.collider.translate(result.normal.multiplyScalar(result.depth));
  }

  // check collision with airdrop
  for (const airdropData of airdropEntities) {
    if (airdropData.airdrop?.status === AirdropStatus.Ready) {
      let closestPoint = new Vector3();
      airdropData.airdrop.collider.clampPoint(
        entity.me.collider.start.clone(),
        closestPoint
      );
      let capsuleSegment = new Line3(
        entity.me.collider.start.clone(),
        entity.me.collider.end.clone()
      );
      let closestOnCapsule = capsuleSegment.closestPointToPoint(
        closestPoint,
        true,
        new Vector3()
      );
      let distance = closestOnCapsule.distanceTo(closestPoint);
      if (distance <= 1.2) {
        // Calculate the direction to move the capsule or the box
        let closestPoint = new Vector3();
        airdropData.airdrop.collider.clampPoint(
          entity.me.collider.start.clone(),
          closestPoint
        );

        let displacement = new Vector3().subVectors(
          entity.me.collider.start.clone(),
          closestPoint
        );
        displacement.normalize().multiplyScalar(0.04); // Move by radius
        displacement.y = 0;

        // Apply the displacement to the object (capsule or box)
        entity.me.collider.translate(displacement);
      }
    }
  }
  let camPosition = entity.me.followCamera.getWorldPosition(new Vector3());
  let viewPointPosition = entity.me.viewPoint.getWorldPosition(new Vector3());
  if (entity.me.keyStates["RIGHTMOUSE"]) {
    camPosition = entity.me.secondaryCamera.getWorldPosition(new Vector3());
    viewPointPosition = entity.me.secondaryObject.getWorldPosition(
      new Vector3()
    );
  }
  G.camera.position.set(camPosition.x, camPosition.y, camPosition.z);
  entity.model.object.lookAt(
    new Vector3(
      viewPointPosition.x,
      entity.model.object.position.y + entity.gameObject.position.y,
      viewPointPosition.z
    )
  );
  G.camera.lookAt(viewPointPosition);
}
function updatePlayer(entity: MeEntity, delta: number) {
  myState.position$.next(entity.gameObject.position);
  const moves = [
    entity.me.moveForward,
    entity.me.moveBackward,
    entity.me.moveLeft,
    entity.me.moveRight,
  ];
  let newDirection = [
    Direction.Forward,
    Direction.Backward,
    Direction.Left,
    Direction.Right,
  ][moves.indexOf(Math.max(...moves))];
  if (Math.max(...moves) == 0) {
    newDirection = Direction.None;
  }
  if (myState.direction$.getValue() !== newDirection) {
    myState.direction$.next(newDirection);
    entity.player.direction = newDirection;
  }
}
function controls(entity: MeEntity, delta: number) {
  const ACCELERATOR = 50;
  let checkMove = false;
  let checkJump = false;
  // gives a bit of air control
  let maxSpeed = Setting.getSetting().CHARACTER_SPEED;
  let oldRun = entity.player.isRun;
  if (entity.me.keyStates["ShiftLeft"]) {
    maxSpeed = Setting.getSetting().CHARACTER_RUN_SPEED;
    entity.player.isRun = true;
  } else {
    entity.player.isRun = false;
  }
  if (oldRun !== entity.player.isRun) {
    myState.isRun$.next(entity.player.isRun);
  }
  let vel = entity.me.velocity.clone();
  if (
    entity.me.keyStates["KeyW"] &&
    entity.player.stateBottom !== PlayerState.Beaten
  ) {
    checkMove = true;
    vel.add(getForwardVector(entity).clone().multiplyScalar(ACCELERATOR));
    entity.me.moveForward += ACCELERATOR;
    if (entity.me.moveForward > maxSpeed) {
      entity.me.moveForward = maxSpeed;
    }
  } else {
    entity.me.moveForward = 0;
  }

  if (
    entity.me.keyStates["KeyS"] &&
    entity.player.stateBottom !== PlayerState.Beaten
  ) {
    checkMove = true;
    vel.add(getForwardVector(entity).clone().multiplyScalar(-ACCELERATOR));
    entity.me.moveBackward += ACCELERATOR;
    if (entity.me.moveBackward > maxSpeed) {
      entity.me.moveBackward = maxSpeed;
    }
  } else {
    entity.me.moveBackward = 0;
  }

  if (
    entity.me.keyStates["KeyA"] &&
    entity.player.stateBottom !== PlayerState.Beaten
  ) {
    checkMove = true;
    vel.add(getSideVector(entity).clone().multiplyScalar(-ACCELERATOR));
    entity.me.moveLeft += ACCELERATOR;
    if (entity.me.moveLeft > maxSpeed) {
      entity.me.moveLeft = maxSpeed;
    }
  } else {
    entity.me.moveLeft = 0;
  }

  if (
    entity.me.keyStates["KeyD"] &&
    entity.player.stateBottom !== PlayerState.Beaten
  ) {
    checkMove = true;
    vel.add(getSideVector(entity).clone().multiplyScalar(ACCELERATOR));
    entity.me.moveRight += ACCELERATOR;
    if (entity.me.moveRight > maxSpeed) {
      entity.me.moveRight = maxSpeed;
    }
  } else {
    entity.me.moveRight = 0;
  }
  vel.y = 0;
  vel.clampLength(-maxSpeed, maxSpeed);
  vel.y = entity.me.velocity.y;

  if (entity.player.isOnFloor) {
    if (
      entity.me.keyStates["Space"] &&
      entity.player.stateBottom !== PlayerState.Jump
    ) {
      checkJump = true;
      vel.y = Setting.getSetting().JUMP_FORCE;
    }
  }
  if (
    !entity.player.isOnFloor &&
    !(
      [PlayerState.Jump, PlayerState.Falling].includes(
        entity.player.stateTop
      ) ||
      [PlayerState.Jump, PlayerState.Falling].includes(
        entity.player.stateBottom
      )
    )
  ) {
    entity.player = addPlayerState(PlayerState.Falling, entity.player);
  }
  // check jump
  if (checkJump) {
    entity.player = addPlayerState(PlayerState.Jump, entity.player);
  } else {
    // check move
    if (checkMove) {
      entity.player = addPlayerState(PlayerState.Move, entity.player);
    } else {
      // case not move
      vel.x = MathUtils.lerp(vel.x, 0, 0.1);
      vel.z = MathUtils.lerp(vel.z, 0, 0.1);
      entity.player = removePlayerState(PlayerState.Move, entity.player);
    }
  }
  entity.me.velocity.copy(vel);
}

async function onEntityAdded(entity: MeEntity) {
  setInputEvent(entity);
  processServerEvent(entity);
  processClientEvent(entity);
  bindInputEvent(entity);
  cronjob(entity);
  document.body.requestPointerLock();
}
function processServerEvent(entity: MeEntity) {
  entity.player.serverObject.listen("isBeaten", (isBeaten: any) => {
    if (isBeaten) {
      entity.player = addPlayerState(PlayerState.Beaten, entity.player);
    } else {
      entity.player = removePlayerState(PlayerState.Beaten, entity.player);
    }
  });
  entity.player.serverObject.listen(
    "airdropClaimStatus",
    (airdropClaimStatus: any) => {
      myState.claimAirdropNoti$.next({
        ...myState.claimAirdropNoti$.value,
        airdropClaimStatus,
      });
    }
  );
  entity.player.serverObject.listen("airdropClaimed", (airdropClaimed: any) => {
    myState.claimAirdropNoti$.next({
      ...myState.claimAirdropNoti$.value,
      airdropClaimed,
    });
  });
}
function processClientEvent(entity: MeEntity) {
  myState.showActionWheel$.subscribe((val) => {
    if (val) {
      unbindInputEvent(entity);
    } else {
      bindInputEvent(entity);
    }
  });
  myState.danceAnim$.subscribe((val) => {
    entity.player.danceAnim = val;
    entity.player = addPlayerState(PlayerState.Dance, entity.player);
    G.getCurrentRoom().send("danceAnim", { danceAnim: val });
  });
  myState.keyStates$.subscribe((keyStates) => {
    if (keyStates["KeyE"] && entity.me.airdrop?.id) {
      G.getCurrentRoom().send("claim_airdrop", {
        id: entity.me.airdrop?.id,
      });
      entity.me.keyStates["KeyE"] = false;
      myState.keyStates$.next(entity.me.keyStates);
    }
  });
}
function cronjob(entity: MeEntity) {
  if (!entity.me.intervalCheckAirdrop) {
    entity.me.intervalCheckAirdrop = setInterval(() => {
      let nearestAirdrop: AirdropEntity = null;
      let minDistantAirdrop = 10000;
      for (const airdropData of airdropEntities) {
        if (airdropData.airdrop.status !== AirdropStatus.Ready) {
          return;
        }
        let distance = Math.max(
          Math.abs(
            airdropData.airdrop.position.x - entity.gameObject.position.x
          ),
          Math.abs(
            airdropData.airdrop.position.z - entity.gameObject.position.z
          )
        );
        if (distance < minDistantAirdrop && distance < 1) {
          minDistantAirdrop = distance;
          nearestAirdrop = airdropData;
        }
      }
      // check remove old airdop
      let isRemoveOldAir = false;
      let isNewAir = false;
      if (nearestAirdrop) {
        if (nearestAirdrop.airdrop.id !== entity.me.airdrop?.id) {
          isRemoveOldAir = true;
          isNewAir = true;
        }
      } else {
        isRemoveOldAir = true;
      }
      if (!entity.me.tutorial) {
        entity.me.tutorial = {};
      }
      if (isRemoveOldAir) {
        // remove tag open airdrop
        if (entity.me.tutorial["airdrop"]) {
          entity.me.tutorial["airdrop"].visible = false;
          entity.me.airdrop = null;
        }
      }
      if (isNewAir) {
        // add new tag open air
        if (!entity.me.tutorial["airdrop"]) {
          entity.me.tutorial["airdrop"] = utils.createPanelText({
            width: 0.05,
          });
          entity.me.tutorial["airdrop"].add(utils.createLineText3D("E"));
          G.particleGroup.add(entity.me.tutorial["airdrop"]);
        }
        entity.me.tutorial["airdrop"].position.copy(
          nearestAirdrop.airdrop.position
        );
        entity.me.tutorial["airdrop"].position.setY(
          entity.me.tutorial["airdrop"].position.y + 0.5
        );
        entity.me.tutorial["airdrop"].visible = true;
        entity.me.airdrop = nearestAirdrop.airdrop;
      }
    }, 1000);
  }
}
function setInputEvent(entity: MeEntity) {
  entity.me.onMouseMove = (event: any) => {
    if (document.pointerLockElement === document.body) {
      if (
        [PlayerState.Dance, PlayerState.Beaten].includes(entity.player.stateTop) &&
        !entity.me.keyStates["RIGHTMOUSE"]
      ) {
        // when dance not rotate
        return;
      }
      const movementX =
        event.movementX || event.mozMovementX || event.webkitMovementX || 0;
      const movementY =
        event.movementY || event.mozMovementY || event.webkitMovementY || 0;
      let _euler = new Euler(0, 0, 0, "YXZ");
      if (entity.me.keyStates["RIGHTMOUSE"]) {
        _euler.setFromQuaternion(entity.me.secondaryObject.quaternion);
      } else {
        _euler.setFromQuaternion(entity.me.mainObject.quaternion);
      }

      _euler.y -= movementX * 0.002;
      _euler.x += movementY * 0.002;

      _euler.x = Math.max(-_PI_2 / 6, Math.min(_PI_2 / 2, _euler.x));
      if (entity.me.keyStates["RIGHTMOUSE"]) {
        entity.me.secondaryObject.quaternion.setFromEuler(_euler);
      } else {
        entity.me.mainObject.quaternion.setFromEuler(_euler);
      }
      myState.cameraRotation$.next(_euler);

      let camPosition = entity.me.followCamera.getWorldPosition(new Vector3());
      if (entity.me.keyStates["RIGHTMOUSE"]) {
        camPosition = entity.me.secondaryCamera.getWorldPosition(new Vector3());
      }
      G.camera.position.set(camPosition.x, camPosition.y, camPosition.z);
      let viewPointPosition = entity.me.viewPoint.getWorldPosition(
        new Vector3()
      );
      entity.model.object.lookAt(
        new Vector3(
          viewPointPosition.x,
          entity.model.object.position.y + entity.gameObject.position.y,
          viewPointPosition.z
        )
      );
      if (entity.me.tutorial && entity.me.tutorial["airdrop"]) {
        entity.me.tutorial["airdrop"].lookAt(camPosition);
      }
    }
  };
  entity.me.onKeyDown = (event: any) => {
    event.stopPropagation();
    event.stopImmediatePropagation();
    event.preventDefault();
    if (entity.me.keyStates[event.code]) {
      return false;
    }
    switch (event.code) {
      case "KeyG":
        myState.showActionWheel$.next(!myState.showActionWheel$.value);
        break;
      case "KeyC":
        console.log(
          Math.round(entity.gameObject.position.x),
          Math.round(entity.gameObject.position.y),
          Math.round(entity.gameObject.position.z)
        );
        break;
      case "Enter":
        myState.activeChat$.next(true);
        break;
    }
    entity.me.keyStates[event.code] = true;
    myState.keyStates$.next(entity.me.keyStates);
    return false;
  };
  entity.me.onKeyUp = (event: any) => {
    if (!entity.me.keyStates[event.code]) {
      return;
    }
    switch (event.code) {
      case "Tab":
        break;
      case "KeyC":
        break;
      case "Enter":
        break;
    }
    entity.me.keyStates[event.code] = false;
    myState.keyStates$.next(entity.me.keyStates);
  };
  entity.me.onMouseDown = (evt: any) => {
    if (myState.pause$.getValue()) {
      return;
    }
    switch (evt.button) {
      case 0: //left mouse
        entity.me.keyStates["LEFTMOUSE"] = true;
        break;
      case 2:
        entity.me.keyStates["RIGHTMOUSE"] = true;
        break;
    }
  };
  entity.me.onMouseUp = (evt: any) => {
    if (myState.pause$.getValue()) {
      return;
    }
    switch (evt.button) {
      case 0: //left mouse
        entity.me.keyStates["LEFTMOUSE"] = false;
        break;
      case 2:
        entity.me.keyStates["RIGHTMOUSE"] = false;
        entity.me.secondaryObject.quaternion.copy(
          entity.me.mainObject.quaternion
        );
        break;
    }
  };
  entity.me.onPointerLockChange = (evt: any) => {
    if (!document.pointerLockElement) {
      unbindInputEvent(entity);
      myState.pause$.next(true);
    } else {
      bindInputEvent(entity);
      myState.pause$.next(false);
    }
  };
}
function getSideVector(entity: MeEntity) {
  G.camera.getWorldDirection(entity.me.direction);
  entity.me.direction.y = 0;
  entity.me.direction.normalize();
  entity.me.direction.cross(G.camera.up);
  return entity.me.direction;
}
function getForwardVector(entity: MeEntity) {
  G.camera.getWorldDirection(entity.me.direction);
  entity.me.direction.y = 0;
  entity.me.direction.normalize();
  return entity.me.direction;
}
function bindInputEvent(entity: MeEntity) {
  document.addEventListener("mousemove", entity.me.onMouseMove);
  document.addEventListener("keydown", entity.me.onKeyDown);
  document.addEventListener("keyup", entity.me.onKeyUp);
  document.addEventListener("mousedown", entity.me.onMouseDown);
  document.addEventListener("mouseup", entity.me.onMouseUp);
  document.addEventListener("pointerlockchange", entity.me.onPointerLockChange);
}
function unbindInputEvent(entity: MeEntity) {
  document.removeEventListener("mousemove", entity.me.onMouseMove);
  document.removeEventListener("keydown", entity.me.onKeyDown);
  document.removeEventListener("keyup", entity.me.onKeyUp);
  document.removeEventListener("mousedown", entity.me.onMouseDown);
  document.removeEventListener("mouseup", entity.me.onMouseUp);
}
async function onEntityRemoved(entity: MeEntity) {
  unbindInputEvent(entity);
  document.removeEventListener(
    "pointerlockchange",
    entity.me.onPointerLockChange
  );
}
