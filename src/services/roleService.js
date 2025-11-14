const API_URL = "http://ec2-13-217-71-142.compute-1.amazonaws.com:8081/v1";

export const roleService = {
  /**
   * Obtiene todos los roles disponibles
   * @returns {Promise<Object>} { roles: [...] }
   */
  getRoles: async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_URL}/roles/`, {
        method: "GET",
        headers: {
          "accept": "application/json",
          'Authorization': `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Error fetching roles: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error in getRoles:", error);
      throw error;
    }
  },

  getRolesByOrganization: async (organization) => {
      try {
        const token = localStorage.getItem('authToken');
        const response = await fetch(`${API_URL}/roles/organization/${organization}`, {
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
    },


  /**
   * Crea un nuevo rol
   * @param {Object} roleData - Datos del rol
   * @param {string} roleData.name - Nombre del rol
   * @param {string} roleData.description - Descripción del rol
   * @param {string} roleData.organization - Organización del rol
   * @returns {Promise<Object>} { inserted_id: "..." }
   */
  createRole: async (roleData) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_URL}/roles/`, {
        method: "POST",
        headers: {
          "accept": "application/json",
          'Authorization': `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: roleData.name,
          description: roleData.description,
          organization: roleData.organization,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error(`Error creating role: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error in createRole:", error);
      throw error;
    }
  },

  /**
   * Actualiza un rol existente
   * @param {string} roleId - ID del rol a actualizar
   * @param {Object} roleData - Datos actualizados del rol
   * @returns {Promise<Object>}
   */
  updateRole: async (roleId, roleData) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_URL}/roles/${roleId}`, {
        method: "PUT",
        headers: {
          "accept": "application/json",
          'Authorization': `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...roleData,
          updated_at: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error(`Error updating role: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error in updateRole:", error);
      throw error;
    }
  },

  /**
   * Elimina un rol
   * @param {string} roleId - ID del rol a eliminar
   * @returns {Promise<Object>}
   */
  deleteRole: async (roleId) => {
    const token = localStorage.getItem('authToken');
    try {
      const response = await fetch(`${API_URL}/roles/${roleId}`, {
        method: "DELETE",
        headers: {
          "accept": "application/json",
          'Authorization': `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Error deleting role: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error in deleteRole:", error);
      throw error;
    }
  },
};
