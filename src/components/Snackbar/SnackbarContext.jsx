import { createContext, useContext, useState, useCallback } from "react";
import GlobalSnackbar from "./GlobalSnackbar";

const SnackbarContext = createContext();

export const SnackbarProvider = ({ children }) => {
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    type: "info",
  });

  const showSnackbar = useCallback((message, type = "info") => {
    setSnackbar({ open: true, message, type });

    // Auto cerrar a los 3s
    setTimeout(() => {
      setSnackbar(prev => ({ ...prev, open: false }));
    }, 3000);
  }, []);

  const showError = message => showSnackbar(message, "error");
  const showWarning = message => showSnackbar(message, "warning");
  const showInfo = message => showSnackbar(message, "info");

  return (
    <SnackbarContext.Provider value={{ showError, showWarning, showInfo }}>
      {children}

      <GlobalSnackbar
        open={snackbar.open}
        type={snackbar.type}
        message={snackbar.message}
      />
    </SnackbarContext.Provider>
  );
};

export const useSnackbar = () => useContext(SnackbarContext);
