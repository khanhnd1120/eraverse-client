import { useEffect, useState } from "react";
import { NotificationType } from "share/game-interface";
import myState from "share/my-state";

export default function Notification() {
  const [notification, setNotification] = useState<any>(null);
  useEffect(() => {
    const noti = myState.notification$.subscribe((data) => {
      setNotification(data);
    });
    return () => {
      noti.unsubscribe();
    };
  }, []);

  if (!(notification && Object.keys(notification).length > 0)) {
    return <div></div>;
  }
  return (
    <div className="bg-black bg-opacity-60 w-full h-full absolute flex item-center align-middle z-[10000]">
      <div className="w-1/2 h-[200px] max-w-[500px] m-auto">
        <div className="bg-black p-2">Notification</div>

        <div className="h-full w-full bg-gray-500 bg-opacity-50 text-center pt-9">
          {notification?.type === NotificationType.Disconnect && (
            <div>
              <div className="text-4xl">Connection Lost</div>
              <div className="text-lg mt-5">
                Connection Lost: You have been disconnected from the server.
                Please check your internet connection and try again.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
