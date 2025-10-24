import MainRouter from './routes/MainRouter';
import AbaciToast from './src/components/AbaciToast';
import { BASE_URL } from './src/constants/baseUrl';
import { setAuthState } from './store/authSlice';
import { removeData, storeData } from './src/helpers/asyncStorageHelper';
import AbaciLoader from './src/components/AbaciLoader';
import { fetchProfile } from './src/apis/auth';
import { fetchSystemStatus } from './src/apis/system';
import { useEffect, useState } from 'react';
import { setIsDarkMode } from './store/themeSlice';
import ErrorScreen from './src/screens/ErrorScreen';
import { clearCookies } from './src/helpers/clearCookieHelper';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Appearance, Platform } from 'react-native';
import CookieManager from '@react-native-cookies/cookies';
import { useDispatch, useSelector } from 'react-redux';

const App = () => {
  const dispatch = useDispatch();
  const [mounted, setMounted] = useState(false);
  const authToggle = useSelector(state => state.authSlice.authToggle);
  const [systemStatus, setSystemStatus] = useState('loading');

  const fetchProfileData = async () => {
    setSystemStatus('loading');
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
            setSystemStatus('success');
            return;
          }

          const authData = { ...profile?.user, authenticated: isPermitted };
          dispatch(setAuthState(authData));
          await storeData('data', JSON.stringify(authData));
          setSystemStatus('success');
        } catch (err) {
          await AsyncStorage.removeItem('data');
          clearCookies();
          dispatch(setAuthState({}));
          setSystemStatus('success');
        }
      } else {
        setSystemStatus('success');
      }
    } catch (err) {
      setSystemStatus('success');
    }
  };

  const fetchSystemStatusData = async () => {
    setSystemStatus('loading');
    try {
      const res = await fetchSystemStatus();
      if (res?.status !== 'success' && !res?.details?.admin_users_exist) {
        return setSystemStatus('error');
      }
    
      await fetchProfileData();
    } catch (error) {
      clearCookies();
      setSystemStatus('error');
    }
  }

  useEffect(() => {
    if (mounted) {
      fetchSystemStatusData();
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
      {systemStatus === 'error' ? (
        <ErrorScreen />
      ) : systemStatus === 'success' ? (
        <MainRouter />
      ) : (
        <AbaciLoader visible={true} />
      )}
      <AbaciToast />
    </SafeAreaView>
  );
};

export default App;
