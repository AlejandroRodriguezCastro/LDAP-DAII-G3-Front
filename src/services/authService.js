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
