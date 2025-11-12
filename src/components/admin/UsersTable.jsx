const UsersTable = ({ users, handleEdit, handleDelete }) => {
  
  // Opcional: Mostrar un mensaje si no hay usuarios
  if (!users || users.length === 0) {
    return <p>No se encontraron usuarios.</p>;
  }

  const renderRoles = (roles) => {
    if (!roles || roles.length === 0) {
      return <span className="empty-roles">Sin roles</span>;
    }

    return (
      <div style={{display: "flex", gap: "0.5rem"}}>
        {roles.map((role) => (
          <span key={role.name} className="role-item">
            {role.name}
          </span>
        ))}
      </div>
    );
  };


  return (
    // Es buena idea agregar una clase para poder estilizar la tabla
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
        {users.map(user => (
          <tr key={`user-${user.id || user.mail}`}>
            <td>{user.first_name} {user.last_name}</td>
            <td>{user.mail}</td>
            <td>{user.organization}</td>
            <td>{renderRoles(user.roles)}</td>
            <td className="action-cell">
              <span onClick={() => handleEdit(user)} className="action-icon material-symbols-outlined">edit</span>
            </td>
            <td className="action-cell">
              <span onClick={() => handleDelete(user)} className="action-icon material-symbols-outlined">delete</span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default UsersTable;