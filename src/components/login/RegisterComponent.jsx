// RegisterComponent.jsx
import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet } from 'react-native';
import { Colors } from '../../constants/customStyles';

export default function RegisterComponent({ setCurrentScreen }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        style={styles.input}
      />
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
      />
      <TextInput
        placeholder="Confirm Password"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
        style={styles.input}
      />
      <Button title="Register" onPress={() => setCurrentScreen('otp')} color={Colors.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.input_border,
    borderRadius: 6,
    padding: 12,
    marginBottom: 16,
    backgroundColor: Colors.input_bg,
  },
});
