import { configureStore } from '@reduxjs/toolkit';
import tiersReducer from './slices/tiersSlice';
import ecrituresReducer from './slices/ecrituresSlice';

const store = configureStore({
  reducer: {
    tiers: tiersReducer,
    ecritures: ecrituresReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
});

export default store; 