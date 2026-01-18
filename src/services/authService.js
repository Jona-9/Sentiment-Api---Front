// src/services/authService.js
import { API_ENDPOINTS } from '../config/api';

export const authService = {
  /**
   * Registra un nuevo usuario
   * @param {Object} userData - { nombre, apellido, correo, contraseña }
   * @returns {Promise<Object>} Usuario registrado
   */
  async register(userData) {
    try {
      const response = await fetch(API_ENDPOINTS.REGISTER, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Error al registrar usuario');
      }

      // El backend retorna 200 OK con body vacío
      return {
        success: true,
        user: {
          nombre: userData.nombre,
          apellido: userData.apellido,
          correo: userData.correo,
        }
      };
    } catch (error) {
      console.error('Error en registro:', error);
      throw error;
    }
  },

  /**
   * Inicia sesión
   * @param {string} correo 
   * @param {string} contraseña 
   * @returns {Promise<Object>} Datos del usuario
   */
  async login(correo, contraseña) {
    try {
      const response = await fetch(API_ENDPOINTS.LOGIN(correo, contraseña), {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error('Credenciales incorrectas');
      }

      // El backend retorna 200 OK con body vacío si las credenciales son correctas
      // Como no retorna datos del usuario, debemos simularlos
      return {
        success: true,
        user: {
          correo: correo,
          nombre: correo.split('@')[0], // Extraer nombre del email
        }
      };
    } catch (error) {
      console.error('Error en login:', error);
      throw error;
    }
  },
};