import { useState, useMemo, useEffect } from "react";

const UsersTable = ({
  users,
  handleEdit,
  handleDelete,
  roleOptions = [],
  organizationsOptions = [],
  isAdmin
}) => {
  const [searchText, setSearchText] = useState("");
  const [selectedOrganization, setSelectedOrganization] = useState("");
  const [selectedRole, setSelectedRole] = useState("");

  const [roles, setRoles] = useState([]);
  const [organizations, setOrganizations] = useState([]);

  useEffect(() => {
    if (roleOptions.length > 0) {
      setRoles(roleOptions.map(role => role.name));
    }
  }, [roleOptions]);

  useEffect(() => {
    if (organizationsOptions.length > 0) {
      setOrganizations(organizationsOptions.map(org => org.ou[0]));
    }
  }, [organizationsOptions]);


  console.log('roles', roles)
  console.log('organizations', organizations)

  const handleOrganizationChange = (org) => {
    setSelectedOrganization(org);
    setSelectedRole(""); 

    if (!org) {
      setRoles(roleOptions.map(role => role.name));
      return;
    }

    const filtered = roleOptions
      .filter(role => role.organization === org)
      .map(role => role.name);

    setRoles(filtered);
  };

  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesText =
        searchText === "" ||
        `${user.first_name} ${user.last_name}`.toLowerCase().includes(searchText.toLowerCase()) ||
        user.mail.toLowerCase().includes(searchText.toLowerCase());

      const matchesOrganization =
        selectedOrganization === "" || user.organization === selectedOrganization;

      const matchesRole =
        selectedRole === "" ||
        (user.roles ?? []).some(r => r.name === selectedRole);

      return matchesText && matchesOrganization && matchesRole;
    });
  }, [users, searchText, selectedOrganization, selectedRole]);

  const renderRoles = (roles) => {
    if (!roles || roles.length === 0) {
      return <span className="empty-roles">Sin roles</span>;
    }

    return (
      <div style={{ display: "flex", gap: "0.5rem" }}>
        {roles.map((role) => (
          <span key={role.name} className="role-item">
            {role.name}
          </span>
        ))}
      </div>
    );
  };

  return (
    <>
      <div className="filters" style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}>
        <input
          type="text"
          placeholder="Buscar usuario..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
        <select
          value={selectedOrganization}
          disabled={!isAdmin}
          onChange={(e) => handleOrganizationChange(e.target.value)}
        >
          {isAdmin ? (
            <>
              <option value="">Todas las organizaciones</option>
              {organizations.map((org, i) => (
                <option key={i} value={org}>
                  {org}
                </option>
              ))}
            </>
          ) : (
            <option value={roleOptions?.[0]?.organization}>
              {roleOptions?.[0]?.organization}
            </option>
          )}
        </select>

        {/* Roles */}
        <select
          value={selectedRole}
          onChange={(e) => setSelectedRole(e.target.value)}
        >
          <option value="">Todos los roles</option>
          {roles.map((role, i) => (
            <option key={i} value={role}>
              {role}
            </option>
          ))}
        </select>
      </div>

      {/* 🔹 TABLA */}
      {filteredUsers.length === 0 ? (
        <p>No se encontraron usuarios con los filtros aplicados.</p>
      ) : (
        <table className="users-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Email</th>
              <th>Organización</th>
              <th>Roles</th>
              <th aria-label="Editar"></th>
              <th aria-label="Eliminar"></th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr key={`user-${user.id || user.mail}`}>
                <td>{user.first_name} {user.last_name}</td>
                <td>{user.mail}</td>
                <td>{user.organization}</td>
                <td>{renderRoles(user.roles)}</td>
                <td className="action-cell">
                  <span
                    onClick={() => handleEdit(user)}
                    className="action-icon material-symbols-outlined"
                  >
                    edit
                  </span>
                </td>
                <td className="action-cell">
                  <span
                    onClick={() => handleDelete(user)}
                    className="action-icon material-symbols-outlined"
                  >
                    delete
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
};

export default UsersTable;
