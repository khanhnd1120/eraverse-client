/** @format */

import ConfirmDialog from "./confirm.dialog";
import { useGlobalContext } from "ui/context";
import { DialogInfo, DialogType } from "share/game-interface";
import LoadingDialog from "./loading.dialog";
import MessageDialog from "./message.dialog";

export default function Dialog() {
  const { dialogs, showLoadingDialog } = useGlobalContext();
  return (
    <div>
      {showLoadingDialog && <LoadingDialog />}
      {dialogs.map((d: DialogInfo) => {
        switch (d.type) {
          case DialogType.Message:
            return <MessageDialog dialog={d} key={d.id} />;
          case DialogType.Confirm:
            return <ConfirmDialog dialog={d} key={d.id} />;
        }
      })}
    </div>
  );
}
