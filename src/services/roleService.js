// services/roleService.js


import { API_URL } from '../config/api';

export const roleService = {
    getRoles: async () => {
        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch(`${API_URL}/v1/roles`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });
            if (!response.ok) throw new Error('Error al obtener roles');
            return await response.json();
        } catch (error) {
            console.error('Error getRoles:', error);
            throw error;
        }
    }

}