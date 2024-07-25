/** @format */

import { AudioLoader, LoadingManager, Texture, TextureLoader } from "three";
import {
  DRACOLoader,
  Font,
  FontLoader,
  GLTF,
  GLTFLoader,
} from "three/examples/jsm/Addons.js";
import api from "./api";
import myState from "./my-state";

const MODELS: { [key: string]: { url: string; gltf?: GLTF } } = {
  model_chibi_male_premium: { url: "character/eragon/model_chibi_male_premium.glb" },
  anim_chibi_male_premium_bottom: { url: "character/eragon/anim_chibi_male_premium_bottom.glb" },
  anim_chibi_male_premium_top: { url: "character/eragon/anim_chibi_male_premium_top.glb" },
};
const SOUNDS: { [key: string]: { url: string; buffer?: any } } = {
  
};
const TEXTURES: { [key: string]: { url: string; texture?: Texture } } = {
};
const FONTS: { [key: string]: { url: string; font?: any } } = {
  agency: { url: "font/gentilis_bold.typeface.json" },
};
function loadFont(manager: LoadingManager) {
  const fontLoader = new FontLoader(manager);
  Object.keys(FONTS).forEach((key: string) => {
    fontLoader.load(FONTS[key].url, (res) => {
      FONTS[key].font = res;
    });
  });
}
/** @format */
function loadModel(manager: LoadingManager) {
  const gltfLoader = new GLTFLoader(manager);
  const dracoLoader = new DRACOLoader();
  gltfLoader.setDRACOLoader(dracoLoader);
  Object.keys(MODELS).forEach((key: string) => {
    gltfLoader.load(MODELS[key].url, (gltf) => {
      MODELS[key].gltf = gltf;
    });
  });
}
function loadSound(manager: LoadingManager) {
  const audioLoader = new AudioLoader(manager);
  Object.keys(SOUNDS).forEach((key: string) => {
    let sound = SOUNDS[key];
    audioLoader.load(`sfx/${sound.url}`, (buffer: any) => {
      SOUNDS[key].buffer = buffer;
    });
  });
}
function loadTexture(manager: LoadingManager) {
  const textureLoader: TextureLoader = new TextureLoader(manager);
  Object.keys(TEXTURES).forEach((key: string) => {
    let texture = TEXTURES[key];
    textureLoader.load(`${texture.url}`, (tex: any) => {
      TEXTURES[key].texture = tex;
    });
  });
}
let manager: LoadingManager = null;
async function loadAssets(): Promise<LoadingManager> {
  const dataMaterial: any = await api.getMaterial();
  const { textures, materials, meshMaterials } = dataMaterial;
  myState.texture$.next(textures);
  myState.material$.next(materials);
  myState.meshMaterial$.next(meshMaterials);
  if (!manager) {
    manager = new LoadingManager();
    loadModel(manager);
    loadSound(manager);
    loadTexture(manager);
    loadFont(manager);
  }
  return manager;
}
function getSound(name: string): AudioBuffer {
  let buf = SOUNDS[name]?.buffer;
  if (!buf) {
    console.log("sound not found ", name);
  }
  return buf;
}
function getModel(name: string) {
  return MODELS[name].gltf;
}
function getTexture(name: string): Texture {
  return TEXTURES[name].texture;
}
function getFont(name: string): Font {
  return FONTS[name].font;
}
const assets = {
  loadAssets,
  getModel,
  getSound,
  getTexture,
  getFont,
};
export default assets;
