const UsersTable = ({ users }) => {
  
  // Opcional: Mostrar un mensaje si no hay usuarios
  if (!users || users.length === 0) {
    return <p>No se encontraron usuarios.</p>;
  }

  const renderRoles = (roles) => {
    if (!roles || roles.length === 0) {
      return 'Sin roles'; // O puedes dejarlo vacío: ''
    }
    
    // Mapea el array de roles y une los nombres con una coma
    return roles.map(role => role.name).join(', '); 
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
          <tr key={user.id || user.mail}>
            <td>{user.first_name} {user.last_name}</td>
            <td>{user.mail}</td>
            <td>{user.organization}</td>
            <td>{renderRoles(user.roles)}</td>
            <td className="action-cell">
              {/* Aquí puedes poner tu botón o icono, por ejemplo:
              <button onClick={() => handleEdit(user.id)}>Editar</button> 
              */}
            </td>
            <td className="action-cell">
              {/* Aquí puedes poner tu botón o icono, por ejemplo:
              <button onClick={() => handleDelete(user.id)}>Eliminar</button> 
              */}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default UsersTable;