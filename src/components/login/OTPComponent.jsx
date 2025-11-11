import React, { useContext, useEffect, useMemo, useState, useCallback } from 'react';
import { View, TextInput, Text, TouchableOpacity, StyleSheet, Dimensions, ActivityIndicator } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { LiquidGlassView } from '@callstack/liquid-glass';
import { Colors } from '../../constants/customStyles';
import { verifyOTP, userLogin } from '../../apis/auth';
import { ToastContext } from '../../context/ToastContext';
import { getData, storeData } from '../../helpers/asyncStorageHelper';
import { useDispatch } from 'react-redux';
import { setAuthState } from '../../../store/authSlice';
import Error from '../../helpers/Error';

const { width, height } = Dimensions.get('window');
const OTP_LENGTH = 4;

const OTPComponent = () => {
	const [otpDigits, setOtpDigits] = useState(Array(OTP_LENGTH).fill(""));
	const inputRefs = useMemo(() => Array.from({ length: OTP_LENGTH }, () => React.createRef()), []);
  
  const [isConfirmingOTP, setIsConfirmingOTP] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [countdown, setCountdown] = useState(59);
  const [isResending, setIsResending] = useState(false);
  const [canResend, setCanResend] = useState(false);
  
  const dispatch = useDispatch();
  const toastContext = useContext(ToastContext);

  useEffect(() => {
    (async () => {
      const email = await getData('registeredEmail');
      if (email) setRegisteredEmail(email);
    })();
  }, []);

  // Countdown timer effect
  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
    } else {
      setCanResend(true);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleChange = useCallback((text, index) => {
		const sanitized = text.replace(/\D/g, "").slice(0, 1);
		const nextDigits = [...otpDigits];
		nextDigits[index] = sanitized;
		setOtpDigits(nextDigits);
		if (sanitized && index < OTP_LENGTH - 1) {
			inputRefs[index + 1]?.current?.focus();
		}  
  }, [otpDigits, inputRefs]);

	const handleKeyPress = useCallback((e, index) => {
		if (e.nativeEvent.key !== "Backspace") return;
		if (otpDigits[index]) {
			const next = [...otpDigits];
			next[index] = "";
			setOtpDigits(next);
			return;
		}
		if (index > 0) {
			const next = [...otpDigits];
			next[index - 1] = "";
			setOtpDigits(next);
			inputRefs[index - 1]?.current?.focus();
		}
	}, [otpDigits, inputRefs]);

  const composedOtp = otpDigits.join('');

  const handleConfirmOTP = async () => {
    if (composedOtp.length !== OTP_LENGTH) {
			toastContext.showToast('Please enter all 4 digits', 'short', 'error');
			return;
		}
    const userEmail = await getData('registeredEmail');
    if (!userEmail) {
			toastContext.showToast('User information not found', 'short', 'error');
			return;
		}

    setIsConfirmingOTP(true);
    try {
      const response = await verifyOTP(userEmail, composedOtp);

      if(response?.status === 200) {
        dispatch(setAuthState({...response?.data?.user, authenticated: true }));
        await storeData('data', JSON.stringify({...response?.data?.user, authenticated: true }));
      }
    } catch (error) {
      const err_msg = Error(error);
      toastContext.showToast(err_msg, 'short', 'error');
    } finally {
      setIsConfirmingOTP(false);
    }
  }

  const handleResendOTP = async () => {
    if (!canResend) return;
    
    const userEmail = await getData('registeredEmail');
    if (!userEmail) {
      toastContext.showToast('User information not found', 'short', 'error');
      return;
    }

    setIsResending(true);
    try {
      const response = await userLogin(userEmail);
      if (response?.status === 200) {
        toastContext.showToast('OTP sent successfully', 'short', 'success');
        setCountdown(59);
        setCanResend(false);
      }
    } catch (error) {
      const err_msg = Error(error);
      toastContext.showToast(err_msg, 'short', 'error');
    } finally {
      setIsResending(false);
    }
  }

  return (
    <View style={styles.screen}>
      <LiquidGlassView
        blurAmount={15}
        color="rgba(255,255,255,0.10)"
        borderRadius={30}
        style={styles.otpContainer}
        shouldRasterizeIOS={true}
        renderToHardwareTextureAndroid={true}
      >
        <View style={styles.headerContainer}>
          <Text style={styles.title}>OTP{'\n'}Verification</Text>
          <Text style={styles.subGray}>We’ve sent OTP to</Text>
          <Text style={styles.subPrimary}>{registeredEmail || ''}</Text>
          <Text style={styles.subGray}>Enter the OTP below to verify</Text>
        </View>

        <View style={styles.otpRow}>
          {otpDigits.map((digit, index) => (
            <LiquidGlassView
              key={index}
              blurAmount={10}
              color="rgba(255,255,255,0.12)"
              borderRadius={12}
              style={styles.otpBox}
              shouldRasterizeIOS={true}
              renderToHardwareTextureAndroid={true}
            >
              <TextInput
                value={digit}
                onChangeText={(text) => handleChange(text, index)}
                keyboardType="numeric"
                maxLength={1}
                style={styles.otpInput}
                ref={inputRefs[index]}
                autoFocus={index === 0}
                onKeyPress={(e) => handleKeyPress(e, index)}
              />
            </LiquidGlassView>
          ))}
        </View>

        <TouchableOpacity
          onPress={handleConfirmOTP}
          disabled={isConfirmingOTP}
          activeOpacity={0.8}
          style={{ marginTop: 5 }}
        >
          <LinearGradient
            colors={['#75C8AD', '#61C8D5']}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={styles.btnGradient}
          >
            {isConfirmingOTP ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.btnText}>Proceed</Text>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </LiquidGlassView>
      <TouchableOpacity 
        style={styles.newUserContainer}
        onPress={handleResendOTP}
        disabled={!canResend || isResending}
        activeOpacity={canResend ? 0.7 : 1}
      >
        <Text style={styles.newUserText}>Don't receive the mail?</Text>
        {canResend ? (
          <Text style={styles.resendText}>Resend Code</Text>
        ) : (
          <Text style={styles.createAccountText}>
            {isResending ? 'Sending...' : `You can resend code in ${countdown}s`}
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

export default OTPComponent;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContainer: {
    marginBottom: 25,
    alignSelf: 'flex-start',
    width: '100%'
  },
  title: {
    fontSize: 32,
    fontFamily: 'Poppins-SemiBold',
    color: Colors.white,
    marginBottom: 15,
  },
  subGray: {
    fontSize: 14,
    color: Colors.font_gray,
    marginTop: 2,
  },
  subPrimary: {
    fontSize: 14,
    color: Colors.primary,
    marginTop: 2,
  },
  otpContainer: {
    width: width * 0.9,              
    paddingBottom: height * 0.035,
    paddingTop: height * 0.02,
    paddingHorizontal: width * 0.08,
    borderRadius: 25,
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)', 
    borderLeftWidth: 2,
    borderTopWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',  
  },
  otpRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '90%',
    marginBottom: 20,
  },
  otpBox: {
    width: width * 0.15,
    height: height * 0.075,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.12)', 
    borderLeftWidth: 2,
    borderTopWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',  
  },
  otpInput: {
    color: Colors.white,
    fontSize: 22,
    textAlign: 'center',
    width: '100%',
    height: '100%',
  },
  btnGradient: {
    paddingVertical: 14,
    alignItems: 'center',
    width: width * 0.50,
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
    fontFamily: 'Poppins-Regular',
  },  
  newUserContainer: {
    marginTop: 15,
    alignItems: 'center',   
  },
  newUserText: {
    color: Colors.font_gray,
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
  },
  createAccountText: {
    color: Colors.primary,
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    fontWeight: 'bold',
  },
  resendText: {
    color: Colors.primary,
    fontFamily: 'Poppins-SemiBold',
    fontSize: 14,
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
  
});
