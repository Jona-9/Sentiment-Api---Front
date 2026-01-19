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
      const response = await fetch(API_ENDPOINTS.LOGIN, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          correo: correo,
          contraseña: contraseña
        }),
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Usuario no encontrado o credenciales incorrectas');
        }
        throw new Error('Error al iniciar sesión');
      }

      // El backend retorna UserDtoLogin con { id, nombre, apellido, correo }
      const userData = await response.json();
      
      return {
        success: true,
        user: {
          id: userData.id,
          correo: userData.correo,
          nombre: userData.nombre,
          apellido: userData.apellido,
        }
      };
    } catch (error) {
      console.error('Error en login:', error);
      throw error;
    }
  },
};