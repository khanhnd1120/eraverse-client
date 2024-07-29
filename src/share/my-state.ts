/** @format */

import { BehaviorSubject } from "rxjs";
import {
  Direction,
  MaterialConfigData,
  TextureConfigData,
} from "./game-interface";
import { Euler, Vector3 } from "three";

const texture$ = new BehaviorSubject<TextureConfigData>({});
const material$ = new BehaviorSubject<MaterialConfigData>({});
const meshMaterial$ = new BehaviorSubject<{ [key: string]: string }>({});
const position$ = new BehaviorSubject<Vector3 | null>(null);
const direction$ = new BehaviorSubject<Direction | null>(null);
const cameraRotation$ = new BehaviorSubject<Euler | null>(null);
const pause$ = new BehaviorSubject<boolean>(false);
const toggleChat$ = new BehaviorSubject<boolean>(false);
const chatMessages$ = new BehaviorSubject<any>([]);

const myState = {
  texture$,
  material$,
  meshMaterial$,
  position$,
  direction$,
  cameraRotation$,
  pause$,
  toggleChat$,
  chatMessages$,
};
export default myState;
