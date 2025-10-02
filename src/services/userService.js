// services/userService.js

// Simulación en memoria
let users = [
  { id: 1, name: "Juan Pérez", email: "juan@example.com", role: "user", organization: "Org A" },
  { id: 2, name: "Ana García", email: "ana@example.com", role: "admin", organization: "Org B" },
  { id: 3, name: "Carlos Ruiz", email: "carlos@example.com", role: "super", organization: "Org Central" },
];

export const userService = {
  getUsers: async () => {
    // simula delay
    return new Promise((resolve) => {
      setTimeout(() => resolve(users), 300);
    });
  },

  createUser: async (user) => {
    const newUser = { ...user, id: Date.now() };
    users.push(newUser);
    return newUser;
  },

  updateUser: async (id, updatedData) => {
    users = users.map((u) => (u.id === id ? { ...u, ...updatedData } : u));
    return users.find((u) => u.id === id);
  },

  deleteUser: async (id) => {
    users = users.filter((u) => u.id !== id);
    return true;
  },
};

// src/services/userServiceReal.js
import { api } from "./api";

export const userServiceReal = {
  // 👥 Obtener todos los usuarios
  getUsers: async () => {
    const res = await api.get("/v1/user/all");
    return res.data;
  },

  // ➕ Crear usuario
  createUser: async (userData) => {
    const res = await api.post("/v1/user/", userData);
    return res.data;
  },

  // ✏️ Actualizar usuario (requiere user_mail como path param)
  updateUser: async (user_mail, updatedData) => {
    const res = await api.put(`/v1/user/${user_mail}`, updatedData);
    return res.data;
  },

  // 🗑️ Eliminar usuario
  deleteUser: async (user_mail) => {
    await api.delete(`/v1/user/${user_mail}`);
    return true;
  },
};
