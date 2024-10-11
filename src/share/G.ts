import {
  DirectionalLight,
  Group,
  PerspectiveCamera,
  Scene,
  WebGLRenderer,
  AudioListener,
  Vector2,
  AmbientLight,
  PCFSoftShadowMap,
  AxesHelper,
} from "three";
import {
  EffectComposer,
  Octree,
  OutputPass,
  RenderPass,
  UnrealBloomPass,
} from "three/examples/jsm/Addons.js";
import { World } from "miniplex";
import { Entity } from "./world";
import { ServerConfigItem } from "./game-interface";
import * as Colyseus from "colyseus.js";
import Environment from "environment";
import Stats from "three/addons/libs/stats.module.js";
import myState from "./my-state";
import TWEEN from "@tweenjs/tween.js";

export const world = new World<Entity>();

let camera: PerspectiveCamera = new PerspectiveCamera();
let audioListener: AudioListener = new AudioListener();
let scene: Scene = new Scene();
const directionalLight = new DirectionalLight(0xffffff, 1); // Color and intensity
const ambientLight = new AmbientLight(0xffffff, 1); // Color and intensity
const renderer: WebGLRenderer = new WebGLRenderer({
  antialias: true,
});
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
let composer = new EffectComposer(renderer);
let particleGroup = new Group();
let physicalGroup = new Group();
let worldOctree: Octree = new Octree();
let client: Colyseus.Client = new Colyseus.Client(Environment.SERVER_SOCKET);
let currentRoom: any;
let stats = new Stats();
let messages: any = [];
let mePlayer: any = null;
let mapScene: any = null;
let fps = 0;
let frames = 0,
  prevTime = performance.now();

function setupEnvironment() {
  // setup camera
  camera.near = 0.01;
  window.addEventListener("resize", setupCamera);

  // setup lighting
  directionalLight.castShadow = true; // Enable shadow casting if needed
  directionalLight.position.x = 10;
  directionalLight.position.y = 10;
  directionalLight.position.z = 10;
  directionalLight.shadow.mapSize.width = 1024;
  directionalLight.shadow.mapSize.height = 1024;
  directionalLight.shadow.camera.near = 0.5;
  directionalLight.shadow.camera.far = 500;
  // scene.add(directionalLight);
  scene.add(ambientLight);
  // setup group
  scene.add(particleGroup);
  scene.add(physicalGroup);

  // setup renderer
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = PCFSoftShadowMap; // Optional: use a softer shadow type
  let containerElement = document.getElementById("game-container");
  if (containerElement) {
    containerElement.appendChild(renderer.domElement);
    containerElement.appendChild(stats.dom);
  }
  setupCamera();
  // setup bloom
  const bloomPass = new UnrealBloomPass(
    new Vector2(window.innerWidth, window.innerHeight),
    0.15,
    0.0005,
    1
  );
  // 1.5,
  //   1,
  //   0

  // setup composer
  const outputPass = new OutputPass();
  const renderScene = new RenderPass(scene, camera);
  composer.addPass(renderScene);
  composer.addPass(bloomPass);
  composer.addPass(outputPass);
}
function setFps(val: number) {
  fps = val;
}
function getFps() {
  return fps;
}
function calFps() {
  frames++;
  const time = performance.now();
  if (time >= prevTime + 1000) {
    G.setFps(Math.round((frames * 1000) / (time - prevTime)));
    frames = 0;
    prevTime = time;
  }
}

function render() {
  composer.render();
  calFps();
  if (stats) {
    stats.update();
    TWEEN.update();
  }
}

function setupCamera() {
  camera.add(audioListener);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  composer.setSize(window.innerWidth, window.innerHeight);
}

function cleanAll() {
  scene.clear();
  physicalGroup.clear();
  particleGroup.clear();
  worldOctree.clear();
  world.clear();
}

function openGameScreen(roomName: string, server: ServerConfigItem) {
  cleanAll();
  setupEnvironment();
  world.add({
    gameScreen: {
      map: "map",
      keyEntities: {},
      airdropEntities: {},
      points: {},
      roomName,
      server,
    },
  });
}

function getCurrentRoom(): Colyseus.Room {
  return currentRoom;
}
function setCurrentRoom(room: Colyseus.Room) {
  currentRoom = room;
  if (room.state.globalChats) {
    room.state.globalChats.onAdd((m: any) => {
      messages.push({
        id: m.id,
        name: m.name,
        content: m.content,
      });
      myState.chatMessages$.next(messages);
    });
    room.state.globalChats.onRemove((m: any) => {
      messages = messages.filter((t: any) => t.id != m.id);
      myState.chatMessages$.next(messages);
    });
  }
}
const G = {
  setCurrentRoom,
  getCurrentRoom,
  openGameScreen,
  audioListener,
  camera,
  physicalGroup,
  scene,
  worldOctree,
  client,
  particleGroup,
  render,
  messages,
  composer,
  renderer,
  mePlayer,
  fps,
  calFps,
  setFps,
  getFps,
  mapScene,
};
export default G;
