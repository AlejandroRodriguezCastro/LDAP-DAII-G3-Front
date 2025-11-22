
import AppRouter from "./routes/AppRouter.jsx";
import ModalProvider from "./components/context/ModalProvider.jsx";
import { SnackbarProvider } from "./components/Snackbar/SnackbarContext.jsx";
import { ToastContainer } from "react-toastify";

function App() {
  return (
    <SnackbarProvider>
      <ModalProvider>
        <AppRouter />
        <ToastContainer />
      </ModalProvider>
    </SnackbarProvider>
  );
}

export default App;
