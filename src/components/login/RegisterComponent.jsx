import React, { useState, useRef } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Dimensions, Alert, ActivityIndicator } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { LiquidGlassView } from '@callstack/liquid-glass';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import PhoneInput from 'react-native-phone-number-input';
import { Colors } from '../../constants/customStyles';
import { register } from '../../apis/auth';
import { useContext } from 'react';
import { ToastContext } from '../../context/ToastContext';
import Error from '../../helpers/Error';
import { storeData } from '../../helpers/asyncStorageHelper';

const { width, height } = Dimensions.get('window');

const RegisterComponent = ({ setCurrentScreen }) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [fullPhoneNumber, setFullPhoneNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  
  const phoneInput = useRef(null);
  const toastContext = useContext(ToastContext);

  const validateForm = () => {
    const newErrors = {};
    
    if (!firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }
    
    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email';
    }
    
    if (!phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (phone.length > 12) {
      newErrors.phone = 'Phone number cannot exceed 12 digits';
    } else if (phone.length < 7) {
      newErrors.phone = 'Please enter a valid phone number';
    } else if (!/^\d+$/.test(phone)) {
      newErrors.phone = 'Phone number should contain only digits';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validateForm()) {
      return;
    }
    setIsLoading(true);
    setErrors({});

    try {
      console.log('fullPhoneNumber in handleRegister: ', fullPhoneNumber);
      const response = await register(firstName, lastName, email, fullPhoneNumber);
      if (response?.status === 201) {
        toastContext.showToast(response?.data?.message, 'long', 'success');
        setCurrentScreen('otp');
        await storeData('registeredEmail', email.trim());
      }
    } catch (error) {
      let err_msg = Error(error);
      toastContext.showToast(err_msg, 'long', 'error');
    } finally {
      setIsLoading(false);
    }
  };

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
            onChangeText={(text) => {
              setFirstName(text);
              if (errors.firstName) {
                setErrors(prev => ({ ...prev, firstName: '' }));
              }
            }}
            style={[styles.input, errors.firstName && styles.inputError]}
          />
        </View>
        {errors.firstName && <Text style={styles.errorText}>{errors.firstName}</Text>}

        {/* Last Name Input */}
        <View style={styles.inputRow}>
          <Ionicons name="person-outline" size={22} color={Colors.primary} style={{ marginRight: 15 }} />
          <TextInput
            placeholder="Last Name"
            placeholderTextColor={Colors.font_gray}
            value={lastName}
            onChangeText={(text) => {
              setLastName(text);
              if (errors.lastName) {
                setErrors(prev => ({ ...prev, lastName: '' }));
              }
            }}
            style={[styles.input, errors.lastName && styles.inputError]}
          />
        </View>
        {errors.lastName && <Text style={styles.errorText}>{errors.lastName}</Text>}

        {/* Email Input */}
        <View style={styles.inputRow}>
          <Ionicons name="mail-open-outline" size={22} color={Colors.primary} style={{ marginRight: 15 }} />
          <TextInput
            placeholder="Email"
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
        {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

        {/* Phone Number Input */}
        <View style={styles.phoneInputContainer}>
          <Ionicons name="call-outline" size={22} color={Colors.primary} style={{ marginRight: 15, marginTop: 8 }} />
          <PhoneInput
            ref={phoneInput}
            defaultValue={phone}
            defaultCode="AE"
            layout="second"
            onChangeText={(text) => {
              // Store the phone number without country code for validation
              setPhone(text);
              if (errors.phone) {
                setErrors(prev => ({ ...prev, phone: '' }));
              }
            }}
            onChangeFormattedText={(formattedText) => {
              // Store the complete phone number with country code for backend
              setFullPhoneNumber(formattedText);
            }}
            withDarkTheme={false}
            withShadow={false}
            autoFocus={false}
            placeholder="Phone Number"
            textInputProps={{
              placeholderTextColor: Colors.font_gray,
              maxLength: 12,
            }}
            containerStyle={[styles.phoneInputWrapper, errors.phone && styles.phoneInputError]}
            textContainerStyle={styles.phoneTextContainer}
            textInputStyle={[styles.phoneTextInput, errors.phone && styles.phoneTextInputError]}
            codeTextStyle={styles.phoneCodeText}
            flagButtonStyle={styles.phoneFlagButton}
            countryPickerButtonStyle={styles.phoneCountryPicker}
            disableArrowIcon={false}
            dropdownImageStyle={styles.phoneDropdownArrow}
            modalProps={{
              animationType: 'fade',
              transparent: true,
              presentationStyle: 'overFullScreen',
            }}
            modalStyle={{
              backgroundColor: Colors.dark_container,
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              position: 'absolute',
              top: 60,
              left: 0,
              right: 0,
              maxHeight: 300,
              zIndex: 1000,
            }}
            filterProps={{
              placeholder: 'Search countries...',
              placeholderTextColor: Colors.font_gray,
            }}
            searchInputStyle={{
              color: Colors.white,
              backgroundColor: 'transparent',
              borderBottomWidth: 1,
              borderBottomColor: Colors.border_line,
              paddingVertical: 15,
              paddingHorizontal: 20,
            }}
          />
        </View>
        {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}

        <TouchableOpacity
          onPress={handleRegister}
          activeOpacity={0.8}
          style={{ marginTop: 20 }}
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
              <Text style={styles.btnText}>Register</Text>
            )}
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
    paddingBottom: 8,
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
    fontSize: 11,
    textAlign: 'center',
    marginTop: 8,
  },
  newUserContainer: {
    marginTop: 8,
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
  inputError: {
    borderColor: Colors.error,
    borderBottomWidth: 2,
  },
  errorText: {
    color: Colors.error,
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    marginLeft: 40,
  },
  btnDisabled: {
    opacity: 0.7,
  },
  phoneInputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  phoneInputWrapper: {
    flex: 1,
    backgroundColor: 'transparent',
    borderBottomWidth: 1,
    borderColor: Colors.border_line,
    paddingBottom: 8,
    paddingRight: 10,
  },
  phoneInputError: {
    borderColor: Colors.error,
    borderBottomWidth: 2,
  },
  phoneTextContainer: {
    backgroundColor: 'transparent',
    borderWidth: 0,
    paddingVertical: 0,
    paddingHorizontal: 0,
    marginLeft: 0,
    paddingLeft: 0,
    flex: 1,
    marginRight: 5,
  },
  phoneTextInput: {
    color: Colors.white,
    fontSize: 16,
    paddingVertical: 0,
    paddingHorizontal: 0,
    borderWidth: 0,
    backgroundColor: 'transparent',
    textAlign: 'left',
    flex: 1,
  },
  phoneTextInputError: {
    borderColor: Colors.error,
  },
  phoneCodeText: {
    color: Colors.font_gray,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
  },
  phoneFlagButton: {
    backgroundColor: 'transparent',
    borderWidth: 0,
    paddingRight: 15,
    marginRight: 0,
    width: 80,
    height: 30,
  },
  phoneCountryPicker: {
    backgroundColor: 'transparent',
    borderWidth: 0,
    paddingRight: 20,
    marginRight: 0,
  },
  phoneDropdownArrow: {
    color: Colors.white,
    fontSize: 16,
  },
});
