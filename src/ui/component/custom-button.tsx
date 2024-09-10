/** @format */

export default function CustomButton({
  onClick,
  children,
  className,
}: {
  onClick: Function;
  children: any;
  className?: string;
}) {
  return (
    <div
      className={`${className} relative`}
      onClick={() => {
        onClick();
      }}
    >
      <div className="absolute top-0 left-0 w-full border-[#f17d00] border-4 h-full battle-button-border"></div>
      {children}
    </div>
  );
}
