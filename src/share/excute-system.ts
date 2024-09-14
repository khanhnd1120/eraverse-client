import { gameScreenSystem } from "game/system/game-screen-system";
import G from "./G";
import { meSystem } from "game/system/me-system";
import initComponent from "game/system/queries";
import { animatorSystem } from "game/system/animator-system";
import { animationControllerSystem } from "game/system/animation-controller-system";
import weaponSystem from "game/system/weapon-system";
import { playerSystem } from "game/system/player-system";
import { positionSystem } from "game/system/position-system";
import { chatSystem } from "game/system/chat-system";
import { airdropSystem } from "game/system/airdrop-system";
import { playerSoundSystem } from "game/system/player-sound-system";

initComponent();
export function executeSystems(delta: number) {
  meSystem(delta);
  animatorSystem(delta);
  animationControllerSystem(delta);
  weaponSystem(delta);
  playerSystem(delta);
  positionSystem(delta);
  gameScreenSystem(delta);
  chatSystem(delta);
  airdropSystem(delta);
  playerSoundSystem(delta);
  G.render();
}
