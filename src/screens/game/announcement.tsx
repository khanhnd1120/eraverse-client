import dayjs from "dayjs";
import { useEffect, useState } from "react";
import Setting from "share/setting";

export default function Announcement() {
  const [airdropInfo, setAirdropInfo] = useState(null);
  useEffect(() => {
    setAirdropInfo(Setting.getLastestAirdropSchedule());
  }, []);
  return (
    <div className="absolute w-full h-[30px] bg-opacity-50 bg-gray-700 top-0 z-[10000]">
      <div className="w-full overflow-hidden whitespace-nowrap">
        <div className="inline-block marqueue w-full">
          {airdropInfo &&
            airdropInfo.start &&
            dayjs(airdropInfo.start) > dayjs() && (
              <div className="inline-block mr-[50px] text-xl">
                🚨 Exciting news! Our airdrop will begin in just 1 minute! Get
                ready to receive your rewards—stay tuned and be prepared!{" "}
              </div>
            )}
        </div>
      </div>
    </div>
  );
}
