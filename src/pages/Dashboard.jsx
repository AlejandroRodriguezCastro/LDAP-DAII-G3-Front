import React, { useEffect, useState } from "react";
import { PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";
import { userService } from "../services/userService.js";
import { authService } from "../services/authService.js";
import { useNavigate } from "react-router-dom";
import "./dashboard.css";

const COLORS = [  "#4f46e5", "#16a34a", "#dc2626", "#f59e0b", "#0ea5e9",
  "#8b5cf6", "#ec4899", "#10b981", "#f97316", "#06b6d4",
  "#84cc16", "#ef4444", "#a855f7", "#3b82f6", "#64748b",
  "#14b8a6", "#f43f5e", "#84cc16", "#d946ef", "#0d9488",
  "#eab308", "#22c55e", "#ea580c", "#db2777", "#4f46e5"];

const Dashboard = () => {
  const [users, setUsers] = useState([]);
  const [filterOrg, setFilterOrg] = useState("");
  const [filterRole, setFilterRole] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const user = authService.getUser();
    const hasSuperAccess = user?.roles?.some(role => 
      role.includes("super_admin")
    );
    
    if (!hasSuperAccess) {
      navigate("/home");
      return;
    }

    userService.getUsers().then(users => {
      console.log("🔍 ESTRUCTURA DE USUARIOS:", users);
      if (users.length > 0) {
        console.log("📋 Primer usuario:", users[0]);
        console.log("🎯 Campos:", Object.keys(users[0]));
      }
      setUsers(users);
    });
  }, []);

  // ==================== KPIs ====================
  
  // 1. Total de usuarios
  const totalUsers = users.length;

  // 2. Total de organizaciones distintas
  const uniqueOrganizations = [...new Set(users.map(u => u.organization).filter(Boolean))];
  const totalOrganizations = uniqueOrganizations.length;

  // 3. Total de roles distintos
  const allRoles = users.map(u => u.roles?.[0]?.name || 'Sin rol');
  const uniqueRoles = [...new Set(allRoles)];
  const totalRoles = uniqueRoles.length;

  // 4. Distribución admins / no admins
  const adminUsers = users.filter(u => {
    const userRole = u.roles?.[0]?.name || '';
    return userRole.toLowerCase().includes('admin');
  }).length;
  
  const nonAdminUsers = totalUsers - adminUsers;
  
  const adminDistributionData = [
    { name: 'Admin', value: adminUsers },
    { name: 'No Admin', value: nonAdminUsers }
  ];

  // ==================== TOP 5 ROLES MÁS USADOS ====================
  
  // Calcular frecuencia de roles
  const roleFrequency = users.reduce((acc, u) => {
    const roleName = u.roles?.[0]?.name || 'Sin rol';
    acc[roleName] = (acc[roleName] || 0) + 1;
    return acc;
  }, {});

  // Convertir a array y ordenar por frecuencia (mayor a menor)
  const topRolesData = Object.entries(roleFrequency)
    .map(([name, count]) => ({ 
      name, 
      count,
      percentage: totalUsers > 0 ? ((count / totalUsers) * 100).toFixed(1) : 0 
    }))
    .sort((a, b) => b.count - a.count) // Ordenar de mayor a menor
    .slice(0, 5); // Tomar solo los top 5

  // ==================== FILTROS EXISTENTES ====================

  // aplicar filtros dinámicos
  const filteredUsers = users.filter((u) => {
    const matchOrg = filterOrg ? u.organization === filterOrg : true;
    const userRole = u.roles?.[0]?.name || 'Sin rol';
    const matchRole = filterRole ? userRole === filterRole : true;
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
    const roleName = u.roles?.[0]?.name || 'Sin rol';
    acc[roleName] = (acc[roleName] || 0) + 1;
    return acc;
  }, {});
  const roleData = Object.entries(roleCount).map(([name, value]) => ({ name, value }));

  // valores únicos para dropdowns
  const organizations = [...new Set(users.map((u) => u.organization))];

  // Calcular roles igual que el gráfico pero para TODOS los usuarios
  const allRoleCount = users.reduce((acc, u) => {
    const roleName = u.roles?.[0]?.name || 'Sin rol';
    acc[roleName] = (acc[roleName] || 0) + 1;
    return acc;
  }, {});
  const roles = Object.keys(allRoleCount);

  // ✅ COMPONENTE LEGEND COMPLETAMENTE SEPARADO
  const CustomLegend = ({ data, colors, total }) => (
    <div className="custom-legend">
      {data.map((entry, index) => (
        <div key={entry.name} className="legend-item">
          <div 
            className="legend-color" 
            style={{ backgroundColor: colors[index % colors.length] }}
          ></div>
          <span className="legend-text">
            {entry.name} 
          </span>
          <span className="legend-percentage">
            {((entry.value / total) * 100).toFixed(0)}%
          </span>
        </div>
      ))}
    </div>
  );

  // ✅ COMPONENTE PARA BARRA VERTICAL PERSONALIZADA
  const CustomBarLabel = ({ x, y, width, height, value }) => {
    return (
      <g>
        <text 
          x={x + width / 2} 
          y={y + height / 2} 
          fill="white" 
          fontSize={12} 
          fontWeight={600}
          textAnchor="middle"
          dominantBaseline="middle"
        >
          {value}
        </text>
      </g>
    );
  };

  return (
    <div className="dashboard-container">
      <h1 className="dashboard-title">📊 Dashboard de Usuarios</h1>

      {/* KPIs */}
      <div className="kpis-grid">
        <div className="kpi-card">
          <div className="kpi-icon">👥</div>
          <div className="kpi-content">
            <h3>Total Usuarios</h3>
            <p className="kpi-value">{totalUsers}</p>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon">🏢</div>
          <div className="kpi-content">
            <h3>Organizaciones</h3>
            <p className="kpi-value">{totalOrganizations}</p>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon">🎭</div>
          <div className="kpi-content">
            <h3>Roles Distintos</h3>
            <p className="kpi-value">{totalRoles}</p>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon">⚡</div>
          <div className="kpi-content">
            <h3>Usuarios Admin</h3>
            <p className="kpi-value">{adminUsers} <span className="kpi-percentage">({totalUsers > 0 ? ((adminUsers/totalUsers)*100).toFixed(0) : 0}%)</span></p>
          </div>
        </div>
      </div>

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

      {/* Gráficos - NUEVO LAYOUT */}
      <div className="charts-grid">
        {/* Columna 1: Gráficos circulares */}
        <div className="chart-column">
          <div className="chart-box">
            <h2>Usuarios por Organización</h2>
            <div className="chart-container">
              <div className="chart-wrapper">
                <PieChart width={250} height={250}>
                  <Pie
                    data={orgData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={false}
                  >
                    {orgData.map((entry, index) => (
                      <Cell key={`org-cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </div>
              <CustomLegend data={orgData} colors={COLORS} total={filteredUsers.length} />
            </div>
          </div>

          <div className="chart-box">
            <h2>Usuarios por Rol</h2>
            <div className="chart-container">
              <div className="chart-wrapper">
                <PieChart width={250} height={250}>
                  <Pie
                    data={roleData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#82ca9d"
                    dataKey="value"
                    label={false}
                  >
                    {roleData.map((entry, index) => (
                      <Cell key={`role-cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </div>
              <CustomLegend data={roleData} colors={COLORS} total={filteredUsers.length} />
            </div>
          </div>
        </div>

        {/* Columna 2: Admin/No Admin + Top 5 Roles */}
        <div className="chart-column">
          <div className="chart-box">
            <h2>Distribución Admin / No Admin</h2>
            <div className="chart-container">
              <div className="chart-wrapper">
                <PieChart width={250} height={250}>
                  <Pie
                    data={adminDistributionData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#ff8042"
                    dataKey="value"
                    label={false}
                  >
                    {adminDistributionData.map((entry, index) => (
                      <Cell key={`admin-cell-${index}`} fill={index === 0 ? "#4f46e5" : "#16a34a"} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </div>
              <CustomLegend 
                data={adminDistributionData} 
                colors={["#4f46e5", "#16a34a"]} 
                total={totalUsers} 
              />
            </div>
          </div>

          {/* ==================== NUEVO GRÁFICO: TOP 5 ROLES MÁS USADOS (HORIZONTAL) ==================== */}
          <div className="chart-box">
            <h2>Top 5 Roles Más Usados</h2>
            <div className="horizontal-bar-chart-wrapper">
              <ResponsiveContainer width="100%" height={220}>
                <BarChart
                  data={topRolesData}
                  layout="horizontal"
                  margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis 
                    type="category" 
                    dataKey="name"
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis 
                    type="number"
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip 
                    formatter={(value, name) => [`${value} usuarios`, 'Cantidad']}
                    labelFormatter={(label) => `Rol: ${label}`}
                  />
                  <Bar 
                    dataKey="count" 
                    fill="#4f46e5" 
                    radius={[4, 4, 0, 0]}
                    label={<CustomBarLabel />}
                  >
                    {topRolesData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="chart-note">
              <p>📊 Mostrando los 5 roles con más usuarios asignados</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabla con usuarios filtrados */}
      <div className="recent-users">
        <h2>Usuarios</h2>
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
              <tr key={u.mail}>
                <td>{u.first_name} {u.last_name}</td>
                <td>{u.mail}</td>
                <td>{u.roles?.[0]?.name || u.role}</td>
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