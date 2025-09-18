import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Link } from "react-router-dom";
import FormInput from "../components/FormInput";
import Button from "../components/Button";
import AuthLayout from "../components/AuthLayout";
import { authService } from "../services/authService";
import "./auth.css";

const schema = yup.object({
  email: yup.string().email("Email inválido").required("El email es obligatorio"),
});

const ForgotPassword = () => {
  const [message, setMessage] = useState("");
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data) => {
    await authService.recoverPassword(data.email);
    setMessage("Si el email existe, recibirás un enlace para restablecer tu contraseña.");
  };

  return (
    <AuthLayout title="Recuperar contraseña">
      <form onSubmit={handleSubmit(onSubmit)}>
        <FormInput label="Email" type="email" register={register("email")} error={errors.email} />
        {message && <p className="success-text">{message}</p>}
        <Button type="submit">Enviar</Button>
      </form>
      <div className="auth-message">
        <Link to="/">Volver a Iniciar sesión</Link>
      </div>
    </AuthLayout>
  );
};

export default ForgotPassword;
