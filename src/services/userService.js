// services/userService.js


import { API_URL } from '../config/api';

export const userService = {

  getUser: async (mail) => {
  try {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`${API_URL}/v1/user/get-user/?username=${encodeURIComponent(mail)}`, {
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

  createUser: async (user) => {
    try {
      const token = localStorage.getItem('authToken');
      // Mockeo los datos faltantes si no están presentes
      const currentUser = JSON.parse(localStorage.getItem('userData')) || {};
      console.log('CU', currentUser)
      const organization = user.organization || currentUser.organization || "Emergencias";
      const telephone_number = user.telephone_number || "000-000-0000";
      const password = user.password || `${user.first_name || "user"}${user.last_name || "pass"}123!`;
      // roles ya viene del selector
      const userToSend = {
        ...user,
        roles: [{ ...user.roles[0], organization: organization }],
        organization,
        telephone_number,
        password
      };
      const response = await fetch(`${API_URL}/v1/user`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userToSend),
      });
      if (!response.ok) throw new Error('Error al crear usuario');
      return await response.json();
    } catch (error) {
      console.error('Error createUser:', error);
      throw error;
    }
  },

  updateUser: async (mail, updatedData) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_URL}/v1/user/${mail}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedData),
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
      const response = await fetch(`${API_URL}/v1/users/${mail}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) throw new Error('Error al eliminar usuario');
      return true;
    } catch (error) {
      console.error('Error deleteUser:', error);
      throw error;
    }
  },
};
