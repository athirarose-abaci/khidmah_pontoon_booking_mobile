import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, Platform, PermissionsAndroid, Dimensions } from 'react-native';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import { BlurView } from '@react-native-community/blur';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';
import { PERMISSIONS, request, RESULTS } from 'react-native-permissions';
import { Colors } from '../../constants/customStyles';
import { ToastContext } from '../../context/ToastContext';
import moment from 'moment';

const {width} = Dimensions.get('window');

const ImageSourceModal = ({
  visible,
  onClose,
  onImageSelected,
  isDarkMode = false,
  maxFiles = 5,
  currentFileCount = 0,
}) => {
  const toastContext = React.useContext(ToastContext);

  const requestPermissions = async (source) => {
    try {
      if (source === 'camera') {
        if (Platform.OS === 'android') {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.CAMERA,
            {
              title: 'Camera Permission',
              message: 'This app needs camera access to take photos',
              buttonNeutral: 'Ask Me Later',
              buttonNegative: 'Cancel',
              buttonPositive: 'OK',
            },
          );
          return granted === PermissionsAndroid.RESULTS.GRANTED;
        } else {
          const result = await request(PERMISSIONS.IOS.CAMERA);
          const grantedResult = Object.values(result).every(status => status === RESULTS.GRANTED);
          return grantedResult;
        }
      } else {
        // For gallery, we don't need to request permissions explicitly on modern Android
        if (Platform.OS === 'android') {
          return true;
        } else {
          const result = await request(PERMISSIONS.IOS.PHOTO_LIBRARY);
          const grantedResult = Object.values(result).every(status => status === RESULTS.GRANTED);
          return grantedResult;
        }
      }
    } catch (error) {
      return false;
    }
  };

  const selectImage = async (source) => {
    const hasPermission = await requestPermissions(source);

    if (!hasPermission) {
      toastContext.showToast(`Permission denied for ${source}`, 'short', 'error');
      return;
    }

    const options = {
      mediaType: 'photo',
      quality: 0.5,
      includeBase64: true,
      maxWidth: 1024,
      maxHeight: 1024,
      saveToPhotos: false,
    };

    const launchFunction = source === 'camera' ? launchCamera : launchImageLibrary;

    launchFunction(options, (response) => {
      if (response.didCancel) {
        return;
      } else if (response.error) {
        toastContext.showToast('Error while opening camera', 'short', 'error');
      } else if (response.assets && response.assets[0]) {
        const fileName = moment().unix().toString() + (response?.assets[0]?.fileName?.slice(-10) || '.jpg');
        const uri = response?.assets[0]?.uri;
        
        // Check if we've reached the max file limit
        if (currentFileCount >= maxFiles) {
          toastContext.showToast(`You can only select up to ${maxFiles} files.`, 'short', 'error');
          return;
        }

        const newFile = {
          id: Date.now() + Math.random(),
          name: fileName,
          uri: uri,
          type: response.assets[0].type || 'image/jpeg',
          size: response.assets[0].fileSize || 0,
        };

        onImageSelected?.(newFile);
        onClose?.();
      }
    });
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}>
      <View style={[styles.modalOverlay, { backgroundColor: isDarkMode ? 'rgba(0, 0, 0, 0.6)' : 'rgba(0, 0, 0, 0.5)' }]}>
        <View
          style={[
            styles.sourceModalContent,
            { backgroundColor: isDarkMode ? Colors.dark_container : Colors.white },
          ]}>
          {/* Header */}
          <View style={[styles.header, { 
            borderBottomColor: isDarkMode ? Colors.dark_separator : '#F2F2F2'
          }]}>
            <View style={styles.headerLeft}>
              <View style={styles.headerIcon}>
                <Ionicons name="camera" size={20} color={Colors.primary} />
              </View>
              <Text style={[styles.headerTitle, { color: isDarkMode ? Colors.white : Colors.heading_font }]}>Select Image Source</Text>
            </View>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={onClose}
            >
              <Ionicons name="close" size={16} color="white" />
            </TouchableOpacity>
          </View>

          <View style={styles.sourceButtonContainer}>
            <TouchableOpacity
              style={[
                styles.sourceButton,
                styles.firstButton,
                { 
                  backgroundColor: isDarkMode ? Colors.dark_bg_color : '#F9F9F9',
                  borderColor: isDarkMode ? Colors.input_border_dark : '#E5E5E5'
                }
              ]}
              onPress={() => selectImage('camera')}>
              <Ionicons name="camera" size={24} color={Colors.primary} />
              <Text style={[styles.sourceButtonText, { color: isDarkMode ? Colors.white : Colors.heading_font }]}>Take Photo</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.sourceButton,
                styles.lastButton,
                { 
                  backgroundColor: isDarkMode ? Colors.dark_bg_color : '#F9F9F9',
                  borderColor: isDarkMode ? Colors.input_border_dark : '#E5E5E5'
                }
              ]}
              onPress={() => selectImage('gallery')}>
              <Ionicons name="images" size={24} color={Colors.primary} />
              <Text style={[styles.sourceButtonText, { color: isDarkMode ? Colors.white : Colors.heading_font }]}>Choose from Gallery</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sourceModalContent: {
    width: width * 0.8,
    borderRadius: 20,
    padding: 0,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
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
    borderBottomWidth: 1,
    marginBottom: 10,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
  },
  closeButton: {
    width: 24,
    height: 24,
    borderRadius: 4,
    backgroundColor: Colors.red,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sourceButtonContainer: {
    width: '100%',
    gap: 12,
    paddingHorizontal: 30,
    paddingTop: 20,
    paddingBottom: 30,
  },
  sourceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    alignSelf: 'center',
    width: '80%',
  },
  firstButton: {
    marginTop: 10,
  },
  lastButton: {
    marginBottom: 10,
  },
  sourceButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    marginLeft: 12,
  },
});

export default ImageSourceModal;
