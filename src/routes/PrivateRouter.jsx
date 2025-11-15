import { Navigate } from "react-router-dom";
import { authService } from "../services/authService";

const PrivateRoute = ({ children }) => {
  const token = authService.getToken();
  const user = authService.getUser();

  console.log({user})
  // Si no está logueado
  if (!token || !user) {
    return <Navigate to="/" replace />;
  }

  // Si pasa validaciones, renderiza hijos
  return children;
};

export default PrivateRoute;
