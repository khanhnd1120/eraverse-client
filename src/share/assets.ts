/** @format */

import {
  AdditiveBlending,
  AudioLoader,
  CanvasTexture,
  Color,
  Euler,
  Float32BufferAttribute,
  ImageBitmapLoader,
  Line,
  LoadingManager,
  Material,
  Mesh,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  RepeatWrapping,
  ShaderMaterial,
  Texture,
  Vector2,
} from "three";
import {
  DRACOLoader,
  Font,
  FontLoader,
  GLTF,
  GLTFLoader,
  TextGeometry,
} from "three/examples/jsm/Addons.js";
import api from "./api";
import myState from "./my-state";
import { MeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module.js";
import { MaterialConfigData, TextureConfigData } from "./game-interface";
import _ from "lodash";
import createMaterialShader from "./create-material-shader";
import { loadTexture } from "game/help/loader";

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
  model_basic: {
    url: "character/eragon/model_basic.glb",
  },
  model_male_premium: {
    url: "character/eragon/model_male_premium.glb",
  },
};
const SOUNDS: { [key: string]: { url: string; buffer?: any } } = {};

const FONTS: { [key: string]: { url: string; font?: any } } = {
  agency: { url: "font/helvetiker_bold.typeface.json" },
};
let TEXTURES: TextureConfigData = {};
let MATERIALS: MaterialConfigData = {};

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
let manager: LoadingManager = null;
async function loadAssets(): Promise<LoadingManager> {
  if (!manager) {
    manager = new LoadingManager();
    const dataMaterial: any = await api.getMaterial();
    const { textures, materials, meshMaterials } = dataMaterial;
    TEXTURES = textures;
    MATERIALS = materials;
    myState.meshMaterial$.next(meshMaterials);
    loadModel(manager);
    loadSound(manager);
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
function getTextures(): TextureConfigData {
  return TEXTURES;
}
function getMaterials(): MaterialConfigData {
  return MATERIALS;
}
function getFont(name: string): Font {
  return FONTS[name].font;
}
function setMaterial(name: string, mat: Material) {
  MATERIALS[name] = {
    data: {},
    mat,
  };
}
function setMaterialData(name: string, data: any) {
  MATERIALS[name] = {
    data: data,
    mat: null,
  };
}
function setTextureData(name: string, data: any) {
  TEXTURES[name] = {
    data,
    texture: null,
  };
}
function requestMaterial(name: string) {
  if (MATERIALS[name] && MATERIALS[name].mat) {
    return MATERIALS[name]?.mat;
  }
  if (MATERIALS[name].loading) return;
  MATERIALS[name].loading = true;

  const textureManager = new LoadingManager();
  const materialData = MATERIALS[name].data;
  const textureIds: string[] = [];

  ["map", "emissiveMap", "metalnessMap", "roughnessMap", "normalMap"].map(
    (property) => {
      if (materialData[property]) {
        textureIds.push(materialData[property]);
      }
    }
  );

  if (!textureIds.length) {
    loadMaterials(name);
    return;
  }
  const bitmapLoader = new ImageBitmapLoader(textureManager);
  textureIds.map((key) => {
    if (!TEXTURES[key]) {
      return;
    }
    if (TEXTURES[key].texture || TEXTURES[key].loading) {
      return;
    }
    const textureData = TEXTURES[key].data;
    TEXTURES[key].loading = true;
    let url = textureData.url;
    bitmapLoader.load(url, (res) => {
      const tex = new CanvasTexture(res);
      tex.colorSpace = "srgb";
      Object.keys(textureData).map((property) => {
        if (["repeat", "offset", "center"].includes(property)) {
          // @ts-ignore
          tex[property] = new Vector2(
            textureData[property][0],
            textureData[property][1]
          );
        } else {
          if (!["image"].includes(property)) {
            // @ts-ignore
            tex[property] = textureData[property];
          }
        }
      });
      // @ts-ignore
      delete tex.url;
      tex.wrapS = 1000;
      tex.wrapT = 1000;
      TEXTURES[key].texture = tex;
    });
  });

  textureManager.onLoad = () => {
    loadMaterials(name);
  };
  return;
}

function loadMaterials(name: string) {
  if (MATERIALS[name].mat) {
    return;
  }
  const materialData = MATERIALS[name].data;
  delete materialData.metadata;
  let mat;
  if (materialData.type === "MeshStandardMaterial") {
    mat = new MeshStandardMaterial(materialData);
  } else {
    mat = new MeshPhysicalMaterial(materialData);
    mat.clearcoat = 0.3;
    mat.clearcoatRoughness = 0;
    mat.ior = 1.45;
    mat.thickness = 0;
    mat.anisotropy = 4;
  }

  const dataMat = _.cloneDeep(materialData);
  if (dataMat.normalMap && TEXTURES[dataMat.normalMap]) {
    mat.normalMap = TEXTURES[dataMat.normalMap].texture;
  }
  if (dataMat.roughnessMap && TEXTURES[dataMat.roughnessMap]) {
    mat.roughnessMap = TEXTURES[dataMat.roughnessMap].texture;
  }
  if (dataMat.metalnessMap && TEXTURES[dataMat.metalnessMap]) {
    mat.metalnessMap = TEXTURES[dataMat.metalnessMap].texture;
  }
  if (dataMat.emissiveMap && TEXTURES[dataMat.emissiveMap]) {
    mat.emissiveMap = TEXTURES[dataMat.emissiveMap].texture;
  }
  if (dataMat.map && TEXTURES[dataMat.map]) {
    mat.map = TEXTURES[dataMat.map].texture;
  }
  Object.keys(dataMat).map((property) => {
    if (property in mat) {
      if (
        [
          "map",
          "emissiveMap",
          "metalnessMap",
          "roughnessMap",
          "normalMap",
          "metadata",
        ].includes(property)
      ) {
        return;
      }
      if (
        ![
          "color",
          "emissive",
          "normalScale",
          "envMapRotation",
          "blendColor",
          "attenuationColor",
          "specularColor",
          "emissive",
          "sheenColor",
        ].includes(property)
      ) {
        // @ts-ignore
        mat[property] = materialData[property];
      }
      if (
        [
          "color",
          "blendColor",
          "attenuationColor",
          "specularColor",
          "emissive",
          "sheenColor",
        ].includes(property)
      ) {
        // @ts-ignore
        mat[property] = new Color(materialData[property]);
      }
      if (property == "envMapRotation") {
        mat[property] = new Euler(
          materialData[property][0],
          materialData[property][1],
          materialData[property][2],
          materialData[property][3]
        );
      }
      if (property == "normalScale") {
        mat[property] = new Vector2(
          materialData[property][0],
          materialData[property][1]
        );
      }
    }
  });
  if (dataMat.isShader) {
    createMaterialShader(
      mat,
      dataMat.colorShader,
      dataMat.typeShader,
      mat?.map
    );
  }
  MATERIALS[name].mat = mat;
  myState.reloadMaterial$.next([name]);
}

function clearAssets() {
  Object.keys(TEXTURES).map((key) => {
    if (TEXTURES[key].texture) {
      TEXTURES[key].texture.dispose();
    }
  });
  Object.keys(MATERIALS).map((key) => {
    if (MATERIALS[key].mat) {
      MATERIALS[key].mat.dispose();
    }
  });
  [SOUNDS, SOUNDS, FONTS, TEXTURES, MATERIALS].map((ass) => {
    Object.keys(ass).map((key) => {
      delete ass[key];
    });
  });
}

function createNeonLightText(text: string) {
  const textGeometry = new TextGeometry(text, {
    font: assets.getFont("agency"),
    size: 0.03,
    height: 0.005,
    curveSegments: 1,
    bevelThickness: 0,
    bevelSize: 0,
    bevelSegments: 0,
  });
  textGeometry.center();

  const textMaterial = new MeshStandardMaterial({
    color: "#B1008D",
    emissive: "#B1008D",
    emissiveIntensity: 1,
    metalness: 0.5,
    roughness: 0.1,
  });

  const uniforms = {
    amplitude: { value: 5.0 },
    opacity: { value: 0.3 },
    color: { value: new Color(0xffffff) },
  };

  const shaderMaterial = new ShaderMaterial({
    uniforms: uniforms,
    vertexShader: `uniform float amplitude;

    attribute vec3 displacement;
    attribute vec3 customColor;

    varying vec3 vColor;

    void main() {

      vec3 newPosition = position + amplitude * displacement;

      vColor = customColor;

      gl_Position = projectionMatrix * modelViewMatrix * vec4( newPosition, 1.0 );

    }`,
    fragmentShader: `uniform vec3 color;
    uniform float opacity;

    varying vec3 vColor;

    void main() {

      gl_FragColor = vec4( vColor * color, opacity );

    }`,
    blending: AdditiveBlending,
    depthTest: false,
    transparent: true,
  });

  const textMesh = new Mesh(textGeometry, textMaterial);
  textMesh.position.set(0, 0, 0);

  textGeometry.center();

  const count = textGeometry.attributes.position.count;

  const displacement = new Float32BufferAttribute(count * 3, 3);
  textGeometry.setAttribute("displacement", displacement);

  const customColor = new Float32BufferAttribute(count * 3, 3);
  textGeometry.setAttribute("customColor", customColor);

  const color = new Color(0xffffff);

  for (let i = 0, l = customColor.count; i < l; i++) {
    color.setHSL(i / l, 0.5, 0.5);
    color.toArray(customColor.array, i * customColor.itemSize);
  }

  const line1 = new Line(textGeometry, shaderMaterial);
  line1.rotation.x = 0.2;
  return line1;
}

function getNeonTextMaterial() {
  if (!MATERIALS["text"]) {
    MATERIALS["text"] = {
      data: {},
      mat: new MeshStandardMaterial({
        color: 0x00ffff,
        emissive: 0x00ffff,
        emissiveIntensity: 1,
        metalness: 0.5,
        roughness: 0.1,
      }),
    };
  }
  return MATERIALS["text"].mat;
}
function getMeshNameByCode(code: string) {
  return Object.keys(myState.meshMaterial$.value[code]).map(
    (key: any) => myState.meshMaterial$.value[code][key]
  );
}
const assets = {
  loadAssets,
  getModel,
  getSound,
  getTextures,
  getMaterials,
  getFont,
  setMaterial,
  requestMaterial,
  clearAssets,
  setMaterialData,
  setTextureData,
  createNeonLightText,
  getNeonTextMaterial,
  getMeshNameByCode,
};
export default assets;
