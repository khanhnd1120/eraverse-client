/** @format */

import Environment from "environment";
import { ConfigKey, SettingData } from "./game-interface";
let settingData: SettingData = null;
let config: { [key: string]: string } = {};

async function loadSetting() {
  let data = await (
    await fetch(`${Environment.SERVER_REST}/config/get-config`)
  ).json();
  settingData = data.GAME_SETTING;
  config = data.CONFIG;
  settingData = data.GAME_SETTING;
}
function getConfig(key: ConfigKey): any {
  return config[key];
}
function getSetting(): SettingData {
  return settingData;
}
const Setting = {
  loadSetting,
  getConfig,
  getSetting,
};

export default Setting;
