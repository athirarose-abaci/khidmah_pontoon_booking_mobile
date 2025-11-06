import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import { Colors } from '../../constants/customStyles';
import SuccessLottie from '../lottie/SuccessLottie';
import { useSelector } from 'react-redux';

const BookingSuccessModal = ({ visible, onClose, onGoHome, isEditMode = false }) => {
  const isDarkMode = useSelector(state => state.themeSlice?.isDarkMode);

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={[styles.modalOverlay, { backgroundColor: isDarkMode ? 'rgba(0, 0, 0, 0.6)' : 'rgba(0, 0, 0, 0.5)' }]}>
        <View style={[styles.modalContainer, { backgroundColor: isDarkMode ? Colors.dark_container : 'white' }]}>
          {/* <TouchableOpacity 
            style={styles.closeButton}
            onPress={onClose}
          >
            <Ionicons name="close" size={20} color="white" />
          </TouchableOpacity> */}
          
          <View style={styles.successIconContainer}>
            <SuccessLottie 
              style={styles.lottieAnimation}
              autoPlay={true}
              loop={true}
            />
          </View>
          
          <Text style={[styles.successMessage, { color: isDarkMode ? Colors.white : '#333' }]}>
            Your booking has been{'\n'}successfully {isEditMode ? 'updated!' : 'created!'}
          </Text>
          
          <TouchableOpacity style={[styles.goHomeButton, { backgroundColor: isDarkMode ? Colors.size_bg_dark : 'white', borderColor: isDarkMode ? Colors.input_border_dark : Colors.primary }]} onPress={onGoHome}>
            <Text style={[styles.goHomeButtonText, { color: isDarkMode ? Colors.white : Colors.primary }]}>Go Home</Text>
          </TouchableOpacity>
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
  modalContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 30,
    marginHorizontal: 20,
    alignItems: 'center',
    position: 'relative',
    width: '90%',
    height: '50%',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 10,
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
  successIconContainer: {
    marginBottom: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lottieAnimation: {
    width: 200,
    height: 200,
  },
  successMessage: {
    fontSize: 18,
    fontFamily: 'Poppins-Regular',
    color: '#333',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 22,
  },
  goHomeButton: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 35,
    minWidth: 120,
    marginBottom: 20,
  },
  goHomeButtonText: {
    fontSize: 15,
    fontFamily: 'Inter-SemiBold',
    color: Colors.primary,
    textAlign: 'center',
  },
});

export default BookingSuccessModal;
