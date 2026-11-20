import { RouterProvider } from "react-router-dom";
import { Toaster } from "sonner";
import { routes } from "./routes";

import "@/styles/index.css";

function App() {
  return (
    <>
      <RouterProvider router={routes} />
      <Toaster />
    </>
  );
}

export default App;
