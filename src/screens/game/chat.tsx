import { Form, Input } from "antd";
import { useEffect, useRef, useState } from "react";
import G from "share/G";
import myState from "share/my-state";

export default function Chat() {
  const [form] = Form.useForm();
  const inputRef = useRef(null);

  const [content, setContent] = useState("");
  const [messages, setMessages] = useState([]);
  const [showChat, setShowChat] = useState(true);
  const [sub, setSub] = useState(null);

  useEffect(() => {
    if (sub) {
      sub.unsubscribe();
      setSub(null);
      console.log("unsub");
    } else
      setSub(
        myState.toggleChat$.subscribe((v: boolean) => {
          console.log("ruynsub")
          if (!showChat) {
            setShowChat(true);
          } else {
            if (!content) {
              setShowChat(false);
            }
          }
        })
      );
  }, []);
  useEffect(() => {
    myState.chatMessages$.subscribe((msgs: any) => {
      setMessages(JSON.parse(JSON.stringify(msgs)));
    });
    if (inputRef && inputRef.current) {
      inputRef.current.focus();
    }
  }, []);
  return (
    <div>
      {showChat ? "a" : "b"}
      {showChat && (
        <div
          className="absolute w-[300px] h-[500px] bg-gray-800 bg-opacity-70 pl-5 py-3 rounded-md"
          style={{ top: "calc(100vh - 510px)", left: "calc(100vw - 310px)" }}
        >
          <div className="overflow-y-scroll w-full h-[430px]">
            {messages.map((item: any) => {
              return (
                <div key={item.id}>
                  <span style={{ color: "#9f9f9f" }}>{item.name}: </span>
                  <span className="text-white">{item.content}</span>
                </div>
              );
            })}
          </div>
          <div className="pr-5">
            <Form
              className="mt-3"
              onFinish={(val: any) => {
                form.resetFields();
                G.getCurrentRoom().send("message", val);
              }}
              form={form}
            >
              <Form.Item name="content">
                <Input
                  ref={inputRef}
                  className="hover:bg-gray-950 focus:bg-gray-950 bg-gray-950 bg-opacity-40 text-white"
                  placeholder="Enter message"
                  // onKeyDown={(val) => {
                  //   console.log(val)
                  // }}
                />
              </Form.Item>
              <input type="submit" className="absolute left-[-99999px]" />
            </Form>
          </div>
        </div>
      )}
    </div>
  );
}
