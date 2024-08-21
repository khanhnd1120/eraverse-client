import { useEffect } from "react";
import myState from "share/my-state";

export default function Playing() {
  useEffect(() => {
    console.log("alooo")
  }, []);
  return (
    <div
      onClick={() => {
        document.body.requestPointerLock();
        myState.showChat$.next(false);
        myState.showDance$.next(false);
      }}
    >
      <div className="absolute w-screen h-screen top-0 left-0 opacity-0"></div>
    </div>
  );
}
