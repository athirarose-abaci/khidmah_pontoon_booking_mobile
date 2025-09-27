import React, { useState } from 'react';
import { View, TextInput, StyleSheet, Text, TouchableOpacity } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import { Colors } from '../../constants/customStyles';
import { BlurView } from '@react-native-community/blur';

export default function LoginComponent({ setCurrentScreen }) {
  const [email, setEmail] = useState('');

  return (
    <View style={styles.wrapper}>
      <BlurView
        style={styles.blurContainer}
        blurType="light"   // options: 'light', 'dark', 'xlight'
        blurAmount={2}    // increase for stronger glass effect
        reducedTransparencyFallbackColor="white"
      />

      <View style={styles.content}>
        <Text style={styles.title}>Login</Text>
        <Text style={styles.subTitle}>Sign in to manage reservations.</Text>

        <View style={styles.inputRow}>
          <Ionicons name="mail-outline" size={22} color={Colors.secondary} style={{ marginRight: 15 }} />
          <TextInput
            placeholder="Email Address"
            placeholderTextColor={Colors.input_placeholder}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
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
            end={{ x: 1, y: 0 }}
            style={styles.btnGradient}
          >
            <Text style={styles.btnText}>Login with OTP</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    borderRadius: 35,
    overflow: 'hidden',
  },
  blurContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  content: {
    flex: 1,
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.15)', // translucent overlay
    borderRadius: 35,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.white,
  },
  subTitle: {
    fontSize: 14,
    color: Colors.white,
    marginTop: 4,
    marginBottom: 24,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: Colors.white,
  },
  input: {
    flex: 1,
    color: Colors.white,
    fontSize: 16,
    borderBottomWidth: 1,
    borderColor: Colors.white,
    paddingBottom: 8,
  },
  btnGradient: {
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 45,
    width: '75%',
    alignSelf: 'center',
  },
  btnText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
});
