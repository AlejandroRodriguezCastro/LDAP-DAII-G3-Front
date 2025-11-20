import React, { useState, useEffect, useMemo, useContext } from "react";
import ModalContext from "../context/ModalContext";
import { userSchema } from "./validationSchemas/userSchema";

const UserFormModalContent = ({ title, user, onChange, organizations = [], roleOptions = [], isEdit }) => {
  const { setValidToSave } = useContext(ModalContext);
  const [form, setForm] = useState(user);
  const [roles, setRoles] = useState(roleOptions);
  const [errors, setErrors] = useState({});
  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  const userData = JSON.parse(localStorage.getItem("userData")) || {};
  const activeRoles = JSON.parse(localStorage.getItem("activeRoles") || "[]");

  const isAdmin = useMemo(() => {
    return activeRoles.some(
      (role) => role.name?.toLowerCase().includes("super") && role.organization === "admin"
    );
  }, [activeRoles]);

  useEffect(() => {
    setForm(user || {});
    setPasswords({
      currentPassword: "",
      newPassword: "",
      confirmPassword: ""
    });
    
    const orgFromUser = user?.organization;
    const orgFromUserData = userData?.organization;
    
    if (orgFromUser) {
      setRoles(roleOptions.filter((r) => r.organization === orgFromUser));
      setForm((prev) => {
        const updated = { ...prev, organization: orgFromUser };
        if (onChange) onChange(updated);
        return updated;
      });
    } else {
      if (isAdmin) {
        setRoles(roleOptions);
      } else {
        setRoles(roleOptions.filter((r) => r.organization === orgFromUserData));
        setForm((prev) => {
          const updated = { ...prev, organization: orgFromUserData };
          if (onChange) onChange(updated);
          return updated;
        });
      }
    }
  }, [user, roleOptions, userData?.organization, isAdmin, onChange]);

  useEffect(() => {
    validateForm();
  }, [form]);

  const validateForm = async () => {
    try {
      await userSchema.validate(form, { abortEarly: false });
      setErrors({});
      setValidToSave(true);
    } catch (err) {
      const newErrors = {};
      err.inner.forEach((e) => {
        newErrors[e.path] = e.message;
      });
      setErrors(newErrors);
      setValidToSave(false);
    }
  };

  const validatePassword = (password) => {
    if (!password || password.trim() === "") return null;
    
    const minLength = 12;
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    if (password.length < minLength) {
      return 'La contraseña debe tener al menos 12 caracteres';
    }
    if (!hasSpecialChar) {
      return 'La contraseña debe contener al menos un carácter especial';
    }
    
    // ✅ NUEVA VALIDACIÓN: La nueva contraseña no puede ser igual a la actual
    if (password === passwords.currentPassword) {
      return 'La nueva contraseña no puede ser igual a la contraseña actual';
    }
    
    return null;
};

const handlePasswordChange = (e) => {
  const { name, value } = e.target;
  
  setPasswords(prev => ({
    ...prev,
    [name]: value
  }));

  setTimeout(() => {
    const newErrors = { ...errors };
    
    if (name === "newPassword") {
      const passwordError = validatePassword(value);
      if (passwordError) {
        newErrors.newPassword = passwordError;
      } else {
        delete newErrors.newPassword;
      }
      
      // Validar confirmación si ya hay valor
      if (passwords.confirmPassword && value !== passwords.confirmPassword) {
        newErrors.confirmPassword = "Las contraseñas no coinciden";
      } else {
        delete newErrors.confirmPassword;
      }
    }

    if (name === "confirmPassword") {
      if (value !== passwords.newPassword) {
        newErrors.confirmPassword = "Las contraseñas no coinciden";
      } else {
        delete newErrors.confirmPassword;
      }
    }
    
    // ✅ NUEVA VALIDACIÓN: Si cambia la contraseña actual, validar la nueva contra ella
    if (name === "currentPassword" && passwords.newPassword) {
      if (value && passwords.newPassword === value) {
        newErrors.newPassword = 'La nueva contraseña no puede ser igual a la contraseña actual';
      } else if (newErrors.newPassword === 'La nueva contraseña no puede ser igual a la contraseña actual') {
        delete newErrors.newPassword;
      }
    }

    setErrors(newErrors);

    if (onChange) {
      onChange({ 
        ...form, 
        _currentPassword: name === "currentPassword" ? value : passwords.currentPassword,
        _newPassword: name === "newPassword" ? value : passwords.newPassword,
        _confirmPassword: name === "confirmPassword" ? value : passwords.confirmPassword
      });
    }
  }, 0);
};
  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === "organization") {
      if (!value) return;
      setRoles(roleOptions.filter((role) => role.organization === value));
      setForm((prev) => {
        const updatedForm = { ...prev, organization: value, roles: [] };
        if (onChange) onChange(updatedForm);
        return updatedForm;
      });
      return;
    }

    if (name === "role") {
      if (!value) return;
      const selectedRole = roleOptions.find((r) => r.name === value);
      if (!selectedRole) return;
      
      setForm((prev) => {
        const currentRoles = prev.roles || [];
        const exists = currentRoles.some((r) => r.name === selectedRole.name);
        const updatedRoles = exists 
          ? currentRoles.filter((r) => r.name !== selectedRole.name)
          : [...currentRoles, selectedRole];
        
        const updatedForm = { ...prev, roles: updatedRoles };
        if (onChange) onChange(updatedForm);
        return updatedForm;
      });
      return;
    }

    const updated = { ...form, [name]: value };
    setForm(updated);
    if (onChange) onChange(updated);
  };

  const removeRole = (role) => {
    setForm((prev) => {
      const updatedRoles = prev.roles.filter((r) => r.name !== role.name);
      const updatedForm = { ...prev, roles: updatedRoles };
      if (onChange) onChange(updatedForm);
      return updatedForm;
    });
  };

  return (
    <form className="form-inline" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      {title && <h3>{title}</h3>}
      
      {/* Nombre */}
      <div style={{ display: "flex", flexDirection: "column" }}>
        <input 
          name="first_name" 
          type="text" 
          placeholder="Nombre" 
          value={form.first_name || ""} 
          onChange={handleChange} 
        />
        {errors.first_name && <span className="error-text">{errors.first_name}</span>}
      </div>

      {/* Apellido */}
      <div style={{ display: "flex", flexDirection: "column" }}>
        <input 
          name="last_name" 
          type="text" 
          placeholder="Apellido" 
          value={form.last_name || ""} 
          onChange={handleChange} 
        />
        {errors.last_name && <span className="error-text">{errors.last_name}</span>}
      </div>

      {/* Email */}
      <div style={{ display: "flex", flexDirection: "column" }}>
        <input 
          name="mail" 
          type="email" 
          disabled={isEdit} 
          placeholder="Email" 
          value={form.mail || ""} 
          onChange={handleChange} 
        />
        {errors.mail && <span className="error-text">{errors.mail}</span>}
      </div>

      {/* Organización (solo admin) */}
      {isAdmin && (
        <div style={{ display: "flex", flexDirection: "column" }}>
          <select 
            name="organization" 
            value={form.organization || ""} 
            onChange={handleChange}
          >
            <option value="">Selecciona una organización</option>
            {organizations.map((org, i) => (
              <option key={i} value={org.ou[0]}>
                {org.ou[0]}
              </option>
            ))}
          </select>
          {errors.organization && (
            <span className="error-text">{errors.organization}</span>
          )}
        </div>
      )}

      {/* Sección de Cambio de Contraseña (solo en edición) */}
      {isEdit && (
        <div style={{ 
          border: "1px solid #e0e0e0", 
          borderRadius: "8px", 
          padding: "1rem", 
          backgroundColor: "#f9f9f9",
          marginTop: "0.5rem"
        }}>
          <h4 style={{ margin: "0 0 1rem 0", color: "#333", fontSize: "1rem" }}>
            Cambiar Contraseña
          </h4>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {/* Contraseña Actual */}
            <div style={{ display: "flex", flexDirection: "column" }}>
              <label style={{ fontWeight: "500", color: "#555", fontSize: "0.9rem", marginBottom: "0.5rem" }}>
                Contraseña Actual
              </label>
              <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                <input
                  name="currentPassword"
                  type={showPasswords.current ? "text" : "password"}
                  placeholder="Contraseña Actual"
                  value={passwords.currentPassword}
                  onChange={handlePasswordChange}
                  style={{ 
                    width: "100%", 
                    padding: "0.75rem",
                    paddingRight: "2.5rem",
                    border: errors.currentPassword ? "1px solid #dc3545" : "1px solid #ddd",
                    borderRadius: "4px",
                    fontSize: "0.9rem"
                  }}
                />
                <button
                  type="button"
                  style={{
                    position: "absolute",
                    right: "0.5rem",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: "0.25rem",
                    fontSize: "1rem",
                    color: "#666"
                  }}
                  onClick={() => togglePasswordVisibility('current')}
                >
                  {showPasswords.current ? 'Ocultar' : 'Mostrar'}
                </button>
              </div>
              {errors.currentPassword && (
                <span style={{ color: "#dc3545", fontSize: "0.8rem", marginTop: "0.25rem" }}>
                  {errors.currentPassword}
                </span>
              )}
            </div>

            {/* Nueva Contraseña */}
            <div style={{ display: "flex", flexDirection: "column" }}>
              <label style={{ fontWeight: "500", color: "#555", fontSize: "0.9rem", marginBottom: "0.5rem" }}>
                Nueva Contraseña
              </label>
              <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                <input
                  name="newPassword"
                  type={showPasswords.new ? "text" : "password"}
                  placeholder="Nueva Contraseña"
                  value={passwords.newPassword}
                  onChange={handlePasswordChange}
                  style={{ 
                    width: "100%", 
                    padding: "0.75rem",
                    paddingRight: "2.5rem",
                    border: errors.newPassword ? "1px solid #dc3545" : "1px solid #ddd",
                    borderRadius: "4px",
                    fontSize: "0.9rem"
                  }}
                />
                <button
                  type="button"
                  style={{
                    position: "absolute",
                    right: "0.5rem",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: "0.25rem",
                    fontSize: "1rem",
                    color: "#666"
                  }}
                  onClick={() => togglePasswordVisibility('new')}
                >
                  {showPasswords.new ? 'Ocultar' : 'Mostrar'}
                </button>
              </div>
              {errors.newPassword ? (
                <span style={{ color: "#dc3545", fontSize: "0.8rem", marginTop: "0.25rem" }}>
                  {errors.newPassword}
                </span>
              ) : (
                <small style={{ fontSize: "0.8rem", color: "#888", marginTop: "0.25rem" }}>
                  Mínimo 8 caracteres con al menos un carácter especial
                </small>
              )}
            </div>

            {/* Confirmar Nueva Contraseña */}
            <div style={{ display: "flex", flexDirection: "column" }}>
              <label style={{ fontWeight: "500", color: "#555", fontSize: "0.9rem", marginBottom: "0.5rem" }}>
                Confirmar Nueva Contraseña
              </label>
              <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                <input
                  name="confirmPassword"
                  type={showPasswords.confirm ? "text" : "password"}
                  placeholder="Confirmar Nueva Contraseña"
                  value={passwords.confirmPassword}
                  onChange={handlePasswordChange}
                  style={{ 
                    width: "100%", 
                    padding: "0.75rem",
                    paddingRight: "2.5rem",
                    border: errors.confirmPassword ? "1px solid #dc3545" : "1px solid #ddd",
                    borderRadius: "4px",
                    fontSize: "0.9rem"
                  }}
                />
                <button
                  type="button"
                  style={{
                    position: "absolute",
                    right: "0.5rem",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: "0.25rem",
                    fontSize: "1rem",
                    color: "#666"
                  }}
                  onClick={() => togglePasswordVisibility('confirm')}
                >
                  {showPasswords.confirm ? 'Ocultar' : 'Mostrar'}
                </button>
              </div>
              {errors.confirmPassword && (
                <span style={{ color: "#dc3545", fontSize: "0.8rem", marginTop: "0.25rem" }}>
                  {errors.confirmPassword}
                </span>
              )}
            </div>
          </div>
          
          <small style={{ 
            display: "block", 
            fontSize: "0.8rem", 
            color: "#666", 
            marginTop: "0.75rem",
            fontStyle: "italic"
          }}>
            Solo completar si deseas cambiar la contraseña del usuario
          </small>
        </div>
      )}

      {/* Roles */}
      <div className="roles-container" style={{ display: "flex", flexDirection: "column" }}>
        <select 
          name="role" 
          value={form.roles?.[0]?.name || ""} 
          onChange={handleChange}
        >
          <option value="">Seleccione una opción</option>
          {roles.map((rol) => (
            <option key={rol.name} value={rol.name}>
              {rol.name}
            </option>
          ))}
        </select>
        {errors.roles && <span className="error-text">{errors.roles}</span>}
        
        <div className="roles-items">
          {form.roles?.length ? (
            form.roles.map((rol) => (
              <div key={rol.name} className="role-item" onClick={() => removeRole(rol)}>
                {rol.name}
              </div>
            ))
          ) : (
            <span className="empty-roles">No hay roles seleccionados todavía</span>
          )}
        </div>
      </div>
    </form>
  );
};

export default UserFormModalContent;