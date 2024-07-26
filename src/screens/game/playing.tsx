export default function Playing() {
  return (
    <div
      onClick={() => {
        document.body.requestPointerLock();
      }}
    >
      <div className="absolute w-screen h-screen top-0 left-0 opacity-0"></div>
    </div>
  );
}
