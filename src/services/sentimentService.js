// src/services/sentimentService.js
import { API_ENDPOINTS } from '../config/api';

export const sentimentService = {
  /**
   * Analiza un texto simple
   * @param {string} text - Texto a analizar (5-2000 caracteres)
   * @returns {Promise<Object>} { prevision: "Positivo"|"Negativo"|"Neutral", probabilidad: 0.85 }
   */
  async analyzeSingle(text) {
    try {
      const response = await fetch(API_ENDPOINTS.ANALYZE_SINGLE, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain',
        },
        body: text,
      });

      if (!response.ok) {
        if (response.status === 400) {
          const errorData = await response.json();
          throw new Error(errorData.Error?.[0] || 'Error de validación');
        }
        if (response.status === 502) {
          throw new Error('El servidor de IA no está disponible');
        }
        throw new Error('Error al analizar el texto');
      }

      const data = await response.json();
      
      const normalizeSentiment = (prevision) => {
        const sentiment = prevision.toLowerCase().trim();
        if (sentiment === 'positivo' || sentiment === 'positive') return 'positivo';
        if (sentiment === 'negativo' || sentiment === 'negative') return 'negativo';
        if (sentiment === 'neutral' || sentiment === 'neutro') return 'neutral';
        return sentiment;
      };
      
      return {
        text: text,
        sentiment: normalizeSentiment(data.prevision),
        score: data.probabilidad,
      };
    } catch (error) {
      console.error('Error en análisis simple:', error);
      throw error;
    }
  },

  /**
   * Analiza múltiples textos
   * @param {string} text - Textos separados por \n (5-20000 caracteres)
   * @returns {Promise<Object>} { isBatch: true, totalAnalyzed: 3, items: [...] }
   */
  async analyzeBatch(text) {
    try {
      const response = await fetch(API_ENDPOINTS.ANALYZE_BATCH, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain',
        },
        body: text,
      });

      if (!response.ok) {
        if (response.status === 400) {
          const errorData = await response.json();
          throw new Error(errorData.Error?.[0] || 'Error de validación');
        }
        if (response.status === 502) {
          throw new Error('El servidor de IA no está disponible');
        }
        throw new Error('Error al analizar los textos');
      }

      const data = await response.json();
      
      const normalizeSentiment = (prevision) => {
        const sentiment = prevision.toLowerCase().trim();
        if (sentiment === 'positivo' || sentiment === 'positive') return 'positivo';
        if (sentiment === 'negativo' || sentiment === 'negative') return 'negativo';
        if (sentiment === 'neutral' || sentiment === 'neutro') return 'neutral';
        return sentiment;
      };
      
      const textsArray = text.split('\n').filter(t => t.trim());
      
      return {
        isBatch: true,
        totalAnalyzed: data.total,
        items: data.results.map((result, index) => ({
          text: textsArray[index] || '',
          sentiment: normalizeSentiment(result.prevision),
          score: result.probabilidad,
        })),
      };
    } catch (error) {
      console.error('Error en análisis batch:', error);
      throw error;
    }
  },

  /**
   * Analiza comentarios y guarda la sesión en la base de datos (requiere autenticación)
   * @param {Array<string>} comentarios - Lista de textos a analizar
   * @param {string} token - JWT token del usuario autenticado
   * @returns {Promise<Object>} Sesión guardada con estadísticas
   */
  async analyzeAndSave(comentarios, token) {
    try {
      const response = await fetch(API_ENDPOINTS.ANALYZE_AND_SAVE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`, // ✅ TOKEN JWT
        },
        body: JSON.stringify({ comentarios }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('No autorizado. Por favor, inicia sesión nuevamente.');
        }
        if (response.status === 502) {
          throw new Error('El servidor de IA no está disponible');
        }
        throw new Error('Error al analizar y guardar los comentarios');
      }

      const data = await response.json();
      
      return {
        sessionId: data.sessionId,
        date: data.date,
        avgScore: data.avgScore,
        total: data.total,
        positivos: data.positivos,
        negativos: data.negativos,
        neutrales: data.neutrales,
      };
    } catch (error) {
      console.error('Error en analyzeAndSave:', error);
      throw error;
    }
  },

  /**
   * Obtiene el historial de sesiones del usuario
   * @param {string} token - JWT token del usuario autenticado
   * @returns {Promise<Array>} Lista de sesiones
   */
  async getHistory(token) {
    try {
      const response = await fetch(API_ENDPOINTS.GET_HISTORY, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('No autorizado');
        }
        throw new Error('Error al obtener historial');
      }

      return await response.json();
    } catch (error) {
      console.error('Error en getHistory:', error);
      throw error;
    }
  },
};