import React, { useState, useEffect } from "react";
import { roleService } from "../../services/roleService";
import "./roles.css";

const RolesTab = ({ currentUser }) => {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [newRole, setNewRole] = useState({
    name: "",
    description: "",
    organization: "",
  });
  const [editingRole, setEditingRole] = useState(null);
  const [filterOrg, setFilterOrg] = useState("");
  const [showForm, setShowForm] = useState(false);

  // Cargar roles al montar el componente
  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await roleService.getRoles();
      setRoles(response.roles || []);
    } catch (err) {
      setError(err.message || "Error cargando roles");
      console.error("Error fetching roles:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRole = async (e) => {
    e.preventDefault();

    // Validaciones
    if (!newRole.name || !newRole.description || !newRole.organization) {
      setError("Todos los campos son requeridos");
      return;
    }

    try {
      setError(null);
      await roleService.createRole(newRole);
      setNewRole({ name: "", description: "", organization: "" });
      setShowForm(false);
      await fetchRoles();
    } catch (err) {
      setError(err.message || "Error creando rol");
      console.error("Error creating role:", err);
    }
  };

  const handleUpdateRole = async (roleIndex, updatedData) => {
    try {
      setError(null);
      // Nota: Aquí necesitarías el ID del rol del backend
      // Por ahora actualizamos localmente
      const updatedRoles = [...roles];
      updatedRoles[roleIndex] = {
        ...updatedRoles[roleIndex],
        ...updatedData,
        updated_at: new Date().toISOString(),
      };
      setRoles(updatedRoles);
      setEditingRole(null);
    } catch (err) {
      setError(err.message || "Error actualizando rol");
    }
  };

  const handleDeleteRole = async (roleIndex) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar este rol?")) {
      try {
        setError(null);
        // Nota: Aquí necesitarías el ID del rol del backend
        setRoles(roles.filter((_, i) => i !== roleIndex));
      } catch (err) {
        setError(err.message || "Error eliminando rol");
      }
    }
  };

  // Obtener organizaciones únicas
  const organizations = [...new Set(roles.map((r) => r.organization))];

  // Filtrar roles por organización
  const filteredRoles =
    filterOrg && filterOrg !== "" ? roles.filter((r) => r.organization === filterOrg) : roles;

  return (
    <div className="tab-panel roles-container">
      <div className="roles-header">
        <h2>Gestión de Roles</h2>
        <button
          className="btn-primary btn-add-role"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? "✕ Cancelar" : "+ Nuevo Rol"}
        </button>
      </div>

      {/* Mostrar errores */}
      {error && <div className="alert alert-error">{error}</div>}

      {/* Formulario de creación */}
      {showForm && (
        <form className="role-form" onSubmit={handleCreateRole}>
          <div className="form-group">
            <label htmlFor="role-name">Nombre del Rol</label>
            <input
              id="role-name"
              type="text"
              placeholder="ej: super_admin_write"
              value={newRole.name}
              onChange={(e) => setNewRole({ ...newRole, name: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="role-description">Descripción</label>
            <textarea
              id="role-description"
              placeholder="ej: Admin to write admin"
              value={newRole.description}
              onChange={(e) =>
                setNewRole({ ...newRole, description: e.target.value })
              }
              rows="3"
              required
            ></textarea>
          </div>

          <div className="form-group">
            <label htmlFor="role-organization">Organización</label>
            <input
              id="role-organization"
              type="text"
              placeholder="ej: admin"
              value={newRole.organization}
              onChange={(e) =>
                setNewRole({ ...newRole, organization: e.target.value })
              }
              required
            />
          </div>

          <div className="form-actions">
            <button type="submit" className="btn-success">
              Crear Rol
            </button>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => setShowForm(false)}
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      {/* Filtro por organización */}
      {organizations.length > 0 && (
        <div className="roles-filter">
          <label htmlFor="org-filter">Filtrar por Organización:</label>
          <select
            id="org-filter"
            value={filterOrg}
            onChange={(e) => setFilterOrg(e.target.value)}
          >
            <option value="">Todas las organizaciones</option>
            {organizations.map((org) => (
              <option key={org} value={org}>
                {org}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Indicador de carga */}
      {loading && <div className="alert alert-info">Cargando roles...</div>}

      {/* Lista de roles */}
      <div className="roles-grid">
        {filteredRoles.length > 0 ? (
          filteredRoles.map((role, index) => (
            <div key={index} className="role-card">
              {editingRole?.index === index ? (
                // Modo edición
                <div className="role-card-edit">
                  <input
                    type="text"
                    className="role-input"
                    value={editingRole.name}
                    onChange={(e) =>
                      setEditingRole({ ...editingRole, name: e.target.value })
                    }
                    placeholder="Nombre del rol"
                  />
                  <textarea
                    className="role-textarea"
                    value={editingRole.description}
                    onChange={(e) =>
                      setEditingRole({
                        ...editingRole,
                        description: e.target.value,
                      })
                    }
                    placeholder="Descripción"
                    rows="2"
                  ></textarea>
                  <input
                    type="text"
                    className="role-input"
                    value={editingRole.organization}
                    onChange={(e) =>
                      setEditingRole({
                        ...editingRole,
                        organization: e.target.value,
                      })
                    }
                    placeholder="Organización"
                  />
                  <div className="card-actions">
                    <button
                      className="btn-save"
                      onClick={() => handleUpdateRole(index, editingRole)}
                    >
                      Guardar
                    </button>
                    <button
                      className="btn-cancel"
                      onClick={() => setEditingRole(null)}
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                // Modo visualización
                <div>
                  <div className="role-name">{role.name}</div>
                  <div className="role-description">{role.description}</div>
                  <div className="role-org-badge">{role.organization}</div>
                  <div className="role-dates">
                    <small>
                      Creado:{" "}
                      {new Date(role.created_at).toLocaleDateString("es-ES")}
                    </small>
                  </div>
                  <div className="card-actions">
                    <button
                      className="btn-edit"
                      onClick={() => setEditingRole({ ...role, index })}
                    >
                      Editar
                    </button>
                    <button
                      className="btn-delete"
                      onClick={() => handleDeleteRole(index)}
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="empty-state">
            <p>No hay roles disponibles</p>
            <button
              className="btn-primary"
              onClick={() => setShowForm(true)}
            >
              Crear el primer rol
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default RolesTab;
