import axios from "axios";
import Environment from "environment";

async function post(url: string, body: any): Promise<any> {
  try {
    let response: any = await axios.request({
      method: "post",
      url: `${Environment.SERVER_REST}${url}`,
      data: body,
      headers: {
        authorization: `Bearer ${sessionStorage.getItem("eraverse_token")}`,
      },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response.data.code);
  }
}

async function eragonPost(url: string, body: any): Promise<any> {
  try {
    let response: any = await axios.request({
      method: "post",
      url: `${Environment.SERVER_ERAGON}${url}`,
      data: body,
      headers: {
        authorization: `Bearer ${localStorage.getItem("access_token")}`,
      },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response.data.code);
  }
}

async function eragonGet(url: string): Promise<any> {
  try {
    let rs = await fetch(`${Environment.SERVER_ERAGON}${url}`, {
      method: "GET",
      mode: "cors",
      headers: {
        "Content-Type": "application/json; charset=UTF-8",
        Authorization: `Bearer ${sessionStorage.getItem("eraverse_token")}`,
      },
    });
    switch (rs.status) {
      case 200:
        let tmp = await rs.json();
        return tmp;
      case 403:
        sessionStorage.clear();
        localStorage.clear();
        throw new Error("forbidden");
      default:
        let err = await rs.json();
        throw err;
    }
  } catch (error: any) {
    throw new Error(error.response.data.code);
  }
}

async function aptosPost(url: string, body: any): Promise<any> {
  try {
    let response: any = await axios.request({
      method: "post",
      url: `${url}`,
      data: body,
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response.data.code);
  }
}

async function auth(eragonToken: string, pool_id: number): Promise<any> {
  let res = await post("/customer/auth", {
    eragon_token: eragonToken,
    pool_id,
  });
  return res;
}

function getToken() {
  return sessionStorage.getItem("eraverse_token");
}

function setToken(newToken: string) {
  return sessionStorage.setItem("eraverse_token", newToken);
}

async function refreshAccessToken() {
  let rs = await post("/customer/refresh-access-token", {});
  return rs;
}

async function getMaterial(): Promise<string> {
  let res = await post("/config/get-material", {});
  return res;
}
const api = {
  post,
  eragonPost,
  eragonGet,
  aptosPost,
  auth,
  setToken,
  refreshAccessToken,
  getToken,
  getMaterial,
};

export default api;
