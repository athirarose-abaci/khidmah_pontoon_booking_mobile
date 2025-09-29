import React, { useState } from 'react';
import { View, TextInput, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { LiquidGlassView } from '@callstack/liquid-glass';
import { Colors } from '../../constants/customStyles';

const { width, height } = Dimensions.get('window');

const OTPComponent = ({ setCurrentScreen }) => {
  const [otp, setOtp] = useState(['', '', '', '']);

  const handleChange = (text, index) => {
    const newOtp = [...otp];
    newOtp[index] = text.slice(-1); 
    setOtp(newOtp);
  };

  return (
    <View style={styles.screen}>
      <LiquidGlassView
        blurAmount={25}
        color="rgba(255,255,255,0.12)"
        borderRadius={30}
        style={styles.otpContainer}
      >
        <View style={styles.headerContainer}>
          <Text style={styles.title}>OTP{'\n'}Verification</Text>
          <Text style={styles.subGray}>We’ve sent OTP to</Text>
          <Text style={styles.subPrimary}>john***@email.com</Text>
          <Text style={styles.subGray}>Enter the OTP below to verify</Text>
        </View>

        <View style={styles.otpRow}>
          {otp.map((digit, index) => (
            <LiquidGlassView
              key={index}
              blurAmount={15}
              color="rgba(255,255,255,0.15)"
              borderRadius={12}
              style={styles.otpBox}
            >
              <TextInput
                value={digit}
                onChangeText={(text) => handleChange(text, index)}
                keyboardType="numeric"
                maxLength={1}
                style={styles.otpInput}
              />
            </LiquidGlassView>
          ))}
        </View>

        <TouchableOpacity
          onPress={() => setCurrentScreen('login')}
          activeOpacity={0.8}
          style={{ marginTop: 5 }}
        >
          <LinearGradient
            colors={['#75C8AD', '#61C8D5']}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={styles.btnGradient}  
          >
            <Text style={styles.btnText}>Proceed</Text>
          </LinearGradient>
        </TouchableOpacity>
      </LiquidGlassView>
      <TouchableOpacity style={styles.newUserContainer}>
        <Text style={styles.newUserText}>Don’t receive the mail?</Text>
        <Text style={styles.createAccountText}>You can resend code in 59s</Text>
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
  
});
