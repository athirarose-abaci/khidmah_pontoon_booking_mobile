import React from 'react';
import { StyleSheet, Text, View, ScrollView } from 'react-native';
import { Colors } from '../../constants/customStyles';
import { Ionicons } from '@react-native-vector-icons/ionicons';

const QRCodeTab = ({ bookingData }) => {
  return (
    <ScrollView 
      style={styles.container} 
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 20 }}
    >
      <View style={styles.qrContainer}>
        <Text style={styles.qrTitle}>Booking QR Code</Text>
        <View style={styles.qrCodeContainer}>
          {/* Placeholder QR Code - Replace with actual QR code component */}
          <View style={styles.qrPlaceholder}>
            <Ionicons name="qr-code" size={120} color={Colors.primary} />
          </View>
        </View>
        <View style={styles.qrDetails}>
          <Text style={styles.qrBookingId}>Booking ID: #{bookingData.bookingId || bookingData.id}</Text>
          <Text style={styles.qrBoatName}>{bookingData.title}</Text>
          <Text style={styles.qrChartererName}>{bookingData.charterer.name}</Text>
          <Text style={styles.qrDate}>
            {bookingData.arrivalDate} - {bookingData.departureDate}
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

export default QRCodeTab;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  qrContainer: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  qrTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: Colors.black,
    marginBottom: 30,
  },
  qrCodeContainer: {
    backgroundColor: Colors.white,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
    marginBottom: 30,
  },
  qrPlaceholder: {
    width: 200,
    height: 200,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderStyle: 'dashed',
  },
  qrDetails: {
    alignItems: 'center',
    gap: 8,
  },
  qrBookingId: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: Colors.primary,
  },
  qrBoatName: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: Colors.black,
    textAlign: 'center',
  },
  qrChartererName: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: Colors.font_gray,
  },
  qrDate: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: Colors.font_gray,
  },
});
