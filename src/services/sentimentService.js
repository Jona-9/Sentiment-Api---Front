// src/services/sentimentService.js
import { API_ENDPOINTS } from '../config/api';

// URL Base de respaldo por si no está en tu archivo de configuración aún
const API_BASE_URL = 'http://localhost:8080/project/api/v2';

export const sentimentService = {
  /**
   * Analiza un texto simple
   * @param {string} text - Texto a analizar (5-2000 caracteres)
   * @returns {Promise<Object>} { sentiment: "positivo"|"negativo"|"neutral", score: 0.85 }
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
   * Analiza múltiples textos (Sin guardar en BD / Modo Demo o Batch Simple)
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
   * Analiza una lista de textos considerando productos específicos
   * @param {Array<string>} textos - Array de strings con los comentarios
   * @param {string} token - JWT del usuario
   * @param {Array<number>} productoIds - IDs de los productos seleccionados
   */
  async analyzeWithMultipleProducts(textos, token, productoIds) {
    try {
      const response = await fetch(API_ENDPOINTS.ANALYZE_MULTI_PRODUCTS, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          comentarios: textos,
          productosIds: productoIds
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        if (response.status === 401) throw new Error('Sesión expirada');
        if (response.status === 502) throw new Error('Servidor de IA no disponible');
        throw new Error(errorData.message || 'Error en el análisis multiproducto');
      }

      const data = await response.json();

      const normalizeSentiment = (sent) => {
        const s = sent?.toLowerCase().trim();
        if (s === 'positive') return 'positivo';
        if (s === 'negative') return 'negativo';
        if (s === 'neutro') return 'neutral';
        return s || 'neutral';
      };

      return {
        total: data.total || textos.length,
        sessionId: data.sessionId,
        comentarios: (data.comentarios || []).map(r => ({
          text: r.texto,
          sentiment: normalizeSentiment(r.sentimiento),
          score: r.probabilidad || 0,
          productoAsociado: r.nombreProducto || null
        })),
        avgScore: data.avgScore || 0,
        positivos: data.positivos || 0,
        negativos: data.negativos || 0,
        neutrales: data.neutrales || 0,
        productosDetectados: data.productosDetectados || []
      };

    } catch (error) {
      console.error('Error en analyzeWithMultipleProducts:', error);
      throw error;
    }
  },

  /**
   * ✨ NUEVO: Analiza batch CSV con auto-creación de categorías y productos
   * @param {Array<{texto: string, producto?: string, categoria?: string}>} entradas
   * @param {string} token - JWT del usuario
   */
  async analyzeCsvBatch(entradas, token) {
    try {
      const response = await fetch(API_ENDPOINTS.ANALYZE_CSV_BATCH, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ entradas })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        if (response.status === 401) throw new Error('Sesión expirada');
        if (response.status === 502) throw new Error('Servidor de IA no disponible');
        throw new Error(errorData.message || 'Error en el análisis batch CSV');
      }

      const data = await response.json();

      const normalizeSentiment = (sent) => {
        const s = sent?.toLowerCase().trim();
        if (s === 'positive') return 'positivo';
        if (s === 'negative') return 'negativo';
        if (s === 'neutro') return 'neutral';
        return s || 'neutral';
      };

      return {
        isBatch: true,
        totalAnalyzed: data.total || entradas.length,
        sessionSaved: true,
        sessionId: data.sessionId,
        items: (data.comentarios || []).map(r => ({
          text: r.texto,
          sentiment: normalizeSentiment(r.sentimiento),
          score: r.probabilidad || 0,
          productoAsociado: r.productoAsociado || null,
        })),
        stats: {
          avgScore: data.avgScore || 0,
          positivos: data.positivos || 0,
          negativos: data.negativos || 0,
          neutrales: data.neutrales || 0,
        },
        productosDetectados: data.productosDetectados || []
      };

    } catch (error) {
      console.error('Error en analyzeCsvBatch:', error);
      throw error;
    }
  },

  /**
   * Analiza comentarios y guarda la sesión (Método Legacy/Simple sin productos específicos)
   * @param {Array<string>} comentarios - Lista de textos a analizar
   * @param {string} token - JWT token del usuario autenticado
   */
  async analyzeAndSave(comentarios, token) {
    try {
      const response = await fetch(API_ENDPOINTS.ANALYZE_AND_SAVE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
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
      
      const comentariosConDetalles = data.comentarios?.map(comentario => ({
        text: comentario.texto,
        sentiment: comentario.sentimiento.toLowerCase(),
        score: comentario.probabilidad,
      })) || [];
      
      return {
        sessionId: data.sessionId,
        date: data.date,
        avgScore: data.avgScore,
        total: data.total,
        positivos: data.positivos,
        negativos: data.negativos,
        neutrales: data.neutrales,
        comentarios: comentariosConDetalles,
      };
    } catch (error) {
      console.error('Error en analyzeAndSave:', error);
      throw error;
    }
  },

  /**
   * Obtiene el historial de sesiones del usuario
   * @param {string} token - JWT token del usuario autenticado
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