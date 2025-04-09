import { configureStore } from '@reduxjs/toolkit';
import spriteReducer from './spriteSlice';

export const store = configureStore({
  reducer: {
    sprites: spriteReducer
  }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;