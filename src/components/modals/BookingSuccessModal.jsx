import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import { Colors } from '../../constants/customStyles';
import SuccessLottie from '../lottie/SuccessLottie';

const BookingSuccessModal = ({ visible, onClose, onGoHome }) => {
  if (!visible) return null;

  return (
    <View style={styles.modalOverlay}>
      <View style={styles.modalContainer}>
        <TouchableOpacity 
          style={styles.closeButton}
          onPress={onClose}
        >
          <Ionicons name="close" size={20} color="white" />
        </TouchableOpacity>
        
        <View style={styles.successIconContainer}>
          <SuccessLottie 
            style={styles.lottieAnimation}
            autoPlay={true}
            loop={true}
          />
        </View>
        
        <Text style={styles.successMessage}>
          Your booking has been{'\n'}successfully created!
        </Text>
        
        <TouchableOpacity style={styles.goHomeButton} onPress={onGoHome}>
          <Text style={styles.goHomeButtonText}>Go Home</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
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
    width: 250,
    height: 250,
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
  },
  goHomeButtonText: {
    fontSize: 15,
    fontFamily: 'Inter-SemiBold',
    color: Colors.primary,
    textAlign: 'center',
  },
});

export default BookingSuccessModal;
