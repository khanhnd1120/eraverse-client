/** @format */

import { Spin } from "antd";

export default function LoadingDialog() {
  return (
    <div className="fixed z-[10000] top-0 left-0 w-screen h-screen bg-black bg-opacity-75">
      <div className="flex-col flex items-center justify-center w-full h-full">
        <Spin />
        <p className="text-2xl font-bold">Loading!</p>
        <p>Please wait</p>
      </div>
    </div>
  );
}
