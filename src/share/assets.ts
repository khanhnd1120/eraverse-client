/** @format */

import {
  AudioLoader,
  ImageBitmapLoader,
  LoadingManager,
  Texture,
  TextureLoader,
} from "three";
import {
  DRACOLoader,
  Font,
  FontLoader,
  GLTF,
  GLTFLoader,
} from "three/examples/jsm/Addons.js";
import api from "./api";
import myState from "./my-state";
import { MeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module.js";

const MODELS: { [key: string]: { url: string; gltf?: GLTF } } = {
  map: { url: "map/map.glb" },
  model_female_premium: {
    url: "character/eragon/model_female_premium.glb",
  },
  female_anim_bottom: {
    url: "character/eragon/female_anim_bottom.glb",
  },
  female_anim_top: {
    url: "character/eragon/female_anim_top.glb",
  },
};
const SOUNDS: { [key: string]: { url: string; buffer?: any } } = {};
const TEXTURES: { [key: string]: { url: string; texture?: Texture } } = {};
const BITMAP_IMAGES: { [key: string]: { url: string; img?: ImageBitmap } } = {
  Island_Displacement: {
    url: "Island_Displacement.png",
  },
};
const FONTS: { [key: string]: { url: string; font?: any } } = {
  agency: { url: "font/gentilis_bold.typeface.json" },
};
function loadImage(manager: LoadingManager) {
  const bitmapLoader = new ImageBitmapLoader(manager);
  Object.keys(BITMAP_IMAGES).forEach((key: string) => {
    bitmapLoader.load(BITMAP_IMAGES[key].url, (res) => {
      BITMAP_IMAGES[key].img = res;
    });
  });
}
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
  gltfLoader.setMeshoptDecoder(MeshoptDecoder);
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
  if (!manager) {
    manager = new LoadingManager();
    const dataMaterial: any = await api.getMaterial();
    const { textures, materials, meshMaterials } = dataMaterial;
    myState.texture$.next(textures);
    myState.material$.next(materials);
    myState.meshMaterial$.next(meshMaterials);
    loadModel(manager);
    loadSound(manager);
    loadTexture(manager);
    loadFont(manager);
    loadImage(manager);
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
function getImage(name: string): ImageBitmap {
  return BITMAP_IMAGES[name]?.img;
}
function setImage(
  name: string,
  data: { url: string; img?: ImageBitmap }
): void {
  BITMAP_IMAGES[name] = data;
}
const assets = {
  loadAssets,
  getModel,
  getSound,
  getTexture,
  getFont,
  getImage,
  setImage,
};
export default assets;
