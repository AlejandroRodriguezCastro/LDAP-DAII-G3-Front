// routes/PrivateRoute.jsx
import { Navigate } from "react-router-dom";
import { authService } from "../services/authService";

const PrivateRoute = ({ children, role }) => {
  const token = authService.getToken();
  const user = authService.getUser();

  if (!token || !user) {
    return <Navigate to="/" replace />;
  }

  if (role && user.role !== role) {
    return <Navigate to="/home" replace />;
  }

  return children;
};

export default PrivateRoute;
