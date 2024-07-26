import { SetStateAction } from "react";
import {
  AnimationAction,
  AnimationActionLoopStyles,
  Material,
  Texture,
} from "three";

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
    data: any;
    texture: Texture;
  };
};
export type MaterialConfigData = {
  [key: string]: {
    data: any;
    mat: Material;
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
}
export type SettingData = {
  PLAYER_VIEW: number;
  GRAVITY: number;
  CHARACTER_SPEED: number;
  JUMP_FORCE: number;
};
export interface AnimatorItem {
  model: string;
  currentAnimation: string;
  nextAnimation: string;
  clips: AnimationClipItem[];
}
export interface AnimationClipItem {
  name: string;
  clampWhenFinished?: boolean;
  loop?: AnimationActionLoopStyles;
  clip?: AnimationAction;
  timeScale?: number;
}