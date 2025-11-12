import { useContext, useEffect, useState } from "react";
import { organizationService } from "../../services/organizationService";
import { roleService } from "../../services/roleService";
import { userService } from "../../services/userService";
import ModalContext from "../context/ModalContext";
import UserFormModalContent from "../UserFormModalContent";
import UsersTable from "./UsersTable";
import './usuarios.css';

const UsersTab = () => {
  const [users, setUsers] = useState([])
  const [roleOptions, setRoleOptions] = useState([])
  const [organizationsOptions, setOrganizationsOptions] = useState([])
  const [newUser, setNewUser] = useState({ first_name: "", last_name: "", mail: "", roles: null, organization: "", is_active: true })
  const { showModal } = useContext(ModalContext);
  const activeRoles = localStorage.getItem("activeRoles");
  const userData = JSON.parse(localStorage.getItem("userData"))

  useEffect(() => {
    const roles = JSON.parse(activeRoles);
    const isAdmin = roles.some(role => 
      role.name.includes("super") && role.organization === "admin"
    );
    
    
    // Se hace fetch de data en una transacción
    const loadData = async () => {
      if (isAdmin) {
        try {
          const [usersData, rolesData, organizationsData] = await Promise.all([
            userService.getUsers(),
            roleService.getRoles(),
            organizationService.getOrganizations()
          ]);
          setUsers(usersData);
          setRoleOptions(rolesData.roles)
          setOrganizationsOptions(organizationsData.organization_units)
        } catch (error) {
          console.error('Error loading data:', error)
        }
      } else {
        try {
          const [usersData, rolesData] = await Promise.all([
            userService.getUsersByOrganization(userData.organization),
            roleService.getRolesByOrganization(userData.organization),
          ]);
          setUsers(usersData);
          setRoleOptions(rolesData.roles)
          setOrganizationsOptions(undefined)
        }
        catch (error) {
          console.error('Error loading data:', error)
        }
      }
    } 
    loadData();
  }, []);


  const handleCreate = () => {
    let tempUser = newUser
    showModal({
      content: () => (
        <UserFormModalContent
          title="Crear usuario"
          user={tempUser}
          onChange={(u) => { tempUser = u; }}
          isEdit={false}
          roleOptions={roleOptions}
          organizations={organizationsOptions}
        />
      ),
      onAccept: async () => {
        const created = await userService.createUser(tempUser);
        setUsers([...users, created]);
      },
      cancelText: "Cancelar",
      acceptText: "Crear"
    });

    setNewUser({ first_name: "", last_name: "", mail: "", roles: null, organization: "", is_active: true });
  };

  const handleEdit = (user) => {
    let tempUser = user
    showModal({
      content: () => (
        <UserFormModalContent
          title="Crear usuario"
          user={tempUser}
          onChange={(user) => { tempUser = user; }}
          isEdit={true}
          roleOptions={roleOptions}
          organizations={organizationsOptions}
        />
      ),
      onAccept: async () => {
        const updatedUser = await userService.updateUser(tempUser);
        setUsers(users.map(user => user.id === updatedUser.id ? updatedUser : user));
      },
      cancelText: "Cancelar",
      acceptText: "Guardar"
    });

    setNewUser({ first_name: "", last_name: "", mail: "", roles: null, organization: "", is_active: true });
  };
  
  const handleDelete = (user) => {
    showModal({
      content: (
        <div className="delete-modal">
          <h3>¿Seguro que deseas eliminar el usuario <span>{user.first_name} {user.last_name}</span>?</h3>
        </div>
      ),
      onAccept: async () => {
        await userService.deleteUser(user.mail);
        setUsers(users.filter((u) => u.id !== user.id));
      },
      cancelText: "Cancelar",
      acceptText: "Eliminar"
    })
  };

  return (
    <div className="tab-panel">
      <div className="roles-header">
        <h2>Gestión de Usuarios</h2>
        <button className="btn-primary btn-add-role" style={{ marginBottom: "1rem" }} onClick={handleCreate}>
          Crear usuario
        </button>
      </div>
      <div className="users-wrapper">
        <UsersTable users={users} handleEdit={handleEdit} handleDelete={handleDelete} />
      </div>
    </div>
  );
};

export default UsersTab;
