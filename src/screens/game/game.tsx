import Chat from "./chat";
import Playing from "./playing";

export default function Game() {
  return (
    <div className="text-white w-screen h-screen flex justify-center items-center">
      <Playing />
      <Chat />
    </div>
  );
}
