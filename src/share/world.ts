import { BehaviorSubject } from "rxjs";
import * as Colyseus from "colyseus.js";
import {
  AnimationMixer,
  Euler,
  Material,
  Object3D,
  Object3DEventMap,
  Vector3,
} from "three";
import {
  AnimatorItem,
  Direction,
  PlayerState,
  ServerConfigItem,
} from "./game-interface";
import { Capsule } from "three/examples/jsm/Addons.js";

export type Entity = {
  model?: {
    parent?: Object3D<Object3DEventMap>;
    name: string;
    scale?: Vector3;
    rotation?: Euler;
    object?: Object3D<Object3DEventMap>;
    position?: Vector3;
    material?: Material;
    traverse?: (obj: Object3D<Object3DEventMap>) => any;
    modelReady$?: BehaviorSubject<boolean>;
  };
  animator?: {
    mixer?: AnimationMixer;
    items: AnimatorItem[];
    ready$?: BehaviorSubject<boolean>;
  };
  me?: {
    onMouseMove: EventListener;
    onKeyDown: EventListener;
    onKeyUp: EventListener;
    onMouseDown: EventListener;
    onMouseUp: EventListener;
    onPointerLockChange: EventListener;
    keyStates: { [key: string]: boolean };
    direction: Vector3;
    moveForward: number;
    moveBackward: number;
    moveLeft: number;
    moveRight: number;
    velocity: Vector3;
    collider: Capsule;
    isOnFloor: boolean;
    followCamera: Object3D;
    mainObject: Object3D;
    viewPoint: Object3D;
    aimPoint: Object3D;
    defaultFollowCam: Object3D;
  };
  gameObject?: Object3D<Object3DEventMap>;
  position?: Vector3;
  player?: {
    serverObject: any;
    state: PlayerState;
    direction: Direction;
  };
  gameScreen?: {
    map: string;
    room?: Colyseus.Room;
    keyEntities: { [key: string]: any };
    points: any;
    roomName: string;
    server: ServerConfigItem;
    character: string;
  };
};
