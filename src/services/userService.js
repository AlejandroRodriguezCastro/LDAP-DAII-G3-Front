// services/userService.js

// Simulación en memoria
let users = [
  { id: 1, name: "Juan Pérez", email: "juan@example.com", role: "user", organization: "Org A" },
  { id: 2, name: "Ana García", email: "ana@example.com", role: "admin", organization: "Org B" },
  { id: 3, name: "Carlos Ruiz", email: "carlos@example.com", role: "super_user", organization: "Org Central" },
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
