import React, { useEffect, useState } from 'react';
import { View, StyleSheet, StatusBar, Image, BackHandler } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import BackgroundImage from '../components/BackgroundImage';
import { Colors } from '../constants/customStyles';
import { useSelector } from 'react-redux';
import LoginComponent from '../components/login/LoginComponent';
import RegisterComponent from '../components/login/RegisterComponent';
import OTPComponent from '../components/login/OTPComponent';

export default function LoginScreen() {
  const [currentScreen, setCurrentScreen] = useState('login');
  const isDarkMode = useSelector(state => state.themeSlice.isDarkMode);

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
        <BackgroundImage>
          <View style={styles.logo_container}>
            <Image
              source={require('../assets/images/logo.png')}
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
        </BackgroundImage>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  main_container: {
    flex: 1,
    backgroundColor: Colors.black,
  },
  logo_container: {
    height: '38%',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 10,
  },
  logo: { width: 200, height: 100, resizeMode: 'contain' },
  form_container: {
    width: '100%',
    height: '45%',
    backgroundColor: 'transparent',
    padding: 20
  },
  // container: {
  //   flex: 1,
  //   padding: 24,
  //   justifyContent: 'center',
  //   backgroundColor: '#fff',
  // },
  // title: {
  //   fontSize: 32,
  //   fontWeight: 'bold',
  //   marginBottom: 24,
  //   textAlign: 'center',
  // },
  // input: {
  //   borderWidth: 1,
  //   borderColor: '#ccc',
  //   borderRadius: 6,
  //   padding: 12,
  //   marginBottom: 16,
  // },
});
