import React, { useEffect, useState } from "react";
import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import { userService } from "../services/userService.js";
import { authService } from "../services/authService.js";
import { useNavigate } from "react-router-dom";
import "./dashboard.css";

const COLORS = ["#4f46e5", "#16a34a", "#dc2626", "#f59e0b", "#0ea5e9"];

const Dashboard = () => {
  const [users, setUsers] = useState([]);
  const [filterOrg, setFilterOrg] = useState("");
  const [filterRole, setFilterRole] = useState("");

  const navigate = useNavigate();
  const currentUser = authService.getUser();

  useEffect(() => {
    if (currentUser?.role !== "super") {
      navigate("/home"); // solo super puede entrar
    }
    userService.getUsers().then(setUsers);
  }, [currentUser, navigate]);

  // aplicar filtros dinámicos
  const filteredUsers = users.filter((u) => {
    const matchOrg = filterOrg ? u.organization === filterOrg : true;
    const matchRole = filterRole ? u.role === filterRole : true;
    return matchOrg && matchRole;
  });

  // por organización (dentro de usuarios filtrados)
  const orgCount = filteredUsers.reduce((acc, u) => {
    acc[u.organization] = (acc[u.organization] || 0) + 1;
    return acc;
  }, {});
  const orgData = Object.entries(orgCount).map(([name, value]) => ({ name, value }));

  // por rol (dentro de usuarios filtrados)
  const roleCount = filteredUsers.reduce((acc, u) => {
    acc[u.role] = (acc[u.role] || 0) + 1;
    return acc;
  }, {});
  const roleData = Object.entries(roleCount).map(([name, value]) => ({ name, value }));

  // valores únicos para dropdowns
  const organizations = [...new Set(users.map((u) => u.organization))];
  const roles = [...new Set(users.map((u) => u.role))];

  return (
    <div className="dashboard-container">
      <h1 className="dashboard-title">📊 Dashboard de Usuarios</h1>

      {/* Filtros */}
      <div className="filter-bar">
        <select value={filterOrg} onChange={(e) => setFilterOrg(e.target.value)}>
          <option value="">Todas las organizaciones</option>
          {organizations.map((org) => (
            <option key={org} value={org}>{org}</option>
          ))}
        </select>

        <select value={filterRole} onChange={(e) => setFilterRole(e.target.value)}>
          <option value="">Todos los roles</option>
          {roles.map((role) => (
            <option key={role} value={role}>{role}</option>
          ))}
        </select>
      </div>

      {/* Contador */}
      <div className="filter-result">
        <p>
          Resultados: <strong>{filteredUsers.length}</strong> usuario(s)
        </p>
      </div>

      {/* Gráficos */}
      <div className="charts-grid">
        <div className="chart-box">
          <h2>Usuarios por Organización</h2>
          <PieChart width={400} height={300}>
            <Pie
              data={orgData}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            >
              {orgData.map((_, index) => (
                <Cell key={index} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </div>

        <div className="chart-box">
          <h2>Usuarios por Rol</h2>
          <PieChart width={400} height={300}>
            <Pie
              data={roleData}
              cx="50%"
              cy="50%"
              outerRadius={100}
              fill="#82ca9d"
              dataKey="value"
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            >
              {roleData.map((_, index) => (
                <Cell key={index} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </div>
      </div>

      {/* Tabla con usuarios filtrados */}
      <div className="recent-users">
        <h2>Usuarios según filtro</h2>
        <table>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Email</th>
              <th>Rol</th>
              <th>Organización</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((u) => (
              <tr key={u.id}>
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td>{u.role}</td>
                <td>{u.organization}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Dashboard;
