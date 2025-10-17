import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import LinearGradient from 'react-native-linear-gradient';
import { LiquidGlassView } from '@callstack/liquid-glass';
import { Colors } from '../constants/customStyles';
import BackgroundImage from './BackgroundImage';
import { setAuthToggle } from '../../store/authSlice';
import { fetchSystemStatus } from '../apis/auth';
import AbaciLoader from './AbaciLoader';

const { width, height } = Dimensions.get('window');

const ErrorScreen = ({ onRefresh }) => {
  const [isLoading, setIsLoading] = useState(false);
  
  const isDarkMode = useSelector(state => state.themeSlice.isDarkMode);
  const dispatch = useDispatch();
  const authToggle = useSelector(state => state.authSlice.authToggle);


  const handleRetry = async () => {
    setIsLoading(true);
    try {
      const response = await fetchSystemStatus();
      if(response?.status === 'success' && response?.details?.admin_users_exist){
        dispatch(setAuthToggle(!authToggle))
      }else {
        dispatch(setAuthToggle(!authToggle))
      }
    } catch (error) {
      dispatch(setAuthToggle(!authToggle))
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <BackgroundImage source={require('../assets/images/login_bg.png')}>
      <View style={styles.container}>
        <LiquidGlassView
          blurAmount={25}
          color="rgba(255,255,255,0.15)"
          borderRadius={30}
          style={styles.glassContainer}
        >
          <View style={styles.content}>
            <View style={styles.iconContainer}>
              <Ionicons 
                name="warning-outline" 
                size={60} 
                color={Colors.error} 
              />
            </View>
            
            <Text style={styles.title}>
              Oops! Something went wrong
            </Text>
            
            <Text style={styles.message}>
              We couldn't load your profile. Please check your connection and try again.
            </Text>
            
            <TouchableOpacity
              onPress={handleRetry}
              activeOpacity={0.8}
              style={styles.buttonContainer}
            >
              <LinearGradient
                colors={['#75C8AD', '#61C8D5']}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
                style={styles.btnGradient}
              >
                <Ionicons name="refresh" size={20} color={Colors.white} style={{ marginRight: 8 }} />
                <Text style={styles.btnText}>Try Again</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </LiquidGlassView>
        <AbaciLoader visible={isLoading} />
      </View>
    </BackgroundImage>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  glassContainer: {
    width: width * 0.9,
    paddingVertical: height * 0.04,
    paddingHorizontal: width * 0.08,
    borderRadius: 30,
    overflow: 'hidden',
    alignSelf: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderLeftWidth: 2,
    borderTopWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    marginBottom: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 22,
    fontFamily: 'Poppins-SemiBold',
    color: Colors.white,
    textAlign: 'center',
    marginBottom: 0,
  },
  message: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: Colors.font_gray,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 15,
    paddingHorizontal: 10,
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
  },
  btnGradient: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    borderLeftWidth: 2,
    borderRightWidth: 1,
    borderTopWidth: 1,
    borderColor: 'rgba(255,255,255,0.95)',
    width: '100%',
    marginTop: 15,
  },
  btnText: {
    color: Colors.white,
    fontSize: 16,
    fontFamily: 'Poppins-Medium',
  },
});

export default ErrorScreen;
