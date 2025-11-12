import React, { useState, useEffect, useMemo } from "react";

const UserFormModalContent = ({ title, user, onChange, organizations = [], roleOptions = [], isEdit }) => {
  const [form, setForm] = useState(user);
  const [roles, setRoles] = useState(roleOptions);
  const userData = JSON.parse(localStorage.getItem("userData")) || {};
  const activeRoles = JSON.parse(localStorage.getItem("activeRoles") || "[]");

  const isAdmin = useMemo(() => {
    return activeRoles.some(
      role => role.name?.toLowerCase().includes("super") && role.organization === "admin"
    );
  }, [activeRoles]);

  // --- Preload y filtrado inicial ---
  useEffect(() => {
    setForm(user || {});

    // Determinar organización base
    const orgFromUser = user?.organization;
    const orgFromUserData = userData?.organization;

    if (orgFromUser) {
      // Modo edición: filtrar roles por la organización del usuario (aunque seas admin)
      setRoles(roleOptions.filter(r => r.organization === orgFromUser));
      setForm(prev => {
        const updated = { ...prev, organization: orgFromUser };
        if (onChange) onChange(updated);
        return updated;
      });
    } else {
      // Modo creación: comportamientos distintos según permisos
      if (isAdmin) {
        // admin creando: ver todos las roles
        setRoles(roleOptions);
      } else {
        // no-admin creando: fijar la org del usuario actual y filtrar
        setRoles(roleOptions.filter(r => r.organization === orgFromUserData));
        setForm(prev => {
          const updated = { ...prev, organization: orgFromUserData };
          if (onChange) onChange(updated);
          return updated;
        });
      }
    }
  }, [user, roleOptions, userData?.organization, isAdmin, onChange]);


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

    setForm((prev) => ({ ...prev, [name]: value }));
    if (onChange) onChange({ ...form, [name]: value });
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

      <input
        name="first_name"
        type="text"
        placeholder="Nombre"
        value={form.first_name || ""}
        onChange={handleChange}
      />
      <input
        name="last_name"
        type="text"
        placeholder="Apellido"
        value={form.last_name || ""}
        onChange={handleChange}
      />
      <input
        name="mail"
        type="email"
        disabled={isEdit}
        placeholder="Email"
        value={form.mail || ""}
        onChange={handleChange}
      />

      {isAdmin && (
        <select name="organization" value={form.organization || ""} onChange={handleChange}>
          <option value="">Selecciona una organización</option>
          {organizations.map((org, i) => (
            <option key={i} value={org.ou[0]}>
              {org.ou[0]}
            </option>
          ))}
        </select>
      )}

      <div className="roles-container">
        <select name="role" value={form.roles?.[0]?.name || ""} onChange={handleChange}>
          <option value="">Seleccione una opción</option>
          {roles.map((rol) => (
            <option key={rol.name} value={rol.name}>
              {rol.name}
            </option>
          ))}
        </select>

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
