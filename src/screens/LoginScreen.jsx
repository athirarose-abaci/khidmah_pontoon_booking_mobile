import React, { useEffect, useState, useMemo } from 'react';
import { View, StyleSheet, StatusBar, Image, BackHandler, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import BackgroundImage from '../components/BackgroundImage';
import { Colors } from '../constants/customStyles';
import { useSelector } from 'react-redux';
import LoginComponent from '../components/login/LoginComponent';
import RegisterComponent from '../components/login/RegisterComponent';
import OTPComponent from '../components/login/OTPComponent';
 

const LoginScreen = () => {
  const [currentScreen, setCurrentScreen] = useState('login');
  const isDarkMode = useSelector(state => state.themeSlice.isDarkMode);

  // Memoize styles to prevent unnecessary re-renders
  const scrollViewContentStyle = useMemo(() => ({
    flexGrow: 1,
    paddingBottom: currentScreen === 'register' ? 180 : 0,
    minHeight: '100%'
  }), [currentScreen]);

  const logoContainerStyle = useMemo(() => [
    styles.logo_container,
    currentScreen === 'register' && { marginTop: 10 },
    currentScreen === 'otp' && { marginTop: -50 }
  ], [currentScreen]);

  useEffect(() => {
    const subscription = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        if (currentScreen === 'register' || currentScreen === 'otp') {
          setCurrentScreen('login');
          return true;
        }
        return false;
      },
    );
    return () => subscription.remove();
  }, [currentScreen]);

  return (
    <SafeAreaView style={styles.safeArea} edges={['left', 'right', 'bottom']}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />
      <View style={styles.main_container}>
        <View style={styles.bg_container} pointerEvents="none">
          <BackgroundImage source={require('../assets/images/login_bg.png')} />
        </View>
        <KeyboardAvoidingView
          style={styles.kb_scroll}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
        >
          <ScrollView
            style={styles.scrollView}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={scrollViewContentStyle}
            showsVerticalScrollIndicator={false}
            overScrollMode="never"
            bounces={false}
            scrollEventThrottle={16}
          >
            <View style={logoContainerStyle}>
              <Image
                source={require('../assets/images/khidmah_logo_dark.png')}
                style={styles.logo}
              />
            </View>
            <View style={styles.form_container}>
              {currentScreen === 'login' ? (
                <LoginComponent
                  key={'login'}
                  setCurrentScreen={setCurrentScreen}
                />
              ) : currentScreen === 'register' ? (
                <RegisterComponent
                  key={'register'}
                  setCurrentScreen={setCurrentScreen}
                />
              ) : (
                <OTPComponent 
                  key={'otp'} 
                  setCurrentScreen={setCurrentScreen} 
                />
              )}
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </SafeAreaView>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  main_container: {
    flex: 1,
    backgroundColor: Colors.black,
  },
  bg_container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0,
  },
  logo_container: {
    height: '38%',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 15,
  },
  logo: { width: 200, height: 100, resizeMode: 'contain' },
  form_container: {
    width: '100%',
    minHeight: '45%',
    backgroundColor: 'transparent',
    paddingHorizontal: 20,
    paddingVertical: 20,
    marginTop: 0,
    justifyContent: 'center',
  },
  kb_scroll: {
    flex: 1,
    backgroundColor: 'transparent',
    position: 'relative',
    zIndex: 1,
  },
  scrollView: {
    backgroundColor: 'transparent',
    flex: 1,
  },
});

