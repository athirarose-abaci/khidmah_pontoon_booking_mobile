import React, { useState, useRef, useCallback } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Dimensions, Alert, ActivityIndicator, Image } from 'react-native';
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

  const handleFirstNameChange = useCallback((text) => {
    setFirstName(text);
    if (errors.firstName) {
      setErrors(prev => ({ ...prev, firstName: '' }));
    }
  }, [errors.firstName]);

  const handleLastNameChange = useCallback((text) => {
    setLastName(text);
    if (errors.lastName) {
      setErrors(prev => ({ ...prev, lastName: '' }));
    }
  }, [errors.lastName]);

  const handleEmailChange = useCallback((text) => {
    setEmail(text);
    if (errors.email) {
      setErrors(prev => ({ ...prev, email: '' }));
    }
  }, [errors.email]);

  const handlePhoneChange = useCallback((text) => {
    setPhone(text);
    if (errors.phone) {
      setErrors(prev => ({ ...prev, phone: '' }));
    }
  }, [errors.phone]);

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
        blurAmount={15}
        color="rgba(255,255,255,0.10)"
        borderRadius={30}
        style={styles.glassContainer}
        shouldRasterizeIOS={true}
        renderToHardwareTextureAndroid={true}
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
            onChangeText={handleFirstNameChange}
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
            onChangeText={handleLastNameChange}
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
            onChangeText={handleEmailChange}
            autoCapitalize="none"
            keyboardType="email-address"
            style={[styles.input, errors.email && styles.inputError]}
          />
        </View>
        {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

        {/* Phone Number Input */}
        <View style={styles.phoneInputContainer}>
          <Ionicons name="call-outline" size={22} color={Colors.primary} style={{ marginRight: 15, marginTop: 8 }} />
          {/* <PhoneInput
            ref={phoneInput}
            defaultValue={phone}
            defaultCode="AE"
            layout="second"
            onChangeText={handlePhoneChange}
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
          /> */}
          <PhoneInput
            ref={phoneInput}
            defaultValue={phone}
            defaultCode="AE"
            layout="first"
            onChangeText={handlePhoneChange}
            onChangeFormattedText={(formattedText) => {
              setFullPhoneNumber(formattedText);
            }}
            withDarkTheme={false}
            withShadow={false}
            autoFocus={false}
            placeholder="Phone Number"
            textInputProps={{
              placeholderTextColor: Colors.font_gray,
              maxLength: 12,
              selectionColor: Colors.white,
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
              animationType: 'slide',
              presentationStyle: 'pageSheet',
            }}
            filterProps={{
              placeholder: 'Search countries...',
              placeholderTextColor: Colors.font_gray,
            }}
            countryPickerProps={{
              modalProps: {
                style: styles.countryPickerModal, 
              },
              renderFlagButton: null, 
              flatListProps: {
                style: styles.countryList,
                contentContainerStyle: styles.countryListContent,
              },
              countryCodeStyles: styles.countryCodeItem,
              closeButtonImageStyle: styles.closeButton,
            }}
            searchInputStyle={{
              color: Colors.white,
              backgroundColor: 'rgba(255,255,255,0.1)',
              borderBottomWidth: 1,
              borderBottomColor: Colors.border_line,
              paddingVertical: 15,
              paddingHorizontal: 20,
              margin: 15,
              borderRadius: 8,
            }}
            countryPickerBackgroundColor="rgba(0,0,0,0.9)" 
            closeButtonStyle={styles.modalCloseButton}
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
    marginTop: 12,
    marginBottom: 12,
  },
  phoneInputWrapper: {
    flex: 1,
    backgroundColor: 'transparent',
    borderBottomWidth: 1,
    borderColor: Colors.border_line,
    paddingBottom: 8,
    paddingRight: 0,
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
    marginLeft: 35,
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
    marginLeft: 0,
  },
  phoneTextInputError: {
    borderColor: Colors.error,
  },
  phoneCodeText: {
    color: Colors.font_gray,
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    marginRight: 10,
    paddingRight: 0,
    marginLeft: -15,
  },
  phoneFlagButton: {
    backgroundColor: 'transparent',
    borderWidth: 0,
    paddingRight: 12,
    marginRight: 0,
    marginLeft: 5,
    width: 40,
    height: 20,
  },
  phoneCountryPicker: {
    backgroundColor: 'transparent',
    borderWidth: 0,
    paddingRight: -15,
    marginRight: 0,
  },
  phoneDropdownArrow: {
    color: Colors.primary,
    fontSize: 16,
    marginLeft: 0,
    marginRight: 0,
  },  
  countryCodeItem: {
    backgroundColor: 'transparent',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
    paddingVertical: 15,
    paddingHorizontal: 20,
  },
  modalCloseButton: {
    color: Colors.primary,
    fontSize: 18,
    padding: 15,
  },
  closeButton: {
    tintColor: Colors.primary,
    width: 20,
    height: 20,
  },
});
