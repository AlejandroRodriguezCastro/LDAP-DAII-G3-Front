import React from "react";
import "./styles/layout.css";

const AuthLayout = ({ title, children }) => (
  <div className="auth-container">
    <div className="auth-box">
      <h1 className="auth-title">{title}</h1>
      {children}
    </div>
  </div>
);

export default AuthLayout;
