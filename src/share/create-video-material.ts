import { Color, MeshBasicMaterial, VideoTexture } from "three";
import myState from "./my-state";
import assets from "./assets";

export default function createVideoMaterial(data: {
  src: string;
  force: boolean;
  rowShader: boolean;
  name: string;
}) {
  if (
    assets.getMaterials()[data.name] &&
    assets.getMaterials()[data.name].mat &&
    !data.force
  ) {
    return;
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

  const material = new MeshBasicMaterial({
    transparent: true,
    map: matVid,
  });

  if (data.rowShader) {
    const vertexShader = `
    varying vec2 vUv;
    void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
`;

    const fragmentShader = `
    varying vec2 vUv;

    uniform sampler2D videoTexture;
    uniform vec3 color;
    uniform float opacity;

    void main() {
        vec4 videoColor = texture2D(videoTexture, vUv);

        float rowCount = 50.0;
        float lightRow = step(0.8, fract(vUv.y * rowCount));

        vec3 finalColor = mix(videoColor.rgb, color, lightRow);
        gl_FragColor = vec4(finalColor, videoColor.a * opacity);
    }
`;
    material.onBeforeCompile = (shader) => {
      // Add vertex shader logic
      shader.vertexShader = vertexShader;

      // Add fragment shader logic
      shader.fragmentShader = fragmentShader;

      // Ensure the shader includes the new uniforms
      shader.uniforms.videoTexture = { value: matVid };
      shader.uniforms.color = { value: new Color(0x00fff4) };
      shader.uniforms.opacity = { value: 0 };
    };
  }
  assets.setMaterial(data.name, material);
  myState.reloadMaterial$.next([data.name]);
}
