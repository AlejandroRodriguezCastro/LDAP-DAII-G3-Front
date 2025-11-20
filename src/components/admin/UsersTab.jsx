import { useContext, useEffect, useState } from "react";
import { organizationService } from "../../services/organizationService";
import { roleService } from "../../services/roleService";
import { userService } from "../../services/userService";
import ModalContext from "../context/ModalContext";
import UsersTable from "./UsersTable";
import './usuarios.css';
import UserFormModalContent from "./UserFormModalContent";
import { ToastContainer, toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import { useCheckToken } from "../hooks/checkToken";

const UsersTab = () => {
  const [users, setUsers] = useState([])
  const [roleOptions, setRoleOptions] = useState([])
  const [organizationsOptions, setOrganizationsOptions] = useState([])
  const [newUser, setNewUser] = useState({ first_name: "", last_name: "", mail: "", roles: null, organization: "", is_active: true })
  const [isAdmin, setIsAdmin] = useState(false)
  const { showModal } = useContext(ModalContext);
  const activeRoles = localStorage.getItem("activeRoles");
  const userData = JSON.parse(localStorage.getItem("userData"))
  const checkToken = useCheckToken();
  
  useEffect(() => {
    const roles = JSON.parse(activeRoles);
    const loggedMail = userData.mail;

    const isAdmin = roles.some(role =>
      role.name.includes("super") && role.organization === "admin"
    );
    setIsAdmin(isAdmin)

    const loadData = async () => {
      const validToken = checkToken()
      if (validToken) {
        try {
          if (isAdmin) {
            const [usersData, rolesData, organizationsData] = await Promise.all([
              userService.getUsers(),
              roleService.getRoles(),
              organizationService.getOrganizations()
            ]);
  
            setUsers(usersData.filter(u => u.mail !== loggedMail));
            setRoleOptions(rolesData.roles);
            setOrganizationsOptions(organizationsData.organization_units);
          } else {
            const [usersData, rolesData] = await Promise.all([
              userService.getUsersByOrganization(userData.organization),
              roleService.getRolesByOrganization(userData.organization),
            ]);
  
            setUsers(usersData.filter(u => u.mail !== loggedMail));
            setRoleOptions(rolesData.roles);
            setOrganizationsOptions(undefined);
          }
        } catch (error) {
          console.error("Error loading data:", error);
        }
      } else {
        console.log('No se pudo concretar la operación, el token es inválido')
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
          organizations={organizationsOptions}
        />
      ),
      onAccept: async () => {
        const tokenValid = checkToken()
        if (tokenValid) {
          const created = await userService.createUser(tempUser);
          if (created?.detail) {
            let msg;
            if (Array.isArray(created.detail)) {
              msg = created.detail[0]?.msg;
            } else {
              msg = created.detail;
            }
            toast.error(msg ?? "Error al crear usuario", {
              position: "bottom-right",
              autoClose: 3000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
              theme: "light",
            })
            return;
          }
          toast.success("Usuario creado con éxito", {
            position: "bottom-right",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            theme: "light",
          })
          setUsers([...users, created]);
        } else {
          console.log('No se pudo concretar la operación, el token es invalido')
        }
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
          title="Actualizar usuario"
          user={tempUser}
          onChange={(user) => { tempUser = user; }}
          isEdit={true}
          roleOptions={roleOptions}
          organizations={organizationsOptions}
        />
      ),
      onAccept: async () => {
        const tokenValid = checkToken()
        if (tokenValid) {
          const updatedUser = await userService.updateUser(tempUser);
          if (updatedUser?.detail) {
            let msg;
            if (Array.isArray(updatedUser.detail)) {
              msg = updatedUser.detail[0]?.msg;
            } else {
              msg = updatedUser.detail;
            }
            toast.error(msg ?? "Error al actualizar usuario", {
              position: "bottom-right",
              autoClose: 3000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
              theme: "light",
            })
            return;
          }
          toast.success("Usuario actualizado con éxito", {
            position: "bottom-right",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            theme: "light",
          })
          setUsers(users.map(user => user.id === updatedUser.id ? updatedUser : user));
        } else {
          console.log('No se pudo concretar la operación, el token es invalido')
        }
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
        const tokenValid = checkToken()
        if (tokenValid) {
          await userService.deleteUser(user.mail);
          toast.success("Usuario eliminado con éxito", {
            position: "bottom-right",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            theme: "light",
          })
          setUsers(users.filter((u) => u.id !== user.id));
        } else {
          console.log('No se pudo concretar la operación, el token es invalido')
        }
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
        <UsersTable users={users} handleEdit={handleEdit} handleDelete={handleDelete} roleOptions={roleOptions} organizationsOptions={organizationsOptions} isAdmin={isAdmin} />
      </div>
    </div>
  );
};

export default UsersTab;
