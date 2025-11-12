import React, { useEffect, useState } from "react";

const RoleFormModalContent = ({ title, role = {}, onChange }) => {
  const [form, setForm] = useState({
    name: role.name || "",
    description: role.description || "",
    organization: role.organization || "",
  });

  useEffect(() => {
    setForm({
      name: role.name || "",
      description: role.description || "",
      organization: role.organization || "",
    });
  }, [role]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const updated = { ...form, [name]: value };
    setForm(updated);
    if (onChange) onChange(updated);
  };

  return (
    <form className="form-inline" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      {title && <h3>{title}</h3>}

      <input
        name="name"
        type="text"
        placeholder="Nombre del rol"
        value={form.name}
        onChange={handleChange}
      />

      <textarea
        name="description"
        placeholder="Descripción"
        value={form.description}
        onChange={handleChange}
        rows={3}
      />

      <input
        name="organization"
        type="text"
        placeholder="Organización"
        value={form.organization}
        onChange={handleChange}
      />
    </form>
  );
};

export default RoleFormModalContent;
