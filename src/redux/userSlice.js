// src/redux/userSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import authService from '../services/authService';

/**
 * Async thunk to register a new user.
 * Calls the authService.register with userData.
 * Returns the response data or rejects with an error message.
 */
export const registerUser = createAsyncThunk(
  'user/registerUser',
  async (userData, thunkAPI) => {
    try {
      const data = await authService.register(userData);
      return data;
    } catch (error) {
      // Return error response data or default error object
      return thunkAPI.rejectWithValue(error.response?.data || { error: 'Registration failed' });
    }
  }
);

/**
 * Async thunk to log in a user.
 * Calls authService.login with user credentials.
 * Returns user data or rejects with an error message.
 */
export const loginUser = createAsyncThunk(
  'user/loginUser',
  async (credentials, thunkAPI) => {
    try {
      const data = await authService.login(credentials);
      return data; // e.g., { message, user: { nickname, id, ... } }
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || { error: 'Login failed' });
    }
  }
);

/**
 * Async thunk to check if the user is authenticated.
 * Calls authService.checkAuth with no arguments.
 * Returns auth status and user info or rejects with error message.
 */
export const checkAuth = createAsyncThunk(
  'user/checkAuth',
  async (_, thunkAPI) => {
    try {
      const data = await authService.checkAuth();
      return data; // e.g., { authenticated: true, user: { nickname, id, ... } }
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || { error: 'Auth check failed' });
    }
  }
);

/**
 * Async thunk to log out the current user.
 * Calls authService.logout.
 * Returns confirmation message or rejects with error message.
 */
export const logoutUser = createAsyncThunk(
  'user/logoutUser',
  async (_, thunkAPI) => {
    try {
      const data = await authService.logout();
      return data; // e.g., { message: 'Logged out successfully' }
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || { error: 'Logout failed' });
    }
  }
);

// Initial state for the user slice
const initialState = {
  nickname: null,
  userId: null,
  firstName: null,
  lastName: null,
  isAdmin: false,
  authenticated: false,
  status: 'idle', // can be 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    // Add synchronous reducers here if needed
  },
  extraReducers: (builder) => {
    builder
      // Handle loginUser lifecycle actions
      .addCase(loginUser.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.authenticated = true;
        state.nickname = action.payload.user?.username || null;
        state.userId = action.payload.user?.user_id || null;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload?.error || 'Login failed';
        state.authenticated = false;
        state.nickname = null;
      })

      // Handle checkAuth lifecycle actions
      .addCase(checkAuth.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.authenticated = action.payload.authenticated || false;
        state.userId = action.payload.user_id || null;
        state.nickname = action.payload.nickname  || null;
        state.firstName = action.payload.first_name || null;
        state.lastName = action.payload.last_name || null;
        state.username = `${action.payload.first_name || ''} ${action.payload.last_name || ''}`.trim();
        state.isAdmin = action.payload.is_admin || false;
        state.error = null;
      })
      .addCase(checkAuth.rejected, (state, action) => {
        state.status = 'failed';
        state.authenticated = false;
        state.nickname = null;
        state.error = action.payload?.error || 'Auth check failed';
      })

      // Handle logoutUser lifecycle actions
      .addCase(logoutUser.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.status = 'idle';
        state.authenticated = false;
        state.nickname = null;
        state.userId = null
        state.error = null;
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload?.error || 'Logout failed';
      });
  },
});

export default userSlice.reducer;
