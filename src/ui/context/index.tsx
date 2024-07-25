import { createContext, useContext, useState } from "react";
import { ContextType, DialogInfo, UserInfo } from "share/game-interface";

let dialogId = 0;
function getDialogId() {
  return dialogId++;
}

export const AppContext = createContext<ContextType | null>(null);

export const AppProvider = ({ children }: any) => {
  const [userInfo, setUserInfo] = useState<UserInfo>();
  const [dialogs, setDialogs] = useState<DialogInfo[]>([]);
  const [showLoadingDialog, setShowLoadingDialog] = useState<boolean>(false);
  const [loadingContent, setLoadingContent] = useState<string>("");

  function createDialog(action: any) {
    let tmp = JSON.parse(JSON.stringify(dialogs));
    tmp = tmp.concat({
      ...action.payload,
      id: getDialogId(),
    });
    setDialogs(tmp);
  }
  function removeDialog(action: any) {
    let tmp = JSON.parse(JSON.stringify(dialogs));
    tmp = tmp.filter((d: DialogInfo) => d.id !== action.payload);
    setDialogs(tmp);
  }
  function showLoading(content?: string) {
    setShowLoadingDialog(true);
    setLoadingContent(content);
  }
  function hideLoading() {
    setShowLoadingDialog(false);
  }
  return (
    <AppContext.Provider
      value={{
        userInfo,
        setUserInfo,
        createDialog,
        removeDialog,
        dialogs,
        showLoading,
        hideLoading,
        showLoadingDialog,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useGlobalContext = () => {
  return useContext(AppContext);
};
