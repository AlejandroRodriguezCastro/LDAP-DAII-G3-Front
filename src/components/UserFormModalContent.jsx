import React, { useState, useEffect } from "react";

const UserFormModalContent = ({ title, user, onChange, organizations = [], roleOptions = [] }) => {
  const [form, setForm] = useState(user);
  console.log(user)

  useEffect(() => {
    setForm(user);
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "role") {
      setForm((prev) => ({ ...prev, roles: [{...prev.roles[0], name: value}]})) 
    }
    setForm((prev) => ({ ...prev, [name]: value }));
    if (onChange) onChange({ ...form, [name]: value });
  };

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
      <select name="role" value={form.roles[0].name} onChange={handleChange}>
        <option value="">Seleccione una opcion</option>
        {
          roleOptions.map(rol => (
            <option key={rol.name} value={rol.name}>
              {rol.name}
            </option>
          ))
        }
      </select>
    </form>
  );
};

export default UserFormModalContent;
