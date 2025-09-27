import React, { createContext, useContext, useEffect } from 'react';
import axios from 'axios';
import { storeData } from '../helpers/asyncStorageHelper';
import { BASE_URL } from '../constants/baseUrl';
import { useDispatch, useSelector } from 'react-redux';
import { setAuthState } from '../../store/authSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchCurrentSSID } from '../helpers/wifiHelper';
// import { logoutUser } from '../apis/authentication';
import { clearCookies } from '../helpers/clearCookieHelper';

// Create axios instances outside the component so they can be exported
export const authAxios = axios.create({
  baseURL: BASE_URL,
  timeout: 5000,
  Accept: 'application/json',
  'Content-Type': 'application/json',
  withCredentials: true,
});

export const publicAxios = axios.create({
  baseURL: BASE_URL,
  timeout: 5000,
});

// Global variable to store current auth state for the interceptor
let currentAuthState = { authenticated: false };
let currentDispatch = null;
let globalShowToast = null;
let isForceLogoutInProgress = false;

// Set up the interceptor outside the component so it works immediately
authAxios.interceptors.request.use(
  async config => {
    // If force logout is in progress, cancel all requests
    if (isForceLogoutInProgress) {
      throw new axios.Cancel('Force logout in progress - request cancelled');
    }

    if (currentAuthState.authenticated) {
      try {
        const profileUrl = `${BASE_URL}users/profile/`;
        const response = await axios.get(profileUrl, {
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            version_code: '1.0.0',
          },
          withCredentials: true,
        });

        // const permitted_ssid = response?.data?.permitted_ssid || [];
        // const ssid = await fetchCurrentSSID();
        // const ssid = 'Abaci_Transit'
        // const isPermitted = permitted_ssid.includes(ssid);

        // if (!isPermitted) {
        //   // Set flag to prevent other requests
        //   // isForceLogoutInProgress = true;

        //   // Force logout
        //   if (currentDispatch) {
        //     currentDispatch(setAuthState({}));
        //     // await logoutUser();
        //     AsyncStorage.removeItem('data');
        //     clearCookies();
        //   }

        //   // Show toast message
        //   if (globalShowToast) {
        //     globalShowToast('Please connect to an authorized WiFi network', 'long', 'error');
        //   }

        //   // Cancel this request
        //   throw new axios.Cancel('SSID not permitted - user force logged out');
        // } else {
        // const new_token = response?.headers['set-cookie']?.[0]?.split(';')[0]?.split('token=')?.[1];
        const updatedUser = {
          ...response.data,
          authenticated: true,
          // accessToken: new_token,
        };

        currentDispatch(setAuthState(updatedUser));
        storeData('data', JSON.stringify(updatedUser));
        // }
      } catch (error) {
        if (axios.isCancel(error)) {
          throw error; // Re-throw cancel errors
        }
        // If profile check fails, it might be due to unauthorized WiFi
      }
    }

    // if (!config.headers.Authorization && currentAuthState.access) {
    //   config.headers.Authorization = `Bearer ${currentAuthState.access}`;
    // }

    return config;
  },
  error => {
    if (axios.isCancel(error)) {
      return Promise.reject(error);
    }
    currentDispatch?.(setAuthState({}));
    AsyncStorage.removeItem('data');
    clearCookies();
    return Promise.reject(error);
  },
);

// Add response interceptor to handle 401 errors
authAxios.interceptors.response.use(
  response => {
    return response;
  },
  async error => {
    if (error.response?.status === 401) {
      // If we get a 401, it means the user is not authenticated
      // This could be due to unauthorized WiFi or expired token
      if (!isForceLogoutInProgress) {
        isForceLogoutInProgress = true;

        // Clear auth state and storage
        if (currentDispatch) {
          currentDispatch(setAuthState({}));
        }
        AsyncStorage.removeItem('data');
        clearCookies();

        // Show toast message about WiFi
        // if (globalShowToast) {
        //   globalShowToast('Please connect to an authorized wifi', 'long', 'warning');
        // }
      }
      return Promise.reject(error);
    }
    return Promise.reject(error);
  },
);

const AxiosContext = createContext();
const { Provider } = AxiosContext;

const AxiosProvider = ({ children }) => {
  const authState = useSelector(state => state.authSlice.authState);
  const dispatch = useDispatch();

  // Update the global auth state and dispatch for the interceptor
  useEffect(() => {
    currentAuthState = authState;
    currentDispatch = dispatch;

    // Reset force logout flag when auth state changes
    if (!authState.authenticated) {
      isForceLogoutInProgress = false;
    }
  }, [authState, dispatch]);

  // Function to set the global toast function
  // const setGlobalToast = (showToastFunction) => {
  //   globalShowToast = showToastFunction;
  // };

  return (
    <Provider
      value={{
        authAxios,
        publicAxios,
        // setGlobalToast,
      }}
    >
      {children}
    </Provider>
  );
};

export { AxiosContext, AxiosProvider };
