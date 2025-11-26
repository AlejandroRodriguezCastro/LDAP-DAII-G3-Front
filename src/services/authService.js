// services/authService.js
import { jwtDecode } from 'jwt-decode';
import { API_URL } from '../config/api';
import { userService } from './userService';

// Manejador de errores específico para login
const handleLoginError = (error) => {
  // Si no hay respuesta del servidor (error de conexión)
  if (!error.response) {
    return 'Error de conexión - Verifique su internet o que el servidor esté activo';
  }

  const { status } = error.response;
  let responseData;
  
  // Intentar obtener los datos de la respuesta
  try {
    responseData = error.response.data;
  } catch {
    responseData = null;
  }

  switch (status) {
    case 307:
      return 'Usuario sin permisos - Contacte al administrador';
    case 400:
      return 'Datos de login incorrectos - Verifique el formato';
    
    case 401:
      return 'Email o contraseña incorrectos';
    
    case 403:
      return 'Cuenta desactivada o sin permisos - Contacte al administrador';

    case 404:
      return 'Servicio de autenticación no disponible';
    
    case 422:
      return 'Datos de entrada inválidos';
    
    case 429:
      return 'Demasiados intentos - Espere unos minutos';
    
    case 500:
      return 'Error interno del servidor - Intente más tarde';
    
    case 502:
    case 503:
    case 504:
      return 'Servicio temporalmente no disponible';
    
    default:
      return `Error ${status}: ${responseData?.message || 'Error inesperado durante el login'}`;
  }
};

export const authService = {
  login: async ({ email, password }, isCallback) => {
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

      // Manejar respuestas no exitosas
      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch {
          errorData = { message: 'Error en la respuesta del servidor' };
        }
        
        throw {
          response: {
            status: response.status,
            data: errorData
          }
        };
      }

      const token = await response.json();
      let decodedJWT = null;

      if (token) {
        decodedJWT = jwtDecode(token);
        localStorage.setItem("authToken", token);

        // ⛔ Si es callback → NO cargar userData
        if (!isCallback) {
          const userData = await userService.getUser(decodedJWT.email);
          localStorage.setItem("user", JSON.stringify(decodedJWT));
          localStorage.setItem("userData", JSON.stringify(userData));
          localStorage.setItem("activeRoles", JSON.stringify(userData.roles));
        }
      }

      return { success: true, token, user: decodedJWT };
    } catch (error) {
      console.error('Error en login:', error);
      
      // Aplicar el manejo de errores con switch case
      const userFriendlyError = handleLoginError(error);
      throw new Error(userFriendlyError);
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
        throw {
          response: {
            status: response.status,
            data: { message: 'Token inválido' }
          }
        };
      }
      
      return { success: true };
    } catch (error) {
      console.error('Error en validateToken:', error);
      const userFriendlyError = handleLoginError(error);
      return { success: false, error: userFriendlyError };
    }
  },

  // ... (el resto de tus métodos permanecen igual - register, recoverPassword, resetPassword, etc.)
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
    try {
      const response = await fetch(`${API_URL}/v1/user/request-password-recovery`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mail: email }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.message || 'No se pudo solicitar recuperación de contraseña');
      }

      return await response.json();
    } catch (error) {
      console.error('Error en recoverPassword:', error);
      throw error;
    }
  },

  resetPassword: async (token, password) => {
    try {
      // El backend espera { token, new_password }
      const body = { token, new_password: password };
      const response = await fetch(`${API_URL}/v1/user/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        // Construir mensaje legible a partir de la estructura { detail: [ { msg, loc, ... } ] }
        let message = 'No se pudo restablecer la contraseña';
        if (err) {
          if (Array.isArray(err.detail)) {
            message = err.detail
              .map((d) => {
                const locParts = Array.isArray(d.loc) ? d.loc : [];
                // Si el error es sobre 'new_password', mostrar mensaje genérico en español
                if (locParts.includes('new_password')) {
                  const minLen = d.ctx && d.ctx.min_length ? d.ctx.min_length : null;
                  return minLen
                    ? `La contraseña debe tener al menos ${minLen} caracteres`
                    : 'La contraseña no cumple los requisitos mínimos';
                }
                const loc = locParts.length ? locParts.join('.') : '';
                return d.msg ? `${loc ? loc + ': ' : ''}${d.msg}` : JSON.stringify(d);
              })
              .join('; ');
          } else if (err.detail && typeof err.detail === 'string') {
            message = err.detail;
          } else if (err.message) {
            message = err.message;
          }
        }
        throw new Error(message);
      }

      return await response.json();
    } catch (error) {
      console.error('Error en resetPassword:', error);
      throw error;
    }
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