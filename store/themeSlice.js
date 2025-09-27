import { createSlice } from '@reduxjs/toolkit';
import { Appearance } from 'react-native';

const themeSlice = createSlice({
  name: 'theme',
  initialState: {
    isDarkMode: Appearance.getColorScheme() === 'dark',
  },
  reducers: {
    setIsDarkMode: (state, action) => {
      state.isDarkMode = action.payload;
    },
  },
});

export const { setIsDarkMode } = themeSlice.actions;
export default themeSlice.reducer;
