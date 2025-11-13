import React, { useState, useEffect, useMemo, useContext } from "react";
import ModalContext from "../context/ModalContext";
import { userSchema } from "./validationSchemas/userSchema";

const UserFormModalContent = ({ title, user, onChange, organizations = [], roleOptions = [], isEdit }) => {
  const { setValidToSave } = useContext(ModalContext);

  const [form, setForm] = useState(user);
  const [roles, setRoles] = useState(roleOptions);
  const [errors, setErrors] = useState({}); // ✅ nuevo estado de errores
  const userData = JSON.parse(localStorage.getItem("userData")) || {};
  const activeRoles = JSON.parse(localStorage.getItem("activeRoles") || "[]");

  const isAdmin = useMemo(() => {
    return activeRoles.some(
      (role) =>
        role.name?.toLowerCase().includes("super") && role.organization === "admin"
    );
  }, [activeRoles]);

  // --- Preload y filtrado inicial ---
  useEffect(() => {
    setForm(user || {});

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

  // ✅ Validación
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
    <form
      className="form-inline"
      style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
    >
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

      {/* Roles */}
      <div className="roles-container" style={{ display: "flex", flexDirection: "column" }}>
        <select name="role" value={form.roles?.[0]?.name || ""} onChange={handleChange}>
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
