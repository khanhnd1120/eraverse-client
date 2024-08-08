import { useEffect, useState } from "react";
import Chat from "./chat";
import Playing from "./playing";
import myState from "share/my-state";
import Dance from "./dance";
import LoadingGame from "./loading-game";

export default function Game() {
  const [showChat, setShowChat] = useState(false);
  const [showDance, setShowDance] = useState(false);
  const [showLoadingGame, setShowLoadingGame] = useState(true);

  useEffect(() => {
    myState.showChat$.subscribe((v: boolean) => {
      setShowChat(v);
    });
    myState.showDance$.subscribe((v: boolean) => {
      setShowDance(v);
    });
    myState.loadingGame$.subscribe((v: boolean) => {
      setShowLoadingGame(v);
    });
  }, []);
  return (
    <div className="text-white w-screen h-screen flex justify-center items-center">
      <Playing />
      {showChat && <Chat />}
      {showDance && <Dance />}
      {showLoadingGame && <LoadingGame />}
    </div>
  );
}
