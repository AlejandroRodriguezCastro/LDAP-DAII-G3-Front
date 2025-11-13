import React, { useEffect, useState, useContext } from "react";
import ModalContext from "../context/ModalContext";
import { roleSchema } from "./validationSchemas/roleSchema";

const RoleFormModalContent = ({ title, role = {}, isAdmin, onChange, organizations }) => {
  const { setValidToSave } = useContext(ModalContext);

  const [form, setForm] = useState({
    name: role.name || "",
    description: role.description || "",
    organization: role.organization || "",
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    setForm({
      name: role.name || "",
      description: role.description || "",
      organization: role.organization || "",
    });
  }, [role]);

  useEffect(() => {
    validateForm();
  }, [form, isAdmin]);

  const validateForm = async () => {
    try {
      await roleSchema.validate(form, { abortEarly: false });
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
    const updated = { ...form, [name]: value };
    setForm(updated);
    if (onChange) onChange(updated);
  };

  return (
    <form
      className="form-inline"
      style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
    >
      {title && <h3>{title}</h3>}
      <div style={{ display: "flex", flexDirection: "column" }}>
        <input
          name="name"
          type="text"
          placeholder="Nombre del rol"
          value={form.name}
          onChange={handleChange}
        />
        {errors.name && <span className="error-text">{errors.name}</span>}
      </div>
      <div style={{ display: "flex", flexDirection: "column" }}>
        <textarea
          className="text-area"
          name="description"
          placeholder="Descripción"
          value={form.description}
          onChange={handleChange}
          rows={3}
        />
        {errors.description && <span className="error-text">{errors.description}</span>}
      </div>
      {isAdmin ? (
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
          {errors.organization && <span className="error-text">{errors.organization}</span>}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column" }}>
          <input
            disabled={!isAdmin}
            name="organization"
            type="text"
            placeholder="Organización"
            value={form.organization}
            onChange={handleChange}
          />
        </div>
      )}
    </form>
  );
};

export default RoleFormModalContent;
