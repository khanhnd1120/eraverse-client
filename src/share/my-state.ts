/** @format */

import { BehaviorSubject } from "rxjs";
import { AirdropClaimStatus, Direction } from "./game-interface";
import { Euler, Vector3 } from "three";
import { KeylessAccount } from "@aptos-labs/ts-sdk";

const reloadMaterial$ = new BehaviorSubject<string[]>([]);
const meshMaterial$ = new BehaviorSubject<{ [key: string]: string }>({});
const position$ = new BehaviorSubject<Vector3 | null>(null);
const direction$ = new BehaviorSubject<Direction | null>(null);
const cameraRotation$ = new BehaviorSubject<Euler | null>(null);
const pause$ = new BehaviorSubject<boolean>(false);
const activeChat$ = new BehaviorSubject<boolean>(false);
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
  airdropClaimError: any;
}>(null);
const keylessAccountData$ = new BehaviorSubject<KeylessAccount>(null);
const listSkin$ = new BehaviorSubject<any[]>([]);
const reloadSound$ = new BehaviorSubject<string>("");
const notification$ = new BehaviorSubject<any>({});
const tutorialAction$ = new BehaviorSubject<any>({});

const myState = {
  reloadMaterial$,
  meshMaterial$,
  position$,
  direction$,
  cameraRotation$,
  pause$,
  activeChat$,
  chatMessages$,
  showActionWheel$,
  loadingTexture$,
  danceAnim$,
  loadingGame$,
  loadVideoMaterial$,
  isRun$,
  keyStates$,
  claimAirdropNoti$,
  keylessAccountData$,
  listSkin$,
  reloadSound$,
  notification$,
  tutorialAction$,
};
export default myState;
