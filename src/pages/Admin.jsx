import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { userService } from "../services/userService";
import { authService } from "../services/authService";
import "./admin.css";

const Admin = () => {
  const [users, setUsers] = useState([]);
  const [newUser, setNewUser] = useState({ name: "", email: "", role: "user", organization: "" });
  const [editingUser, setEditingUser] = useState(null);
  const [filterOrg, setFilterOrg] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    userService.getUsers().then(setUsers);
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newUser.name || !newUser.email || !newUser.organization) return;
    const created = await userService.createUser(newUser);
    setUsers([...users, created]);
    setNewUser({ name: "", email: "", role: "user", organization: "" });
  };

  const handleUpdate = async (id, updatedData) => {
    const updated = await userService.updateUser(id, updatedData);
    setUsers(users.map((u) => (u.id === id ? updated : u)));
    setEditingUser(null);
  };

  const handleDelete = async (id) => {
    await userService.deleteUser(id);
    setUsers(users.filter((u) => u.id !== id));
  };

  const handleLogout = () => {
    authService.logout();
    navigate("/");
  };

  // Organizaciones únicas para el filtro
  const organizations = [...new Set(users.map((u) => u.organization))];

  const filteredUsers = filterOrg
    ? users.filter((u) => u.organization === filterOrg)
    : users;

  return (
    <div className="admin-container">
      <h1 className="admin-title">Administración de Usuarios</h1>

      <div style={{ textAlign: "right", marginBottom: "1rem" }}>
        <button className="btn-small btn-delete" onClick={handleLogout}>
          Cerrar sesión
        </button>
      </div>

      {/* Filtro por organización */}
      <div className="filter-bar">
        <select value={filterOrg} onChange={(e) => setFilterOrg(e.target.value)}>
          <option value="">Todas las organizaciones</option>
          {organizations.map((org) => (
            <option key={org} value={org}>
              {org}
            </option>
          ))}
        </select>
      </div>

      {/* Alta usuario */}
      <form className="form-inline" onSubmit={handleCreate}>
        <input
          type="text"
          placeholder="Nombre"
          value={newUser.name}
          onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
        />
        <input
          type="email"
          placeholder="Email"
          value={newUser.email}
          onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
        />
        <input
          type="text"
          placeholder="Organización"
          value={newUser.organization}
          onChange={(e) => setNewUser({ ...newUser, organization: e.target.value })}
        />
        <select
          value={newUser.role}
          onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
        >
          <option value="user">Usuario</option>
          <option value="admin">Administrador</option>
          <option value="super">Super Usuario</option>
        </select>
        <button className="btn-small btn-save" type="submit">
          Crear
        </button>
      </form>

      {/* Tabla */}
      <table className="user-table">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Email</th>
            <th>Organización</th>
            <th>Rol</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {filteredUsers.map((u) => (
            <tr key={u.id}>
              <td>
                {editingUser?.id === u.id ? (
                  <input
                    type="text"
                    value={editingUser.name}
                    onChange={(e) =>
                      setEditingUser({ ...editingUser, name: e.target.value })
                    }
                  />
                ) : (
                  u.name
                )}
              </td>
              <td>
                {editingUser?.id === u.id ? (
                  <input
                    type="email"
                    value={editingUser.email}
                    onChange={(e) =>
                      setEditingUser({ ...editingUser, email: e.target.value })
                    }
                  />
                ) : (
                  u.email
                )}
              </td>
              <td>
                {editingUser?.id === u.id ? (
                  <input
                    type="text"
                    value={editingUser.organization}
                    onChange={(e) =>
                      setEditingUser({ ...editingUser, organization: e.target.value })
                    }
                  />
                ) : (
                  u.organization
                )}
              </td>
              <td>
                {editingUser?.id === u.id ? (
                  <select
                    value={editingUser.role}
                    onChange={(e) =>
                      setEditingUser({ ...editingUser, role: e.target.value })
                    }
                  >
                    <option value="user">Usuario</option>
                    <option value="admin">Administrador</option>
                    <option value="super">Super Usuario</option>
                  </select>
                ) : (
                  u.role
                )}
              </td>
              <td className="user-actions">
                {editingUser?.id === u.id ? (
                  <button
                    className="btn-small btn-save"
                    onClick={() => handleUpdate(u.id, editingUser)}
                  >
                    Guardar
                  </button>
                ) : (
                  <button
                    className="btn-small btn-edit"
                    onClick={() => setEditingUser(u)}
                  >
                    Editar
                  </button>
                )}
                <button
                  className="btn-small btn-delete"
                  onClick={() => handleDelete(u.id)}
                >
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Admin;
