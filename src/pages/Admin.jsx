import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../services/authService.js";
import UsuariosTab from "../components/admin/UsuariosTab";
import RolesTab from "../components/admin/RolesTab";
import "./admin.css";
import ModalContext from "../components/context/ModalContext.jsx";
import UserFormModalContent from "../components/UserFormModalContent.jsx";

const Admin = () => {
  const [activeTab, setActiveTab] = useState("usuarios");
  const navigate = useNavigate();
  const currentUser = authService.getUser();

  const handleLogout = () => {
    authService.logout();
    navigate("/");
  };

  return (
    <div className="admin-container">
      <h1 className="admin-title">Administración de usuarios</h1>
      
      <div style={{ textAlign: "right", marginBottom: "1rem" }}>
        <button className="btn-small btn-delete" onClick={handleLogout}>
          Cerrar sesión
        </button>
      </div>

      {/* Tabs Navigation */}
      <div className="tabs-navigation">
        <button
          className={`tab-button ${activeTab === "usuarios" ? "active" : ""}`}
          onClick={() => setActiveTab("usuarios")}
        >
          Usuarios
        </button>
        <button
          className={`tab-button ${activeTab === "roles" ? "active" : ""}`}
          onClick={() => setActiveTab("roles")}
        >
          Roles
        </button>
      </div>

      {/* Tabs Content */}
      <div className="tabs-content">
        {activeTab === "usuarios" && <UsuariosTab currentUser={currentUser} />}
        {activeTab === "roles" && <RolesTab currentUser={currentUser} />}
      </div>
    </div>
  );
};

export default Admin;
