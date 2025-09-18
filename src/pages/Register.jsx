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
  fullName: yup.string().required("El nombre es obligatorio"),
  email: yup.string().email("Email inválido").required("El email es obligatorio"),
  password: yup.string()
    .required("La contraseña es obligatoria")
    .min(8, "Mínimo 8 caracteres")
    .matches(/[0-9]/, "Debe incluir al menos un número")
    .matches(/[A-Za-z]/, "Debe incluir letras"),
  confirmPassword: yup.string()
    .oneOf([yup.ref("password")], "Las contraseñas no coinciden")
    .required("Confirma la contraseña"),
});

const Register = () => {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data) => {
    try {
      await authService.register(data);
      alert("Registro exitoso. Revisa tu correo de confirmación.");
      navigate("/");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <AuthLayout title="Crear cuenta">
      <form onSubmit={handleSubmit(onSubmit)}>
        <FormInput label="Nombre completo" register={register("fullName")} error={errors.fullName} />
        <FormInput label="Email" type="email" register={register("email")} error={errors.email} />
        <FormInput label="Contraseña" type="password" register={register("password")} error={errors.password} />
        <FormInput label="Confirmar contraseña" type="password" register={register("confirmPassword")} error={errors.confirmPassword} />
        {error && <p className="error-text">{error}</p>}
        <Button type="submit">Crear cuenta</Button>
      </form>
      <div className="auth-message">
        <Link to="/">¿Ya tienes cuenta? Iniciar sesión</Link>
      </div>
    </AuthLayout>
  );
};

export default Register;
