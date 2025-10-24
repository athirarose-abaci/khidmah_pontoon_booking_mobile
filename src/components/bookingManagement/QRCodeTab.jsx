import React, { useContext, useRef } from 'react';
import { StyleSheet, Text, View, ScrollView, Image, TouchableOpacity, Alert } from 'react-native';
import { Colors } from '../../constants/customStyles';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import QRCode from 'react-native-qrcode-svg';
import Share from 'react-native-share';
import ViewShot, { captureRef } from 'react-native-view-shot';
import { ToastContext } from '../../context/ToastContext';

const QRCodeTab = ({ bookingData, isDarkMode }) => {
  const viewShotRef = useRef(null);

  const toastContext = useContext(ToastContext);

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
    <ScrollView 
      style={styles.container} 
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 20 }}
    >
      <View style={styles.section}>
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
          <ViewShot 
            ref={viewShotRef} 
            options={{ format: 'png', quality: 0.9 }}
            style={styles.qrContainer}
          >
            <View style={styles.qrCodeContainer}>
              {/* Khidmah Logo */}
              <Image 
                source={require('../../assets/images/khidmah_logo.png')} 
                style={styles.khidmahLogo}
                resizeMode="contain"
              />
              {/* QR Code Image */}
              <View style={styles.qrPlaceholder}>
                {bookingData?.qr_code ? (
                  <QRCode
                    value={bookingData?.qr_code}
                    size={180}
                    color={Colors.black}
                    backgroundColor={Colors.white}
                  />
                ) : (
                  <Image 
                    source={require('../../assets/images/no_image.jpg')} 
                    style={styles.qrImage}
                    resizeMode="contain"
                  />
                )}
                {/* Corner markers */}
                <View style={[styles.qrCorner, styles.qrCornerTopLeft]} />
                <View style={[styles.qrCorner, styles.qrCornerTopRight]} />
                <View style={[styles.qrCorner, styles.qrCornerBottomLeft]} />
                <View style={[styles.qrCorner, styles.qrCornerBottomRight]} />
              </View>
            </View>
            <View style={styles.qrDetails}>
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
                {/* <Text style={styles.poweredBy}>Powered by</Text> */}
            </View>
          </ViewShot>
        </View>
      </View>
    </ScrollView>
  );
};

export default QRCodeTab;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  section: {
    marginBottom: 20,
  },
  // Card Header Styles
  cardHeaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 0,
    marginTop: -8,
  },
  cardHeaderIconContainer: {
    width: 45,
    height: 45,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cardHeaderIcon: {
    width: 35,
    height: 35,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.primary,
  },
  cardHeaderText: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    flex: 1,
    marginLeft: 12,
  },
  shareButtonContainer: {
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardHeaderSeparator: {
    height: 1,
    backgroundColor: '#E8EBEC',
    marginHorizontal: -20,
    marginTop: 8,
    marginBottom: 8,
  },
  qrCard: {
    padding: 20,
    borderRadius: 12,
  },
  qrContainer: {
    flex: 1,
    alignItems: 'center',
    paddingBottom: 20,
  },
  qrCodeContainer: {
    marginBottom: 30,
    alignItems: 'center',
  },
  khidmahLogo: {
    width: 120,
    height: 60,
  },
  qrPlaceholder: {
    width: 220,
    height: 220,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  qrImage: {
    width: 180,
    height: 180,
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
    marginTop: 10,
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
  poweredBy: {
    fontSize: 12,
    fontFamily: 'merchant-copy-regular',
    color: Colors.font_gray,
    textAlign: 'center',
    marginTop: 4,
  },
});
