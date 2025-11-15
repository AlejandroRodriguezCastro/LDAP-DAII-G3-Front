import { useState } from "react";
import "react-toastify/dist/ReactToastify.css";
import RolesTab from "../components/admin/RolesTab";
import UsersTab from "../components/admin/UsersTab.jsx";
import AdminHeader from "../components/AdminHeader.jsx";
import "./admin.css";
import Dashboard from "./Dashboard";

const Admin = () => {
  const [activeTab, setActiveTab] = useState("usuarios");
  const currentUser = JSON.parse(localStorage.getItem("userData"));

  // ✅ CONDICIÓN: Solo mostrar Dashboard para admin@citypass.com
  const showDashboard = currentUser?.mail === "admin@citypass.com";
  return (
    <div className="admin-container">
      <div style={{ textAlign: "right", marginBottom: "1rem" }}>
        <AdminHeader currentUser={currentUser} />
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
        
        {/* ✅ SOLO MOSTRAR DASHBOARD SI showDashboard es true */}
        {showDashboard && (
          <button
            className={`tab-button ${activeTab === "dashboard" ? "active" : ""}`}
            onClick={() => setActiveTab("dashboard")}
          >
            Dashboard
          </button>
        )}
      </div>

      {/* Tabs Content */}
      <div className="tabs-content">
        {activeTab === "usuarios" && <UsersTab />}
        {activeTab === "roles" && <RolesTab currentUser={currentUser} />}
        {activeTab === "dashboard" && showDashboard && <Dashboard />}
      </div>
    </div>
  );
};

export default Admin;