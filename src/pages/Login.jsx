import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Link, useNavigate } from "react-router-dom";
import FormInput from "../components/FormInput.jsx";
import Button from "../components/Button.jsx";
import AuthLayout from "../components/AuthLayout.jsx";
import { FiEye, FiEyeOff } from "react-icons/fi";
import "./auth.css";
import { authService } from "../services/authService.js";

const schema = yup.object({
  email: yup
    .string()
    .email("Email inválido")
    .required("El email es obligatorio"),
  password: yup.string().required("La contraseña es obligatoria"),
});

const Login = () => {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data) => {
    try {
      setError(''); // Limpiar error previo
      const { user: decodedJWT } = await authService.login(data);
      
      // 🔑 Redirección según roles del JWT
      // if (decodedJWT.roles && (decodedJWT.roles.includes("super_admin_write") || decodedJWT.roles.includes("super_admin_read"))) {
        console.log('Redirigiendo a admin...');
        navigate("/admin");
      // } else {
      //   console.log('Redirigiendo a home...');
      //   navigate("/home");
      // }
    } catch (err) {
      setError(err.message || 'Error al iniciar sesión. Por favor, verifica tus credenciales.');
    }
  };

  return (
    <AuthLayout title="Iniciar sesión">
      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Input Email */}
        <FormInput
          id="email"
          label="Email"
          type="email"
          register={register("email")}
          error={errors.email}
        />
        {/* Input Password with visibility toggle inside the input */}
        <div className="form-group">
          <label htmlFor="password">Contraseña</label>
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

        {/* Error global */}
        {error && (
          <p className="error-text" role="alert">
            {error}
          </p>
        )}

        {/* Botón */}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Ingresando..." : "Iniciar sesión"}
        </Button>
      </form>

      {/* Links extra */}
      <div className="auth-links">
        {/* <Link to="/forgot-password">¿Olvidaste tu contraseña?</Link>
        <Link to="/register">Crear cuenta</Link> */}
      </div>
    </AuthLayout>
  );
};

export default Login;
