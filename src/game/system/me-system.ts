import { With } from "miniplex";
import G, { world } from "share/G";
import { Direction, PlayerState } from "share/game-interface";
import myState from "share/my-state";
import Setting from "share/setting";
import { Entity } from "share/world";
import { Euler, MathUtils, Raycaster, Vector3 } from "three";

const _PI_2 = Math.PI / 2;
const STEPS_PER_FRAME = 5;

let meEntities = world.with("me", "player");
type MeEntity = With<Entity, "me" | "player">;
meEntities.onEntityAdded.subscribe(onEntityAdded);
meEntities.onEntityRemoved.subscribe(onEntityRemoved);

export function meSystem(delta: number) {
  for (const me of meEntities) {
    updateMe(me, delta);
  }
}

function updateMe(entity: MeEntity, delta: number) {
  if (!entity.model.object) {
    return;
  }
  controls(entity, delta);
  updatePlayer(entity, delta);
  playerRigidBody(entity, delta);
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

  if (!entity.me.isOnFloor) {
    entity.me.velocity.y -= Setting.getSetting().GRAVITY * deltaTime;
    damping *= 0.1;
  }

  entity.me.velocity.addScaledVector(entity.me.velocity, damping);

  const deltaPosition = entity.me.velocity.clone().multiplyScalar(deltaTime);
  entity.me.collider.translate(deltaPosition);

  const result = G.worldOctree.capsuleIntersect(entity.me.collider);

  entity.me.isOnFloor = false;

  if (result) {
    entity.me.isOnFloor = result.normal.y > 0;

    if (!entity.me.isOnFloor) {
      entity.me.velocity.addScaledVector(
        result.normal,
        -result.normal.dot(entity.me.velocity)
      );
    }
    entity.me.collider.translate(result.normal.multiplyScalar(result.depth));
  }
  let camPosition = entity.me.followCamera.getWorldPosition(new Vector3());
  G.camera.position.set(camPosition.x, camPosition.y, camPosition.z);
  let viewPointPosition = entity.me.viewPoint.getWorldPosition(new Vector3());
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
  // gives a bit of air control
  let maxSpeed = Setting.getSetting().CHARACTER_SPEED;
  let vel = entity.me.velocity.clone();
  if (entity.me.keyStates["KeyW"]) {
    checkMove = true;
    vel.add(getForwardVector(entity).clone().multiplyScalar(ACCELERATOR));
    entity.me.moveForward += ACCELERATOR;
    if (entity.me.moveForward > maxSpeed) {
      entity.me.moveForward = maxSpeed;
    }
  } else {
    entity.me.moveForward = 0;
  }

  if (entity.me.keyStates["KeyS"]) {
    checkMove = true;
    vel.add(getForwardVector(entity).clone().multiplyScalar(-ACCELERATOR));
    entity.me.moveBackward += ACCELERATOR;
    if (entity.me.moveBackward > maxSpeed) {
      entity.me.moveBackward = maxSpeed;
    }
  } else {
    entity.me.moveBackward = 0;
  }

  if (entity.me.keyStates["KeyA"]) {
    checkMove = true;
    vel.add(getSideVector(entity).clone().multiplyScalar(-ACCELERATOR));
    entity.me.moveLeft += ACCELERATOR;
    if (entity.me.moveLeft > maxSpeed) {
      entity.me.moveLeft = maxSpeed;
    }
  } else {
    entity.me.moveLeft = 0;
  }

  if (entity.me.keyStates["KeyD"]) {
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

  if (entity.me.isOnFloor) {
    if (entity.me.keyStates["Space"]) {
      checkMove = true;
      vel.y = Setting.getSetting().JUMP_FORCE;
    }
  }
  if (checkMove) {
    if (!(entity.player.state == PlayerState.Move)) {
      entity.player.state = PlayerState.Move;
      G.getCurrentRoom().send("state", { state: PlayerState.Move });
    }
  } else {
    vel.x = MathUtils.lerp(vel.x, 0, 0.1);
    vel.z = MathUtils.lerp(vel.z, 0, 0.1);
  }
  entity.me.velocity.copy(vel);
}

async function onEntityAdded(entity: MeEntity) {
  // entity.gameObject.add(G.camera);
  let pos = new Vector3(
    entity.player.serverObject.position.x,
    entity.player.serverObject.position.y,
    entity.player.serverObject.position.z
  );
  entity.gameObject.position.copy(pos);
  entity.me.onMouseMove = (event: any) => {
    if (document.pointerLockElement === document.body) {
      const movementX =
        event.movementX || event.mozMovementX || event.webkitMovementX || 0;
      const movementY =
        event.movementY || event.mozMovementY || event.webkitMovementY || 0;
      let _euler = new Euler(0, 0, 0, "YXZ");
      _euler.setFromQuaternion(entity.me.mainObject.quaternion);

      _euler.y -= movementX * 0.002;
      _euler.x += movementY * 0.002;

      _euler.x = Math.max(-_PI_2 / 6, Math.min(_PI_2 / 2, _euler.x));
      entity.me.mainObject.quaternion.setFromEuler(_euler);
      myState.cameraRotation$.next(_euler);

      let camPosition = entity.me.followCamera.getWorldPosition(new Vector3());
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
      case "Tab":
        break;
      case "KeyC":
        if (!entity.me.keyStates[event.code]) {
          G.getCurrentRoom().send("crouch", { isCrouch: true });
        }
        break;
    }
    entity.me.keyStates[event.code] = true;
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
        if (entity.me.keyStates[event.code]) {
          G.getCurrentRoom().send("crouch", { isCrouch: false });
        }
        break;
    }
    entity.me.keyStates[event.code] = false;
  };
  entity.me.onMouseDown = (evt: any) => {
    if (myState.pause$.getValue()) {
      return;
    }
    switch (evt.button) {
      case 0: //left mouse
        break;
      case 2:
        break;
    }
  };
  entity.me.onMouseUp = (evt: any) => {
    if (myState.pause$.getValue()) {
      return;
    }
    switch (evt.button) {
      case 0: //left mouse
        break;
      case 2:
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
  bindInputEvent(entity);
  document.body.requestPointerLock();
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
