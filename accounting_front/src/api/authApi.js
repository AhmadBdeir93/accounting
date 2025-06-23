import apiClient from './config';

// URLs pour l'authentification
const AUTH_ENDPOINTS = {
  REGISTER: '/auth/register',
  LOGIN: '/auth/login',
  PROFILE: '/auth/profile',
};

// Fonctions d'authentification
export const authApi = {
  // Inscription d'un nouvel utilisateur
  register: async (userData) => {
    try {
      const response = await apiClient.post(AUTH_ENDPOINTS.REGISTER, userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Connexion d'un utilisateur
  login: async (credentials) => {
    try {
      const response = await apiClient.post(AUTH_ENDPOINTS.LOGIN, credentials);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Récupération du profil utilisateur
  getProfile: async () => {
    try {
      const response = await apiClient.get(AUTH_ENDPOINTS.PROFILE);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
}; 