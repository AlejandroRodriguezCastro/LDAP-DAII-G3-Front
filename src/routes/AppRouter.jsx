import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "../pages/Login";
import CallbackLogin from "../pages/CallbackLogin";
import Register from "../pages/Register";
import ForgotPassword from "../pages/ForgotPassword";
import Admin from "../pages/Admin";
import Dashboard from "../pages/Dashboard";
import PrivateRoute from "./PrivateRouter";

const AppRouter = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/auth" element={<CallbackLogin />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      {/* Admin y Super entran */}
      {/* <Route
        path="/admin"
        element={
          <PrivateRoute role="admin">
            <Admin />
          </PrivateRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <PrivateRoute role="super">
            <Dashboard />
          </PrivateRoute>
        }
      /> */}
      <Route
        path="/admin"      
        element={<Admin />}
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
