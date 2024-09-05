import _ from "lodash";
import { useEffect, useState } from "react";
import Constants from "share/game-constant";
import myState from "share/my-state";

export default function ActionWheel() {
  const [positionMouse, setPositionMouse] = useState({ x: 0, y: 0 });
  const [activeMenu, setActiveMenu] = useState(null);
  const [moving, setIsMoving] = useState(false);
  const [activeAction, setActiveAction] = useState([]);

  const switchMenu = (menu: any) => {
    setActiveAction(menu);
    setActiveMenu(-1);
    setPositionMouse({ x: 0, y: 0 });
  };

  const DanceAction = Constants.DanceAnim.map((anim: any) => {
    return {
      text: anim.name,
      action: () => {
        console.log(activeAction)
        myState.danceAnim$.next(Constants.DanceAnim[activeMenu].anim);
        myState.showDance$.next(false);
      },
    };
  });

  const MainAction = [
    {
      text: "Chat",
      action: () => {
        myState.showChat$.next(true);
      },
    },
    {
      text: "Dance",
      action: () => {
        switchMenu(DanceAction);
      },
    },
    {
      text: "Skin",
      action: () => {},
    },
  ];
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
      //   myState.danceAnim$.next(activeMenu.anim);
      //   myState.showDance$.next(false);
      activeAction[activeMenu].action();
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
    activeAction.map((action: any, ind: number) => {
      let deg = (360 / activeAction.length) * (ind + 1);
      let from = deg - 360 / activeAction.length / 2;
      let to = deg + 360 / activeAction.length / 2;
      if (
        (convertDegree >= from && convertDegree < to) ||
        (convertDegree + 360 >= from && convertDegree + 360 < to)
      ) {
        setActiveMenu(ind);
      }
    });
  }, [positionMouse]);

  useEffect(() => {
    setActiveAction(MainAction);
  }, []);

  return (
    <div className="action-wheel">
      {activeAction.map((action: any, ind: number) => {
        let deg = (360 / activeAction.length) * (ind + 1);
        return (
          <div
            className={`action-wheel-item  ${
              activeMenu == ind ? "action-wheel-item-active" : ""
            }`}
            key={ind}
            style={{
              transform: `rotate(${deg}deg)`,
            }}
          >
            <div className="action-wheel-text">{action.text}</div>
          </div>
        );
      })}
    </div>
  );
}
