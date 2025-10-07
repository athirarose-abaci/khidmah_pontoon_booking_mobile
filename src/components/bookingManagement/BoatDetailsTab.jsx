import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image, ScrollView } from 'react-native';
import { Colors } from '../../constants/customStyles';
import { Ionicons } from '@react-native-vector-icons/ionicons';

const BoatDetailsTab = ({ bookingData }) => {
  return (
    <ScrollView 
      style={styles.container} 
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 20 }}
    >
      {/* Booking Details Section */}
      <View style={styles.section}>
        <View style={styles.bookingHeader}>
          <View style={styles.bookingHeaderLeft}>
            <Text style={styles.bookingTitle}>Booking Details</Text>
            <Text style={styles.bookingId}>#{bookingData.bookingId || bookingData.id}</Text>
          </View>
          <View style={styles.actionButtons}>
            <View style={styles.bookingHeaderVerticalDivider} />
            <TouchableOpacity style={styles.checkInButton}>
              <Image source={require('../../assets/images/clock_in.png')} style={styles.checkInIcon} />
              <Text style={styles.checkInText}>Check-in</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.editButton}>
              <Ionicons name="pencil" size={16} color={Colors.font_gray} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.deleteButton}>
              <Ionicons name="trash" size={16} color="#FF4444" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Boat Details Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Boat Details</Text>
        <View style={styles.boatCard}>
          <Image source={bookingData.image} style={styles.boatImage} />
          <View style={styles.boatInfo}>
            <Text style={styles.boatName}>{bookingData.title}</Text>
            <View style={styles.boatDetails}>
              <View style={styles.capacityContainer}>
                <Ionicons name="people" size={16} color={Colors.primary} />
                <Text style={styles.capacityText}>{bookingData.capacity}</Text>
              </View>
              <Text style={styles.boatReg}>Boat Reg.No {bookingData.boatId}</Text>
              <Text style={styles.boatSize}>Boat Size {bookingData.size}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Chartered Information Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Chartered Information Details</Text>
        <View style={styles.chartererCard}>
          <View style={styles.chartererRow}>
            <Text style={styles.chartererLabel}>Full Name</Text>
            <Text style={styles.chartererValue}>{bookingData.charterer.name}</Text>
          </View>
          <View style={styles.chartererRow}>
            <Text style={styles.chartererLabel}>Phone Number</Text>
            <Text style={styles.chartererValue}>{bookingData.charterer.phone}</Text>
          </View>
          <View style={styles.chartererRow}>
            <Text style={styles.chartererLabel}>Email</Text>
            <Text style={styles.chartererValue}>{bookingData.charterer.email}</Text>
          </View>
        </View>
      </View>

      {/* Date and Time Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Date and Time</Text>
        <View style={styles.dateTimeCard}>
          <View style={styles.dateTimeRow}>
            <Text style={styles.dateTimeLabel}>Arrival</Text>
            <Text style={styles.dateTimeValue}>
              {bookingData.arrivalDate} {bookingData.arrivalTime}
            </Text>
          </View>
          <View style={styles.dateTimeRow}>
            <Text style={styles.dateTimeLabel}>Departure</Text>
            <Text style={styles.dateTimeValue}>
              {bookingData.departureDate} {bookingData.departureTime}
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

export default BoatDetailsTab;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: Colors.font_gray,
    marginBottom: 12,
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.white,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  bookingHeaderLeft: {
    gap: 4,
  },
  bookingTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: Colors.font_gray,
  },
  bookingId: {
    fontSize: 25,
    fontFamily: 'Inter-Bold',
    color: Colors.primary,
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  bookingHeaderVerticalDivider: {
    width: 1,
    height: 60,
    backgroundColor: '#E8EBEC',
    marginLeft: 15,
  },
  checkInButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
    gap: 6,
  },
  checkInText: {
    color: Colors.white,
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
  },
  checkInIcon: {
    width: 16,
    height: 16,
    resizeMode: 'contain',
  },
  editButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  boatCard: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  boatImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 16,
  },
  boatInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  boatName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: Colors.black,
    marginBottom: 8,
  },
  boatDetails: {
    gap: 4,
  },
  capacityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  capacityText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: Colors.primary,
  },
  boatReg: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: Colors.font_gray,
  },
  boatSize: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: Colors.font_gray,
  },
  chartererCard: {
    backgroundColor: Colors.white,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  chartererRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  chartererLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: Colors.font_gray,
    flex: 1,
  },
  chartererValue: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: Colors.black,
    flex: 1,
    textAlign: 'right',
  },
  dateTimeCard: {
    backgroundColor: Colors.white,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  dateTimeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  dateTimeLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: Colors.font_gray,
  },
  dateTimeValue: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: Colors.black,
  },
});
