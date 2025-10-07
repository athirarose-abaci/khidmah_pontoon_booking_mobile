import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image, ScrollView } from 'react-native';
import { Colors } from '../../constants/customStyles';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import { MaterialDesignIcons } from '@react-native-vector-icons/material-design-icons';

const BoatDetailsTab = ({ bookingData }) => {
  return (
    <View style={styles.container}>
      {/* Boat Details Section */}
      <View style={styles.section}>
        <View style={styles.boatCard}>
          <View style={styles.cardHeaderContainer}>
            <View style={styles.cardHeaderIconContainer}>
              <View style={styles.cardHeaderIcon}>
                <Ionicons name="boat" size={23} color={Colors.white} />
              </View>
            </View>
            <Text style={styles.cardHeaderText}>Boat Details</Text>
          </View>
          <View style={styles.cardHeaderSeparator} />
          <View style={styles.boatContent}>
            <Image source={bookingData.image} style={styles.boatImage} />
            <View style={styles.boatInfo}>
              <Text style={styles.boatName}>{bookingData.title}</Text>
              <View style={styles.boatDetails}>
                <View style={styles.capacityContainer}>
                  <Image source={require('../../assets/images/capacity.png')} style={styles.capacityIcon} />
                  <Text style={styles.capacityText}>{bookingData.capacity}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Boat Reg.No</Text>
                  <Text style={styles.detailValue}>{bookingData.boatId}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Boat Size</Text>
                  <Text style={styles.detailValue}>{bookingData.size}</Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      </View>

      {/* Chartered Information Section */}
      <View style={styles.section}>
        <View style={styles.chartererCard}>
          <View style={styles.cardHeaderContainer}>
              <View style={styles.cardHeaderIconContainer}>
                <View style={styles.cardHeaderIcon}>
                  <Image source={require('../../assets/images/person_pin.png')} style={styles.cardHeaderImage} />
                </View>
              </View>
            <Text style={styles.cardHeaderText}>Chartered Information Details</Text>
          </View>
          <View style={styles.cardHeaderSeparator} />
          <View style={styles.chartererContent}>
            <View style={styles.chartererRow}>
              <View style={styles.chartererLeftColumn}>
                <View style={styles.chartererDetailColumn}>
                  <Text style={styles.detailLabel}>Full Name</Text>
                  <Text style={styles.detailValue}>{bookingData.charterer.name}</Text>
                </View>
                <View style={styles.chartererDetailColumn}>
                  <Text style={styles.detailLabel}>Email</Text>
                  <Text style={styles.detailValue}>{bookingData.charterer.email}</Text>
                </View>
              </View>
              <View style={styles.chartererRightColumn}>
                <View style={styles.chartererDetailColumn}>
                  <Text style={styles.detailLabel}>Phone Number</Text>
                  <Text style={styles.detailValue}>{bookingData.charterer.phone}</Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      </View>

      {/* Date and Time Section */}
      <View style={styles.section}>
        <View style={styles.dateTimeCard}>
          <View style={styles.cardHeaderContainer}>
              <View style={styles.cardHeaderIconContainer}>
                <View style={styles.cardHeaderIcon}>
                  <Ionicons name="calendar-outline" size={20} color={Colors.white} />
                </View>
              </View>
            <Text style={styles.cardHeaderText}>Date and Time</Text>
          </View>
          <View style={styles.cardHeaderSeparator} />
          <View style={styles.dateTimeContent}>
            <View style={styles.dateTimeRow}>
              <View style={styles.dateTimeLeftColumn}>
                <View style={styles.dateTimeDetailColumn}>
                  <Text style={styles.detailLabel}>Arrival</Text>
                  <Text style={styles.detailValue}>
                    {bookingData.arrivalDate} {bookingData.arrivalTime}
                  </Text>
                </View>
              </View>
              <View style={styles.dateTimeRightColumn}>
                <View style={styles.dateTimeDetailColumn}>
                  <Text style={styles.detailLabel}>Departure</Text>
                  <Text style={styles.detailValue}>
                    {bookingData.departureDate} {bookingData.departureTime}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

export default BoatDetailsTab;

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
  cardHeaderImage: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
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
  boatCard: {
    backgroundColor: Colors.white,
    padding: 20,
    borderRadius: 12,
  },
  boatContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 4,
  },
  boatImage: {
    width: '50%',
    height: 140,
    borderRadius: 15,
    marginRight: 16,
    resizeMode: 'cover',
  },
  boatInfo: {
    flex: 1,
    justifyContent: 'center',
    paddingLeft: 8,
  },
  boatName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: Colors.heading_font,
    marginBottom: 4,
  },
  boatDetails: {
    gap: 8,
  },
  capacityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.primary,
    paddingHorizontal: 8,
    borderRadius: 18,
    alignSelf: 'flex-start',
  },
  capacityIcon: {
    width: 16,
    height: 16,
    resizeMode: 'contain',
  },
  capacityText: {
    fontSize: 15,
    fontFamily: 'Inter-Medium',
    color: Colors.primary,
  },
  detailRow: {
    gap: 1,
  },
  detailLabel: {
    fontSize: 13,
    fontFamily: 'Inter-Regular',
    color: Colors.font_gray,
  },
  detailValue: {
    fontSize: 15,
    fontFamily: 'Inter-Medium',
    color: Colors.heading_font,
  },
  chartererCard: {
    backgroundColor: Colors.white,
    padding: 20,
    borderRadius: 12,
  },
  chartererContent: {
    paddingTop: 4,
    paddingHorizontal: 8,
  },
  chartererRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 8,
    gap: 24,
  },
  chartererLeftColumn: {
    flex: 1,
    gap: 12,
  },
  chartererRightColumn: {
    flex: 1,
    gap: 12,
  },
  chartererDetailColumn: {
    gap: 2,
  },
  dateTimeCard: {
    backgroundColor: Colors.white,
    padding: 20,
    borderRadius: 12,
  },
  dateTimeContent: {
    paddingTop: 4,
  },
  dateTimeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 8,
    gap: 24,
  },
  dateTimeLeftColumn: {
    flex: 1,
    gap: 12,
  },
  dateTimeRightColumn: {
    flex: 1,
    gap: 12,
  },
  dateTimeDetailColumn: {
    gap: 2,
  },
});
