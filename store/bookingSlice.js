import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  bookings: [],
  loading: false,
  error: null,
};

const bookingSlice = createSlice({
  name: 'bookings',
  initialState,
  reducers: {
    setBookings: (state, action) => {
      state.bookings = action.payload;
      state.loading = false;
      state.error = null;
    },
    addBookings: (state, action) => {
      state.bookings = [...state.bookings, ...action.payload];
      state.loading = false;
      state.error = null;
    },
    updateBooking: (state, action) => {
      const updated = action.payload;
      state.bookings = state.bookings.map(existing => {
        if (existing.id !== updated.id) return existing;
        return {
          ...existing,
          ...updated,
          boat: {
            ...(existing.boat || {}),
            ...(updated.boat || {}),
          },
        };
      });
      state.loading = false;
      state.error = null;
    },
    clearBookings: (state) => {
      state.bookings = [];
      state.loading = false;
      state.error = null;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
  },
});

export const { setBookings, addBookings, clearBookings, setLoading, setError, updateBooking } = bookingSlice.actions;
export default bookingSlice.reducer;
