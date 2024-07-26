import { gameScreenSystem } from "game/system/game-screen-system";
import G from "./G";
import { meSystem } from "game/system/me-system";
import initComponent from "game/system/queries";

initComponent();
export function executeSystems(delta: number) {
  meSystem(delta);
  gameScreenSystem(delta);
  G.render();
}
