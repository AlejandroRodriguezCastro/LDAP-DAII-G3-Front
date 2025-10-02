import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { userServiceReal } from "../services/userService";
import { authService } from "../services/authService";
import { Link } from "react-router-dom";
import "./admin.css";

const Admin = () => {
  const [users, setUsers] = useState([]);
  const [newUser, setNewUser] = useState({ name: "", email: "", role: "user", organization: "" });
  const [editingUser, setEditingUser] = useState(null);
  const [filterOrg, setFilterOrg] = useState("");

  const navigate = useNavigate();
  // const currentUser = authService.getUser(); // 👈 leer usuario logueado
  const currentUser = {
    role : "super",
    organization : "Org Central"
  }
  console.log('Usuario actual:', currentUser);

  useEffect(() => {
    userServiceReal.getUsers().then(setUsers);
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    // validación: solo super admin requiere organización
    if (!newUser.name || !newUser.email) return;
    if (currentUser?.role === "super" && !newUser.organization) return;

    const created = await userServiceReal.createUser(newUser);
    setUsers([...users, created]);
    setNewUser({ name: "", email: "", role: "user", organization: "" });
  };

  const handleUpdate = async (id, updatedData) => {
    const updated = await userServiceReal.updateUser(id, updatedData);
    setUsers(users.map((u) => (u.mail === id ? updated : u)));
    setEditingUser(null);
  };

  const handleDelete = async (id) => {
    await userServiceReal.deleteUser(id);
    setUsers(users.filter((u) => u.mail !== id));
  };

  const handleLogout = () => {
    console.log('Cierre de sesión en proceso');
    authService.logout();
    navigate("/");
  };

  // Solo si es super mostramos filtro por organización
  const organizations = currentUser?.role === "super" 
    ? [...new Set(users.map((u) => u.organization))] 
    : [];

  const filteredUsers =
    currentUser?.role === "super" && filterOrg
      ? users.filter((u) => u.organization === filterOrg)
      : users;
  console.log('Usuarios filtrados:', filteredUsers);
  return (
    <div className="admin-container">
      <h1 className="admin-title">Administración de Usuarios</h1>

      <div style={{ textAlign: "right", marginBottom: "1rem" }}>
        <button className="btn-small btn-delete" onClick={handleLogout}>
          Cerrar sesión
        </button>
      </div>

      {/* Filtro solo visible para super */}
      {currentUser?.role === "super" && (
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
      )}

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

        {/* Campo organización visible solo para super */}
        {currentUser?.role === "super" && (
          <input
            type="text"
            placeholder="Organización"
            value={newUser.organization}
            onChange={(e) => setNewUser({ ...newUser, organization: e.target.value })}
          />
        )}

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

      {currentUser?.role === "super" && (
        <div style={{ marginBottom: "1rem" }}>
          <Link to="/dashboard">
            <button className="btn-small btn-edit">Ir al Dashboard</button>
          </Link>
        </div>
      )}

      {/* Tabla */}
      <table className="user-table">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Email</th>
            {currentUser?.role === "super" && <th>Organización</th>}
            <th>Rol</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {filteredUsers.map((u) => (
            <tr key={u.mail}>
              <td>
                {editingUser?.id === u.mail ? (
                  <input
                    type="text"
                    value={editingUser.first_name + " " + editingUser.last_name}
                    onChange={(e) =>
                      setEditingUser({ ...editingUser, first_name: e.target.value.split(" ")[0], last_name: e.target.value.split(" ")[1] })
                    }
                  />
                ) : (
                  u.first_name + " " + u.last_name
                )}
              </td>
              <td>
                {editingUser?.id === u.mail ? (
                  <input
                    type="email"
                    value={editingUser.mail}
                    onChange={(e) =>
                      setEditingUser({ ...editingUser, mail: e.target.value })
                    }
                  />
                ) : (
                  u.mail
                )}
              </td>

              {/* Columna org visible solo para super */}
              {currentUser?.role === "super" && (
                <td>
                  {editingUser?.id === u.mail ? (
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
              )}

              <td>
                {editingUser?.id === u.mail ? (
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
                {editingUser?.id === u.mail ? (
                  <button
                    className="btn-small btn-save"
                    onClick={() => handleUpdate(u.mail, editingUser)}
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
                  onClick={() => handleDelete(u.mail)}
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
