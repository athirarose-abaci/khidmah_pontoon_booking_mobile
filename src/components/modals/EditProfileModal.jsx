import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Image, Animated, Modal, Dimensions, } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/customStyles';
import { AntDesign } from '@react-native-vector-icons/ant-design';
import { Ionicons } from '@react-native-vector-icons/ionicons';

const { height: screenHeight } = Dimensions.get('window');

const EditProfileModal = ({ visible, onClose, onSave }) => {
  const slideAnim = useRef(new Animated.Value(-screenHeight * 0.8)).current;
  const [firstName, setFirstName] = React.useState('Casey');
  const [lastName, setLastName] = React.useState('Blake');
  const [phoneNumber, setPhoneNumber] = React.useState('+971 50 123 4567');

  useEffect(() => {
    if (visible) {
      // Reset animation value to starting position first
      slideAnim.setValue(-screenHeight * 0.8);
      // Then animate to center
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: -screenHeight * 0.8,
        duration: 400,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  const handleSave = () => {
    onSave({ firstName, lastName, phoneNumber });
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Animated.View
          style={[
            styles.modalContainer,
            {
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <SafeAreaView style={styles.safeArea}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                  <Text style={styles.headerTitle}>Edit Profile</Text>
                </View>
                <TouchableOpacity 
                  style={styles.closeButton}
                  onPress={onClose}
                >
                  <Ionicons name="close" size={20} color="white" />
                </TouchableOpacity>
            </View>

            {/* Profile Picture Section */}
            <View style={styles.profileSection}>
              <View style={styles.profileImageContainer}>
                <Image
                  source={require('../../assets/images/profile_image.png')}
                  style={styles.profileImage}
                />
              </View>
              <TouchableOpacity style={styles.uploadButton}>
                <AntDesign name="upload" size={16} color={Colors.primary} />
                <Text style={styles.uploadText}>Upload photo</Text>
              </TouchableOpacity>
            </View>

            {/* Form Fields */}
            <View style={styles.formContainer}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>First Name*</Text>
                <TextInput
                  style={styles.input}
                  value={firstName}
                  onChangeText={setFirstName}
                  placeholder="Enter first name"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Last Name*</Text>
                <TextInput
                  style={styles.input}
                  value={lastName}
                  onChangeText={setLastName}
                  placeholder="Enter last name"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Phone Number*</Text>
                <TextInput
                  style={styles.input}
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                  placeholder="Enter phone number"
                  keyboardType="phone-pad"
                />
              </View>
            </View>

            {/* Save Button */}
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <AntDesign name="file-text" size={20} color="white" />
              <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>
          </SafeAreaView>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: '-33%',
    marginLeft: '-45%',
    width: '90%',
    height: '67%',
    backgroundColor: 'white',
    borderRadius: 20,
  },
  safeArea: {
    flex: 1,
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
    position: 'absolute',
    top: 25,
    right: 25,
    width: 20,
    height: 20,
    borderRadius: 2,
    backgroundColor: Colors.red,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 20,
    justifyContent: 'flex-start',
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
    flex: 1,
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
