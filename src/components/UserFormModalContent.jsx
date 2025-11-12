import React, { useState, useEffect } from "react";

const UserFormModalContent = ({ title, user, onChange, organizations = [], roleOptions = [], isEdit }) => {
  const [form, setForm] = useState(user);

  useEffect(() => {
    setForm(user);
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "role") {
      if (value === "") return;

      // Buscar el objeto completo en roleOptions
      const selectedRole = roleOptions.find((role) => role.name === value);
      if (!selectedRole) return;

      setForm((prev) => {
        const currentRoles = prev.roles || [];
        const exists = currentRoles.some((role) => role.name === selectedRole.name);

        const updatedRoles = exists
          ? currentRoles.filter((role) => role.name !== selectedRole.name)
          : [...currentRoles, selectedRole];

        const updatedForm = { ...prev, roles: updatedRoles };

        if (onChange) onChange(updatedForm);
        return updatedForm;
      });
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
      if (onChange) onChange({ ...form, [name]: value });
    }
  };

  const removeRole = (role) => {
    setForm((prev) => {
      const updatedRoles = prev.roles.filter((r) => r.name !== role.name)
      const updatedForm = { ...prev, roles: updatedRoles }
      if (onChange) onChange(updatedForm)
      return updatedForm
    })
  }


  return (
    <form className="form-inline" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      {
        title && <h3>{title}</h3>
      }
      <input
        name="first_name"
        type="text"
        placeholder="Nombre"
        value={form.first_name}
        onChange={handleChange}
      />

      <input
        name="last_name"
        type="text"
        placeholder="Apellido"
        value={form.last_name}
        onChange={handleChange}
        />
      
      <input
        name="mail"
        type="email"
        disabled={isEdit}
        placeholder="Email"
        value={form.mail}
        onChange={handleChange}
      />
      {/* {form.role === "super" && (
        organizations.length > 0 ? (
          <select
            name="organization"
            value={form.organization}
            onChange={handleChange}
          >
            <option value="">Selecciona organización</option>
            {organizations.map((org) => (
              <option key={org} value={org}>{org}</option>
            ))}
          </select>
        ) : (
          <input
            name="organization"
            type="text"
            placeholder="Organización"
            value={form.organization}
            onChange={handleChange}
          />
        )
      )} */}
      <div className="roles-container">
        <select name="role" value={form.roles?.[0]?.name || ""} onChange={handleChange}>
          <option value="">Seleccione una opcion</option>
          {
            roleOptions.map(rol => (
              <option className="option-selected" key={rol.name} value={rol.name}>
                {rol.name}
              </option>
            ))
          }
        </select>
        <div className="roles-items">
          {
            form.roles?.length ? 
            form.roles.map(
              rol => {
                return (
                <div className="role-item" onClick={() => removeRole(rol)}>{rol.name}</div>
                )
              }
            ) :
            <span className="empty-roles">No hay roles seleccionados todavía</span  >
          }
        </div>
      </div>
    </form>
  );
};

export default UserFormModalContent;
