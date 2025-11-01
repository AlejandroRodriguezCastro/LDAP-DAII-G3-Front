import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { userService } from "../services/userService";
import { authService } from "../services/authService";
import { Link } from "react-router-dom";
import "./admin.css";
import ModalContext from "../components/context/ModalContext.jsx";
import UserFormModalContent from "../components/UserFormModalContent.jsx";

const Admin = () => {
  const [users, setUsers] = useState([]);
  const [editingUser, setEditingUser] = useState(null);
  const [filterOrg, setFilterOrg] = useState("");

  const navigate = useNavigate();
  const currentUser = authService.getUser(); // 👈 leer usuario logueado

  useEffect(() => {
    userService.getUsers().then(setUsers);
  }, []);


  const handleCreate = () => {
    let tempUser = { name: "", email: "", role: "user", organization: "" };
    showModal(
      () => (
        <UserFormModalContent
          user={tempUser}
          onChange={(u) => { tempUser = u; }}
          organizations={organizations}
        />
      ),
      async () => {
        // validación: solo super admin requiere organización
        if (!tempUser.name || !tempUser.email) return;
        if (currentUser?.role === "super" && !tempUser.organization) return;
        const created = await userService.createUser(tempUser);
        setUsers([...users, created]);
      },
      { acceptText: "Crear", cancelText: "Cancelar" }
    );
  };


  const handleEdit = (user) => {
    let tempUser = { ...user };
    showModal(
      () => (
        <UserFormModalContent
          user={tempUser}
          onChange={(u) => { tempUser = u; }}
          organizations={organizations}
        />
      ),
      async () => {
        const updated = await userService.updateUser(user.id, tempUser);
        setUsers(users.map((u) => (u.id === user.id ? updated : u)));
      },
      { acceptText: "Guardar", cancelText: "Cancelar" }
    );
  };


  const { showModal } = useContext(ModalContext);

  const confirmDelete = (id) => {
    showModal(
      <div>
        <h3>¿Seguro que deseas eliminar este usuario?</h3>
      </div>,
      async () => {
        await userService.deleteUser(id);
        setUsers(users.filter((u) => u.id !== id));
      },
      { acceptText: "Eliminar", cancelText: "Cancelar" }
    );
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
      <button className="btn-small btn-save" style={{ marginBottom: "1rem" }} onClick={handleCreate}>
        Crear usuario
      </button>

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

              {/* Columna org visible solo para super */}
              {currentUser?.role === "super" && (
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
              )}

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
                <button
                  className="btn-small btn-edit"
                  onClick={() => handleEdit(u)}
                >
                  Editar
                </button>
                <button
                  className="btn-small btn-delete"
                  onClick={() => confirmDelete(u.id)}
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
