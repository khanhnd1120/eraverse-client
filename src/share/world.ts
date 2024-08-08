import { BehaviorSubject } from "rxjs";
import * as Colyseus from "colyseus.js";
import {
  AnimationMixer,
  Euler,
  Material,
  Object3D,
  Object3DEventMap,
  Raycaster,
  Vector3,
} from "three";
import {
  AnimatorItem,
  MeWorldType,
  PlayerWorldType,
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
  me?: MeWorldType;
  weapon?: {
    attackTimer?: number;
    aimRaycaster: Raycaster;
  };
  gameObject?: Object3D<Object3DEventMap>;
  position?: Vector3;
  player?: PlayerWorldType;
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
