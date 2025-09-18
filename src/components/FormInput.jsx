import React from "react";
import "./styles/form.css";

const FormInput = ({ label, type = "text", register, error, ...rest }) => (
  <div className="form-group">
    <label className="form-label">{label}</label>
    <input type={type} {...register} {...rest} className="form-input" />
    {error && <p className="error-text">{error.message}</p>}
  </div>
);

export default FormInput;
