import { useContext, useEffect, useState } from "react";
import { organizationService } from "../../services/organizationService";
import { roleService } from "../../services/roleService";
import ModalContext from "../context/ModalContext";
import "./roles.css";
import RolesTable from "./RolesTable";
import RoleFormModalContent from "./RoleFormModalContent";

const RolesTab = ({ currentUser }) => {
  const [roles, setRoles] = useState([]);
  const [organizationsOptions, setOrganizationsOptions] = useState([]);
  const [newRole, setNewRole] = useState({ name: "", description: "", organization: "" });
  const [isAdmin, setIsAdmin] = useState(false);
  const { showModal } = useContext(ModalContext);
  const userData = JSON.parse(localStorage.getItem("userData"));
  const activeRoles = JSON.parse(localStorage.getItem("activeRoles"));

  useEffect(() => {
    const loadData = async () => {
      try {

        const adminCheck =
          activeRoles?.some(
            (role) => role.name.includes("super") && role.organization === "admin"
          ) || false;
        setIsAdmin(adminCheck);

        if (adminCheck) {
          // Admin: carga todos los roles y organizaciones
          const [rolesData, organizationsData] = await Promise.all([
            roleService.getRoles(),
            organizationService.getOrganizations(),
          ]);

          setRoles((rolesData && rolesData.roles) || []);
          setOrganizationsOptions(organizationsData.organization_units || []);
        } else {
          // Usuario normal: solo roles de su organización
          const rolesData = await roleService.getRolesByOrganization(userData.organization);
          setRoles((rolesData && rolesData.roles) || []);
          setOrganizationsOptions(undefined);
        }
      } catch (error) {
        console.error("Error loading roles/organizations:", error);
      }
    };

    loadData();
  }, []);

  const handleCreate = () => {
    let tempRole = { ...newRole, organization: userData.organization };

    showModal({
      content: () => (
        <RoleFormModalContent
          title="Crear rol"
          role={tempRole}
          isAdmin={isAdmin}
          onChange={(r) => (tempRole = r)}
          currentUser={currentUser}
          organizations={organizationsOptions}
        />
      ),
      onAccept: async () => {
        try {
          await roleService.createRole({
            ...tempRole,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });

          const userData = JSON.parse(localStorage.getItem("userData"));
          const data = isAdmin
            ? await roleService.getRoles()
            : await roleService.getRolesByOrganization(userData.organization);

          setRoles((data && data.roles) || []);
        } catch (error) {
          console.error("Error creating role:", error);
        }
      },
      showButtons: false
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
        <button
          className="btn-primary btn-add-role"
          style={{ marginBottom: "1rem" }}
          onClick={handleCreate}
        >
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
