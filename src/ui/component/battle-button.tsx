/** @format */

export default function BattleButton({ onClick }: { onClick: Function }) {
  return (
    <div
      className="relative"
      onClick={() => {
        onClick();
      }}
    >
      <div className="absolute top-0 left-0 w-full border-[#f17d00] border-4 h-full battle-button-border"></div>
      <div className="bg-[#f17d00] w-[350px] h-[150px] text-8xl text-center flex justify-center items-center">
        JOIN
      </div>
    </div>
  );
}
