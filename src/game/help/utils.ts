/** @format */
import { nanoid } from "nanoid";
import G from "share/G";
import { Euler, Quaternion, Vector3 } from "three";
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
const utils = {
  uniqueId,
  isSmall,
  getAngle,
  getForwardVector,
};
export default utils;
