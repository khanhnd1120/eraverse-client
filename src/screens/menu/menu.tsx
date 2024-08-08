import Character from "ui/component/character";
import AvatarPanel from "./avatar-panel";
import BattleButton from "ui/component/battle-button";
import { Link, useNavigate } from "react-router-dom";
import { useGlobalContext } from "ui/context";
import Constants from "share/game-constant";
import { twMerge } from "tailwind-merge";
import { useState } from "react";
import Setting from "share/setting";
import { ConfigKey } from "share/game-interface";
import G from "share/G";

export default function Menu() {
  const { userInfo } = useGlobalContext();
  const nav = useNavigate();
  const [activeCharacterCode, setActiveCharacterCode] = useState(
    Constants.CharacterCodes[0]
  );
  return (
    <div
      className="text-white w-screen h-screen flex justify-center items-center"
      style={{ backgroundImage: `url(ui/icon/BG.png)` }}
    >
      <div
        className="absolute right-0 top-0"
        style={{ height: `100vh`, width: "90%" }}
      >
        <Character
          anim="idle"
          secondAnim="ninja_idle"
          code={activeCharacterCode}
        />
      </div>
      <div className="absolute bottom-0 right-0 p-[50px]">
        <BattleButton
          onClick={() => {
            G.openGameScreen(
              "lobby",
              Setting.getConfig(ConfigKey.LOBBY_ROOM),
              activeCharacterCode
            );
            nav("/game");
          }}
        />
      </div>
      <div className="absolute w-full top-0 left-0" style={{ padding: 40 }}>
        <div className="w-full h-full flex justify-between">
          <div className="flex gap-4">
            <AvatarPanel />
          </div>
        </div>
      </div>
      {userInfo?.name && (
        <div className="absolute" style={{ top: 200, left: 40, width: 520 }}>
          <div className="flex flex-col gap-2">
            <p className="text-5xl">CUSTOM CHARACTER</p>
            <div
              style={{
                width: 500,
                height: "calc(80vh - 120px)",
                zIndex: 1000,
              }}
              className="flex-shrink-0 overflow-auto pr-2 absolute mt-16"
            >
              {Constants.CharacterCodes.map((code: string) => {
                return (
                  <div
                    onClick={() => {
                      setActiveCharacterCode(code);
                    }}
                    className={twMerge(
                      "w-full p-1 border-l-4 border-transparent hover:border-white mt-2",
                      activeCharacterCode == code
                        ? "bg-activeColor"
                        : "bg-black hover:bg-gray-900"
                    )}
                    key={code}
                  >
                    <img src={`ui/icon/1.1.png`} className="h-20" />
                    <div className="flex justify-between">
                      <p>{code}</p>
                      <div className="flex gap-2">
                        <img src="ui/icon/Ammo.png" className="h-6" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
