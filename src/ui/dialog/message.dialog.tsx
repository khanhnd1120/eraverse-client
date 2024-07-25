/** @format */

import { Modal } from "antd";
import { useState } from "react";
import { DialogInfo } from "share/game-interface";
import TextButton from "ui/component/text-button";
import { useGlobalContext } from "ui/context";

export default function MessageDialog({ dialog }: { dialog: DialogInfo }) {
  const { removeDialog } = useGlobalContext();

  const [open, setOpen] = useState<boolean>(true);
  function onClose() {
    setOpen(false);
    setTimeout(() => {
      removeDialog(dialog.id);
    }, 1000);
  }
  return (
    <Modal
      title="Message"
      open={open}
      onOk={onClose}
      onCancel={onClose}
      footer={
        <div>
          <TextButton onClick={onClose} text="CLOSE" />
        </div>
      }
    >
      <div className="w-full h-full">
        <p>{dialog.content}</p>
      </div>
    </Modal>
  );
}
