import { createSlice } from '@reduxjs/toolkit';

interface BaseState {
  initialized: boolean;
}

const initialState: BaseState = {
  initialized: false
};

export const baseSlice = createSlice({
  name: 'base',
  initialState,
  reducers: {
    setInitialized(state, action: { payload: boolean }) {
      state.initialized = action.payload;
    }
  }
});

export const { setInitialized } = baseSlice.actions;
