import { API_URL } from '../config/api';

export const userService = {

  getUser: async (mail) => {
  try {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`${API_URL}/v1/user/get-user/?user_mail=${encodeURIComponent(mail)}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) throw new Error('Error al obtener usuario');
    return await response.json();
  } catch (error) {
    console.error('Error getUser:', error);
    throw error;
  }
},


  getUsers: async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_URL}/v1/user/all`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) throw new Error('Error al obtener usuarios');
      return await response.json();
    } catch (error) {
      console.error('Error getUsers:', error);
      throw error;
    }
  },

  getUsersByOrganization: async (organization) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_URL}/v1/user/by-organization/${organization}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) throw new Error('Error al obtener usuarios');
      return await response.json();
    } catch (error) {
      console.error('Error getUsers:', error);
      throw error;
    }
  },

  createUser: async (user) => {
    try {
      const token = localStorage.getItem('authToken');
      const currentUser = JSON.parse(localStorage.getItem('userData')) || {};
      const organization = user.organization || currentUser.organization || "admin";
      const telephone_number = user.telephone_number || "000-000-0000";
      const password = user.password || `${user.first_name || "user"}${user.last_name || "pass"}123!`;
      const userToSend = {
        ...user,
        roles: user.roles,
        organization,
        telephone_number,
        password
      };
      const response = await fetch(`${API_URL}/v1/user`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'X-Request-Name': 'createUser',
        },
        body: JSON.stringify(userToSend),
      });
      return await response.json();
    } catch (error) {
      console.error('Error createUser:', error);
      throw error;
    }
  },

  updateUser: async (user) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_URL}/v1/user/${user.mail}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'X-Request-Name': 'updateUser',
        },
        body: JSON.stringify(user),
      });
      if (!response.ok) throw new Error('Error al actualizar usuario');
      return await response.json();
    } catch (error) {
      console.error('Error updateUser:', error);
      throw error;
    }
  },

  deleteUser: async (mail) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_URL}/v1/user/${mail}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'X-Request-Name': 'deleteUser',
        },
      });
      if (!response.ok) throw new Error('Error al eliminar usuario');
      return true;
    } catch (error) {
      console.error('Error deleteUser:', error);
      throw error;
    }
  },
  changePassword: async (email, oldPassword, newPassword) => {
    try {
      // Validar que los parámetros no estén vacíos
      if (!email || !oldPassword || !newPassword) {
        throw new Error("Email, contraseña actual y nueva contraseña son requeridos");
      }

      const response = await fetch(`${API_URL}/v1/user/change-password`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("authToken")}`,
          "Content-Type": "application/json",
          "X-Request-Name": "changePassword"
        },
        body: JSON.stringify({
          mail: email,
          old_password: oldPassword,
          new_password: newPassword
        }),
      });

      const responseText = await response.text();
      let responseData;
      
      try {
        responseData = responseText ? JSON.parse(responseText) : {};
      } catch (e) {
        responseData = { detail: responseText };
      }

      if (!response.ok) {
        // Manejar diferentes formatos de error
        let errorMessage = "Error al cambiar contraseña";
        
        if (responseData && responseData.detail) {
          if (Array.isArray(responseData.detail)) {
            errorMessage = responseData.detail[0]?.msg || "Error de validación";
          } else if (typeof responseData.detail === 'string') {
            errorMessage = responseData.detail;
          } else if (typeof responseData.detail === 'object') {
            errorMessage = JSON.stringify(responseData.detail);
          }
        } else if (responseData && responseData.message) {
          errorMessage = responseData.message;
        } else if (responseText) {
          errorMessage = responseText;
        }
        
        throw new Error(errorMessage);
      }

      return responseData || { message: "Contraseña cambiada exitosamente" };
    } catch (error) {
      console.error("Error en changePassword:", error);
      
      // Si el error ya es un string, lanzarlo directamente
      if (typeof error === 'string') {
        throw new Error(error);
      }
      // Si es un objeto Error, lanzarlo tal cual
      if (error instanceof Error) {
        throw error;
      }
      // Si es un objeto genérico, convertirlo a string
      throw new Error(JSON.stringify(error));
    }
  }
};
