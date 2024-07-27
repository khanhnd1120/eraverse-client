import { Form, Input } from "antd";

export default function Chat() {
  return (
    <div
      className="absolute w-[300px] h-[500px] bg-gray-800 bg-opacity-70 pl-5 py-3 rounded-md"
      style={{ top: "calc(100vh - 510px)", left: "calc(100vw - 310px)" }}
    >
      <div className="overflow-y-scroll w-full h-[430px]">
        {Array.from(Array(100).keys()).map((item: number) => {
          return (
            <div>
              <span style={{ color: "#9f9f9f" }}>Nham Do: </span>
              <span className="text-white">đi xe bus cày eragon.</span>
            </div>
          );
        })}
      </div>
      <div className="pr-5">
        <Form className="mt-3">
          <Form.Item name="username">
            <Input className="hover:bg-gray-950 focus:bg-gray-950 bg-gray-950 bg-opacity-40 text-white" />
          </Form.Item>
        </Form>
      </div>
    </div>
  );
}
