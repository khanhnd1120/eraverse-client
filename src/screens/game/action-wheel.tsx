import _ from "lodash";
import { useEffect, useState } from "react";
import G from "share/G";
import Constants from "share/game-constant";
import myState from "share/my-state";
import SelectSkin from "./select-skin";

const MAX_ITEM = 6;

export default function ActionWheel() {
  const [positionMouse, setPositionMouse] = useState({ x: 0, y: 0 });
  const [activeMenu, setActiveMenu] = useState(null);
  const [moving, setIsMoving] = useState(false);
  const [activeAction, setActiveAction] = useState([]);
  const [chooseSkinMenu, setChooseSkinMenu] = useState<boolean>(false);

  const switchMenu = (menu: any) => {
    setActiveAction(menu);
    setPositionMouse({ x: 0, y: 0 });
    setActiveMenu(0);
  };

  const paginateMenu = (
    arr: any,
    backFirst: any,
    action: any,
    ind: number = 0
  ) => {
    const firstBactItem = {
      text: "Back",
      action: backFirst,
    };
    let arrMenu: any = [];
    if (arr.length > MAX_ITEM - 2) {
      arrMenu = [...arr].slice(
        ind * (MAX_ITEM - 2),
        (ind + 1) * (MAX_ITEM - 2)
      );
      let menu = arrMenu.map((item: any) => {
        return {
          text: item.name,
          action: (activeMenu: any) => {
            action(arrMenu, activeMenu);
          },
        };
      });
      if (ind == 0) {
        menu.push(firstBactItem);
      } else {
        menu.push({
          text: "Back",
          action: () => {
            switchMenu(paginateMenu(arr, backFirst, action, ind - 1));
          },
        });
      }
      if (ind + 1 < arr.length / (MAX_ITEM - 2)) {
        menu.push({
          text: "More",
          action: () => {
            switchMenu(paginateMenu(arr, backFirst, action, ind + 1));
          },
        });
      }
      return menu;
    }
    let menu = [...arr].map((item: any) => {
      return {
        text: item.name,
        action: (activeMenu: any) => {
          action(arr, activeMenu);
        },
      };
    });
    menu.push(firstBactItem);
    return menu;
  };

  const DanceAction = paginateMenu(
    Constants.DanceAnim,
    () => {
      switchMenu(MainAction);
    },
    (menu: any, activeMenu: any) => {
      myState.danceAnim$.next(menu[activeMenu].anim);
      myState.showActionWheel$.next(false);
      switchMenu(MainAction);
    }
  );

  const MainAction = [
    {
      text: "Chat",
      action: () => {
        myState.activeChat$.next(true);
        myState.showActionWheel$.next(false);
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
      action: () => {
        setChooseSkinMenu(true);
        document.exitPointerLock();
      },
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
        if (myState.showActionWheel$.value) {
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
      activeAction[activeMenu].action(activeMenu);
    };
    document.addEventListener("mouseup", handleClick);
    return () => {
      document.removeEventListener("mousemove", handleInput);
      document.removeEventListener("mouseup", handleClick);
    };
  }, [positionMouse, moving, activeAction]);

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
    <div>
      {chooseSkinMenu && (
        <SelectSkin
          onClose={() => {
            setChooseSkinMenu(false);
            document.body.requestPointerLock();
            myState.showActionWheel$.next(false);
          }}
        />
      )}
      {!chooseSkinMenu && (
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
      )}
    </div>
  );
}
