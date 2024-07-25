import { useEffect } from "react";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import LoadingAsset from "screens/loading-assets/loading-assets";
import Menu from "screens/menu/menu";
import api from "share/api";
import { useGlobalContext } from "ui/context";

const router = createMemoryRouter([
  {
    path: "/",
    element: <LoadingAsset />,
  },
  {
    path: "/menu",
    element: <Menu />,
  },
]);

function Layout() {
  const { setUserInfo } = useGlobalContext();
  useEffect(() => {
    async function refreshToken() {
      let token = api.getToken();
      if (!token) return;
      let rs = await api.refreshAccessToken();
      api.setToken(rs.accessToken);
      setUserInfo({
        name: rs.name,
      })
    }
    refreshToken();
  }, []);
  return <RouterProvider router={router} />;
}

export default Layout;
