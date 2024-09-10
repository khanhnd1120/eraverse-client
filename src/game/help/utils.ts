/** @format */
import { nanoid } from "nanoid";
import assets from "share/assets";
import G from "share/G";
import Setting from "share/setting";
import {
  BoxGeometry,
  EdgesGeometry,
  Euler,
  LineSegments,
  Mesh,
  MeshStandardMaterial,
  Object3D,
  Quaternion,
  Vector3,
} from "three";
import { TextGeometry } from "three/examples/jsm/Addons.js";
function uniqueId() {
  return nanoid();
}
function isSmall(val: number, ref: number = 0.0001) {
  return Math.abs(val) < ref;
}
function getAngle(v1: Vector3, v2: Vector3) {
  let qrot = new Quaternion();
  qrot.setFromUnitVectors(v1, v2); // (unit vectors)
  let e = new Euler();
  e.setFromQuaternion(qrot, "YXZ");
  return e.y;
}
function getForwardVector() {
  let dir = new Vector3();
  G.camera.getWorldDirection(dir);
  dir.y = 0;
  dir.normalize();
  return dir;
}
function createPanelText(data?: { width: number }) {
  const chatBox = new Object3D();
  chatBox.position.set(0, Setting.getSetting().PLAYER_VIEW + 0.2, 0);
  const geometry = new BoxGeometry(data?.width ?? 0.6, 0.05, 0.01);
  const edges = new EdgesGeometry(geometry);
  const line = new LineSegments(edges, assets.getNeonTextMaterial());
  line.position.set(0, 0, 0);
  chatBox.add(line);

  const contentGeometry = new BoxGeometry(0.6, 0.05, 0.01);
  const content = new Mesh(
    contentGeometry,
    new MeshStandardMaterial({
      color: 0x00ffff,
      emissive: 0x00ffff,
      emissiveIntensity: 1,
      metalness: 0.5,
      roughness: 0.1,
      opacity: 0.2,
      transparent: true,
    })
  );
  chatBox.add(content);
  chatBox.visible = false;
  return chatBox;
}
function createLineText3D(content: string) {
  const textGeometry = new TextGeometry(content, {
    font: assets.getFont("agency"),
    size: 0.02,
    height: 0.005,
    curveSegments: 1,
    bevelThickness: 0,
    bevelSize: 0,
    bevelSegments: 0,
  });
  textGeometry.center();
  const edges = new EdgesGeometry(textGeometry);
  const line = new LineSegments(edges, assets.getNeonTextMaterial());
  return line;
}
const utils = {
  uniqueId,
  isSmall,
  getAngle,
  getForwardVector,
  createPanelText,
  createLineText3D,
};
export default utils;
