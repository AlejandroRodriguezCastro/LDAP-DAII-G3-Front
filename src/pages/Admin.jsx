import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { userService } from "../services/userService";
import { roleService } from "../services/roleService";
import { authService } from "../services/authService";
import { Link } from "react-router-dom";
import "./admin.css";

const Admin = () => {
  const [users, setUsers] = useState([]);
  const [roleOptions, setRoleOptions] = useState([]);
  const [newUser, setNewUser] = useState({ 
    first_name: "", 
    last_name: "", 
    mail: "", 
    roles: [{ name: "user" }],
    organization: "",
    is_active: true 
  });
  const [editingUser, setEditingUser] = useState(null);
  const [filterOrg, setFilterOrg] = useState("");
  let token = localStorage.getItem("authToken");
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const currentUser = authService.getUser(); // 👈 leer usuario logueado

  useEffect(() => {
    // Se hace fetch de data en una transacción
    const loadData = async () => {
      try {
        const [usersData, rolesData] = await Promise.all([
          userService.getUsers(),
          roleService.getRoles()
        ]);
        setUsers(usersData);
        setRoleOptions(rolesData.roles);
        setLoading(false);
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };
    loadData();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    // validación: solo super admin requiere organización
    if (!newUser.first_name || !newUser.mail) return;
    if (currentUser?.roles?.[0]?.name === "super" && !newUser.organization) return;

    console.log(newUser)
    const created = await userService.createUser(newUser);
    setUsers([...users, created]);
    setNewUser({ 
      first_name: "", 
      last_name: "", 
      mail: "", 
      roles: [{ name: "user" }],
      organization: "",
      is_active: true 
    });
  };

  const handleUpdate = async (mail, updatedData) => {
    const updated = await userService.updateUser(mail, updatedData);
    setUsers(users.map((u) => (u.mail === mail ? updated : u)));
    setEditingUser(null);
  };

  const handleDelete = async (mail) => {
    await userService.deleteUser(mail);
    setUsers(users.filter((u) => u.mail !== mail));
  };

  const handleLogout = () => {
    authService.logout();
    navigate("/");
  };

  // Solo si es super mostramos filtro por organización
  const organizations = currentUser?.roles?.[0]?.name === "super" 
    ? [...new Set(users.map((u) => u.organization))] 
    : [];

  const filteredUsers =
    currentUser?.role === "super" && filterOrg
      ? users.filter((u) => u.organization === filterOrg)
      : users;


  return (
    <div className="admin-container">
      <h1 className="admin-title">Administración de Usuarios</h1>
      <button onClick={() => {
        const response = authService.validateToken(token)
        console.log('Respuesta validacion', response)
      }}>TEST</button>
      <div style={{ textAlign: "right", marginBottom: "1rem" }}>
        <button className="btn-small btn-delete" onClick={handleLogout}>
          Cerrar sesión
        </button>
      </div>

      {/* Filtro solo visible para super */}
      {currentUser?.roles?.[0]?.name === "super" && (
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
          value={newUser.first_name}
          onChange={(e) => setNewUser({ ...newUser, first_name: e.target.value })}
        />
        <input
          type="text"
          placeholder="Apellido"
          value={newUser.last_name}
          onChange={(e) => setNewUser({ ...newUser, last_name: e.target.value })}
        />
        <input
          type="email"
          placeholder="Email"
          value={newUser.mail}
          onChange={(e) => setNewUser({ ...newUser, mail: e.target.value })}
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
          value={newUser.roles[0].name}
          onChange={(e) => {setNewUser({ ...newUser, roles: [{ ...newUser.roles[0], name: e.target.value }] })}}
        >
          {!loading 
            ? roleOptions.map(rol => (
                <option key={rol.name} value={rol.name}>
                  {rol.name}
                </option>
              ))
            : <option value="loading">Cargando roles...</option>}
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
          {filteredUsers.map((user) => (
            <tr key={`${user.mail}_${user.first_name}_${user.organization || ''}`}>
              <td>
                {editingUser?.id === user.id ? (
                  <>
                    <input
                      type="text"
                      value={editingUser.first_name}
                      onChange={(e) =>
                        setEditingUser({ ...editingUser, first_name: e.target.value })
                      }
                    />
                    <input
                      type="text"
                      value={editingUser.last_name}
                      onChange={(e) =>
                        setEditingUser({ ...editingUser, last_name: e.target.value })
                      }
                    />
                  </>
                ) : (
                  `${user.first_name} ${user.last_name}`
                )}
              </td>
              <td>
                {editingUser?.id === user.id ? (
                  <input
                    type="email"
                    value={editingUser.mail}
                    onChange={(e) =>
                      setEditingUser({ ...editingUser, mail: e.target.value })
                    }
                  />
                ) : (
                  user.mail
                )}
              </td>

              {/* Columna org visible solo para super */}
              {currentUser?.role === "super" && (
                <td>
                  {editingUser?.id === user.id ? (
                    <input
                      type="text"
                      value={editingUser.organization}
                      onChange={(e) =>
                        setEditingUser({ ...editingUser, organization: e.target.value })
                      }
                    />
                  ) : (
                    user.organization
                  )}
                </td>
              )}

              <td>
                {editingUser?.id === user.id ? (
                  <select
                    value={editingUser.roles[0].name}
                    onChange={(e) =>
                      setEditingUser({ 
                        ...editingUser, 
                        roles: [{ ...editingUser.roles[0], name: e.target.value }]
                      })
                    }
                  >
                    {roleOptions.length > 0
                      ? roleOptions.map(rol => (
                          <option key={rol.name} value={rol.name}>
                            {rol.name}
                          </option>
                        ))
                      : <option value="user">Usuario</option>}
                  </select>
                ) : (
                  user.roles.length > 0 ? (
                    user.roles[0].name
                  ) : 'No role'
                )}
              </td>
              <td className="user-actions">
                {editingUser?.id === user.id ? (
                  <button
                    className="btn-small btn-save"
                    onClick={() => handleUpdate(user.id, editingUser)}
                  >
                    Guardar
                  </button>
                ) : (
                  <button
                    className="btn-small btn-edit"
                    onClick={() => setEditingUser(user)}
                  >
                    Editar
                  </button>
                )}
                <button
                  className="btn-small btn-delete"
                  onClick={() => handleDelete(user.email)}
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
