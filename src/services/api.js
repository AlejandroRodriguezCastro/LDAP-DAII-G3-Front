// src/services/api.js
import axios from "axios";

// const BASE_URL = process?.env?.REACT_APP_API_BASE_URL || "http://localhost:8000";
const BASE_URL = "http://localhost:8000";

export const api = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// Adjunta el token si existe
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
