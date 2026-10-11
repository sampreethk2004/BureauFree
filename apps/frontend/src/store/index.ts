import { configureStore } from '@reduxjs/toolkit';
import { baseSlice } from './slices/baseSlice';

export const store = configureStore({
  reducer: {
    base: baseSlice.reducer
  }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
