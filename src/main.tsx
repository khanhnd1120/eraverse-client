import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { AppProvider } from "ui/context/index.tsx";
import { Clock } from "three";
import { executeSystems } from "share/excute-system.ts";
import loadTexture from "share/load-texture.ts";
import loadMaterial from "share/load-material.ts";

async function bootstrap() {
  loadTexture();
  loadMaterial();
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
