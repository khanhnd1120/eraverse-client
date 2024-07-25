/** @format */

import { useEffect } from "react";
import { Link } from "react-router-dom";
import api from "share/api";
import { useGlobalContext } from "ui/context";

export default function AvatarPanel() {
  const { userInfo } = useGlobalContext();
  useEffect(() => {
    checkAuth();
  }, []);
  async function checkAuth() {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const poolId = urlParams.get("poolId");
    const eragonToken = localStorage.getItem("access_token");
    if (eragonToken) {
      let rs = await api.auth(eragonToken, Number(poolId));
      api.setToken(rs.accessToken);
    }
  }
  return (
    <div style={{ height: 120 }} className="flex">
      {userInfo?.name ? (
        <Link to="/profile/profile">
          <div className="flex">
            <div className="bg-white h-full" style={{ width: 5 }}></div>
            <div
              className="bg-white h-full"
              style={{ width: 130, background: "#050505" }}
            >
              <img src="ui/icon/Rank.png" />
            </div>
            <div
              style={{ background: "#050505" }}
              className="h-full text-4xl px-6 py-4"
            >
              <div>
                <p>{userInfo?.name}</p>
              </div>
            </div>
          </div>
        </Link>
      ) : (
        <div></div>
      )}
    </div>
  );
}
