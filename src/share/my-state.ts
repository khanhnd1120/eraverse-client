/** @format */

import { BehaviorSubject } from "rxjs";
import { AirdropClaimStatus, Direction } from "./game-interface";
import { Euler, Vector3 } from "three";

const reloadMaterial$ = new BehaviorSubject<string[]>([]);
const meshMaterial$ = new BehaviorSubject<{ [key: string]: string }>({});
const position$ = new BehaviorSubject<Vector3 | null>(null);
const direction$ = new BehaviorSubject<Direction | null>(null);
const cameraRotation$ = new BehaviorSubject<Euler | null>(null);
const pause$ = new BehaviorSubject<boolean>(false);
const showChat$ = new BehaviorSubject<boolean>(false);
const chatMessages$ = new BehaviorSubject<any>([]);
const showActionWheel$ = new BehaviorSubject<boolean>(false);
const loadingTexture$ = new BehaviorSubject<boolean>(false);
const danceAnim$ = new BehaviorSubject<string>("");
const loadingGame$ = new BehaviorSubject<boolean>(true);
const loadVideoMaterial$ = new BehaviorSubject<string[]>([]);
const isRun$ = new BehaviorSubject<boolean>(false);
const keyStates$ = new BehaviorSubject<{ [key: string]: boolean }>({});
const claimAirdropNoti$ = new BehaviorSubject<{
  airdropClaimStatus: AirdropClaimStatus;
  airdropClaimed: any;
}>(null);

const myState = {
  reloadMaterial$,
  meshMaterial$,
  position$,
  direction$,
  cameraRotation$,
  pause$,
  showChat$,
  chatMessages$,
  showActionWheel$,
  loadingTexture$,
  danceAnim$,
  loadingGame$,
  loadVideoMaterial$,
  isRun$,
  keyStates$,
  claimAirdropNoti$,
};
export default myState;
