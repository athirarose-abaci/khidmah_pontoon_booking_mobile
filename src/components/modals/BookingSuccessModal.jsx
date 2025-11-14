import React, { useContext, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, ScrollView, Image } from 'react-native';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import { Colors } from '../../constants/customStyles';
// import SuccessLottie from '../lottie/SuccessLottie';
import { useSelector } from 'react-redux';
import QRCode from 'react-native-qrcode-svg';
import Share from 'react-native-share';
import ViewShot, { captureRef } from 'react-native-view-shot';
import { ToastContext } from '../../context/ToastContext';

const BookingSuccessModal = ({ visible, onClose, onGoHome, isEditMode = false, bookingData = null }) => {
  const isDarkMode = useSelector(state => state.themeSlice?.isDarkMode);
  const toastContext = useContext(ToastContext);
  const viewShotRef = useRef(null);

  const handleShareQRCode = async () => {
    try {
      if (!bookingData?.qr_code) {
        toastContext.showToast('No QR code available to share', 'short', 'error');
        return;
      }

      // 1. Capture the View and get its local URI
      const uri = await captureRef(viewShotRef, {
        format: 'png',
        quality: 0.9,
      });

      // 2. Share the captured URI
      await Share.open({ 
        url: uri,
        title: 'Booking QR Code'
      });

    } catch (error) {
      if (error.message !== 'User did not share') {
        toastContext.showToast('Failed to share QR code', 'short', 'error');
      }
    }
  };

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
          
          <ScrollView 
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* <View style={styles.successIconContainer}>
              <SuccessLottie 
                style={styles.lottieAnimation}
                autoPlay={true}
                loop={true}
              />
            </View> */}
            
            {bookingData?.qr_code && !isEditMode && (
              <View style={[styles.qrCard, { backgroundColor: isDarkMode ? Colors.dark_container : Colors.white }]}>
                <View style={styles.cardHeaderContainer}>
                  <View style={styles.cardHeaderIconContainer}>
                    <View style={styles.cardHeaderIcon}>
                      <Ionicons name="qr-code" size={20} color={Colors.white} />
                    </View>
                  </View>
                  <Text style={[styles.cardHeaderText, { color: isDarkMode ? Colors.white : Colors.heading_font }]}>Booking QR Code</Text>
                  <TouchableOpacity 
                    style={styles.shareButtonContainer}
                    onPress={handleShareQRCode}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="share-outline" size={24} color={Colors.primary} />
                  </TouchableOpacity>
                </View>
                <View style={[styles.cardHeaderSeparator, { backgroundColor: isDarkMode ? Colors.dark_separator : '#E8EBEC' }]} />
                <Text style={[styles.successMessage, { color: isDarkMode ? Colors.white : '#333' }]}>
                  Your booking has been{'\n'}successfully {isEditMode ? 'updated!' : 'created!'}
                </Text>
                {bookingData?.qr_code && !isEditMode && (
                  <Text style={[styles.shareMessage, { color: isDarkMode ? Colors.dark_text_secondary : Colors.font_gray }]}>
                    Please share the QR code with{'\n'}all passengers
                  </Text>
                )}
                <ViewShot 
                  ref={viewShotRef} 
                  options={{ format: 'png', quality: 0.9 }}
                  style={styles.qrContainer}
                >
                  <View style={styles.qrCodeContainer}>
                    {/* Khidmah Logo */}
                    <Image 
                      source={isDarkMode ? require('../../assets/images/khidmah_logo_dark.png') : require('../../assets/images/khidmah_logo.png')} 
                      style={styles.khidmahLogo}
                      resizeMode="contain"
                    />
                    {/* QR Code Image */}
                    <View style={styles.qrPlaceholder}>
                      <QRCode
                        value={bookingData?.qr_code}
                        size={180}
                        color={Colors.black}
                        backgroundColor={Colors.white}
                      />
                      {/* Corner markers */}
                      <View style={[styles.qrCorner, styles.qrCornerTopLeft]} />
                      <View style={[styles.qrCorner, styles.qrCornerTopRight]} />
                      <View style={[styles.qrCorner, styles.qrCornerBottomLeft]} />
                      <View style={[styles.qrCorner, styles.qrCornerBottomRight]} />
                    </View>
                  </View>

                  {/* <View style={styles.qrDetails}>
                    <View style={[styles.refNoContainer, { backgroundColor: isDarkMode ? Colors.dark_bg_color : Colors.black }]}>
                      <View style={styles.refNoRow}>
                        <Text style={[styles.refNoLabel, { color: isDarkMode ? Colors.white : Colors.white }]}>Ref No:</Text>
                        <Text style={[styles.refNoValue, { color: isDarkMode ? Colors.white : Colors.white }]}>{bookingData?.booking_number || 'N/A'}</Text>
                      </View>
                    </View>
                    <View style={styles.nameContainer}>
                      <Text style={[styles.nameLabel, { color: isDarkMode ? Colors.white : Colors.black }]}>Name:</Text>
                      <Text style={[styles.nameValue, { color: isDarkMode ? Colors.white : Colors.black }]}>{bookingData?.customer?.full_name || 'N/A'}</Text>
                    </View>
                    <View style={styles.dottedLineContainer}>
                      {Array.from({ length: 20 }, (_, index) => (
                        <View key={index} style={[styles.dottedLineDot, { backgroundColor: isDarkMode ? Colors.white : Colors.black }]} />
                      ))}
                    </View>
                  </View> */}
                </ViewShot>
              </View>
            )}
            
            <TouchableOpacity style={[styles.goHomeButton, { backgroundColor: isDarkMode ? Colors.size_bg_dark : 'white', borderColor: isDarkMode ? Colors.input_border_dark : Colors.primary }]} onPress={onGoHome}>
              <Text style={[styles.goHomeButtonText, { color: isDarkMode ? Colors.white : Colors.primary }]}>Go Home</Text>
            </TouchableOpacity>
          </ScrollView>
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
    paddingVertical: 20,
    paddingHorizontal: 20,
    marginHorizontal: 20,
    alignItems: 'center',
    position: 'relative',
    width: '90%',
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 10,
  },
  scrollContent: {
    alignItems: 'center',
    paddingBottom: 10,
  },
  successMessage: {
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
    color: '#333',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 8,
    lineHeight: 20,
    letterSpacing: -0.5,
  },
  shareMessage: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    textAlign: 'center',
    // marginBottom: 20,
    lineHeight: 15,
    paddingHorizontal: 20,
  },
  qrCard: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
    borderRadius: 12,
    width: '100%',
    overflow: 'visible',
    // marginBottom: 30,
  },
  cardHeaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 0,
    marginTop: 0,
    marginHorizontal: -36,
    paddingLeft: 0,
    paddingRight: 0,
  },
  cardHeaderIconContainer: {
    width: 45,
    height: 45,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 0,
    marginLeft: 20,
  },
  cardHeaderIcon: {
    width: 35,
    height: 35,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    marginRight: 10,
  },
  cardHeaderText: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    flex: 1,
    marginLeft: 20,
  },
  shareButtonContainer: {
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 20,
  },
  cardHeaderSeparator: {
    height: 1,
    backgroundColor: '#E8EBEC',
    marginHorizontal: -36,
    marginTop: 8,
    marginBottom: 8,
  },
  qrContainer: {
    flex: 1,
    alignItems: 'center',
    // paddingBottom: 20,
  },
  qrCodeContainer: {
    marginBottom: 30,
    alignItems: 'center',
  },
  khidmahLogo: {
    width: 120,
    height: 60,
    marginBottom: 10,
  },
  qrPlaceholder: {
    width: 220,
    height: 220,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  qrCorner: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderColor: '#D9D9D9',
    borderWidth: 3,
  },
  qrCornerTopLeft: {
    top: 5,
    left: 5,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  qrCornerTopRight: {
    top: 5,
    right: 5,
    borderTopWidth: 3,
    borderRightWidth: 3,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
  },
  qrCornerBottomLeft: {
    bottom: 5,
    left: 5,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    borderTopWidth: 0,
    borderRightWidth: 0,
  },
  qrCornerBottomRight: {
    bottom: 5,
    right: 5,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderTopWidth: 0,
    borderLeftWidth: 0,
  },
  qrDetails: {
    alignItems: 'center',
    gap: 12,
    // marginTop: 10,
  },
  refNoContainer: {
    paddingHorizontal: 20,
    paddingVertical: 5,
  },
  refNoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  refNoLabel: {
    fontSize: 16,
    fontFamily: 'merchant-copy-regular',
  },
  refNoValue: {
    fontSize: 16,
    fontFamily: 'merchant-copy-regular',
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 28,
  },
  nameLabel: {
    fontSize: 16,
    fontFamily: 'merchant-copy-regular',
  },
  nameValue: {
    fontSize: 16,
    fontFamily: 'merchant-copy-regular',
  },
  dottedLineContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 15,
    gap: 4,
  },
  dottedLineDot: {
    width: 10,
    height: 1,
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
