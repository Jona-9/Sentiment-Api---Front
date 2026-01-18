// src/config/api.js
const API_BASE_URL = 'http://localhost:8080/project/api/v2';

export const API_ENDPOINTS = {
  // Autenticación
  REGISTER: `${API_BASE_URL}/usuario`,
  LOGIN: (correo, contraseña) => `${API_BASE_URL}/usuario/${encodeURIComponent(correo)}/${encodeURIComponent(contraseña)}`,
  
  // Análisis de Sentimientos
  ANALYZE_SINGLE: `${API_BASE_URL}/sentiment/analyze`,
  ANALYZE_BATCH: `${API_BASE_URL}/sentiment/analyze/batch`,
};

export default API_BASE_URL;