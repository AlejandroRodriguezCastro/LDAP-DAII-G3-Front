export const authService = {
  login: async ({ email, password }) => {
    if (email === "test@citypass.com" && password === "12345678") {
      return { success: true, token: "fake-jwt-token" };
    }
    throw new Error("Credenciales inválidas");
  },

  register: async ({ email }) => {
    if (email === "test@citypass.com") {
      throw new Error("El email ya está registrado");
    }
    return { success: true };
  },

  recoverPassword: async (email) => {
    return { success: true }; // siempre éxito, por seguridad
  },
};
