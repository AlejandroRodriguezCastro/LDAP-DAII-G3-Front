import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Link, useNavigate, useLocation } from "react-router-dom";
import Button from "../components/Button.jsx";
import AuthLayout from "../components/AuthLayout.jsx";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { authService } from "../services/authService.js";
import "./auth.css";

const schema = yup.object({
  password: yup
    .string()
    .required("La contraseña es obligatoria")
    .min(8, "Mínimo 8 caracteres")
    .matches(/[0-9]/, "Debe incluir al menos un número")
    .matches(/[A-Za-z]/, "Debe incluir letras"),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("password")], "Las contraseñas no coinciden")
    .required("Confirma la contraseña"),
});

const ResetPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const getToken = () => {
    const params = new URLSearchParams(location.search);
    return params.get("token");
  };

  const onSubmit = async (data) => {
    try {
      setError("");
      const token = getToken();
      if (!token) throw new Error("Token de recuperación ausente");
      await authService.resetPassword(token, data.password);
      setMessage("Contraseña cambiada correctamente. Redirigiendo al login...");
      setTimeout(() => navigate("/"), 1500);
    } catch (err) {
      setError(err.message || "No se pudo cambiar la contraseña");
    }
  };

  return (
    <AuthLayout title="Restablecer contraseña">
      <form onSubmit={handleSubmit(onSubmit)}>
        {/* New Password */}
        <div className="form-group">
          <label htmlFor="password">Nueva contraseña</label>
          <div style={{ position: "relative" }}>
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              {...register("password")}
              aria-invalid={errors.password ? "true" : "false"}
              className="form-control"
              style={{ paddingRight: "2.5rem" }}
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              className="password-toggle"
              style={{
                position: "absolute",
                right: "0.5rem",
                top: "50%",
                transform: "translateY(-50%)",
                background: "transparent",
                border: "none",
                padding: 0,
                margin: 0,
                cursor: "pointer",
                lineHeight: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
            </button>
          </div>
          {errors.password && (
            <p className="error-text" role="alert">
              {errors.password.message}
            </p>
          )}
        </div>

        {/* Confirm Password */}
        <div className="form-group">
          <label htmlFor="confirmPassword">Confirmar nueva contraseña</label>
          <div style={{ position: "relative" }}>
            <input
              id="confirmPassword"
              type={showConfirm ? "text" : "password"}
              {...register("confirmPassword")}
              aria-invalid={errors.confirmPassword ? "true" : "false"}
              className="form-control"
              style={{ paddingRight: "2.5rem" }}
            />
            <button
              type="button"
              onClick={() => setShowConfirm((s) => !s)}
              aria-label={showConfirm ? "Ocultar contraseña" : "Mostrar contraseña"}
              className="password-toggle"
              style={{
                position: "absolute",
                right: "0.5rem",
                top: "50%",
                transform: "translateY(-50%)",
                background: "transparent",
                border: "none",
                padding: 0,
                margin: 0,
                cursor: "pointer",
                lineHeight: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {showConfirm ? <FiEyeOff size={18} /> : <FiEye size={18} />}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="error-text" role="alert">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        {error && (
          <p className="error-text" role="alert">
            {error}
          </p>
        )}

        {message && (
          <p className="success-text" role="alert">
            {message}
          </p>
        )}

        <Button type="submit" disabled={isSubmitting}>
          Cambiar contraseña
        </Button>
      </form>

      <div className="auth-message">
        <Link to="/">Volver a Iniciar sesión</Link>
      </div>
    </AuthLayout>
  );
};

export default ResetPassword;
