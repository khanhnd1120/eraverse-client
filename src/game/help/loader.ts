/** @format */

import G from "share/G";
import {
  AudioLoader,
  PositionalAudio,
  Texture,
  TextureLoader,
} from "three";
import {
  GLTF,
  GLTFLoader,
  TGALoader,
} from "three/examples/jsm/Addons.js";
const tgaLoader: TGALoader = new TGALoader();
const textureLoader: TextureLoader = new TextureLoader();
const gltfLoader: GLTFLoader = new GLTFLoader();
// gltfLoader.setDRACOLoader(dracoLoader);

export async function loadTexture(file: string): Promise<Texture> {
  return new Promise((resolve) => {
    textureLoader.load(file, (tex: any) => {
      resolve(tex);
    });
  });
}
export async function loadTga(file: string): Promise<Texture> {
  return new Promise((resolve) => {
    tgaLoader.load(file, (tex: any) => {
      resolve(tex);
    });
  });
}
export async function loadGltf(filename: string): Promise<GLTF> {
  return new Promise((resolve) => {
    gltfLoader.load(filename, (gltf) => {
      resolve(gltf);
    });
  });
}
export async function loadAudio(filename: string): Promise<PositionalAudio> {
  const audioLoader = new AudioLoader();
  const sound = new PositionalAudio(G.audioListener);
  return new Promise((resolve) => {
    audioLoader.load(filename, function (buffer) {
      sound.setBuffer(buffer);
      sound.setRefDistance(20);
      resolve(sound);
    });
  });
}
export async function loadAudioBuffer(filename: string): Promise<AudioBuffer> {
  const audioLoader = new AudioLoader();
  return new Promise((resolve) => {
    audioLoader.load(filename, function (buffer) {
      resolve(buffer);
    });
  });
}
