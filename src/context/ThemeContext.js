import React, {createContext, useState, useEffect} from 'react';
import {Appearance} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const ThemeContext = createContext();

export const ThemeProvider = ({children}) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const loadTheme = async () => {
      const savedTheme = await AsyncStorage.getItem('theme');
      if (savedTheme !== null) {
        setIsDarkMode(savedTheme === 'dark');
      } else {
        const systemTheme = Appearance.getColorScheme();
        setIsDarkMode(systemTheme === 'dark');
      }
    };

    loadTheme();
  }, []);

  const toggleTheme = async () => {
    const newValue = !isDarkMode;
    setIsDarkMode(newValue);
    await AsyncStorage.setItem('theme', newValue ? 'dark' : 'light');
  };

  return (
    <ThemeContext.Provider value={{isDarkMode, toggleTheme}}>
      {children}
    </ThemeContext.Provider>
  );
};
