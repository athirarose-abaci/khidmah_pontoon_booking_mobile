import React from 'react';
import { StyleSheet, Text, View, ScrollView, Image } from 'react-native';
import { Colors } from '../../constants/customStyles';
import { Ionicons } from '@react-native-vector-icons/ionicons';

const QRCodeTab = ({ bookingData }) => {
  return (
    <ScrollView 
      style={styles.container} 
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 20 }}
    >
      <View style={styles.section}>
        <View style={styles.qrCard}>
          <View style={styles.cardHeaderContainer}>
            <View style={styles.cardHeaderIconContainer}>
              <View style={styles.cardHeaderIcon}>
                <Ionicons name="qr-code" size={20} color={Colors.white} />
              </View>
            </View>
            <Text style={styles.cardHeaderText}>Booking QR Code</Text>
          </View>
          <View style={styles.cardHeaderSeparator} />
          <View style={styles.qrContainer}>
            <View style={styles.qrCodeContainer}>
              {/* Khidmah Logo */}
              <Image 
                source={require('../../assets/images/khidmah_logo.png')} 
                style={styles.khidmahLogo}
                resizeMode="contain"
              />
              {/* QR Code Image */}
              <View style={styles.qrPlaceholder}>
                <Image 
                  source={require('../../assets/images/qr.png')} 
                  style={styles.qrImage}
                  resizeMode="contain"
                />
                {/* Corner markers */}
                <View style={[styles.qrCorner, styles.qrCornerTopLeft]} />
                <View style={[styles.qrCorner, styles.qrCornerTopRight]} />
                <View style={[styles.qrCorner, styles.qrCornerBottomLeft]} />
                <View style={[styles.qrCorner, styles.qrCornerBottomRight]} />
              </View>
            </View>
            <View style={styles.qrDetails}>
              <View style={styles.refNoContainer}>
                <View style={styles.refNoRow}>
                  <Text style={styles.refNoLabel}>Ref No:</Text>
                  <Text style={styles.refNoValue}>XXXXXXXXXXXXX</Text>
                </View>
              </View>
                <View style={styles.nameContainer}>
                  <Text style={styles.nameLabel}>Name:</Text>
                  <Text style={styles.nameValue}>{bookingData.charterer.name}</Text>
                </View>
                <View style={styles.dottedLineContainer}>
                  {Array.from({ length: 20 }, (_, index) => (
                    <View key={index} style={styles.dottedLineDot} />
                  ))}
                </View>
                <Text style={styles.poweredBy}>Powered by</Text>
            </View>
          </View>
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
    color: Colors.heading_font,
  },
  cardHeaderSeparator: {
    height: 1,
    backgroundColor: '#E8EBEC',
    marginHorizontal: -20,
    marginTop: 8,
    marginBottom: 8,
  },
  qrCard: {
    backgroundColor: Colors.white,
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
    width: 200,
    height: 200,
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
    backgroundColor: Colors.black,
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
    color: Colors.white,
  },
  refNoValue: {
    fontSize: 16,
    fontFamily: 'merchant-copy-regular',
    color: Colors.white,
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 28,
  },
  nameLabel: {
    fontSize: 16,
    fontFamily: 'merchant-copy-regular',
    color: Colors.black,
  },
  nameValue: {
    fontSize: 16,
    fontFamily: 'merchant-copy-regular',
    color: Colors.black,
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
    backgroundColor: Colors.black,
  },
  poweredBy: {
    fontSize: 12,
    fontFamily: 'merchant-copy-regular',
    color: Colors.font_gray,
    textAlign: 'center',
    marginTop: 4,
  },
});
