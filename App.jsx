import MainRouter from './routes/MainRouter';
import { ThemeProvider } from '@react-navigation/native';
import AbaciToast from './src/components/AbaciToast';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from './src/constants/baseUrl';
import { Appearance, Platform } from 'react-native';
import CookieManager from '@react-native-cookies/cookies';
import { setAuthState } from './store/authSlice';
import { useDispatch, useSelector } from 'react-redux';
import { removeData } from './src/helpers/asyncStorageHelper';
import { clearCookies } from './src/helpers/clearCookieHelper';
import { useEffect, useState } from 'react';
import { fetchProfile } from './src/apis/auth';
import { setIsDarkMode } from './store/themeSlice';
import AbaciLoader from './src/components/AbaciLoader';
import ErrorScreen from './src/components/ErrorScreen';

const App = () => {
  const dispatch = useDispatch();
  const [mounted, setMounted] = useState(false);
  const authToggle = useSelector(state => state.authSlice.authToggle);
  const [profileStatus, setProfileStatus] = useState('loading');

  const fetchProfileData = async () => {
    setProfileStatus('loading');
    try {
      const response = await AsyncStorage.getItem('data');
      const data = response ? JSON.parse(response) : null;

      if (data !== null) {
        if (Platform.OS === 'ios') {
          const storedCookie = await AsyncStorage.getItem('cookie');
          if (storedCookie) {
            const cookie = JSON.parse(storedCookie);
            for (const [key, value] of Object.entries(cookie)) {
              await CookieManager.set(BASE_URL, {
                name: key,
                value: value.value,
                path: '/',
                secure: true,
                httpOnly: false,
              });
            }
          }
        }

        try {
          const profile = await fetchProfile();
          const isPermitted = true;

          if (!isPermitted) {
            await removeData('data');
            dispatch(setAuthState({}));
            return;
          }

          const authData = { ...profile, authenticated: isPermitted };
          dispatch(setAuthState(authData));
          await storeData('data', JSON.stringify(authData));
          setProfileStatus('success');
        } catch (err) {
          await AsyncStorage.removeItem('data');
          clearCookies();
          dispatch(setAuthState({}));
          setProfileStatus('error');
        }
      } else {
        setProfileStatus('success');
      }
    } catch (err) {
      console.log(err);
      setProfileStatus('error');
    }
  };

  useEffect(() => {
    if (mounted) {
      fetchProfileData();
    }
  }, [mounted, authToggle]);

  useEffect(() => {
    setMounted(true);
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      dispatch(setIsDarkMode(colorScheme === 'dark'));
    });

    return () => subscription?.remove();
  }, []);

  return (
    <SafeAreaView style={{ flex: 1}} edges={['left', 'right']}>
      {profileStatus === 'loading' ? (
        <AbaciLoader visible={true} />
      ) : profileStatus === 'success' ? (
        <MainRouter />
      ) : (
        <ErrorScreen onRefresh={fetchProfileData} />
      )}
      <AbaciToast />
    </SafeAreaView>
  );
};

export default App;
