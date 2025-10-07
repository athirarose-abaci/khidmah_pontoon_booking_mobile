import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import { Colors, getStatusTagColors } from '../../constants/customStyles';

const MyBookingCard = ({ item, onPress }) => {
  const { backgroundColor: statusBg, textColor: statusTextColor } = getStatusTagColors(item?.status);
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      {/* Left side image */}
      <View style={styles.imageWrapper}>
        <Image source={item.image} style={styles.image} />
        <View style={[styles.statusTag, { backgroundColor: statusBg }]}>
          <Text style={[styles.statusText, { color: statusTextColor }]}>{item.status}</Text>
        </View>
      </View>

      {/* Right content */}
      <View style={styles.content}>
        <View style={styles.headerRow}>
          <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
          <View style={styles.dot} />
          <Text style={styles.subTitle} numberOfLines={1}>{item.boatId}</Text>
          <Text style={styles.code} numberOfLines={1}>#{item.bookingId}</Text>
        </View>
        <View style={styles.divider} />

        <View style={styles.timeRow}>
          <View style={styles.timeBlock}>
            <View style={styles.timeHeaderRow}>
              <Ionicons name="time-outline" size={16} color={Colors.primary} />
              <Text style={[styles.label, { marginLeft: 6 }]}>Arrival</Text>
            </View>
            <Text style={styles.timeText}>
              {item.arrivalDate} | {item.arrivalTime}
            </Text>
          </View>

          <View style={styles.timeBlock}>
            <View style={styles.timeHeaderRow}>
              <Ionicons name="time-outline" size={16} color={Colors.primary} />
              <Text style={[styles.label, { marginLeft: 6 }]}>Departure</Text>
            </View>
            <Text style={styles.timeText}>
              {item.departureDate} | {item.departureTime}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default MyBookingCard;

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderRadius: 12,
    marginBottom: 5,
    marginTop: 10,
    minHeight: 110,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
    overflow: 'hidden',
  },
  imageWrapper: {
    position: 'relative',
    width: 95,
    height: 90,
    margin: 12,
    borderRadius: 10,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  content: {
    flex: 1,
    paddingVertical: 10,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#BDBDBD',
    marginHorizontal: 3,
  },
  title: {
    color: Colors.primary,
    fontFamily: 'Inter-SemiBold',
    fontSize: 15,
    flex: 0,
    flexShrink: 1,
  },
  subTitle: {
    color: Colors.font_gray,
    fontSize: 13,
    flex: 0.2,
    textAlign: 'left',
  },
  code: {
    fontSize: 12,
    color: Colors.font_gray,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingVertical: 1,
    paddingHorizontal: 7,
    marginRight: 2,
  },
  divider: {
    height: 1,
    backgroundColor: '#F6F6F6',
    marginTop: 6,
    marginBottom: 6,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  timeBlock: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    flex: 1,
  },
  timeHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  label: {
    fontSize: 13,
    color: Colors.font_gray,
    fontFamily: 'Inter-Regular',
  },
  timeText: {
    fontSize: 12,
    color: Colors.black,
    fontFamily: 'Inter-SemiBold',
    marginTop: 4,
  },
  statusTag: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#FFD966',
    paddingVertical: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusText: {
    fontSize: 13,
    color: Colors.black,
    fontFamily: 'Inter-SemiBold',
    textAlign: 'center',
  },
});
