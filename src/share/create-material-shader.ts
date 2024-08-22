import { Color } from "three";
import { ShaderType } from "./game-interface";

export default function createMaterialShader(
  material: any,
  color: string,
  type: ShaderType,
  matColor?: any
) {
  switch (type) {
    case ShaderType.RowShader:
      createRowShader(material, color, matColor);
      break;
    case ShaderType.PointShader:
      pointShader(material, color);
      break;
  }
}
function createRowShader(material: any, color: string, matColor: any) {
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
  material.onBeforeCompile = (shader: any) => {
    // Add vertex shader logic
    shader.vertexShader = vertexShader;

    // Add fragment shader logic
    shader.fragmentShader = fragmentShader;

    // Ensure the shader includes the new uniforms
    shader.uniforms.videoTexture = { value: matColor };
    shader.uniforms.color = { value: new Color(color) };
    shader.uniforms.opacity = { value: 0 };
  };
}

function pointShader(material: any, color: string) {
  material.onBeforeCompile = (shader: any) => {
    // Inject uniforms
    shader.uniforms.u_time = { value: 0.1 };
    shader.uniforms.u_color1 = { value: new Color(color) };
    shader.uniforms.u_color2 = { value: new Color(color) };

    // Declare vUv in vertex shader and pass it to the fragment shader
    shader.vertexShader = `
    varying vec2 vUv;
    varying vec3 vNormal;
    void main() {
        vUv = uv;
        vNormal = normalize(normalMatrix * normal);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
    `;
    // Modify the fragment shader
    shader.fragmentShader = `
      varying vec2 vUv;
      varying vec3 vNormal;
      uniform float u_time;
      uniform vec2 u_resolution;
      uniform vec3 u_color1;
      uniform vec3 u_color2;

      // Simple 3D noise function
      float random(vec3 st) {
          return fract(sin(dot(st.xyz, vec3(12.9898, 78.233, 54.53))) * 43758.5453123);
      }

      // Function to create a noise pattern
      float noise(vec3 st) {
          vec3 i = floor(st);
          vec3 f = fract(st);
          float a = random(i);
          float b = random(i + vec3(1.0, 0.0, 0.0));
          float c = random(i + vec3(0.0, 1.0, 0.0));
          float d = random(i + vec3(1.0, 1.0, 0.0));
          vec3 u = f * f * (3.0 - 2.0 * f);
          return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
      }

      void main() {
          // Increase UV scaling to create more dense noise points
          vec3 st = vec3(vUv * 50.0, u_time * 0.05); // Adjust the scaling factor (50.0) for more noise points
          float n = noise(st);

          // Create a gradient based on the normal
          float intensity = dot(vNormal, vec3(0.0, 0.0, 1.0));
          vec3 color = mix(u_color1, u_color2, intensity);

          // Create a soft glow effect around each point
          float glow = smoothstep(0.4, 0.6, n) * 2.0; // Adjust smoothstep for soft edges
          color *= glow;

          // Apply noise and glow
          gl_FragColor = vec4(color, glow);
      }
  `;
  };
}
