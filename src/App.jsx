
import AppRouter from "./routes/AppRouter.jsx";
import ModalProvider from "./components/context/ModalProvider.jsx";
import { ToastContainer } from "react-toastify";

function App() {
  return (
    <ModalProvider>
      <AppRouter />
      <ToastContainer />
    </ModalProvider>
  );
}

export default App;
