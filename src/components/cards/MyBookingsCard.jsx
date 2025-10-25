import React, { useContext, useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import moment from 'moment';
import { Colors, getStatusTagColorsWithBg, getDisplayStatus } from '../../constants/customStyles';
import { checkOutBooking, extendBooking } from '../../apis/booking';
import { MaterialDesignIcons } from '@react-native-vector-icons/material-design-icons';
import Error from '../../helpers/Error';
import { ToastContext } from '../../context/ToastContext';
import ExtendBookingModal from '../modals/ExtendBookingModal';
import ConfirmationModal from '../modals/ConfirmationModal';
import AbaciLoader from '../AbaciLoader';
import { useDispatch, useSelector } from 'react-redux';
import { updateBooking as updateBookingAction } from '../../../store/bookingSlice';

const MyBookingCard = ({ item, onPress, isCheckedInTab = false, onCheckoutSuccess }) => {
  const dispatch = useDispatch();
  const isDarkMode = useSelector(state => state.themeSlice.isDarkMode);
  const bookingFromStore = useSelector(state => state?.bookingSlice?.bookings?.find(b => b.id === item?.id));
  const booking = bookingFromStore || item;

  const { backgroundColor: statusBg, textColor: statusTextColor } = getStatusTagColorsWithBg(booking?.status);
  const [checkingOut, setCheckingOut] = useState(false);
  const [showExtendModal, setShowExtendModal] = useState(false);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [extending, setExtending] = useState(false);

  const toastContext = useContext(ToastContext);

  const handleCheckOutPress = () => {
    setShowCheckoutModal(true);
  };

  const handleConfirmCheckout = async () => {
    if (checkingOut) return;
    try {
      setCheckingOut(true);
      setShowCheckoutModal(false);
      const updated = await checkOutBooking(booking?.id);
      if (updated) {
        dispatch(updateBookingAction(updated));
        if (onCheckoutSuccess) {
          onCheckoutSuccess();
        }
      }
    } catch (e) {
      let err_msg = Error(e);
      toastContext.showToast(err_msg, "short", "error");
    } finally {
      setCheckingOut(false);
    }
  };

  const handleExtendBooking = async (bookingId, hours, minutes) => {
    setExtending(true);
    try {
      const updated = await extendBooking(bookingId, hours, minutes);
      if (updated) {
        dispatch(updateBookingAction(updated));
      }
      toastContext.showToast(`Booking extended by ${hours}:${minutes}`, "short", "success");
    } catch (error) {
      let err_msg = Error(error);
      toastContext.showToast(err_msg, "short", "error");
    } finally {
      setExtending(false);
    }
  };
  
  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return 'N/A';
       
    const momentDate = moment(dateTimeString);
    
    if (!momentDate.isValid()) {
      return 'Invalid Date';
    }
    
    const dateStr = momentDate.format('DD.MM.YY');
    const timeStr = momentDate.format('hh:mmA');
    
    return `${dateStr} | ${timeStr}`;
  };

  const getBoatImage = () => {
    if (booking?.boat?.images && booking?.boat?.images?.length > 0) {
      const firstImage = booking?.boat?.images[0];
      
      if (typeof firstImage === 'string') {
        return { uri: firstImage };
      } else if (firstImage && typeof firstImage === 'object') {
        const imageUrl = firstImage.url || firstImage.image || firstImage.src || firstImage.uri;
        if (imageUrl && typeof imageUrl === 'string') {
          return { uri: imageUrl };
        }
      }
    }
    return require('../../assets/images/no_image.jpg');
  };

  return (
    <TouchableOpacity style={[styles.card, { backgroundColor: isDarkMode ? Colors.dark_container : Colors.white }]} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.topRow}>
        {/* Left side image */}
        <View style={styles.imageWrapper}>
          <Image source={getBoatImage()} style={styles.image} />
          <View style={[styles.statusTag, { backgroundColor: statusBg }]}>
            <Text style={[styles.statusText, { color: statusTextColor }]}>{getDisplayStatus(booking?.status)}</Text>
          </View>
        </View>

        {/* Right content */}
        <View style={styles.content}>
          <View style={styles.headerRow}>
            <Text style={styles.title} >
              {booking?.boat?.name ? (booking?.boat?.name.length > 11 ? booking?.boat?.name.substring(0, 11) + '...' : booking?.boat?.name) : 'N/A'}
            </Text>
            <View style={styles.dot} />
            <Text style={[styles.subTitle, { marginRight: 5 }]} >
              {booking?.boat?.registration_number ? (booking?.boat?.registration_number.length > 8 ? booking?.boat?.registration_number.substring(0, 8) + '...' : booking?.boat?.registration_number) : 'N/A'}
            </Text>
            <Text style={[styles.code, { backgroundColor: isDarkMode ? Colors.size_bg_dark : Colors.size_bg_light }]} >
              {booking?.booking_number ? (booking?.booking_number.length > 9 ? '#' + booking?.booking_number.substring(0, 9) + '...' : '#' + booking?.booking_number) : 'N/A'}
            </Text>
          </View>
          <View style={styles.divider} />

          <View style={styles.timeRow}>
            <View style={styles.timeBlock}>
              <View style={styles.timeHeaderRow}>
                <Image 
                  source={require('../../assets/images/clock_in.png')} 
                  style={styles.timeIcon}
                  resizeMode="contain"
                />
                <Text style={[styles.label, { marginLeft: 6 }]}>Arrival</Text>
              </View>
              <Text style={[styles.timeText, { color: isDarkMode ? Colors.white : Colors.black }]}>
                {formatDateTime(booking?.start_date)}
              </Text>
            </View>

            <View style={styles.timeBlock}>
              <View style={styles.timeHeaderRow}>
                <Image 
                  source={require('../../assets/images/clock_out.png')} 
                  style={styles.timeIcon}
                  resizeMode="contain"
                />
                <Text style={[styles.label, { marginLeft: 6 }]}>Departure</Text>
              </View>
              <Text style={[styles.timeText, { color: isDarkMode ? Colors.white : Colors.black }]}>
                {formatDateTime(booking?.end_date)}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {isCheckedInTab && String(booking?.status).toLowerCase() === 'checked_in' && (
        <View style={styles.actionsRow}>
          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.extendButton}
            onPress={() => setShowExtendModal(true)}
          >
            <View style={styles.btnContent}>
              <MaterialDesignIcons name="timer-plus-outline" size={18} color={Colors.primary} style={styles.btnIcon} />
              <Text style={styles.extendButtonText}>Extend stay</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.checkoutButton}
            disabled={checkingOut}
            onPress={handleCheckOutPress}
          >
            <View style={styles.btnContent}>
              <Image source={require('../../assets/images/clock_out.png')} style={styles.btnIcon} />
              <Text style={styles.checkoutButtonText}>Check-out</Text>
            </View>
          </TouchableOpacity>
        </View>
      )}

      <ExtendBookingModal
        visible={showExtendModal}
        onClose={() => setShowExtendModal(false)}
        onExtend={handleExtendBooking}
        bookingItem={booking}
        extending={extending}
      />
      <ConfirmationModal
        isVisible={showCheckoutModal}
        onRequestClose={() => setShowCheckoutModal(false)}
        onConfirm={handleConfirmCheckout}
        title="Check-out Confirmation"
        message="Are you sure you want to check out? This action cannot be undone."
        confirmText="Check-out"
        cancelText="Cancel"
        showWarningIcon={true}
        warningIconName="exit-to-app"
        warningIconColor="#FF6B35"
        warningIconSize={30}
        confirmIconName="exit-to-app"
        confirmIconColor="white"
        confirmButtonColor="#FF6B35"
        warningIconBgColor="#FFF3E0"
      />
      <AbaciLoader visible={extending || checkingOut} />
    </TouchableOpacity>
  );
};

export default MyBookingCard;

const styles = StyleSheet.create({
  card: {
    flexDirection: 'column',
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
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
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
    fontSize: 14.5,
    flexShrink: 1,
    maxWidth: '40%',
  },
  subTitle: {
    color: Colors.font_gray,
    fontSize: 11,
    flexShrink: 1,
    maxWidth: '25%',
  },
  code: {
    fontSize: 12,
    color: Colors.font_gray,
    borderRadius: 12,
    paddingVertical: 1,
    paddingHorizontal: 7,
    marginRight: 2,
  },
  registrationNumber: {
    color: Colors.font_gray,
    fontSize: 13,
    flexShrink: 1,
    maxWidth: '25%',
    textAlign: 'right',
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
  timeIcon: {
    width: 16,
    height: 16,
    tintColor: Colors.primary,
  },
  label: {
    fontSize: 13,
    color: Colors.font_gray,
    fontFamily: 'Inter-Regular',
  },
  timeText: {
    fontSize: 11,
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
  extendButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: 10,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FFFC',
    marginRight: 15,
  },
  checkoutButton: {
    flex: 1,
    backgroundColor: Colors.primary,
    borderRadius: 10,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 5,
    marginBottom: 20,
    alignSelf: 'stretch',
    paddingHorizontal: 12,
  },
  
  extendButtonText: {
    color: Colors.primary,
    fontFamily: 'Inter-SemiBold',
    fontSize: 13,
  },
  btnContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnIcon: {
    marginRight: 6,
    width: 18,
    height: 18,
    tintColor: Colors.white,
  },
  
  checkoutButtonText: {
    color: Colors.white,
    fontFamily: 'Inter-SemiBold',
    fontSize: 13,
  },
  
});
