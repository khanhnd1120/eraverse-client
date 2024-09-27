/** @format */

import Environment from "environment";
import { ConfigKey, SettingData } from "./game-interface";
let settingData: SettingData = null;
let config: { [key: string]: string } = {};
let airdropScheduleInfo: any = {};
let allConfig: any = {};

async function loadSetting() {
  let data = await (
    await fetch(`${Environment.SERVER_REST}/config/get-config`)
  ).json();
  settingData = data.GAME_SETTING;
  config = data.CONFIG;
  settingData = data.GAME_SETTING;
  airdropScheduleInfo = data.airdropScheduleInfo;
  allConfig = data;
}
function getConfig(key: ConfigKey): any {
  return config[key];
}
function getSetting(): SettingData {
  return settingData;
}
function getLastestAirdropSchedule() {
  return airdropScheduleInfo;
}
function getAllConfig() {
  return allConfig;
}
const Setting = {
  loadSetting,
  getConfig,
  getSetting,
  getLastestAirdropSchedule,
  getAllConfig,
};

export default Setting;
