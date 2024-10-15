/** @format */

import { useEffect, useState } from "react";
import myState from "share/my-state";

export default function Recoil() {
  const [isShow, setIsShow] = useState(false);
  const [isShowText, setIsShowText] = useState<boolean>(false);
  const [timeoutShowText, setTimeoutShowText] = useState<any>();
  useEffect(() => {
    if (isShow) {
      if (timeoutShowText) clearTimeout(timeoutShowText);
      setTimeoutShowText(
        setTimeout(() => {
          setIsShowText(true);
          const gif: any = document.getElementById("loadingGif");
          if (gif) {
            gif.src = "ui/icon/cf.png";
          }
        }, 1700)
      );
      const gif: any = document.getElementById("loadingGif");
      if (gif) {
        gif.src = "ui/icon/cf.png";
        gif.src = "ui/icon/cf.gif";
      }
    }
    if (!isShow && timeoutShowText) {
      setIsShowText(false);
      clearTimeout(timeoutShowText);
      setTimeoutShowText(null);
    }
  }, [isShow]);
  useEffect(() => {
    const adsTutorial = myState.tutorialAction$.subscribe((v) => {
      setIsShow(v?.ads);
    });
    return () => {
      adsTutorial.unsubscribe();
    };
  }, []);
  return (
    <div className="absolute h-screen w-screen">
      <div className="text-white relative w-[100px] h-[100px] top-1/2 left-1/2 translate-x-[-50%] translate-y-[-50%] flex justify-center items-center">
        <div className="absolute">
          <img src="ui/icon/Crosshair.png" className="w-[30%] h-[30%] m-auto" />
        </div>
        {isShow && (
          <div className="absolute top-[3px]">
            <img src="ui/icon/cf.gif" className="m-auto" id="loadingGif" />
          </div>
        )}
        {isShowText && (
          <div className="left-[100%] w-[100px] font-bold text-[#00ffff] absolute text-shadow">
            Press E to Interact
          </div>
        )}
      </div>
    </div>
  );
}
