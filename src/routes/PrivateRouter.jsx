import { Navigate } from "react-router-dom";
import { authService } from "../services/authService";

const PrivateRoute = ({ children, role }) => {
  const token = authService.getToken();
  const user = authService.getUser();

  // Si no está logueado
  if (!token || !user) {
    return <Navigate to="/" replace />;
  }

  // Si hay un rol requerido
  if (role) {
    // Caso admin → permite admin y super
    if (role === "admin" && user.role !== "admin" && user.role !== "super") {
      return <Navigate to="/home" replace />;
    }

    // Caso super → solo super
    if (role === "super" && user.role !== "super") {
      return <Navigate to="/home" replace />;
    }

    // Caso user → solo user
    if (role === "user" && user.role !== "user") {
      return <Navigate to="/home" replace />;
    }
  }

  // Si pasa validaciones, renderiza hijos
  return children;
};

export default PrivateRoute;
