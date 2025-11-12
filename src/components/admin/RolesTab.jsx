import React, { useContext, useEffect, useState } from "react";
import ModalContext from "../context/ModalContext";
import { roleService } from "../../services/roleService";
import RoleFormModalContent from "./RoleFormModalContent";
import './roles.css'
import RolesTable from "./RolesTable";

const RolesTab = ({ currentUser }) => {
  const [roles, setRoles] = useState([]);
  const [newRole, setNewRole] = useState({ name: "", description: "", organization: "" });
  const { showModal } = useContext(ModalContext);

  useEffect(() => {
    const loadRoles = async () => {
      try {
        const data = await roleService.getRoles();
        setRoles((data && data.roles) || []);
      } catch (error) {
        console.error("Error loading roles:", error);
      }
    };
    loadRoles();
  }, []);

  const handleCreate = () => {
    let tempRole = { ...newRole };

    showModal({
      content: () => (
        <RoleFormModalContent
          title="Crear rol"
          role={tempRole}
          onChange={(r) => {
            tempRole = r;
          }}
        />
      ),
      onAccept: async () => {
        try {
          await roleService.createRole({
            ...tempRole,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
          // Refresh list after create to ensure consistent data
          const data = await roleService.getRoles();
          setRoles((data && data.roles) || []);
        } catch (error) {
          console.error("Error creating role:", error);
        }
      },
      cancelText: "Cancelar",
      acceptText: "Crear",
    });

    setNewRole({ name: "", description: "", organization: "" });
  };

  const handleDelete = (role) => {
    showModal({
      content: (
        <div className="delete-modal">
          <h3>¿Seguro que querés eliminar el rol “{role.name}”?</h3>
        </div>
      ),
      onAccept: async () => {
        try {
          await roleService.deleteRole(role.id);
          setRoles((prev) => prev.filter((r) => r.id !== role.id));
        } catch (error) {
          console.error("Error deleting role:", error);
        }
      },
      cancelText: "Cancelar",
      acceptText: "Eliminar",
    });
  };

  return (
    <div className="tab-panel">
      <div className="roles-header">
        <h2>Gestión de Roles</h2>
        <button className="btn-primary btn-add-role" style={{ marginBottom: "1rem" }} onClick={handleCreate}>
          Crear rol
        </button>
      </div>

      <div className="users-wrapper">
        <RolesTable roles={roles} handleDelete={handleDelete} />
      </div>
    </div>
  );
};

export default RolesTab;
