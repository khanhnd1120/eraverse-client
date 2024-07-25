/** @format */

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import assets from "share/assets";

export default function LoadingAsset() {
  const [progress, setProgress] = useState<number>(0);
  const nav = useNavigate();
  useEffect(() => {
    assets.loadAssets().then((manager) => {
      manager.onStart = function (url, itemsLoaded, itemsTotal) {
      };

      manager.onLoad = function () {
        nav("/menu");
      };

      manager.onProgress = function (url, itemsLoaded, itemsTotal) {
        setProgress(Math.round((itemsLoaded / itemsTotal) * 100));
      };

      manager.onError = function (url) {
        console.log("There was an error loading " + url);
      };
    });
  }, []);
  return (
    <div
      className="absolute top-0 left-0 w-screen h-screen"
      style={{ backgroundImage: `url(ui/icon/BG.png)` }}
    >
      <div className="w-full h-full flex justify-center items-center text-white text-3xl">
        <div>
          <p>LOADING ASSETS</p>
          <p>{progress}</p>
        </div>
      </div>
    </div>
  );
}
