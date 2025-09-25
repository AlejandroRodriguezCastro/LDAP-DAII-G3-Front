import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "../pages/Login";
import Register from "../pages/Register";
import ForgotPassword from "../pages/ForgotPassword";
import Admin from "../pages/Admin";
import PrivateRoute from "./PrivateRouter";

const AppRouter = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      {/* Admin y Super entran */}
      <Route
        path="/admin"
        element={
          <PrivateRoute role="admin">
            <Admin />
          </PrivateRoute>
        }
      />

      {/* Pantalla normal */}
      <Route
        path="/home"
        element={<div className="p-8">🏙 Bienvenido a CityPass!</div>}
      />
    </Routes>
  </BrowserRouter>
);

export default AppRouter;
