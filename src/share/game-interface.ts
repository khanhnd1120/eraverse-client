import { SetStateAction } from "react";
import {
  AnimationAction,
  AnimationActionLoopStyles,
  Material,
  Object3D,
  Texture,
  Vector3,
} from "three";
import { Capsule } from "three/examples/jsm/Addons.js";

export type UserInfo = {
  name: string;
};

export type ContextType = {
  userInfo: UserInfo;
  setUserInfo: Function;
  createDialog: Function;
  removeDialog: Function;
  dialogs: DialogInfo[];
  showLoading: Function;
  hideLoading: Function;
  showLoadingDialog: boolean;
};

export type TextureConfigData = {
  [key: string]: {
    data?: any;
    texture?: Texture;
    loading?: boolean;
  };
};
export type MaterialConfigData = {
  [key: string]: {
    data: any;
    mat: Material;
    loading?: boolean;
  };
};
export interface DialogInfo {
  id: number;
  type: DialogType;
  content: string;
  callback?: Function;
}
export enum DialogType {
  Message,
  Confirm,
}
export enum PlayerState {
  Idle,
  Move,
  Jump,
  Run,
  Beaten,
  Attack,
  Dance,
  Falling,
}

export enum Direction {
  None,
  Forward,
  Backward,
  Left,
  Right,
}
export interface ServerConfigItem {
  name: string;
  url: string;
  ping_url: string;
}

export enum ConfigKey {
  WHITELIST = "WHITELIST",
  SYSTEM_MAINTAIN = "SYSTEM_MAINTAIN",
  JWT_SECRET = "JWT_SECRET",
  JWT_TTL = "JWT_TTL",
  SERVER_URLS = "SERVER_URLS",
  MATERIALS_MESH = "MATERIALS_MESH",
  LOBBY_ROOM = "LOBBY_ROOM",
  ADS_BOARD = "ADS_BOARD",
  ROTATE_MESH = "ROTATE_MESH",
}
export type SettingData = {
  PLAYER_VIEW: number;
  GRAVITY: number;
  CHARACTER_SPEED: number;
  CHARACTER_RUN_SPEED: number;
  CHARACTER_ATTACK_SPEED: number;
  JUMP_FORCE: number;
};
export interface AnimatorItem {
  model: string;
  currentAnimation: string;
  nextAnimation: string;
  clips: AnimationClipItem[];
  duration: number;
  hold?: number;
  arrAnimation: {
    anim: string;
    canSwitchAnimInstantly: boolean;
    duration?: number;
  }[];
  currentArrAnimationItem: {
    anim: string;
    canSwitchAnimInstantly: boolean;
    duration?: number;
  };
  currentClip: AnimationAction;
}
export interface AnimationClipItem {
  name: string;
  clampWhenFinished?: boolean;
  loop?: AnimationActionLoopStyles;
  clip?: AnimationAction;
  timeScale?: number;
  repetitions?: number;
}
export interface PlayerWorldType {
  serverObject: any;
  stateTop: PlayerState;
  stateBottom: PlayerState;
  direction: Direction;
  danceAnim: string;
  nameObject?: Object3D;
  chatBox?: Object3D;
  chatMessage?: Object3D;
  timeoutHideMessage?: any;
  isOnFloor: boolean;
  isRun?: boolean;
  id?: string;
  character?: { model: string; nftId: string };
}
export interface MeWorldType {
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
  followCamera: Object3D;
  secondaryCamera: Object3D;
  mainObject: Object3D;
  secondaryObject: Object3D;
  viewPoint: Object3D;
  aimPoint: Object3D;
  defaultFollowCam: Object3D;
  intervalCheckAirdrop?: any;
  airdrop?: any;
  tutorial?: { [key: string]: Object3D };
}

export enum AdsType {
  Banner,
  Video,
}

export enum ShaderType {
  RowShader,
  PointShader,
}

export type AdsConfig = {
  type: AdsType;
  src: string;
  emission?: string;
  isShader?: boolean;
  id: string;
  time: number;
  typeShader?: ShaderType;
  colorShader?: string;
};

export type AdsBoard = {
  [key: string]: AdsConfig[];
};

export enum RewardType {
  APT,
  EGON,
  GIFT_CODE,
  PEGON,
}

export enum AirdropStatus {
  Drop,
  Ready,
  Claimed,
}

export enum AirdropClaimStatus {
  None,
  Process,
  Success,
  Failed,
}

export enum NotificationType {
  Default,
  Disconnect,
}
