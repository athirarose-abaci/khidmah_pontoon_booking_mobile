import React, { useContext, useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Image, Animated, Modal, Dimensions, KeyboardAvoidingView, Platform, ScrollView, } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/customStyles';
import { AntDesign } from '@react-native-vector-icons/ant-design';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import Error from '../../helpers/Error';
import { launchImageLibrary } from 'react-native-image-picker';
import { ToastContext } from '../../context/ToastContext';
import { useDispatch, useSelector } from 'react-redux';
import AbaciLoader from '../AbaciLoader';
import { updateProfile } from '../../apis/auth';
import { storeData } from '../../helpers/asyncStorageHelper';
import { setAuthState } from '../../../store/authSlice';
import { BASE_URL_IMAGE } from '../../constants/baseUrl';

const { height: screenHeight } = Dimensions.get('window');

const EditProfileModal = ({ visible, onRequestClose, profileInfo, onProfileUpdate }) => {
  const slideAnim = useRef(new Animated.Value(screenHeight)).current;
  const [firstName, setFirstName] = useState(profileInfo?.first_name || '');
  const [lastName, setLastName] = useState(profileInfo?.last_name || '');
  const [phoneNumber, setPhoneNumber] = useState(profileInfo?.mobile_number || '');
  const [profileImage, setProfileImage] = useState(null);
  const [selectedImageBase64, setSelectedImageBase64] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const toastContext = useContext(ToastContext);
  const currentAuthState = useSelector(state => state.authSlice.authState);
  const dispatch = useDispatch();
  const isDarkMode = useSelector(state => state.themeSlice?.isDarkMode);


  useEffect(() => {
    if (profileInfo) {
      setFirstName(profileInfo?.first_name || '');
      setLastName(profileInfo?.last_name || '');
      setPhoneNumber(profileInfo?.mobile_number || '');
      if (profileInfo?.avatar) {
        setProfileImage({ uri: profileInfo?.avatar });
      } else {
        setProfileImage(null);
      }
    }
  }, [profileInfo, visible]);

  useEffect(() => {
    if (visible) {
      slideAnim.setValue(screenHeight);
      Animated.timing(slideAnim, {
        toValue: screenHeight * 0.15, 
        duration: 400,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: screenHeight,
        duration: 400,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  const selectImage = () => {
    const options = {
      mediaType: 'photo',
      quality: 0.8,
      includeBase64: true,
    };

    launchImageLibrary(options, response => {
      if (response.didCancel) {
        // user cancelled
      } else if (response.error) {
        toastContext.showToast('Error while opening camera', 'short', 'error');
      } else if (response.assets && response.assets[0]) {
        const source = { uri: response.assets[0].uri };
        setProfileImage(source);

        const imageType = response.assets[0].type || 'image/jpeg';
        const base64Data = `data:${imageType};base64,${response.assets[0].base64}`;
        setSelectedImageBase64(base64Data);
      }
    });
  };

  const handleSave = async () => {
    setIsLoading(true);
    const payload = {
      first_name: firstName,
      last_name: lastName,
      mobile_number: phoneNumber,
    };
    if (selectedImageBase64) {
      payload.avatar = selectedImageBase64;
    }
    try {
      const response = await updateProfile(payload);
      if (response.status === 200) {
        const updatedProfile = {
          ...profileInfo,
          first_name: response?.data?.first_name,
          last_name: response?.data?.last_name,
          full_name: response?.data?.full_name,
          mobile_number: response?.data?.mobile_number,
          avatar: response?.data?.avatar,
        };
        if (selectedImageBase64 && response?.data?.avatar) {
          setProfileImage({ uri: response?.data?.avatar });
        }
        onProfileUpdate(updatedProfile);
        
        const updatedAuthState = {
          ...currentAuthState,
          first_name: response?.data?.first_name,
          last_name: response?.data?.last_name,
          full_name: response?.data?.full_name,
          mobile_number: response?.data?.mobile_number,
          avatar: response?.data?.avatar,
        };
        dispatch(setAuthState(updatedAuthState));
        await storeData('data', JSON.stringify(updatedAuthState));
        toastContext.showToast('Profile updated successfully', 'short', 'success');
        onRequestClose();
      }
    } catch (error) {
      let err_msg = Error(error);
      toastContext.showToast(err_msg, 'short', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const transformImage = (imageUrl) => {
    if (!imageUrl) return null;

    // Check if it's a string and doesn't already start with http or https
    if (typeof imageUrl === 'string' && !imageUrl.startsWith('http')) {
      return BASE_URL_IMAGE + imageUrl;
    }

    return imageUrl;
  };

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onRequestClose}>
      <View style={[styles.overlay, { backgroundColor: isDarkMode ? 'rgba(0, 0, 0, 0.6)' : 'rgba(0, 0, 0, 0.5)' }]}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <Animated.View
            style={[
              styles.modalContainer,
              {
                transform: [{ translateY: slideAnim }],
                backgroundColor: isDarkMode ? Colors.dark_container : 'white',
              },
            ]}
          >
            <SafeAreaView style={{ flex: 1 }}>
              {/* Header */}
              <View style={styles.header}>
                <View style={styles.headerLeft}>
                  <Text style={[styles.headerTitle, { color: isDarkMode ? Colors.white : '#00263A' }]}>Edit Profile</Text>
                </View>
                <TouchableOpacity style={styles.closeButton} onPress={onRequestClose}>
                  <Ionicons name="close" size={20} color="white" />
                </TouchableOpacity>
              </View>

              {/* Scrollable Content */}
              <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={{ paddingBottom: 20 }}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
              >
                {/* Profile Section */}
                <View style={styles.profileSection}>
                  <View style={styles.profileImageContainer}>
                  <Image
                      source={
                        profileImage 
                        ? profileImage.uri.startsWith('file://') || profileImage.uri.startsWith('content://')
                          ? profileImage
                          : { uri: transformImage(profileImage.uri) }
                        : require('../../assets/images/profile_image.png')
                      }
                      style={styles.profileImage}
                    />
                  </View>
                  <TouchableOpacity style={styles.uploadButton} onPress={selectImage}>
                    <AntDesign name="upload" size={16} color={Colors.primary} />
                    <Text style={styles.uploadText}>Upload photo</Text>
                  </TouchableOpacity>
                </View>

                {/* Input Fields */}
                <View style={styles.formContainer}>
                  <View style={styles.inputGroup}>
                    <Text style={[styles.label, { color: isDarkMode ? Colors.label_dark : Colors.label_light }]}>First Name*</Text>
                    <TextInput
                      style={[styles.input, { 
                        backgroundColor: isDarkMode ? Colors.size_bg_dark : '#F5F5F5',
                        color: isDarkMode ? Colors.white : '#00263A',
                        borderColor: isDarkMode ? Colors.input_border_dark : '#E5E5E5'
                      }]}
                      value={firstName}
                      onChangeText={setFirstName}
                      placeholder="Enter first name"
                      placeholderTextColor={isDarkMode ? Colors.font_gray : '#999'}
                    />
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={[styles.label, { color: isDarkMode ? Colors.label_dark : Colors.label_light }]}>Last Name*</Text>
                    <TextInput
                      style={[styles.input, { 
                        backgroundColor: isDarkMode ? Colors.size_bg_dark : '#F5F5F5',
                        color: isDarkMode ? Colors.white : '#00263A',
                        borderColor: isDarkMode ? Colors.input_border_dark : '#E5E5E5'
                      }]}
                      value={lastName}
                      onChangeText={setLastName}
                      placeholder="Enter last name"
                      placeholderTextColor={isDarkMode ? Colors.font_gray : '#999'}
                    />
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={[styles.label, { color: isDarkMode ? Colors.label_dark : Colors.label_light }]}>Phone Number*</Text>
                    <TextInput
                      style={[styles.input, { 
                        backgroundColor: isDarkMode ? Colors.size_bg_dark : '#F5F5F5',
                        color: isDarkMode ? Colors.white : '#00263A',
                        borderColor: isDarkMode ? Colors.input_border_dark : '#E5E5E5'
                      }]}
                      value={phoneNumber}
                      onChangeText={setPhoneNumber}
                      placeholder="Enter phone number"
                      placeholderTextColor={isDarkMode ? Colors.font_gray : '#999'}
                      keyboardType="phone-pad"
                    />
                  </View>
                </View>
              </ScrollView>

              {/* Save Button */}
              <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                <AntDesign name="file-text" size={20} color="white" />
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </SafeAreaView>
          </Animated.View>
        </KeyboardAvoidingView>
      </View>
      <AbaciLoader visible={isLoading} />
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    width: '90%',
    height: '68%', // ✅ compact height
    alignSelf: 'center',
    backgroundColor: 'white',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 21,
    fontFamily: 'Inter-SemiBold',
    color: '#00263A',
  },
  closeButton: {
    width: 24,
    height: 24,
    borderRadius: 4,
    backgroundColor: Colors.red,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 20,
  },
  profileImageContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#FFF09E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: 10,
    backgroundColor: 'transparent',
    marginLeft: 16,
  },
  uploadText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: Colors.primary,
    marginLeft: 6,
  },
  formContainer: {
    paddingHorizontal: 25,
    paddingTop: 8,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 15,
    fontFamily: 'Inter-Medium',
    color: '#00263A',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#00263A',
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    marginHorizontal: 25,
    marginBottom: 20,
    paddingVertical: 16,
    borderRadius: 12,
  },
  saveButtonText: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: Colors.white,
    marginLeft: 10,
  },
});

export default EditProfileModal;
