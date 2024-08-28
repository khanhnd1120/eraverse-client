import { With } from "miniplex";
import assets from "share/assets";
import G, { world } from "share/G";
import { Entity } from "share/world";
import { EdgesGeometry, LineSegments, Vector3 } from "three";
import { TextGeometry } from "three/examples/jsm/Addons.js";

let playerEntities = world.with("player");
type PlayerEntity = With<Entity, "player">;

playerEntities.onEntityAdded.subscribe(onEntityAdded);

export function chatSystem(delta: number) {
  if (!(G.mePlayer && G.mePlayer.me)) {
    return;
  }
  for (const entity of playerEntities) {
    // update text
    let camPosition = G.mePlayer.me.followCamera.getWorldPosition(
      new Vector3()
    );
    if (G.mePlayer.me.keyStates["RIGHTMOUSE"]) {
      camPosition = G.mePlayer.me.secondaryCamera.getWorldPosition(
        new Vector3()
      );
    }
    if (entity.player.nameObject) {
      entity.player.nameObject.lookAt(camPosition);
    }
    if (entity.player.chatBox) {
      entity.player.chatBox.lookAt(camPosition);
    }
  }
}

function onEntityAdded(entity: PlayerEntity) {
  entity.player.serverObject.listen("lastMessage", (message: any) => {
    if (new Date().getTime() - Number(message.time) <= 2000) {
      chat(message.content, entity);
    }
  });
}

function chat(content: string, entity: PlayerEntity) {
  let maxLength: number = 36;
  const words = content.split(" ");
  let ctn = "";
  let nextContent = "";
  let isMax = false;
  words.forEach((word) => {
    if (!word) return;
    if ((`${ctn} ${word}`.length < maxLength && !isMax) || !ctn) {
      ctn += ` ${word}`;
    } else {
      nextContent += ` ${word}`;
      isMax = true;
    }
  });
  if (ctn.length > maxLength) {
    ctn.slice(0, maxLength - 3) + "...";
  }

  const textGeometry = new TextGeometry(ctn, {
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

  if (entity.player.chatMessage) {
    entity.player.chatBox.remove(entity.player.chatMessage);
  }
  entity.player.chatMessage = line;
  entity.player.chatBox.add(entity.player.chatMessage);

  if (entity.player.chatBox) {
    entity.player.chatBox.visible = true;
  }
  if (nextContent) {
    entity.player.timeoutHideMessage = setTimeout(
      () => chat(nextContent, entity),
      1000
    );
  } else {
    if (entity.player.timeoutHideMessage) {
      clearTimeout(entity.player.timeoutHideMessage);
    }
    entity.player.timeoutHideMessage = setTimeout(
      () => (entity.player.chatBox.visible = false),
      1000
    );
  }
}
