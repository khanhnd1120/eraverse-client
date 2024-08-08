import { useEffect, useState } from "react";

const tips = [
  "Press double G button to explore more animations",
  "Press Enter to chat with others",
  "Click Left Mouse for punch",
];
export default function LoadingGame() {
  const [tip, setTip] = useState("");
  useEffect(() => {
    let intervalId = setInterval(() => {
      setTip(tips[Math.floor(Math.random() * tips.length)]);
    }, 1000);
    return () => {
      clearInterval(intervalId);
    };
  }, []);
  return (
    <div className="fixed z-[10000] top-0 left-0 w-screen h-screen bg-black">
      <div className="flex-col flex items-center text-center justify-center w-full h-full">
        <p className="text-3xl font-bold">Loading!</p>
        <p className="mt-1">{tip}</p>
      </div>
    </div>
  );
}
