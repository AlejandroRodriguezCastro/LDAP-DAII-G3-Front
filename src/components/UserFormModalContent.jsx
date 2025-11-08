import React, { useState, useEffect } from "react";

const UserFormModalContent = ({ user, onChange, organizations = [] }) => {
  const [form, setForm] = useState(user);

  useEffect(() => {
    setForm(user);
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (onChange) onChange({ ...form, [name]: value });
  };

  return (
    <form className="form-inline" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <input
        name="name"
        type="text"
        placeholder="Nombre"
        value={form.name}
        onChange={handleChange}
      />
      <input
        name="email"
        type="email"
        placeholder="Email"
        value={form.email}
        onChange={handleChange}
      />
      {form.role === "super" && (
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
      )}
      <select name="role" value={form.role} onChange={handleChange}>
        <option value="user">Usuario</option>
        <option value="admin">Administrador</option>
        <option value="super">Super Usuario</option>
      </select>
    </form>
  );
};

export default UserFormModalContent;
