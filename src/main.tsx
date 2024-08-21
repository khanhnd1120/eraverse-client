import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { AppProvider } from "ui/context/index.tsx";
import { Clock } from "three";
import { executeSystems } from "share/excute-system.ts";
import Setting from "share/setting.ts";
import G from "share/G.ts";
import assets from "share/assets.ts";

function clearReferences() {
  G.scene = null;
  G.camera = null;
  G.renderer = null;
  G.composer = null;
}

function disposeObject(object: any) {
  if (object.geometry) {
    object.geometry.dispose();
  }
  if (object.material) {
    if (Array.isArray(object.material)) {
      object.material.forEach((material: any) => material.dispose());
    } else {
      object.material.dispose();
    }
  }
  if (object.texture) {
    object.texture.dispose();
  }
}

async function bootstrap() {
  window.addEventListener("beforeunload", () => {
    // Dispose of objects
    G.scene.traverse((child: any) => {
      if (child.isMesh || child.isLight || child.isCamera) {
        G.scene.remove(child);
        disposeObject(child);
      }
    });

    // Dispose of renderer
    G.renderer.dispose();
    G.composer.dispose();

    // Clear references
    clearReferences();
    assets.clearAssets();
  });
  await Setting.loadSetting();
  const clock = new Clock();
  ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
      <AppProvider>
        <App />
      </AppProvider>
    </React.StrictMode>
  );

  function animate() {
    requestAnimationFrame(animate);
    executeSystems(clock.getDelta());
  }
  animate();
}
bootstrap();
