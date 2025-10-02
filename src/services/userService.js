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
    console.log('Usuarios obtenidos:', res);
    console.log('Usuarios obtenidos - data:', res.data);
//     {
//     "data": [
//         {
//             "username": "jdoe",
//             "mail": "jdoe@example.com",
//             "roles": [],
//             "id": "user_4335545440",
//             "uidNumber": 0,
//             "gidNumber": 0,
//             "is_active": true,
//             "telephone_number": "123-456-7890",
//             "postalAddress": "",
//             "address": "",
//             "first_name": "John",
//             "last_name": "Doe",
//             "dnPath": "",
//             "organization": "Unknown",
//             "created_at": "2025-10-02T01:50:00.688640+00:00",
//             "updated_at": "2025-10-02T01:50:00.688643+00:00",
//             "password": "asd324ewrf!@#QWEqwe"
//         },
//         {
//             "username": "jdoe2",
//             "mail": "jdoe@example.com",
//             "roles": [],
//             "id": "user_4335545440",
//             "uidNumber": 0,
//             "gidNumber": 0,
//             "is_active": true,
//             "telephone_number": "123-456-7890",
//             "postalAddress": "",
//             "address": "",
//             "first_name": "John",
//             "last_name": "Doe 2",
//             "dnPath": "",
//             "organization": "OrgF2",
//             "created_at": "2025-10-02T01:50:00.688693+00:00",
//             "updated_at": "2025-10-02T01:50:00.688694+00:00",
//             "password": "asd324ewrf!@#QWEqwe"
//         },
//         {
//             "username": "jdoe3",
//             "mail": "jdoe3@example.com",
//             "roles": [],
//             "id": "user_4335545440",
//             "uidNumber": 0,
//             "gidNumber": 0,
//             "is_active": true,
//             "telephone_number": "123-456-7890",
//             "postalAddress": "",
//             "address": "",
//             "first_name": "John",
//             "last_name": "Doe 3",
//             "dnPath": "",
//             "organization": "OrgF2",
//             "created_at": "2025-10-02T01:50:00.688735+00:00",
//             "updated_at": "2025-10-02T01:50:00.688736+00:00",
//             "password": "asd324ewrf!@#QWEqwe"
//         },
//         {
//             "username": "arodriguez",
//             "mail": "alejandro@gmail.com",
//             "roles": [],
//             "id": "user_4335545440",
//             "uidNumber": 0,
//             "gidNumber": 0,
//             "is_active": true,
//             "telephone_number": "+5491130901234",
//             "postalAddress": "",
//             "address": "",
//             "first_name": "Alejandro",
//             "last_name": "Rodriguez",
//             "dnPath": "",
//             "organization": "OrgA2",
//             "created_at": "2025-10-02T01:50:00.688774+00:00",
//             "updated_at": "2025-10-02T01:50:00.688776+00:00",
//             "password": "asd324ewrf!@#QWEqwe"
//         },
//         {
//             "username": "arodriguez1",
//             "mail": "alejandro1@gmail.com",
//             "roles": [],
//             "id": "user_4335545440",
//             "uidNumber": 0,
//             "gidNumber": 0,
//             "is_active": true,
//             "telephone_number": "+5491130901234",
//             "postalAddress": "",
//             "address": "",
//             "first_name": "Alejandro",
//             "last_name": "Rodriguez",
//             "dnPath": "",
//             "organization": "OrgA2",
//             "created_at": "2025-10-02T01:50:00.688968+00:00",
//             "updated_at": "2025-10-02T01:50:00.688973+00:00",
//             "password": "asd324ewrf!@#QWEqwe"
//         },
//         {
//             "username": "arodriguez2",
//             "mail": "alejandro12@gmail.com",
//             "roles": [],
//             "id": "user_4335545440",
//             "uidNumber": 0,
//             "gidNumber": 0,
//             "is_active": true,
//             "telephone_number": "+5491130901234",
//             "postalAddress": "",
//             "address": "",
//             "first_name": "Alejandro",
//             "last_name": "Rodriguez",
//             "dnPath": "",
//             "organization": "OrgA2",
//             "created_at": "2025-10-02T01:50:00.689181+00:00",
//             "updated_at": "2025-10-02T01:50:00.689183+00:00",
//             "password": "asd324ewrf!@#QWEqwe"
//         },
//         {
//             "username": "arodriguez3",
//             "mail": "alejandro123@gmail.com",
//             "roles": [],
//             "id": "user_4335545440",
//             "uidNumber": 0,
//             "gidNumber": 0,
//             "is_active": true,
//             "telephone_number": "+5491130901234",
//             "postalAddress": "",
//             "address": "",
//             "first_name": "Alejandro Modify",
//             "last_name": "Rodriguez Modify",
//             "dnPath": "",
//             "organization": "OrgA2",
//             "created_at": "2025-10-02T01:50:00.689342+00:00",
//             "updated_at": "2025-10-02T01:50:00.689346+00:00",
//             "password": "asd324ewrf!@#QWEqwe"
//         }
//     ],
//     "status": 200,
//     "statusText": "OK",
//     "headers": {
//         "content-length": "2872",
//         "content-type": "application/json"
//     },
//     "config": {
//         "transitional": {
//             "silentJSONParsing": true,
//             "forcedJSONParsing": true,
//             "clarifyTimeoutError": false
//         },
//         "adapter": [
//             "xhr",
//             "http",
//             "fetch"
//         ],
//         "transformRequest": [
//             null
//         ],
//         "transformResponse": [
//             null
//         ],
//         "timeout": 0,
//         "xsrfCookieName": "XSRF-TOKEN",
//         "xsrfHeaderName": "X-XSRF-TOKEN",
//         "maxContentLength": -1,
//         "maxBodyLength": -1,
//         "env": {},
//         "headers": {
//             "Accept": "application/json, text/plain, */*",
//             "Content-Type": "application/json"
//         },
//         "baseURL": "http://localhost:8081",
//         "method": "get",
//         "url": "/v1/user/all",
//         "allowAbsoluteUrls": true
//     },
//     "request": {}
// }
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
