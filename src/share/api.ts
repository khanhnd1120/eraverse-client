import axios from "axios";
import Environment from "environment";

async function post(url: string, body: any): Promise<any> {
  try {
    let response: any = await axios.request({
      method: "post",
      url: `${Environment.SERVER_REST}${url}`,
      data: body,
      headers: {
        authorization: `Bearer ${sessionStorage.getItem("token")}`,
      },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response.data.code);
  }
}

async function auth(eragonToken: string, pool_id: number): Promise<any> {
  let res = await post("/auth", { eragon_token: eragonToken, pool_id });
  return res;
}

function getToken() {
  return sessionStorage.getItem("token");
}

function setToken(newToken: string) {
  return sessionStorage.setItem("token", newToken);
}

async function refreshAccessToken() {
  let rs = await post("/refresh-access-token", {});
  return rs;
}

async function getMaterial(): Promise<string> {
  let res = await post("/get-material", {});
  return res;
}
const api = {
  auth,
  setToken,
  refreshAccessToken,
  getToken,
  getMaterial,
};

export default api;
