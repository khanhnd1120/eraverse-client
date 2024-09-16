import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useGlobalContext } from "ui/context";

export default function Home() {
  const nav = useNavigate();
  const { userInfo } = useGlobalContext();
  useEffect(() => {
    if (userInfo && userInfo.name) {
      nav("/loading-assets");
    }
  }, [userInfo]);
  return <div></div>;
}
