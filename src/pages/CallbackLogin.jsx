import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import FormInput from "../components/FormInput.jsx";
import Button from "../components/Button.jsx";
import AuthLayout from "../components/AuthLayout.jsx";
import { authService } from "../services/authService.js";
import "./auth.css";

const schema = yup.object({
  email: yup.string().email("Email inválido").required("El email es obligatorio"),
  password: yup.string().required("La contraseña es obligatoria"),
});

const CallbackLogin = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectUrl = searchParams.get("redirectUrl");
  const [error, setError] = useState("");

  useEffect(() => {
    if (redirectUrl) {
      console.log(`Login con callback: retornará el token a ${redirectUrl}`);
    }
  }, [redirectUrl]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data) => {
    try {
      setError("");
      const { token, user } = await authService.login(data, true);;

      // Token se guarda localmente
      localStorage.setItem("authToken", token);

      if (redirectUrl && window.opener) {
        // Devuelve token a la aplicación externa
        window.opener.postMessage({ token }, redirectUrl);

        alert("Inicio de sesión exitoso. Puedes volver a tu aplicación.");
        window.close();
        return;
      }

      // Si no hay redirectUrl, se acude al flujo normal
      if (user?.roles?.some(r => r.startsWith("super_admin"))) {
        navigate("/admin");
      } else {
        navigate("/home");
      }

    } catch (err) {
      setError(err.message || "Error al iniciar sesión. Verifica tus credenciales.");
    }
  };

  return (
    <AuthLayout title="Iniciar sesión">
      <form onSubmit={handleSubmit(onSubmit)}>
        <FormInput
          id="email"
          label="Email"
          type="email"
          register={register("email")}
          error={errors.email}
        />
        <FormInput
          id="password"
          label="Contraseña"
          type="password"
          register={register("password")}
          error={errors.password}
        />
        {error && <p className="error-text" role="alert">{error}</p>}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Ingresando..." : "Iniciar sesión"}
        </Button>
      </form>

      <div className="auth-links">
        {/* <Link to="/forgot-password">¿Olvidaste tu contraseña?</Link>
        <Link to="/register">Crear cuenta</Link> */}
      </div>
    </AuthLayout>
  );
};

export default CallbackLogin;
