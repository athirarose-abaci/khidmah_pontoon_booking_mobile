import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image, ScrollView } from 'react-native';
import moment from 'moment';
import { Colors } from '../../constants/customStyles';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import { MaterialDesignIcons } from '@react-native-vector-icons/material-design-icons';

const BoatDetailsTab = ({ bookingData, isDarkMode }) => {
  
  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return 'N/A';
    
    const momentDate = moment(dateTimeString);
    
    if (!momentDate.isValid()) {
      return 'Invalid Date';
    }
    
    const dateStr = momentDate.format('DD.MM.YYYY');
    const timeStr = momentDate.format('hh:mma');
    
    return `${dateStr} | ${timeStr}`;
  };

  const getBoatImage = () => {
    if (bookingData?.boat?.images && bookingData.boat.images.length > 0) {
      const firstImage = bookingData.boat.images[0];
      
      // Handle both string URLs and image objects
      if (typeof firstImage === 'string') {
        return { uri: firstImage };
      } else if (firstImage && typeof firstImage === 'object') {
        // If it's an object, try to get the URL from common properties
        const imageUrl = firstImage.url || firstImage.image || firstImage.src || firstImage.uri;
        if (imageUrl && typeof imageUrl === 'string') {
          return { uri: imageUrl };
        }
      }
    }
    return require('../../assets/images/no_image.jpg');
  };

  return (
    <View style={styles.container}>
      {/* Boat Details Section */}
      <View style={styles.section}>
        <View style={[styles.boatCard, { backgroundColor: isDarkMode ? Colors.dark_container : Colors.white }]}>
          <View style={styles.cardHeaderContainer}>
            <View style={styles.cardHeaderIconContainer}>
              <View style={styles.cardHeaderIcon}>
                <Ionicons name="boat" size={23} color={Colors.white} />
              </View>
            </View>
            <Text style={[styles.cardHeaderText, { color: isDarkMode ? Colors.white : Colors.heading_font }]}>Boat Details</Text>
          </View>
          <View style={[styles.cardHeaderSeparator, { backgroundColor: isDarkMode ? Colors.dark_separator : '#E8EBEC' }]} />
          <View style={styles.boatContent}>
            <Image source={getBoatImage()} style={styles.boatImage} />
            <View style={styles.boatInfo}>
              <Text style={[styles.boatName, { color: isDarkMode ? Colors.white : Colors.heading_font }]}>{bookingData?.boat?.name || ''}</Text>
              <View style={styles.boatDetails}>
                <View style={styles.capacityContainer}>
                  <Image source={require('../../assets/images/capacity.png')} style={styles.capacityIcon} />
                  <Text style={styles.capacityText}>{bookingData?.passengers !== undefined ? bookingData?.passengers : ''}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={[styles.detailLabel, { color: isDarkMode ? Colors.dark_text_secondary : Colors.font_gray }]}>Boat Reg.No</Text>
                  <Text style={[styles.detailValue, { color: isDarkMode ? Colors.white : Colors.heading_font }]}>{bookingData?.boat?.registration_number || ''}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={[styles.detailLabel, { color: isDarkMode ? Colors.dark_text_secondary : Colors.font_gray }]}>Boat Size</Text>
                  <Text style={[styles.detailValue, { color: isDarkMode ? Colors.white : Colors.heading_font }]}>
                    {bookingData?.boat?.length && bookingData?.boat?.width 
                      ? `${bookingData?.boat?.length} ft x ${bookingData?.boat?.width} ft` 
                      : ''}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      </View>

      {/* Booking Information Section */}
      <View style={styles.section}>
        <View style={[styles.chartererCard, { backgroundColor: isDarkMode ? Colors.dark_container : Colors.white }]}>
          <View style={styles.cardHeaderContainer}>
              <View style={styles.cardHeaderIconContainer}>
                <View style={styles.cardHeaderIcon}>
                  <Image source={require('../../assets/images/person_pin.png')} style={styles.cardHeaderImage} />
                </View>
              </View>
            <Text style={[styles.cardHeaderText, { color: isDarkMode ? Colors.white : Colors.heading_font }]}>Chartered Information Details</Text>
          </View>
          <View style={[styles.cardHeaderSeparator, { backgroundColor: isDarkMode ? Colors.dark_separator : '#E8EBEC' }]} />
          <View style={styles.chartererContent}>
            <View style={styles.chartererRow}>
              <View style={styles.chartererLeftColumn}>
                <View style={styles.chartererDetailColumn}>
                  <Text style={[styles.detailLabel, { color: isDarkMode ? Colors.dark_text_secondary : Colors.font_gray }]}>Full Name</Text>
                  <Text style={[styles.detailValue, { color: isDarkMode ? Colors.white : Colors.heading_font }]}>{bookingData?.customer?.full_name || ''}</Text>
                </View>
              </View>
              <View style={styles.chartererRightColumn}>
                <View style={styles.chartererDetailColumn}>
                  <Text style={[styles.detailLabel, { color: isDarkMode ? Colors.dark_text_secondary : Colors.font_gray }]}>Mobile Number</Text>
                  <Text style={[styles.detailValue, { color: isDarkMode ? Colors.white : Colors.heading_font }]}>{bookingData?.customer?.mobile_number || ''}</Text>
                </View>
              </View>
            </View>
            <View style={styles.emailRow}>
              <View style={styles.emailDetailColumn}>
                <Text style={[styles.detailLabel, { color: isDarkMode ? Colors.dark_text_secondary : Colors.font_gray }]}>Email</Text>
                <Text style={[styles.detailValue, { color: isDarkMode ? Colors.white : Colors.heading_font }]}>{bookingData?.customer?.email || ''}</Text>
              </View>
            </View>
          </View>
        </View>
      </View>

      {/* Date and Time Section */}
      <View style={styles.section}>
        <View style={[styles.dateTimeCard, { backgroundColor: isDarkMode ? Colors.dark_container : Colors.white }]}>
          <View style={styles.cardHeaderContainer}>
              <View style={styles.cardHeaderIconContainer}>
                <View style={styles.cardHeaderIcon}>
                  <Ionicons name="calendar-outline" size={20} color={Colors.white} />
                </View>
              </View>
            <Text style={[styles.cardHeaderText, { color: isDarkMode ? Colors.white : Colors.heading_font }]}>Date and Time</Text>
          </View>
          <View style={[styles.cardHeaderSeparator, { backgroundColor: isDarkMode ? Colors.dark_separator : '#E8EBEC' }]} />
          <View style={styles.dateTimeContent}>
            <View style={styles.dateTimeRow}>
              <View style={styles.dateTimeLeftColumn}>
                <View style={styles.dateTimeDetailColumn}>
                  <Text style={[styles.detailLabel, { color: isDarkMode ? Colors.dark_text_secondary : Colors.font_gray }]}>Arrival</Text>
                  <Text style={[styles.detailValue, { color: isDarkMode ? Colors.white : Colors.heading_font }]}>
                    {formatDateTime(bookingData?.start_date)}
                  </Text>
                </View>
              </View>
              <View style={styles.dateTimeRightColumn}>
                <View style={styles.dateTimeDetailColumn}>
                  <Text style={[styles.detailLabel, { color: isDarkMode ? Colors.dark_text_secondary : Colors.font_gray }]}>Departure</Text>
                  <Text style={[styles.detailValue, { color: isDarkMode ? Colors.white : Colors.heading_font }]}>
                    {formatDateTime(bookingData?.end_date)}
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
    fontSize: 17,
    fontFamily: 'Inter-SemiBold',
  },
  cardHeaderSeparator: {
    height: 1,
    backgroundColor: '#E8EBEC',
    marginHorizontal: -20,
    marginTop: 8,
    marginBottom: 8,
  },
  boatCard: {
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
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
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
    paddingHorizontal: 6,
    borderRadius: 18,
    alignSelf: 'flex-start',
  },
  capacityIcon: {
    width: 14,
    height: 14,
    resizeMode: 'contain',
  },
  capacityText: {
    fontSize: 13,
    fontFamily: 'Inter-Medium',
    color: Colors.primary,
  },
  detailRow: {
    gap: 1,
  },
  detailLabel: {
    fontSize: 13,
    fontFamily: 'Inter-Regular',
  },
  detailValue: {
    fontSize: 13,
    fontFamily: 'Inter-Medium',
  },
  chartererCard: {
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
  emailRow: {
    marginTop: 12,
  },
  emailDetailColumn: {
    gap: 2,
  },
  dateTimeCard: {
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
