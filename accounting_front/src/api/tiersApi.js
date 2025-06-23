import apiClient from './config';

// URLs pour les tiers
const TIERS_ENDPOINTS = {
  BASE: '/tiers',
  BY_ID: (id) => `/tiers/${id}`,
};

// Fonctions pour la gestion des tiers
export const tiersApi = {
  // Récupérer tous les tiers avec pagination et filtres
  getAllTiers: async (params = {}) => {
    try {
      const response = await apiClient.get(TIERS_ENDPOINTS.BASE, { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Récupérer un tiers par ID
  getTierById: async (id) => {
    try {
      const response = await apiClient.get(TIERS_ENDPOINTS.BY_ID(id));
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Créer un nouveau tiers
  createTier: async (tierData) => {
    try {
      const response = await apiClient.post(TIERS_ENDPOINTS.BASE, tierData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Mettre à jour un tiers
  updateTier: async (id, tierData) => {
    try {
      const response = await apiClient.put(TIERS_ENDPOINTS.BY_ID(id), tierData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Supprimer un tiers
  deleteTier: async (id) => {
    try {
      const response = await apiClient.delete(TIERS_ENDPOINTS.BY_ID(id));
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Récupérer les balances clients/fournisseurs avec pagination et filtres
  getBalances: async (params = {}) => {
    try {
      const response = await apiClient.get('/tiers/balances', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
}; 