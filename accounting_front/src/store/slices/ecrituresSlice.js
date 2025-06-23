import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import ecrituresApi from '../../api/ecrituresApi';

// Async thunks
export const fetchEcritures = createAsyncThunk(
  'ecritures/fetchEcritures',
  async (params, { rejectWithValue }) => {
    try {
      const response = await ecrituresApi.fetchEcritures(params);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const createEcriture = createAsyncThunk(
  'ecritures/createEcriture',
  async (ecritureData, { rejectWithValue }) => {
    try {
      const response = await ecrituresApi.create(ecritureData);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const updateEcriture = createAsyncThunk(
  'ecritures/updateEcriture',
  async ({ id, ecritureData }, { rejectWithValue }) => {
    try {
      const response = await ecrituresApi.update(id, ecritureData);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const deleteEcriture = createAsyncThunk(
  'ecritures/deleteEcriture',
  async (id, { rejectWithValue }) => {
    try {
      await ecrituresApi.delete(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const fetchEcrituresByTiers = createAsyncThunk(
  'ecritures/fetchEcrituresByTiers',
  async ({ tiersId, params }, { rejectWithValue }) => {
    try {
      const response = await ecrituresApi.getByTiers(tiersId, params);
      return { ...response, tiersId };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const fetchBalanceReport = createAsyncThunk(
  'ecritures/fetchBalanceReport',
  async (params, { rejectWithValue }) => {
    try {
      const response = await ecrituresApi.getBalanceReport(params);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const fetchSummary = createAsyncThunk(
  'ecritures/fetchSummary',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await ecrituresApi.getSummary(params);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

const initialState = {
  ecritures: [],
  currentEcriture: null,
  balanceReport: null,
  summary: null,
  loading: false,
  error: null,
  pagination: {
    total: 0,
    totalPages: 0,
    currentPage: 1,
    limit: 10,
    hasNextPage: false,
    hasPreviousPage: false
  },
  filters: {
    dateDebut: null,
    dateFin: null,
    tiersId: null,
    libelle: '',
    searchTerm: '',
    orderBy: 'date_ecriture',
    orderDirection: 'ASC'
  }
};

const ecrituresSlice = createSlice({
  name: 'ecritures',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearEcritures: (state) => {
      state.ecritures = [];
      state.pagination = initialState.pagination;
      state.balanceReport = null;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = initialState.filters;
    },
    setCurrentEcriture: (state, action) => {
      state.currentEcriture = action.payload;
    },
    clearCurrentEcriture: (state) => {
      state.currentEcriture = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch ecritures
      .addCase(fetchEcritures.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEcritures.fulfilled, (state, action) => {
        state.loading = false;
        state.ecritures = action.payload.data;
        state.pagination = action.payload.pagination;
        state.balanceReport = action.payload.balanceReport;
      })
      .addCase(fetchEcritures.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Create ecriture
      .addCase(createEcriture.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createEcriture.fulfilled, (state, action) => {
        state.loading = false;
        state.ecritures.unshift(action.payload.ecriture);
        state.currentEcriture = action.payload.ecriture;
      })
      .addCase(createEcriture.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Update ecriture
      .addCase(updateEcriture.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateEcriture.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.ecritures.findIndex(e => e.id === action.payload.ecriture.id);
        if (index !== -1) {
          state.ecritures[index] = action.payload.ecriture;
        }
        state.currentEcriture = action.payload.ecriture;
      })
      .addCase(updateEcriture.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Delete ecriture
      .addCase(deleteEcriture.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteEcriture.fulfilled, (state, action) => {
        state.loading = false;
        state.ecritures = state.ecritures.filter(e => e.id !== action.payload);
        if (state.currentEcriture?.id === action.payload) {
          state.currentEcriture = null;
        }
      })
      .addCase(deleteEcriture.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch ecritures by tiers
      .addCase(fetchEcrituresByTiers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEcrituresByTiers.fulfilled, (state, action) => {
        state.loading = false;
        state.ecritures = action.payload.data;
        state.pagination = action.payload.pagination;
        state.balanceReport = action.payload.balanceReport;
      })
      .addCase(fetchEcrituresByTiers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch balance report
      .addCase(fetchBalanceReport.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBalanceReport.fulfilled, (state, action) => {
        state.loading = false;
        state.balanceReport = action.payload.balanceReport;
      })
      .addCase(fetchBalanceReport.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch summary
      .addCase(fetchSummary.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSummary.fulfilled, (state, action) => {
        state.loading = false;
        state.summary = action.payload.summary;
      })
      .addCase(fetchSummary.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const {
  clearError,
  clearEcritures,
  setFilters,
  clearFilters,
  setCurrentEcriture,
  clearCurrentEcriture
} = ecrituresSlice.actions;

export default ecrituresSlice.reducer; 