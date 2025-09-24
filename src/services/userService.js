// services/userService.js
let users = [
  { id: 1, name: "Juan Pérez", email: "juan@example.com", role: "user" },
  { id: 2, name: "Ana García", email: "ana@example.com", role: "admin" },
];

export const userService = {
  getUsers: async () => {
    return users;
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
