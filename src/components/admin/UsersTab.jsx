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
import Loading from "../Loading/Loading";

const UsersTab = () => {
  const [users, setUsers] = useState([])
  const [roleOptions, setRoleOptions] = useState([])
  const [organizationsOptions, setOrganizationsOptions] = useState([])
  const [newUser, setNewUser] = useState({ first_name: "", last_name: "", mail: "", roles: null, organization: "", is_active: true })
  const [loading, setLoading] = useState(true);
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
  
    const loadData = async () => {
      setLoading(true);
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
        setLoading(false);
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
        try {

          
          // 1. Primero actualizar los datos del usuario
          const updatedUser = await userService.updateUser(tempUser);


          // 2. Si se ingresó una nueva contraseña, cambiarla
          let passwordChanged = false;
          if (tempUser._newPassword && tempUser._newPassword.trim() !== '' && 
              tempUser._currentPassword && tempUser._currentPassword.trim() !== '') {

            

            await userService.changePassword(
              tempUser.mail, 
              tempUser._currentPassword, // Contraseña actual
              tempUser._newPassword       // Nueva contraseña
            );
            
            passwordChanged = true;

          } else if (tempUser._newPassword && tempUser._newPassword.trim() !== '') {

          }

          // ✅ MENSAJE DE ÉXITO
          let successMessage = "Usuario actualizado correctamente";
          if (passwordChanged) {
            successMessage = "Usuario actualizado y contraseña cambiada con éxito";
          }
          
          toast.success(successMessage, {
            position: "bottom-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            theme: "light",
          })
          
          setUsers(users.map(user => user.id === updatedUser.id ? updatedUser : user));
          
        } catch (error) {

          
          let errorMessage = "Error al actualizar usuario";
          if (error && typeof error === 'object' && error.message) {
            errorMessage = error.message;
          }
          
          toast.error(errorMessage, {
            position: "bottom-right",
            autoClose: 7000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            theme: "light",
          })
        }
      } else {
        toast.error("Token inválido - No se pudo completar la operación", {
          position: "bottom-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          theme: "light",
        })
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
      { loading ? <Loading type="bar" /> : <div className="users-wrapper">
        <UsersTable users={users} handleEdit={handleEdit} handleDelete={handleDelete} />
      </div>}
    </div>
  );
};

export default UsersTab;