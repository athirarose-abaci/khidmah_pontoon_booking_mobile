import {createSlice} from '@reduxjs/toolkit';

const initialState = {
  isConnected: false,
  lastPing: null,
  error: null,
};

const socketSlice = createSlice({
  name: 'socket',
  initialState,
  reducers: {
    setConnectionStatus: (state, action) => {
      state.isConnected = action.payload;
    },
    setLastPing: (state, action) => {
      state.lastPing = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
  },
});

export const {setConnectionStatus, setLastPing, setError} = socketSlice.actions;
export default socketSlice.reducer;
