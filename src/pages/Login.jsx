import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Link, useNavigate } from "react-router-dom";
import FormInput from "../components/FormInput";
import Button from "../components/Button";
import AuthLayout from "../components/AuthLayout";
import { authService } from "../services/authService";
import "./auth.css";

const schema = yup.object({
  email: yup.string().email("Email inválido").required("El email es obligatorio"),
  password: yup.string().required("La contraseña es obligatoria"),
});

const Login = () => {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data) => {
    try {
      await authService.login(data);
      navigate("/home");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <AuthLayout title="Iniciar sesión">
      <form onSubmit={handleSubmit(onSubmit)}>
        <FormInput label="Email" type="email" register={register("email")} error={errors.email} />
        <FormInput label="Contraseña" type="password" register={register("password")} error={errors.password} />
        {error && <p className="error-text">{error}</p>}
        <Button type="submit">Iniciar sesión</Button>
      </form>
      <div className="auth-links">
        <Link to="/forgot-password">¿Olvidaste tu contraseña?</Link>
        <Link to="/register">Crear cuenta</Link>
      </div>
    </AuthLayout>
  );
};

export default Login;
