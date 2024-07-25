import { SetStateAction } from "react";
import { Material, Texture } from "three";

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
