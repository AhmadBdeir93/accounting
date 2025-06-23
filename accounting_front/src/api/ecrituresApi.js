import api from './config';

const ecrituresApi = {
  // Create a new ecriture
  create: async (ecritureData) => {
    const response = await api.post('/ecritures', ecritureData);
    return response.data;
  },

  // Get all ecritures with date range (REQUIRED)
  getAll: async (params = {}) => {
    const { dateDebut, dateFin, tiersId, libelle, searchTerm, orderBy, orderDirection } = params;
    if (!dateDebut || !dateFin) {
      throw new Error('Date range (dateDebut and dateFin) is required');
    }
    const queryParams = new URLSearchParams({
      date_debut: dateDebut,
      date_fin: dateFin
    });
    if (tiersId) queryParams.append('tiers_id', tiersId);
    if (libelle) queryParams.append('libelle', libelle);
    if (searchTerm) queryParams.append('searchTerm', searchTerm);
    if (orderBy) queryParams.append('orderBy', orderBy);
    if (orderDirection) queryParams.append('orderDirection', orderDirection);
    const response = await api.get(`/ecritures?${queryParams}`);
    return response.data;
  },

  // Get single ecriture by ID
  getById: async (id) => {
    const response = await api.get(`/ecritures/${id}`);
    return response.data;
  },

  // Update ecriture
  update: async (id, ecritureData) => {
    const response = await api.put(`/ecritures/${id}`, ecritureData);
    return response.data;
  },

  // Delete ecriture
  delete: async (id) => {
    const response = await api.delete(`/ecritures/${id}`);
    return response.data;
  },

  // Get ecritures by tiers with date range (REQUIRED)
  getByTiers: async (tiersId, params = {}) => {
    const { dateDebut, dateFin } = params;
    if (!dateDebut || !dateFin) {
      throw new Error('Date range (dateDebut and dateFin) is required');
    }
    const queryParams = new URLSearchParams({
      date_debut: dateDebut,
      date_fin: dateFin
    });
    const response = await api.get(`/ecritures/tiers/${tiersId}?${queryParams}`);
    return response.data;
  },

  // Get summary statistics with optional date range
  getSummary: async (params = {}) => {
    const { dateDebut, dateFin } = params;
    const queryParams = new URLSearchParams();
    
    if (dateDebut && dateFin) {
      queryParams.append('date_debut', dateDebut);
      queryParams.append('date_fin', dateFin);
    }

    const response = await api.get(`/ecritures/summary?${queryParams}`);
    return response.data;
  },

  // Get balance report for a specific date range
  getBalanceReport: async (params = {}) => {
    const { dateDebut, dateFin, tiersId } = params;
    
    if (!dateDebut || !dateFin) {
      throw new Error('Date range (dateDebut and dateFin) is required');
    }

    const queryParams = new URLSearchParams({
      date_debut: dateDebut,
      date_fin: dateFin
    });

    if (tiersId) queryParams.append('tiers_id', tiersId);

    const response = await api.get(`/ecritures/balance/report?${queryParams}`);
    return response.data;
  },

  // Get ecritures with pagination and filtering - REQUIRES DATE RANGE AND TIERS
  fetchEcritures: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();
      if (!params.dateDebut || !params.dateFin) {
        throw new Error('dateDebut and dateFin are required');
      }
      if (!params.tiersId) {
        throw new Error('tiersId is required');
      }
      queryParams.append('date_debut', params.dateDebut);
      queryParams.append('date_fin', params.dateFin);
      queryParams.append('tiers_id', params.tiersId);
      if (params.libelle) queryParams.append('libelle', params.libelle);
      if (params.searchTerm) queryParams.append('search_term', params.searchTerm);
      if (params.orderBy) queryParams.append('order_by', params.orderBy);
      if (params.orderDirection) queryParams.append('order_direction', params.orderDirection);
      const response = await api.get(`/ecritures?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get today's statistics for Quick Stats
  fetchTodayStats: async () => {
    try {
      const response = await api.get('/ecritures/today-stats');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get recent ecritures for dashboard (without tiers requirement)
  fetchRecentEcritures: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();
      
      // Required parameters
      if (!params.dateDebut || !params.dateFin) {
        throw new Error('dateDebut and dateFin are required');
      }
      
      queryParams.append('date_debut', params.dateDebut);
      queryParams.append('date_fin', params.dateFin);
      
      // Optional parameters
      if (params.page) queryParams.append('page', params.page);
      if (params.limit) queryParams.append('limit', params.limit);
      if (params.orderBy) queryParams.append('order_by', params.orderBy);
      if (params.orderDirection) queryParams.append('order_direction', params.orderDirection);

      const response = await api.get(`/ecritures/recent?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default ecrituresApi; 