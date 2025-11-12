import React, { useContext, useEffect, useState } from "react";
import ModalContext from "../context/ModalContext";
import { userService } from "../../services/userService";
import UserFormModalContent from "../UserFormModalContent";
import { roleService } from "../../services/roleService";
import './usuarios.css'
import UsersTable from "./UsersTable";

const UsersTab = ({ currentUser }) => {

  const [users, setUsers] = useState([]);
  const [roleOptions, setRoleOptions] = useState([]);
  const [newUser, setNewUser] = useState({ first_name: "", last_name: "", mail: "", roles: null, organization: "", is_active: true });
  const { showModal } = useContext(ModalContext);
  const organizations = ['admin', 'Emergencias']

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
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };
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
          // organizations={organizations}
        />
      ),
      onAccept: async () => {
        // if (currentUser?.role === "super" && !tempUser.organization) return;
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
          // organizations={organizations}
        />
      ),
      onAccept: async () => {
        // if (currentUser?.role === "super" && !tempUser.organization) return;
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
