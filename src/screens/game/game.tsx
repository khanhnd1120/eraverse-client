import { useEffect, useState } from "react";
import Chat from "./chat";
import Playing from "./playing";
import myState from "share/my-state";
import LoadingGame from "./loading-game";
import ActionWheel from "./action-wheel";
import ClaimAirdropPanel from "./claim-airdrop";

export default function Game() {
  const [showChat, setShowChat] = useState(false);
  const [showDance, setShowDance] = useState(false);
  const [showLoadingGame, setShowLoadingGame] = useState(true);

  useEffect(() => {
    const showChat = myState.showChat$.subscribe((v: boolean) => {
      setShowChat(v);
    });
    const actionWheel = myState.showActionWheel$.subscribe((v: boolean) => {
      setShowDance(v);
    });
    const loadingGame = myState.loadingGame$.subscribe((v: boolean) => {
      setShowLoadingGame(v);
    });
    return () => {
      loadingGame.unsubscribe();
      actionWheel.unsubscribe();
      showChat.unsubscribe();
    };
  }, []);
  return (
    <div className="text-white w-screen h-screen flex justify-center items-center">
      <Playing />
      {showChat && <Chat />}
      {showDance && <ActionWheel />}
      {showLoadingGame && <LoadingGame />}
      <ClaimAirdropPanel />
    </div>
  );
}
