// services/authService.js
import { jwtDecode } from 'jwt-decode';
import { API_URL } from '../config/api';
import { userService } from './userService';

export const authService = {
  login: async ({ email, password } ) => {
    try {
      const response = await fetch(`${API_URL}/v1/auth/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          username: email, 
          redirect_uris: ["http://localhost/callback"],
          password 
        })
      });

      const token = await response.json();
      let decodedJWT = null;

      if (token) {
        decodedJWT = jwtDecode(token);
        // const userData = await userService.getUser(decodedJWT.email);

        // Guardamos el token y la info del usuario (todo el JWT decodificado)
        localStorage.setItem("authToken", token);
        localStorage.setItem("user", JSON.stringify(decodedJWT));
        // localStorage.setItem("userData", JSON.stringify(userData));
      }

      if (!response.ok) {
        throw new Error('Error al iniciar sesión');
      }

      return { success: true, token, user: decodedJWT };
    } catch (error) {
      console.error('Error en login:', error);
      throw error;
    }
  },

  validateToken: async (token) => {
    try {
      const response = await fetch(`${API_URL}/v1/auth/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ jwt_token: token })
      });
      if (!response.ok) {
        throw new Error('Token inválido');
      }
      return { success: true };
    } catch (error) {
      console.error('Error en validateToken:', error);
      return { success: false, error: error.message };
    }
  },

  register: async ({ email, password, name }) => {
    if (email === "test@citypass.com") {
      throw new Error("El email ya está registrado");
    }

    const token = "fake-new-user-token";
    const user = { email, role: "user", name };

    localStorage.setItem("authToken", token);
    localStorage.setItem("user", JSON.stringify(user));

    console.log('No implementado', password)
    return { success: true, token, user };
  },

  recoverPassword: async (email) => {
    console.log('No implementado', email)
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
