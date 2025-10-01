// src/components/FormInput.jsx
import React from "react";
import "./styles/form.css";

const FormInput = ({ id, label, type = "text", register, error }) => {
  return (
    <div className="form-group">
      <label htmlFor={id} className="form-label">
        {label}
      </label>
      <input
        id={id}
        name={id}
        type={type}
        className="form-input"
        {...register}
      />
      {error && <p className="error-text">{error.message}</p>}
    </div>
  );
};

export default FormInput;
