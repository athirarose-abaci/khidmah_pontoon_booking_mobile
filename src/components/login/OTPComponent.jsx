// OTPComponent.jsx
import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet, Text } from 'react-native';
import { Colors } from '../../constants/customStyles';

export default function OTPComponent({ setCurrentScreen }) {
  const [otp, setOtp] = useState('');

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Enter OTP</Text>
      <TextInput
        placeholder="123456"
        value={otp}
        onChangeText={setOtp}
        keyboardType="numeric"
        style={styles.input}
      />
      <Button title="Verify" onPress={() => setCurrentScreen('login')} color={Colors.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    fontSize: 18,
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.input_border,
    borderRadius: 6,
    padding: 12,
    marginBottom: 16,
    backgroundColor: Colors.input_bg,
    width: '60%',
    textAlign: 'center',
  },
});
