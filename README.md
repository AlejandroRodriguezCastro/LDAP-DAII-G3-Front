# 🔐 CityPass+ - Login Federado (Frontend)

Este repositorio contiene el **módulo de Login Federado** del proyecto **CityPass+**.  
Su objetivo es centralizar la autenticación de usuarios contra **LDAP** y manejar la emisión/validación de **JWT**, que luego son consumidos por los demás módulos de la plataforma.

---

## 🎯 Funcionalidad

- Pantalla de **login** (usuario + contraseña).
- Conexión al backend LDAP para validar credenciales.
- Obtención de **JWT** tras login exitoso.
- Manejo de roles (`ciudadano`, `operador`, `administrador`).
- Guardado de token en `localStorage` o `sessionStorage`.
- Middleware de validación de sesión en el frontend.
- Logout y expiración de sesión.

---

## 📦 Requisitos

- Node.js >= 18
- npm / yarn / pnpm
- Backend LDAP + servicio de emisión de JWT (proyecto del grupo 2 - backend)

---

## ⚙️ Instalación

```bash
git clone https://github.com/tu-org/citypass-login-frontend.git
cd LDAP-DAII-G3-Front
npm install
