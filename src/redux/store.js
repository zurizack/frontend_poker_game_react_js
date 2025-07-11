// src/redux/store.js
import { configureStore } from '@reduxjs/toolkit';
import userReducer from './userSlice';
import tableReducer from './tableSlice';

/**
 * Configure and create the Redux store.
 * Registers the user reducer under the 'user' slice of state.
 */
export const store = configureStore({
  reducer: {
    user: userReducer,
    table: tableReducer,
  },
});
