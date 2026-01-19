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
      
      // ✅ CORREGIDO: Normalizar el sentimiento correctamente
      const normalizeSentiment = (prevision) => {
        const sentiment = prevision.toLowerCase().trim();
        // Manejar variaciones comunes
        if (sentiment === 'positivo' || sentiment === 'positive') return 'positivo';
        if (sentiment === 'negativo' || sentiment === 'negative') return 'negativo';
        if (sentiment === 'neutral' || sentiment === 'neutro') return 'neutral';
        return sentiment; // Fallback
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
      
      // ✅ CORREGIDO: Normalizar el sentimiento correctamente
      const normalizeSentiment = (prevision) => {
        const sentiment = prevision.toLowerCase().trim();
        if (sentiment === 'positivo' || sentiment === 'positive') return 'positivo';
        if (sentiment === 'negativo' || sentiment === 'negative') return 'negativo';
        if (sentiment === 'neutral' || sentiment === 'neutro') return 'neutral';
        return sentiment;
      };
      
      // Convertir respuesta del backend al formato del frontend
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
};