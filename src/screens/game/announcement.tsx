import dayjs from "dayjs";
import { useEffect, useState } from "react";
import Setting from "share/setting";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
dayjs.extend(utc);
dayjs.extend(timezone);

function convertTimeDiff(totalMinutes: number) {
  const days = Math.floor(totalMinutes / (24 * 60)); // Get the number of days
  const hours = Math.floor((totalMinutes % (24 * 60)) / 60); // Get the number of hours
  const minutes = totalMinutes % 60; // Get the remaining minutes

  return `${days > 0 ? days + " days, " : ""}${
    hours > 0 ? hours + " hours, " : ""
  }${minutes > 0 ? minutes + " minutes" : ""}`;
}

export default function Announcement() {
  const [airdropInfo, setAirdropInfo] = useState(null);
  const [serverTz, setServerTz] = useState("");
  const [countDownAirdrop, setCountDownAirdrop] = useState("");
  const [isInAirdrop, setIsInAirdrop] = useState(false);

  useEffect(() => {
    setAirdropInfo(Setting.getLastestAirdropSchedule());
    setServerTz(Setting.getAllConfig().timeZone);
  }, []);
  useEffect(() => {
    const interval = setInterval(() => {
      if (
        airdropInfo &&
        airdropInfo.start &&
        serverTz &&
        dayjs(airdropInfo.start) > dayjs().tz(serverTz)
      ) {
        setCountDownAirdrop(
          convertTimeDiff(
            dayjs(airdropInfo.start).diff(dayjs().tz(serverTz), "minutes")
          )
        );
      }
      if (
        dayjs(airdropInfo.start) < dayjs().tz(serverTz) &&
        dayjs(airdropInfo.end) > dayjs().tz(serverTz)
      ) {
        setIsInAirdrop(true);
      } else {
        setIsInAirdrop(false);
      }
    }, 1000);
    return () => {
      clearInterval(interval);
    };
  }, [airdropInfo, serverTz]);
  return (
    <div className="absolute w-full h-[60px] bg-opacity-50 bg-gray-700 top-0 z-[10000]">
      <div className="w-full overflow-hidden whitespace-nowrap">
        <div className="inline-block marqueue w-full">
          {countDownAirdrop && (
            <div className="inline-block mr-[50px] text-3xl mt-1">
              🚨 Exciting news! Our airdrop will begin in just{" "}
              {countDownAirdrop} ! Get ready to receive your rewards—stay tuned
              and be prepared!
            </div>
          )}
          {isInAirdrop && (
            <div className="inline-block mr-[50px] text-3xl mt-1">
              Airdrop Season is here! Collect your rewards while it lasts. Stay
              active and don't miss out on this limited opportunity!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
