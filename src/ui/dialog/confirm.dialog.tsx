/** @format */

import { Modal } from "antd";
import { useState } from "react";
import { DialogInfo } from "share/game-interface";
import TextButton from "ui/component/text-button";
import { useGlobalContext } from "ui/context";

export default function ConfirmDialog({ dialog }: { dialog: DialogInfo }) {
  const { removeDialog } = useGlobalContext();
  const [open, setOpen] = useState<boolean>(true);

  function onClose(success: boolean) {
    if (dialog.callback) {
      dialog.callback(success);
    }
    setOpen(false);
    setTimeout(() => {
      removeDialog(dialog.id);
    }, 1000);
  }
  return (
    <Modal
      title="Confirm"
      open={open}
      onCancel={() => {
        onClose(false);
      }}
      footer={
        <div className="flex gap-1 justify-end">
          <TextButton
            onClick={() => {
              onClose(false);
            }}
            text="CANCEL"
          />
          <TextButton
            onClick={() => {
              onClose(true);
            }}
            text="OK"
          />
        </div>
      }
    >
      <div className="w-full h-full bg-[#353348]">
        <p>{dialog.content}</p>
      </div>
    </Modal>
  );
}
