import { useState } from "react";
import { authService } from "../services/authService";
import { useNavigate } from "react-router-dom";

const AdminHeader = ({currentUser}) => {
  const [showMenu, setShowMenu] = useState(false);
  const navigate = useNavigate();    

  const handleLogout = () => {
    authService.logout();
    navigate("/");
  };

  console.log('currentUser', currentUser)

  return (
    <div className="admin-header">
      <h1 className="admin-title">Administración LDAP</h1>
      <div className="session-info">
        <div className="session-user" onClick={() => setShowMenu((prev) => !prev)}>
          <div className="avatar">
            {currentUser?.first_name?.[0] ?? "U"}
          </div>
          <span className="session-name">
            {currentUser?.first_name} {currentUser?.last_name}
          </span>
          <span className="arrow">▾</span>
        </div>
        {showMenu && (
        <div className="session-menu">
          {/* <button className="session-item" onClick={handleRedirect}>Cambiar contraseña</button> */}
          <button className="session-item logout" onClick={handleLogout}>
          Cerrar sesión
          </button>
        </div>
        )}
      </div>
    </div>
  )
}

export default AdminHeader;