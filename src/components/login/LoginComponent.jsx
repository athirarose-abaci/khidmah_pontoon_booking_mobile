import React, { useState, useContext } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Dimensions, ActivityIndicator } from 'react-native';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import LinearGradient from 'react-native-linear-gradient';
import { LiquidGlassView } from '@callstack/liquid-glass';
import { Colors } from '../../constants/customStyles';
import { userLogin } from '../../apis/auth';
import Error from '../../helpers/Error';
import { storeData } from '../../helpers/asyncStorageHelper';
import { ToastContext } from '../../context/ToastContext';

const { width, height } = Dimensions.get('window');

const LoginComponent = ({ setCurrentScreen }) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const toastContext = useContext(ToastContext);

  const handleLogin = async () => {
    const newErrors = {};
    if (!email || email.trim().length === 0) {
      newErrors.email = 'Please enter a valid email address';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    setErrors({});
    try {
      const response = await userLogin(email.trim());
      if (response?.status === 200) {
        await storeData('registeredEmail', email.trim());
        setCurrentScreen('otp');
      }
    } catch (error) {
      const errMsg = Error(error);
      toastContext.showToast(errMsg || 'Login failed, please try again', 'long', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.screen}>
      <LiquidGlassView
        blurAmount={25}                      
        color="rgba(255,255,255,0.15)"       
        borderRadius={30}                    
        style={styles.glassContainer}
      >
        <Text style={styles.title}>Login</Text>
        <Text style={styles.subTitle}>Sign in to manage reservations.</Text>

        <View style={styles.inputRow}>
          <Ionicons name="mail-open-outline" size={22} color={Colors.primary} style={{ marginRight: 15 }} />
          <TextInput
            placeholder="Email Address"
            placeholderTextColor={Colors.font_gray}
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              if (errors.email) {
                setErrors(prev => ({ ...prev, email: '' }));
              }
            }}
            autoCapitalize="none"
            keyboardType="email-address"
            style={[styles.input, errors.email && styles.inputError]}
          />
        </View>
        {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}

        <TouchableOpacity
          onPress={handleLogin}
          activeOpacity={0.8}
          style={{ marginTop: 28 }}
          disabled={isLoading}
        >
          <LinearGradient
            colors={['#75C8AD', '#61C8D5']}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={styles.btnGradient}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.btnText}>Login with OTP</Text>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </LiquidGlassView>
      <TouchableOpacity
        onPress={() => setCurrentScreen('register')}
        style={styles.newUserContainer}
      >
        <Text style={styles.newUserText}>
          New User? <Text style={styles.createAccountText}>Create an Account</Text>
        </Text>
      </TouchableOpacity>
    </View>
  );
}

export default LoginComponent;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  title: {
    fontSize: 32,
    fontFamily: 'Poppins-SemiBold',
    color: Colors.white,
  },
  subTitle: {
    fontSize: 15,
    color: Colors.primary,
    marginBottom: 34,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    color: Colors.white,
    fontSize: 16,
    borderBottomWidth: 1,
    borderColor: Colors.border_line,
    paddingBottom: 8,
  },
  inputError: {
    borderColor: Colors.error,
    borderBottomWidth: 2,
  },
  errorText: {
    color: Colors.error,
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    marginLeft: 40,
    marginTop: 6,
  },
  btnGradient: {
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 25,
    width: '75%',
    alignSelf: 'center',
    borderRadius: 12,
    borderLeftWidth: 2,
    borderRightWidth: 1,
    borderTopWidth: 1,
    borderColor: 'rgba(255,255,255,0.95)', 
  },
  btnText: {
    color: Colors.white,
    fontSize: 16,
    fontFamily: 'Poppins-Regular'
  },
  newUserContainer: {
    marginTop: 20,
  },
  newUserText: {
    color: Colors.font_gray,
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
  },
  createAccountText: {
    color: Colors.primary,
    fontFamily: 'Poppins-Medium',
    fontWeight: 'bold',
  },
});
