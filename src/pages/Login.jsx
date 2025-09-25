import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Link, useNavigate } from "react-router-dom";
import FormInput from "../components/FormInput.jsx";
import Button from "../components/Button.jsx";
import AuthLayout from "../components/AuthLayout.jsx";
import { authService } from "../services/authService.js";
import "./auth.css";

const schema = yup.object({
  email: yup.string().email("Email inválido").required("El email es obligatorio"),
  password: yup.string().required("La contraseña es obligatoria"),
});

const Login = () => {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data) => {
    try {
      const { user } = await authService.login(data);

      // 🔑 Redirección según rol
      if (user.role === "admin" || user.role === "super") {
        navigate("/admin");
      } else {
        navigate("/home");
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <AuthLayout title="Iniciar sesión">
      <form onSubmit={handleSubmit(onSubmit)}>
        <FormInput id="email" label="Email" type="email" register={register("email")} error={errors.email} />
        <FormInput id="password" label="Contraseña" type="password" register={register("password")} error={errors.password} />
        {error && <p className="error-text" role="alert">{error}</p>}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Ingresando..." : "Iniciar sesión"}
        </Button>
      </form>
      <div className="auth-links">
        <Link to="/forgot-password">¿Olvidaste tu contraseña?</Link>
        <Link to="/register">Crear cuenta</Link>
      </div>
    </AuthLayout>
  );
};

export default Login;
