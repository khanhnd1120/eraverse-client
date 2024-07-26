import {
  DirectionalLight,
  Group,
  PerspectiveCamera,
  Scene,
  WebGLRenderer,
  AudioListener,
  Vector2,
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

export const world = new World<Entity>();

let camera: PerspectiveCamera = new PerspectiveCamera();
let audioListener: AudioListener = new AudioListener();
let scene: Scene = new Scene();
const light = new DirectionalLight(0xffffff, 1);
const renderer: WebGLRenderer = new WebGLRenderer({ antialias: true });
let composer = new EffectComposer(renderer);
let particleGroup = new Group();
let physicalGroup = new Group();
let worldOctree: Octree = new Octree();
let client: Colyseus.Client = new Colyseus.Client(Environment.SERVER_SOCKET);
let currentRoom: any;
let stats = new Stats();

function setupEnvironment() {
  // setup camera
  camera.near = 0.01;
  window.addEventListener("resize", setupCamera);
  // setup lighting
  scene.add(light);

  // setup group
  scene.add(particleGroup);
  scene.add(physicalGroup);

  // setup renderer
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  let containerElement = document.getElementById("game-container");
  if (containerElement) {
    containerElement.appendChild(renderer.domElement);
    containerElement.appendChild(stats.dom);
  }
  setupCamera();
  // setup bloom
  const bloomPass = new UnrealBloomPass(
    new Vector2(window.innerWidth, window.innerHeight),
    0.3,
    0.1,
    0.3
  );

  // setup composer
  const outputPass = new OutputPass();
  const renderScene = new RenderPass(scene, camera);
  composer.addPass(renderScene);
  composer.addPass(bloomPass);
  composer.addPass(outputPass);
}

function render() {
  composer.render();
  if (stats) {
    stats.update();
  }
}

function setupCamera() {
  camera.add(audioListener);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function cleanAll() {
  scene.clear();
  physicalGroup.clear();
  particleGroup.clear();
  worldOctree.clear();
  world.clear();
}

function openGameScreen(
  roomName: string,
  server: ServerConfigItem,
  character: string
) {
  cleanAll();
  setupEnvironment();
  world.add({
    gameScreen: {
      map: "./map/wooden_plane.glb",
      keyEntities: {},
      points: {},
      roomName,
      server,
      character,
    },
  });
}

function getCurrentRoom(): Colyseus.Room {
  return currentRoom;
}
function setCurrentRoom(room: Colyseus.Room) {
  currentRoom = room;
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
};
export default G;
