import React from "react";
import "./styles/button.css";

const Button = ({ children, ...rest }) => (
  <button {...rest} className="btn">
    {children}
  </button>
);

export default Button;
