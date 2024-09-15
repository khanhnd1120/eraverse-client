import { Color, MeshBasicMaterial, VideoTexture } from "three";
import myState from "./my-state";
import assets from "./assets";
import createMaterialShader from "./create-material-shader";
import { ShaderType } from "./game-interface";

export default function createVideoMaterial(data: {
  src: string;
  force: boolean;
  isShader?: boolean;
  typeShader?: ShaderType;
  colorShader?: string;
  name: string;
}) {
  if (
    assets.getMaterials()[data.name] &&
    assets.getMaterials()[data.name].mat &&
    !data.force
  ) {
    return assets.getMaterials()[data.name].mat;
  }
  const oldVideo = document.getElementById(data.name);
  if (oldVideo && !data.force) {
    return;
  }
  if (oldVideo) {
    oldVideo.remove();
  }
  const vidElement = document.createElement("video");
  vidElement.id = data.name;
  vidElement.loop = true;
  vidElement.autoplay = true;
  vidElement.playsInline = true;
  vidElement.crossOrigin = "anonymous";
  vidElement.muted = true;
  vidElement.style.display = "none";
  const source = document.createElement("source");
  source.src = data.src;
  vidElement.appendChild(source);
  document.getElementById("game-container")?.appendChild(vidElement);
  vidElement.play();
  const matVid = new VideoTexture(vidElement);
  matVid.flipY = false;

  const material = new MeshBasicMaterial({
    transparent: true,
    map: matVid,
  });

  if (data.isShader) {
    createMaterialShader(material, data.colorShader, data.typeShader, matVid);
  }
  assets.setMaterial(data.name, material);
  myState.reloadMaterial$.next([data.name]);
}
