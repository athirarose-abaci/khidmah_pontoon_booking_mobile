import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { LiquidGlassView } from '@callstack/liquid-glass';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import { Colors } from '../../constants/customStyles';

const { width, height } = Dimensions.get('window');

const RegisterComponent = ({ setCurrentScreen }) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  return (
    <View style={styles.screen}>
      <LiquidGlassView
        blurAmount={25}
        color="rgba(255,255,255,0.12)"
        borderRadius={30}
        style={styles.glassContainer}
      >
        <Text style={styles.title}>Register</Text>
        <Text style={styles.subTitle}>Create an account to get started.</Text>

        {/* First Name Input */}
        <View style={styles.inputRow}>
          <Ionicons name="person-outline" size={22} color={Colors.primary} style={{ marginRight: 15 }} />
          <TextInput
            placeholder="First Name"
            placeholderTextColor={Colors.font_gray}
            value={firstName}
            onChangeText={setFirstName}
            style={styles.input}
          />
        </View>

        {/* Last Name Input */}
        <View style={styles.inputRow}>
          <Ionicons name="person-outline" size={22} color={Colors.primary} style={{ marginRight: 15 }} />
          <TextInput
            placeholder="Last Name"
            placeholderTextColor={Colors.font_gray}
            value={lastName}
            onChangeText={setLastName}
            style={styles.input}
          />
        </View>

        {/* Email Input */}
        <View style={styles.inputRow}>
          <Ionicons name="mail-open-outline" size={22} color={Colors.primary} style={{ marginRight: 15 }} />
          <TextInput
            placeholder="Email"
            placeholderTextColor={Colors.font_gray}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            style={styles.input}
          />
        </View>

        {/* Phone Number Input */}
        <View style={styles.inputRow}>
          <Ionicons name="call-outline" size={22} color={Colors.primary} style={{ marginRight: 15 }} />
          <TextInput
            placeholder="Phone Number"
            placeholderTextColor={Colors.font_gray}
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            style={styles.input}
          />
        </View>

        <TouchableOpacity
          onPress={() => setCurrentScreen('otp')}
          activeOpacity={0.8}
          style={{ marginTop: 28 }}
        >
          <LinearGradient
            colors={['#75C8AD', '#61C8D5']}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={styles.btnGradient}
          >
            <Text style={styles.btnText}>Register</Text>
          </LinearGradient>
        </TouchableOpacity>
      </LiquidGlassView>
      <Text style={styles.instuction}>By creating an account, You agree to our terms and{'\n'}conditions and privacy policy</Text>

      <TouchableOpacity
        onPress={() => setCurrentScreen('login')}
        style={styles.newUserContainer}
      >
        <Text style={styles.newUserText}>
          Already have an account? <Text style={styles.createAccountText}>Login</Text>
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default RegisterComponent;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  glassContainer: {
    width: width * 0.9,              
    paddingBottom: height * 0.030,
    paddingTop: height * 0.018,
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
    fontSize: 14,
    color: Colors.primary,
    marginTop: 4,
    marginBottom: 20,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  input: {
    flex: 1,
    borderBottomWidth: 1,
    borderColor: Colors.border_line,
    color: Colors.white,
    fontSize: 16,
    paddingBottom: 5,
  },
  btnGradient: {
    paddingVertical: 14,
    alignItems: 'center',
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
    fontFamily: 'Poppins-Regular',
  },
  instuction: {
    color: Colors.font_gray,
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 10,
  },
  newUserContainer: {
    marginTop: 15,
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
