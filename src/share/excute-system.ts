import { gameScreenSystem } from "game/system/game-screen-system";
import G from "./G";
import { meSystem } from "game/system/me-system";
import initComponent from "game/system/queries";
import { animatorSystem } from "game/system/animator-system";
import { animationControllerSystem } from "game/system/animation-controller-system";
import weaponSystem from "game/system/weapon-system";

initComponent();
export function executeSystems(delta: number) {
  meSystem(delta);
  gameScreenSystem(delta);
  animatorSystem(delta);
  animationControllerSystem(delta);
  weaponSystem(delta);
  G.render();
}
