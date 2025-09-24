import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { userService } from "../services/userService";
import { authService } from "../services/authService";
import "./admin.css";

const Admin = () => {
  const [users, setUsers] = useState([]);
  const [newUser, setNewUser] = useState({ name: "", email: "", role: "user" });
  const [editingUser, setEditingUser] = useState(null);

  const navigate = useNavigate();

  // cargar usuarios
  useEffect(() => {
    userService.getUsers().then(setUsers);
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newUser.name || !newUser.email) return;
    const created = await userService.createUser(newUser);
    setUsers([...users, created]);
    setNewUser({ name: "", email: "", role: "user" });
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

  return (
    <div className="admin-container">
      <h1 className="admin-title">Administración de Usuarios</h1>

      {/* Botón logout */}
      <div style={{ textAlign: "right", marginBottom: "1rem" }}>
        <button className="btn-small btn-delete" onClick={handleLogout}>
          Cerrar sesión
        </button>
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
        <select
          value={newUser.role}
          onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
        >
          <option value="user">Usuario</option>
          <option value="admin">Administrador</option>
        </select>
        <button className="btn-small btn-save" type="submit">
          Crear
        </button>
      </form>

      {/* Tabla de usuarios */}
      <table className="user-table">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Email</th>
            <th>Rol</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
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
                  <select
                    value={editingUser.role}
                    onChange={(e) =>
                      setEditingUser({ ...editingUser, role: e.target.value })
                    }
                  >
                    <option value="user">Usuario</option>
                    <option value="admin">Administrador</option>
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
