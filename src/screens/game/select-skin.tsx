import { useEffect, useState } from "react";
import G from "share/G";
import Constants from "share/game-constant";
import myState from "share/my-state";

export default function SelectSkin({ onClose }: { onClose: any }) {
  const [listSkin, setListSkin] = useState([]);
  useEffect(() => {
    const listSkinListen = myState.listSkin$.subscribe((listSkin) => {
      setListSkin(listSkin);
    });
    return () => {
      listSkinListen.unsubscribe();
    };
  }, []);
  return (
    <div
      className="absolute w-[310px] z-[10000] h-[500px] bg-gray-800 bg-opacity-70  rounded-md"
      style={{ top: "calc(100vh - 510px)", left: "10px" }}
    >
      <div
        className="w-[30px] py-[3px] bg-gray-900 absolute left-[280px] top-[-30px] text-center cursor-pointer"
        onClick={() => {
          if (onClose) {
            onClose();
          }
        }}
      >
        ✖
      </div>
      <div className="overflow-y-scroll w-full h-full">
        <div className="grid grid-cols-2 auto-rows-auto gap-y-[10px] py-3 pl-3">
          {listSkin.map((skin) => {
            return (
              <div
                key={skin.nftId}
                className="w-[135px] h-[135px] relative skin-menu-item cursor-pointer"
                onClick={() => {
                  G.getCurrentRoom().send("character", {
                    nftId: skin.nftId,
                  });
                  myState.showActionWheel$.next(false);
                  if (onClose) {
                    onClose();
                  }
                }}
              >
                <div className="hidden absolute top-0 left-0 w-full border-[#f17d00] border-4 h-full battle-button-border"></div>
                <img
                  src={Constants.SkinAvatarImgs[skin.model]}
                  alt="icon"
                  className={`w-[135px] h-[135px] border-4 border-solid ${
                    skin.isActive ? "border-blue-600" : "border-gray-600"
                  }`}
                />
                {skin.isInAirdrop && (
                  <div className="absolute w-[127px] bottom-1 left-1 bg-slate-900 bg-opacity-60 p-2">
                    {skin.numberCanClaim} / {skin.maxClaim}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
