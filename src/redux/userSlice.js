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
      return data; // e.g., { message: 'User registered successfully', user: { ... } }
    } catch (error) {
      // Return error response data (e.g., { message: 'Username already exists' })
      return thunkAPI.rejectWithValue(error.response?.data || { message: 'Registration failed' });
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
      return data; // e.g., { message, user: { id, username, nickname, balance, is_admin, ... } }
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || { message: 'Login failed' });
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
      return data; // e.g., { authenticated: true, user: { id, username, nickname, balance, is_admin, ... } }
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || { message: 'Auth check failed' });
    }
  }
);

/**
 * Async thunk to log out the current user.
 * @returns {Promise<Object>} - Response data confirming logout.
 */
export const logoutUser = createAsyncThunk(
  'user/logoutUser',
  async (_, thunkAPI) => {
    try {
      const data = await authService.logout();
      return data; // e.g., { message: 'Logged out successfully' }
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.message || 'Logout failed'); 
    }
  }
);

// Initial state for the user slice
const initialState = {
  username: null, 
  nickname: null, 
  userId: null,
  firstName: null,
  lastName: null,
  balance: null, 
  isAdmin: false,
  authenticated: false,
  status: 'idle', 
  error: null,
  registrationMessage: null, // ✅ New field for registration feedback
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    // Reducer to clear registration message
    clearRegistrationMessage: (state) => { // ✅ New reducer
      state.registrationMessage = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Handle registerUser lifecycle actions
      .addCase(registerUser.pending, (state) => {
        state.status = 'loading';
        state.error = null;
        state.registrationMessage = null; // Clear previous messages
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.error = null;
        state.registrationMessage = action.payload.message || 'Registration successful!'; // ✅ Store success message
        // Do NOT set authenticated here; user needs to log in after registration
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload?.message || 'Registration failed'; // ✅ Store error message
        state.registrationMessage = action.payload?.message || 'Registration failed'; // ✅ Store error message for display
      })

      // Handle loginUser lifecycle actions
      .addCase(loginUser.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.authenticated = true;
        state.username = action.payload.user?.username || null; 
        state.nickname = action.payload.user?.nickname || null; 
        state.userId = action.payload.user?.id || null; 
        state.firstName = action.payload.user?.first_name || null; 
        state.lastName = action.payload.user?.last_name || null; 
        state.balance = action.payload.user?.balance || null; 
        state.isAdmin = action.payload.user?.is_admin || false; 
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload?.message || action.payload?.error || 'Login failed'; 
        state.authenticated = false;
        state.username = null; 
        state.nickname = null; 
        state.userId = null;
        state.firstName = null;
        state.lastName = null;
        state.balance = null; 
        state.isAdmin = false;
      })

      // Handle checkAuth lifecycle actions
      .addCase(checkAuth.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.authenticated = action.payload.authenticated || false;
        if (action.payload.authenticated && action.payload.user) {
          state.userId = action.payload.user.id || null; 
          state.username = action.payload.user.username || null; 
          state.nickname = action.payload.user.nickname || null; 
          state.firstName = action.payload.user.first_name || null; 
          state.lastName = action.payload.user.last_name || null; 
          state.balance = action.payload.user.balance || null; 
          state.isAdmin = action.payload.user.is_admin || false; 
        } else {
          state.userId = null;
          state.username = null;
          state.nickname = null; 
          state.firstName = null;
          state.lastName = null;
          state.balance = null;
          state.isAdmin = false;
        }
        state.error = null;
      })
      .addCase(checkAuth.rejected, (state, action) => {
        state.status = 'failed';
        state.authenticated = false;
        state.username = null; 
        state.nickname = null; 
        state.userId = null;
        state.firstName = null;
        state.lastName = null;
        state.balance = null; 
        state.isAdmin = false;
        state.error = action.payload?.message || action.payload?.error || 'Auth check failed'; 
      })

      // Handle logoutUser lifecycle actions
      .addCase(logoutUser.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.status = 'idle';
        state.authenticated = false;
        state.username = null; 
        state.nickname = null; 
        state.userId = null;
        state.firstName = null;
        state.lastName = null;
        state.balance = null; 
        state.isAdmin = false;
        state.error = null;
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload?.message || action.payload?.error || 'Logout failed'; 
      });
  },
});

export const { clearRegistrationMessage } = userSlice.actions; // ✅ Export new action
export default userSlice.reducer;
