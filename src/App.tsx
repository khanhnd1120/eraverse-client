import Layout from "screens/layout/layout";
import Dialog from "ui/dialog/dialog";

function App() {
  return (
    <div className="absolute top-0 left-0 z-10 w-full h-full overflow-hidden">
      <Layout />
      <Dialog />
    </div>
  );
}

export default App;
