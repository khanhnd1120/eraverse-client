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

  return `${days > 0 ? days + " days," : ""} ${
    hours > 0 ? hours + " hours," : ""
  } ${minutes} minutes`;
}

export default function Announcement() {
  const [airdropInfo, setAirdropInfo] = useState(null);
  const [serverTz, setServerTz] = useState("");
  const [countDownAirdrop, setCountDownAirdrop] = useState("");

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
    }, 1000);
    return () => {
      clearInterval(interval);
    };
  }, [airdropInfo, serverTz]);
  return (
    <div className="absolute w-full h-[30px] bg-opacity-50 bg-gray-700 top-0 z-[10000]">
      <div className="w-full overflow-hidden whitespace-nowrap">
        <div className="inline-block marqueue w-full">
          {countDownAirdrop && (
            <div className="inline-block mr-[50px] text-xl">
              🚨 Exciting news! Our airdrop will begin in just{" "}
              {countDownAirdrop} ! Get ready to receive your rewards—stay tuned
              and be prepared!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
