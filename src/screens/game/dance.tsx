import _ from "lodash";
import { useEffect, useState } from "react";
import Constants from "share/game-constant";
import myState from "share/my-state";
export default function Dance() {
  const [positionMouse, setPositionMouse] = useState({ x: 0, y: 0 });
  const [activeMenu, setActiveMenu] = useState(null);
  const [moving, setIsMoving] = useState(false);
  useEffect(() => {
    const convertPosMouse = (val: number) => {
      if (val < -20) return -20;
      if (val > 20) return 20;
      return val;
    };
    const handleInput = (event: any) => {
      if (moving) return;
      if (document.pointerLockElement === document.body) {
        const movementX =
          event.movementX || event.mozMovementX || event.webkitMovementX || 0;
        const movementY =
          event.movementY || event.mozMovementY || event.webkitMovementY || 0;
        if (myState.showDance$.value) {
          setIsMoving(true);
          setTimeout(() => {
            setIsMoving(false);
          }, 50);
          setPositionMouse({
            x: convertPosMouse(positionMouse.x + movementX),
            y: convertPosMouse(positionMouse.y + movementY),
          });
        }
      }
    };
    document.addEventListener("mousemove", handleInput);

    const handleClick = () => {
      myState.danceAnim$.next(activeMenu.anim);
      myState.showDance$.next(false);
    };
    document.addEventListener("mouseup", handleClick);
    return () => {
      document.removeEventListener("mousemove", handleInput);
      document.removeEventListener("mouseup", handleClick);
    };
  }, [positionMouse, moving]);

  useEffect(() => {
    let angleRadians = Math.atan2(positionMouse.y, positionMouse.x);

    // Convert the angle from radians to degrees
    const angleDegrees = (angleRadians * 180) / Math.PI;
    let convertDegree = angleDegrees;
    if (angleDegrees <= 180 && angleDegrees >= -90) {
      convertDegree = angleDegrees + 90;
    } else {
      convertDegree = 450 + angleDegrees;
    }
    Constants.DanceAnim.map((anim, ind) => {
      let deg = (360 / Constants.DanceAnim.length) * (ind + 1);
      let from = deg - 360 / Constants.DanceAnim.length / 2;
      let to = deg + 360 / Constants.DanceAnim.length / 2;
      if (
        (convertDegree >= from && convertDegree < to) ||
        (convertDegree + 360 >= from && convertDegree + 360 < to)
      ) {
        setActiveMenu(anim);
      }
    });
  }, [positionMouse]);

  return (
    <div className="dance-menu">
      {Constants.DanceAnim.map((anim, ind) => {
        let deg = (360 / Constants.DanceAnim.length) * (ind + 1);
        let from = deg - 360 / Constants.DanceAnim.length / 2;
        let to = deg + 360 / Constants.DanceAnim.length / 2;
        return (
          <div
            className={`dance-anim-item  ${
              activeMenu?.anim == anim.anim ? "dance-anim-item-active" : ""
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
