/** @format */

export default function TextButton({
  text,
  onClick,
}: {
  text: string;
  onClick: Function;
}) {
  return (
    <div
      className="bg-[#050505] hover:bg-[#242424] cursor-pointer px-8 py-2 text-white inline-block"
      onClick={() => {
        onClick();
      }}
    >
      <span className="text-xl">{text}</span>
    </div>
  );
}
