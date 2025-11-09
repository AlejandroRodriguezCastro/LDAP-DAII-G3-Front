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
  const [newUser, setNewUser] = useState({ first_name: "", last_name: "", mail: "", roles: [{ name: ""}], organization: "", is_active: true });

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

  const organizations = ['admin', 'Emergencias']
  // --- Handlers de Creación ---

const handleCreate = () => {
    let tempUser = { first_name: "", last_name: "", mail: "", roles: [{ name: ""}], organization: "", is_active: true };
    
    showModal({
      content: () => (
        <UserFormModalContent
          title="Crear usuario"
          user={tempUser}
          onChange={(u) => { tempUser = u; }}
          roleOptions={roleOptions}
          // organizations={organizations}
        />
      ),
      onAccept: async () => {
        console.log({ tempUser });
        // if (currentUser?.role === "super" && !tempUser.organization) return;
        const created = await userService.createUser(tempUser);
        setUsers([...users, created]);
      },
      cancelText: "Cancelar",
      acceptText: "Crear"
    });

    setNewUser({ first_name: "", last_name: "", mail: "", roles: [{ name: ""}], organization: "", is_active: true });
  };

  const handleEdit = (user) => {
    let tempUser = { ...user };
    showModal(
      () => (
        <UserFormModalContent
          user={tempUser}
          onChange={(u) => { tempUser = u; }}
          organizations={organizations}
        />
      ),
      async () => {
        const updated = await userService.updateUser(user.id, tempUser);
        setUsers(users.map((u) => (u.id === user.id ? updated : u)));
      },
      { acceptText: "Guardar", cancelText: "Cancelar" }
    );
  };

  const { showModal } = useContext(ModalContext);

  const confirmDelete = (id) => {
    showModal(
      <div>
        <h3>¿Seguro que deseas eliminar este usuario?</h3>
      </div>,
      async () => {
        await userService.deleteUser(id);
        setUsers(users.filter((u) => u.id !== id));
      },
      { acceptText: "Eliminar", cancelText: "Cancelar" }
    );
  };

  console.log(users)

  return (
    <div className="tab-panel">
      <div className="roles-header">
        <h2>Gestión de Usuarios</h2>
        <button className="btn-primary btn-add-role" style={{ marginBottom: "1rem" }} onClick={handleCreate}>
          Crear usuario
        </button>
      </div>
      <div className="users-wrapper">
        <UsersTable users={users} />
      </div>
    </div>
  );
};

export default UsersTab;
