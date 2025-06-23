import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { tiersApi } from '../../api/tiersApi';

// Actions asynchrones
export const fetchAllTiers = createAsyncThunk(
  'tiers/fetchAllTiers',
  async (params, { rejectWithValue }) => {
    try {
      const response = await tiersApi.getAllTiers(params);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Erreur lors de la récupération des tiers');
    }
  }
);

export const fetchTiersByType = createAsyncThunk(
  'tiers/fetchTiersByType',
  async ({ type, params }, { rejectWithValue }) => {
    try {
      const response = await tiersApi.getTiersByType(type, params);
      return { type, data: response };
    } catch (error) {
      return rejectWithValue(error.message || 'Erreur lors de la récupération des tiers');
    }
  }
);

export const fetchTierById = createAsyncThunk(
  'tiers/fetchTierById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await tiersApi.getTierById(id);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Erreur lors de la récupération du tiers');
    }
  }
);

export const createTier = createAsyncThunk(
  'tiers/createTier',
  async (tierData, { rejectWithValue }) => {
    try {
      const response = await tiersApi.createTier(tierData);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Erreur lors de la création du tiers');
    }
  }
);

export const updateTier = createAsyncThunk(
  'tiers/updateTier',
  async ({ id, tierData }, { rejectWithValue }) => {
    try {
      const response = await tiersApi.updateTier(id, tierData);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Erreur lors de la mise à jour du tiers');
    }
  }
);

export const deleteTier = createAsyncThunk(
  'tiers/deleteTier',
  async (id, { rejectWithValue }) => {
    try {
      await tiersApi.deleteTier(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.message || 'Erreur lors de la suppression du tiers');
    }
  }
);

export const searchTiers = createAsyncThunk(
  'tiers/searchTiers',
  async ({ searchTerm, params }, { rejectWithValue }) => {
    try {
      const response = await tiersApi.searchTiers(searchTerm, params);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Erreur lors de la recherche');
    }
  }
);

// Thunk pour récupérer les balances clients/fournisseurs
export const fetchBalances = createAsyncThunk(
  'tiers/fetchBalances',
  async (params, { rejectWithValue }) => {
    try {
      const response = await tiersApi.getBalances(params);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Erreur lors de la récupération des balances');
    }
  }
);

// État initial
const initialState = {
  tiers: [],
  currentTier: null,
  loading: false,
  error: null,
  searchResults: [],
  filters: {
    type: null,
    searchTerm: '',
  },
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
    currentPage: 1,
    hasNextPage: false,
    hasPreviousPage: false
  },
  balances: [],
  balancesPagination: {
    total: 0,
    totalPages: 0,
    currentPage: 1,
    limit: 10,
    hasNextPage: false,
    hasPreviousPage: false
  },
};

// Slice
const tiersSlice = createSlice({
  name: 'tiers',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentTier: (state) => {
      state.currentTier = null;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {
        type: null,
        searchTerm: '',
      };
    },
    setPagination: (state, action) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchAllTiers
      .addCase(fetchAllTiers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllTiers.fulfilled, (state, action) => {
        state.loading = false;
        state.tiers = action.payload.data || [];
        if (action.payload.pagination) {
          state.pagination = action.payload.pagination;
        }
      })
      .addCase(fetchAllTiers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // fetchTiersByType
      .addCase(fetchTiersByType.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTiersByType.fulfilled, (state, action) => {
        state.loading = false;
        state.tiers = action.payload.data.data || action.payload.data;
        if (action.payload.data.pagination) {
          state.pagination = action.payload.data.pagination;
        }
      })
      .addCase(fetchTiersByType.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // fetchTierById
      .addCase(fetchTierById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTierById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentTier = action.payload.tier;
      })
      .addCase(fetchTierById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // createTier
      .addCase(createTier.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createTier.fulfilled, (state, action) => {
        state.loading = false;
        const newTier = action.payload.tier;
        state.tiers = [newTier, ...state.tiers];
        state.currentTier = newTier;
      })
      .addCase(createTier.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // updateTier
      .addCase(updateTier.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateTier.fulfilled, (state, action) => {
        state.loading = false;
        const updatedTier = action.payload.tier;
        const index = state.tiers.findIndex(tier => tier.id === updatedTier.id);
        if (index !== -1) {
          state.tiers[index] = updatedTier;
        }
        state.currentTier = updatedTier;
      })
      .addCase(updateTier.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // deleteTier
      .addCase(deleteTier.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteTier.fulfilled, (state, action) => {
        state.loading = false;
        const deletedId = action.payload;
        state.tiers = state.tiers.filter(tier => tier.id !== deletedId);
        if (state.currentTier && state.currentTier.id === deletedId) {
          state.currentTier = null;
        }
      })
      .addCase(deleteTier.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // searchTiers
      .addCase(searchTiers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchTiers.fulfilled, (state, action) => {
        state.loading = false;
        state.searchResults = action.payload.data || action.payload;
      })
      .addCase(searchTiers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // fetchBalances
      .addCase(fetchBalances.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBalances.fulfilled, (state, action) => {
        state.loading = false;
        state.balances = action.payload.data || [];
        state.balancesPagination = action.payload.pagination || initialState.balancesPagination;
      })
      .addCase(fetchBalances.rejected, (state, action) => {
        state.loading = false;
        if (action.payload && typeof action.payload === 'string' && action.payload.includes('Tier not found')) {
          state.balances = [];
          state.balancesPagination = initialState.balancesPagination;
          state.error = null;
        } else {
          state.error = action.payload;
        }
      });
  },
});

export const { 
  clearError, 
  clearCurrentTier, 
  setFilters, 
  clearFilters, 
  setPagination 
} = tiersSlice.actions;

export default tiersSlice.reducer; 