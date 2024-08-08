import { useEffect, useState } from "react";
import Constants from "share/game-constant";
import myState from "share/my-state";

export default function Dance() {
  const [degreesMouse, setDegreesMouse] = useState(0);
  useEffect(() => {
    const handleInput = (event: any) => {
      if (document.pointerLockElement === document.body) {
        const movementX =
          event.movementX || event.mozMovementX || event.webkitMovementX || 0;
        const movementY =
          event.movementY || event.mozMovementY || event.webkitMovementY || 0;
        if (
          myState.showDance$.value &&
          (Math.abs(movementX) > 10 || Math.abs(movementY) > 10)
        ) {
          let angleRadians = Math.atan2(movementY, movementX);

          // Convert the angle from radians to degrees
          const angleDegrees = (angleRadians * 180) / Math.PI;
          let convertDegree = angleDegrees;
          if (angleDegrees <= 180 && angleDegrees >= -90) {
            convertDegree = angleDegrees + 90;
          } else {
            convertDegree = 450 + angleDegrees;
          }
          setDegreesMouse(convertDegree);
          console.log(convertDegree);
        }
      }
    };
    document.addEventListener("mousemove", handleInput);
    return () => {
      document.removeEventListener("mousemove", handleInput);
    };
  }, []);
  return (
    <div className="dance-menu">
      {Constants.DanceAnim.map((anim, ind) => {
        let deg = (360 / Constants.DanceAnim.length) * (ind + 1);
        return (
          <div
            className={`dance-anim-item ${
              deg - 360 / Constants.DanceAnim.length / 2
            } ${deg + 360 / Constants.DanceAnim.length / 2} ${
              degreesMouse >= deg - 360 / Constants.DanceAnim.length / 2 &&
              degreesMouse < deg + 360 / Constants.DanceAnim.length / 2
                ? "dance-anim-item-active"
                : ""
            }`}
            key={anim.anim}
            style={{
              transform: `rotate(${deg}deg)`,
            }}
          >
            <div className="dance-menu-text">{anim.name}</div>
          </div>
        );
      })}
    </div>
  );
}
