// src/redux/tableSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../axiosConfig";

const initialState = {
  tableId: null,
  tableState: null,
  privateHand: [],
  currentTurn: null,
  tableInfo: null,
  tableInfoStatus: 'idle',
  tableInfoError: null,
};

export const fetchTableInfo = createAsyncThunk(
  'table/fetchTableInfo',
  async (tableId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/game/table/${tableId}`);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

const tableSlice = createSlice({
  name: "table",
  initialState,
  reducers: {
    updateTableState: (state, action) => {
      state.tableState = action.payload;
      state.tableId = action.payload.id;
    },
    setPrivateHand: (state, action) => {
      state.privateHand = action.payload;
    },
    setCurrentTurn: (state, action) => {
      state.currentTurn = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTableInfo.pending, (state) => {
        state.tableInfoStatus = 'loading';
        state.tableInfoError = null;
      })
      .addCase(fetchTableInfo.fulfilled, (state, action) => {
        state.tableInfoStatus = 'succeeded';
        state.tableInfo = action.payload;
      })
      .addCase(fetchTableInfo.rejected, (state, action) => {
        state.tableInfoStatus = 'failed';
        state.tableInfoError = action.payload;
      });
  }
});

export const {
  updateTableState,
  setPrivateHand,
  setCurrentTurn,
} = tableSlice.actions;

export default tableSlice.reducer;
