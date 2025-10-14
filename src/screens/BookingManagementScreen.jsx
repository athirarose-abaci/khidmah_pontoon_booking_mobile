import React, { useLayoutEffect, useState, useRef, useContext, useCallback, useEffect } from 'react';
import { StatusBar, StyleSheet, Text, View, TouchableOpacity, Image, ScrollView, Animated, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, getDisplayStatus, getStatusTagColors } from '../constants/customStyles';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import { MaterialIcons } from '@react-native-vector-icons/material-icons';
import { BoatDetailsTab, QRCodeTab } from '../components/bookingManagement';
import { MaterialDesignIcons } from '@react-native-vector-icons/material-design-icons';
import LinearGradient from 'react-native-linear-gradient';
import { bookingDetails, checkInBooking, checkOutBooking, deleteBooking } from '../apis/booking';
import ConfirmationModal from '../components/modals/ConfirmationModal';
import { ToastContext } from '../context/ToastContext';
import Error from '../helpers/Error';
import { useFocusEffect } from '@react-navigation/native';
import AbaciLoader from '../components/AbaciLoader';

const BookingManagementScreen = ({ route, navigation }) => {
  const { booking } = route.params || {};
  console.log('booking from booking management screen', booking);
  const [activeTab, setActiveTab] = useState('info');
  const [isTabBarVisible, setIsTabBarVisible] = useState(true);
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [showDeleteConfirmationModal, setShowDeleteConfirmationModal] = useState(false);
  const scrollY = useRef(new Animated.Value(0)).current;
  const [bookingData, setBookingData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isTabLoading, setIsTabLoading] = useState(false);

  const toastContext = useContext(ToastContext);

  useFocusEffect(
    useCallback(() => {
      if (booking) {
        fetchBookingDetails();
      }
    }, [booking])
  )

  useEffect(() => {
    if (bookingData?.status === 'CHECKED_OUT' && activeTab === 'qr') {
      setActiveTab('info');
    }
  }, [bookingData?.status, activeTab]);

  useLayoutEffect(() => {
    navigation.getParent()?.setOptions({
      tabBarStyle: { display: 'none' }
    });
  }, [navigation]);

  const fetchBookingDetails = async () => {
    setIsLoading(true);
    try {
      console.log('bookingData from booking management screen', booking?.id);
      const response = await bookingDetails(booking?.id);
      console.log('bookingDetails from booking management screen', bookingDetails);
      setBookingData(response);
    } catch (error) {
      console.log('error from booking management screen details', error);
      let err_msg = Error(error);
      console.log('error from booking management screen details', err_msg);
      toastContext.showToast(err_msg, 'short', 'error');
    } finally {
      setIsLoading(false);
    }
  }

  const handleScroll = (event) => {
    const currentOffset = event.nativeEvent.contentOffset.y;
    const threshold = 20; 
    
    if (currentOffset > threshold && isTabBarVisible) {
      setIsTabBarVisible(false);
    } else if (currentOffset <= threshold && !isTabBarVisible) {
      setIsTabBarVisible(true);
    }
  };

  const handleCheckIn = () => {
    if (!booking?.id) {
      toastContext.showToast('Booking ID not found', 'short', 'error');
      return;
    }
    setShowConfirmationModal(true);
  };

  const handleConfirmCheckIn = async () => {
    const bookingId = booking?.id;
    
    setIsCheckingIn(true);
    try {
      setShowConfirmationModal(false);
      await checkInBooking(bookingId);
      toastContext.showToast('Booking checked-in successfully!', 'short', 'success');
      navigation.goBack();
    } catch (error) {
      console.log('error from booking management screen check in', error);
      let err_msg = Error(error);
      console.log('error from booking management screen check in', err_msg);
      toastContext.showToast(err_msg, 'short', 'error');
    } finally {
      setIsCheckingIn(false);
    }
  };

  const handleCheckOut = async () => {
    const bookingId = booking?.id;
    if (!bookingId) {
      toastContext.showToast('Booking ID not found', 'short', 'error');
      return;
    }
    setIsCheckingOut(true);
    try {
      await checkOutBooking(bookingId);
      toastContext.showToast('Booking checked-out successfully!', 'short', 'success');
      navigation.goBack();
    } catch (error) {
      console.log('error from booking management screen check out', error);
      let err_msg = Error(error);
      console.log('error from booking management screen check out', err_msg);
      toastContext.showToast(err_msg, 'short', 'error');
    } finally {
      setIsCheckingOut(false);
    }
  };

  const handleTabSwitch = (tabName) => {
    if (activeTab !== tabName) {
      setIsTabLoading(true);
      setTimeout(() => {
        setActiveTab(tabName);
        setIsTabLoading(false);
      }, 500);
    }
  };

  const handleEditBooking = () => {
    if (!booking?.id) {
      toastContext.showToast('Booking ID not found', 'short', 'error');
      return;
    }
    navigation.navigate('NewBooking', {
      editMode: true,
      bookingId: booking.id,
      bookingData: bookingData
    });
  };

  const handleDeleteBooking = () => {
    if (!booking?.id) {
      toastContext.showToast('Booking ID not found', 'short', 'error');
      return;
    }
    setShowDeleteConfirmationModal(true);
  };

  const handleConfirmDeleteBooking = async () => {
    const bookingId = booking?.id;
    
    setShowDeleteConfirmationModal(false);
    try {
      await deleteBooking(bookingId);
      toastContext.showToast('Booking cancelled successfully!', 'short', 'success');
      navigation.goBack();
    } catch (error) {
      console.log('error from booking management screen delete booking', error);
      let err_msg = Error(error);
      console.log('error from booking management screen delete booking', err_msg);
      toastContext.showToast(err_msg, 'short', 'error');
    } finally {
      setShowDeleteConfirmationModal(false);
    }
  };


  return (
    <SafeAreaView style={styles.safeArea} edges={["left", "right"]}>
      <StatusBar backgroundColor="#F7F7F7" barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <MaterialIcons
          name="chevron-left"
          size={30}
          color={Colors.font_gray}
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        />
        <Text style={styles.headerTitle}>Booking Management</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Booking Details Section */}
      <View style={styles.section}>
        <View style={styles.bookingHeader}>
          <View style={styles.bookingHeaderLeft}>
            {bookingData?.status && bookingData?.status !== 'CHECKED_OUT' && (
              <View style={[styles.statusTag, { backgroundColor: getStatusTagColors(bookingData?.status).backgroundColor }]}>
                <Text style={[styles.statusText, { color: getStatusTagColors(bookingData?.status).textColor }]}>
                  {getDisplayStatus(bookingData?.status)}
                </Text>
              </View>
            )}
            <Text style={styles.bookingTitle}>Booking Details</Text>
            <Text style={styles.bookingId}>#{booking?.booking_number}</Text>
          </View>
          <View style={styles.actionButtons}>
            {bookingData?.status !== 'CANCELLED' && <View style={styles.bookingHeaderVerticalDivider} />}
            {bookingData?.status === 'CHECKED_OUT' ? (
              <View style={styles.checkedOutButton}>
                <MaterialDesignIcons name="check-circle" size={15} color={Colors.black} />
                <Text style={styles.checkedOutText}>Checked Out</Text>
              </View>
            ) : bookingData?.status === 'CHECKED_IN' ? (
              <TouchableOpacity 
                style={[styles.checkInButton, isCheckingOut && styles.checkInButtonDisabled]} 
                onPress={handleCheckOut}
                disabled={isCheckingOut}
              >
                {isCheckingOut ? (
                  <ActivityIndicator size="small" color={Colors.white} style={styles.checkInIcon} />
                ) : (
                  <Ionicons name="log-out-outline" size={18} color={Colors.white} style={styles.checkInIcon} />
                )}
                <Text style={styles.checkInText}>
                  {isCheckingOut ? 'Checking out...' : 'Check-out'}
                </Text>
              </TouchableOpacity>
            ) : bookingData?.status !== 'NO_SHOW' && bookingData?.status !== 'CANCELLED' ? (
              <TouchableOpacity 
                style={[styles.checkInButton, isCheckingIn && styles.checkInButtonDisabled]} 
                onPress={handleCheckIn}
                disabled={isCheckingIn}
              >
                {isCheckingIn ? (
                  <ActivityIndicator size="small" color={Colors.white} style={styles.checkInIcon} />
                ) : (
                  <Image source={require('../assets/images/clock_in.png')} style={styles.checkInIcon} />
                )}
                <Text style={styles.checkInText}>
                  {isCheckingIn ? 'Checking in...' : 'Check-in'}
                </Text>
              </TouchableOpacity>
            ) : null}
            {bookingData?.status !== 'CHECKED_OUT' && bookingData?.status !== 'NO_SHOW' && bookingData?.status !== 'CANCELLED' && (
              <TouchableOpacity style={styles.editButton} onPress={handleEditBooking}>
                <MaterialDesignIcons name="square-edit-outline" size={18} color={Colors.primary} />
              </TouchableOpacity>
            )}
            {bookingData?.status !== 'CANCELLED' && (
              <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteBooking}>
                <MaterialIcons name="cancel" size={18} color={Colors.white} />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>

      {/* Tab Content */}
      <ScrollView 
        style={styles.scrollContainer} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        <View style={styles.tabContent}>
          {activeTab === 'info' ? (
            <BoatDetailsTab bookingData={bookingData} isLoading={isLoading} />
          ) : (
            <QRCodeTab bookingData={bookingData} isLoading={isLoading} />
          )}
        </View>
      </ScrollView>

      {/* Bottom Tab Bar */}
      {isTabBarVisible && (
        <LinearGradient
          colors={['#D9D9D91A', '#7373731A', '#D9D9D91A']}
          locations={[0, 0.46, 1]}
          style={styles.bottomTabBar}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
        <TouchableOpacity 
          style={[styles.tabButton, activeTab === 'info' && styles.activeTabButton]}
          onPress={() => handleTabSwitch('info')}
          disabled={isTabLoading}
        >
          <MaterialDesignIcons 
            name="information-variant-circle" 
            size={30} 
            color={activeTab === 'info' ? Colors.white : '#6F6F6F'} 
          />
        </TouchableOpacity>
        {bookingData?.status !== 'CHECKED_OUT' && bookingData?.status !== 'CANCELLED' && (
          <TouchableOpacity 
            style={[styles.tabButton, activeTab === 'qr' && styles.activeTabButton]}
            onPress={() => handleTabSwitch('qr')}
            disabled={isTabLoading}
          >
            <Ionicons 
              name="qr-code" 
              size={28} 
              color={activeTab === 'qr' ? Colors.white : '#6F6F6F'} 
            />
          </TouchableOpacity>
        )}
        </LinearGradient>
      )}

      {/* Check-in Confirmation Modal */}
      <ConfirmationModal
        isVisible={showConfirmationModal}
        onRequestClose={() => setShowConfirmationModal(false)}
        onConfirm={handleConfirmCheckIn}
        title="Check-in Confirmation"
        message={`Are you sure you want to check-in booking #${booking?.booking_number}?`}
        confirmText="Check-in"
        cancelText="Cancel"
        showWarningIcon={true}
        warningIconName="check-circle"
        warningIconColor={Colors.primary}
        warningIconBgColor="rgba(117, 200, 173, 0.2)"
        confirmIconComponent={
          <Image 
            source={require('../assets/images/clock_in.png')} 
            style={{ width: 18, height: 18, resizeMode: 'contain', marginBottom: 4 }} 
          />
        }
        showConfirmIcon={true}
        confirmButtonColor={Colors.primary}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isVisible={showDeleteConfirmationModal}
        onRequestClose={() => setShowDeleteConfirmationModal(false)}
        onConfirm={handleConfirmDeleteBooking}
        title="Cancel Booking"
        message={`Are you sure you want to cancel booking #${booking?.booking_number}?`}
        confirmText="Cancel Booking"
        cancelText="Keep Booking"
        showWarningIcon={true}
        warningIconName="warning"
        warningIconColor="#FF4444"
        warningIconBgColor="#FFE6E6"
        confirmIconName="delete"
        confirmIconColor="white"
        showConfirmIcon={true}
        confirmButtonColor="#FF4444"
      />
      <AbaciLoader visible={isLoading || isTabLoading} />
    </SafeAreaView>
  );
};

export default BookingManagementScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F7F7F7',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 20,
    marginTop: 25,
    paddingRight: 12,
  },
  backButton: {
    marginLeft: 10,
    marginTop: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: Colors.font_gray,
    marginLeft: 5,
    flex: 1,
  },
  placeholder: {
    width: 40,
  },
  // Bottom Tab Bar Styles
  bottomTabBar: {
    position: 'absolute',
    bottom: 60,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 45,
    borderWidth: 1,
    borderColor: '#7373731A',
  },
  tabButton: {
    width: 65,
    height: 65,
    borderRadius: 35,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#D9D9D9',
  },
  activeTabButton: {
    backgroundColor: Colors.primary,
  },
  // Booking Details Styles
  scrollContainer: {
    flex: 1,
  },
  section: {
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  tabContent: {
    paddingHorizontal: 20,
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.white,
    padding: 20,
    borderRadius: 12,
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
    fontSize: 18,
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
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    gap: 6,
  },
  checkInButtonDisabled: {
    backgroundColor: '#CCCCCC',
    opacity: 0.7,
  },
  checkInText: {
    color: Colors.white,
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
  },
  checkInIcon: {
    width: 15,
    height: 15,
    resizeMode: 'contain',
  },
  editButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.red,
    backgroundColor: Colors.red,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkedOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D0D0D0',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  checkedOutText: {
    color: Colors.black,
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
  },
  statusTag: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 1,
    borderRadius: 10,
    marginBottom: 0,
  },
  statusText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    textAlign: 'center',
  },
});
