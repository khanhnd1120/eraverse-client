/** @format */

import { BehaviorSubject } from "rxjs";
import { MaterialConfigData, TextureConfigData } from "./game-interface";

const texture$ = new BehaviorSubject<TextureConfigData>({});
const material$ = new BehaviorSubject<MaterialConfigData>({});
const meshMaterial$ = new BehaviorSubject<{ [key: string]: string }>({});

const myState = {
  texture$,
  material$,
  meshMaterial$,
};
export default myState;
