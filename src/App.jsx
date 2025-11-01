
import AppRouter from "./routes/AppRouter.jsx";
import ModalProvider from "./components/context/ModalProvider.jsx";

function App() {
  return (
    <ModalProvider>
      <AppRouter />
    </ModalProvider>
  );
}

export default App;
