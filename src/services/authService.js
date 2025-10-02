// services/authService.js

export const authService = {
  login: async ({ email, password }) => {
    // Super Admin
    if (email === "super@citypass.com" && password === "12345678") {
      const token = "fake-super-token";
      const user = { email, role: "super" };

      localStorage.setItem("authToken", token);
      localStorage.setItem("user", JSON.stringify(user));

      return { success: true, token, user };
    }

    // Admin normal
    if (email === "admin@citypass.com" && password === "12345678") {
      const token = "fake-admin-token";
      const user = { email, role: "admin" };

      localStorage.setItem("authToken", token);
      localStorage.setItem("user", JSON.stringify(user));

      return { success: true, token, user };
    }

    // Usuario común
    if (email === "test@citypass.com" && password === "12345678") {
      const token = "fake-user-token";
      const user = { email, role: "user" };

      localStorage.setItem("authToken", token);
      localStorage.setItem("user", JSON.stringify(user));

      return { success: true, token, user };
    }

    throw new Error("Credenciales inválidas");
  },

  register: async ({ email, password, name }) => {
    if (email === "test@citypass.com") {
      throw new Error("El email ya está registrado");
    }

    const token = "fake-new-user-token";
    const user = { email, role: "user", name };

    localStorage.setItem("authToken", token);
    localStorage.setItem("user", JSON.stringify(user));

    return { success: true, token, user };
  },

  recoverPassword: async (email) => {
    return { success: true };
  },

  logout: () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
  },

  getToken: () => {
    return localStorage.getItem("authToken");
  },

  getUser: () => {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  },
};

// src/services/authServiceReal.js
import { api } from "./api";

export const authServiceReal = {
  // 🔑 Login contra backend
  login: async ({ email, password }) => {
    try {
      const res = await api.post("/v1/auth/token", {
        username: email,   // el backend usa "username"
        password,
      });

      const token = res.data; // el backend devuelve un string JWT
      localStorage.setItem("authToken", token);
      console.log("Response del login:", res);
      console.log("Token guardado:", token);

//       {
//     "data": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhcm9kcmlndWV6IiwiYXVkIjoibGRhcC5jb20iLCJpc3MiOiJhdXRoX3NlcnZlciIsImV4cCI6MTc1OTQ1MzU0NywibmJmIjoxNzU5MzY3MTQ3LCJpYXQiOjE3NTkzNjcxNDcsImp0aSI6ImE2ZTlkYWZjLTZlNDAtNDFjNS04YmIzLWE2OWM0Y2Q0MTBmMiIsInJvbGVzIjpbXSwiYXpwIjoiYXJvZHJpZ3VleiIsImVtYWlsIjoiYWxlamFuZHJvQGdtYWlsLmNvbSIsInNjb3BlIjpbXSwidHlwIjoiYWNjZXNzIn0.be1lPJR1tOufQmUgs4Tz_yf1ZE7t4GOLQeAd5Oz0dUg",
//     "status": 200,
//     "statusText": "OK",
//     "headers": {
//         "content-length": "402",
//         "content-type": "application/json"
//     },
//     "config": {
//         "transitional": {
//             "silentJSONParsing": true,
//             "forcedJSONParsing": true,
//             "clarifyTimeoutError": false
//         },
//         "adapter": [
//             "xhr",
//             "http",
//             "fetch"
//         ],
//         "transformRequest": [
//             null
//         ],
//         "transformResponse": [
//             null
//         ],
//         "timeout": 0,
//         "xsrfCookieName": "XSRF-TOKEN",
//         "xsrfHeaderName": "X-XSRF-TOKEN",
//         "maxContentLength": -1,
//         "maxBodyLength": -1,
//         "env": {},
//         "headers": {
//             "Accept": "application/json, text/plain, */*",
//             "Content-Type": "application/json"
//         },
//         "baseURL": "http://localhost:8081",
//         "method": "post",
//         "url": "/v1/auth/token",
//         "data": "{\"username\":\"alejandro@gmail.com\",\"password\":\"Asd123asd123as!\"}",
//         "allowAbsoluteUrls": true
//     },
//     "request": {}
// }

      // luego se puede validar el token para obtener info del user
      return { success: true, token };
    } catch (err) {
      throw new Error(err.response?.data?.detail || "Error en login");
    }
  },

  // ✅ Validar token
  validateToken: async () => {
    const token = localStorage.getItem("authToken");
    if (!token) throw new Error("No hay token");

    const res = await api.post("/v1/auth/validate", { jwt_token: token });
    return res.data;
  },

  // 👤 Crear usuario
  register: async (userData) => {
    try {
      const res = await api.post("/v1/user/", userData);
      return res.data;
    } catch (err) {
      throw new Error(err.response?.data?.detail || "Error al registrar");
    }
  },

  // 📜 Historial de login
  getLoginHistory: async (user_mail, limit = 5) => {
    const res = await api.get(`/v1/auth/login-history`, {
      params: { user_mail, limit },
    });
    return res.data;
  },

  // 🔑 Cambiar contraseña
  changePassword: async (user_mail, new_password) => {
    const res = await api.post("/v1/user/change-password", null, {
      params: { user_mail, new_password },
    });
    return res.data;
  },

  logout: () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
  },

  getToken: () => {
    return localStorage.getItem("authToken");
  },

  getUser: () => {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  },
};
