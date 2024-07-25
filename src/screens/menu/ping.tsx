/** @format */

export default function Ping({ value }: { value: number }) {
  return (
    <div className="flex gap-2 items-start">
      <img src="ui/icon/Ping icon.png" style={{ height: 30 }} />
      <p
        className="text-2xl font-bold"
        style={{ color: value > 100 ? "#ff0000" : "lime" }}
      >
        {value}ms
      </p>
    </div>
  );
}
