import { API_URL } from "../config/api";

export const organizationService = {
  getOrganizations: async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_URL}/v1/organization_units/`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
      });
      return await response.json();
    } catch (error) {
      console.error('Error al traer las organizaciones:', error);
      throw error;
    }
  }
}