import React from "react";

const RolesTable = ({ roles, handleDelete }) => {
  if (!roles || roles.length === 0) {
    return <p>No se encontraron roles.</p>;
  }

  const formatDate = (d) => {
    try {
      return new Date(d).toLocaleString();
    } catch (e) {
      return d;
    }
  };

  return (
    <table className="users-table roles-table">
      <thead>
        <tr>
          <th>Nombre</th>
          <th>Descripción</th>
          <th>Organización</th>
          <th>Creado</th>
          <th>Actualizado</th>
          <th aria-label="Acciones"></th>
        </tr>
      </thead>
      <tbody>
        {roles.map((role) => (
          <tr key={`role-${role.id || role.name}`}>
            <td>{role.name}</td>
            <td>{role.description}</td>
            <td>{role.organization}</td>
            <td>{formatDate(role.created_at)}</td>
            <td>{formatDate(role.updated_at)}</td>
            <td className="action-cell">
              <span onClick={() => handleDelete(role)} className="action-icon material-symbols-outlined">delete</span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default RolesTable;
