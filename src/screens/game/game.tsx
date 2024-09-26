import { useEffect, useState } from "react";
import Chat from "./chat";
import Playing from "./playing";
import myState from "share/my-state";
import LoadingGame from "./loading-game";
import ActionWheel from "./action-wheel";
import ClaimAirdropPanel from "./claim-airdrop";
import Notification from "./notification";
import Announcement from "./announcement";

export default function Game() {
  const [showDance, setShowDance] = useState(false);
  const [showLoadingGame, setShowLoadingGame] = useState(true);

  useEffect(() => {
    const actionWheel = myState.showActionWheel$.subscribe((v: boolean) => {
      setShowDance(v);
    });
    const loadingGame = myState.loadingGame$.subscribe((v: boolean) => {
      setShowLoadingGame(v);
    });
    return () => {
      loadingGame.unsubscribe();
      actionWheel.unsubscribe();
    };
  }, []);
  return (
    <div className="text-white w-screen h-screen flex justify-center items-center">
      <Playing />
      <Chat />
      {showDance && <ActionWheel />}
      {showLoadingGame && <LoadingGame />}
      <ClaimAirdropPanel />
      <Notification />
      <Announcement />
    </div>
  );
}
