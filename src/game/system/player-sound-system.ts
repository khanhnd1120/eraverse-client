import { With } from "miniplex";
import assets from "share/assets";
import G, { world } from "share/G";
import { PlayerState } from "share/game-interface";
import { Entity } from "share/world";
import { PositionalAudio } from "three";

let playerEntities = world.with("playerSound", "gameObject");
type PlayerEntity = With<Entity, "playerSound" | "gameObject">;
playerEntities.onEntityAdded.subscribe(onEntityAdded);

export function playerSoundSystem(delta: number) {
  for (const entity of playerEntities) {
    update(entity);
  }
}

function update(entity: PlayerEntity) {
  // sound top
  const bodySoundTop = entity.playerSound.bodySoundTop;
  const bodySoundBottom = entity.playerSound.bodySoundBottom;
  switch (entity.player.stateTop) {
    case PlayerState.Idle:
      if (getCurrentBodySound(bodySoundTop) !== "idle") {
        bodySoundTop?.stop();
        setCurrentBodySound(bodySoundTop, "idle");
      }
      break;
    case PlayerState.Attack:
      if (getCurrentBodySound(bodySoundTop) !== "punch") {
        bodySoundTop?.stop();
        playBodySound({ bodySound: bodySoundTop, sound: "punch", loop: false });
      }
      break;
  }

  switch (entity.player.stateBottom) {
    case PlayerState.Idle:
      if (getCurrentBodySound(bodySoundBottom) !== "idle") {
        bodySoundBottom?.stop();
        setCurrentBodySound(bodySoundBottom, "idle");
      }
      break;
    case PlayerState.Move:
      let soundMove = "walk";
      if (entity.player.isRun) {
        soundMove = "run";
      }
      if (getCurrentBodySound(bodySoundBottom) !== soundMove) {
        bodySoundBottom?.stop();
        playBodySound({
          bodySound: bodySoundBottom,
          sound: soundMove,
          volume: 2,
        });
      }
      break;
  }
  // if (
  //   entity.player.stateBottom === PlayerState.Move &&
  //   getCurrentBodySound(entity) !== "punch"
  // ) {
  //   if (entity.player.isRun) {
  //     entity.playerSound.bodySound.setBuffer(assets.getSound("run"));
  //     entity.playerSound.bodySound.play();
  //     setCurrentBodySound(entity, "run");
  //   } else {
  //     entity.playerSound.bodySound.setBuffer(assets.getSound("walk"));
  //     entity.playerSound.bodySound.play();
  //     setCurrentBodySound(entity, "walk");
  //   }
  // }
}

function onEntityAdded(entity: PlayerEntity) {
  entity.gameObject.add(entity.playerSound.bodySoundBottom);
  entity.gameObject.add(entity.playerSound.bodySoundTop);
  // entity.player.serverObject.listen("stateTop", (stateTop: any) => {
  //   if (stateTop === PlayerState.Attack) {
  //     entity.playerSound.bodySound.setBuffer(assets.getSound("punch"));
  //     entity.playerSound.bodySound.play();
  //     setCurrentBodySound(entity, "punch");
  //   }
  // });
}

function playBodySound({
  bodySound,
  sound,
  loop = true,
  volume = 1,
}: {
  bodySound: PositionalAudio;
  sound: string;
  loop?: boolean;
  volume?: number;
}) {
  bodySound.setBuffer(assets.getSound(sound));
  bodySound.setLoop(loop);
  bodySound.setVolume(volume);
  bodySound.play();
  setCurrentBodySound(bodySound, sound);
}

function getCurrentBodySound(bodySound: PositionalAudio) {
  return bodySound.userData.sound;
}

function setCurrentBodySound(bodySound: PositionalAudio, sound: string) {
  bodySound.userData.sound = sound;
}
