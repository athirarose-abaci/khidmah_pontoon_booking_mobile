import React, { useLayoutEffect, useState, useRef, useContext, useCallback, useEffect } from 'react';
import { StatusBar, StyleSheet, Text, View, TouchableOpacity, Image, ScrollView, Animated, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, getDisplayStatus, getStatusTagColors } from '../constants/customStyles';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import { MaterialIcons } from '@react-native-vector-icons/material-icons';
import { BoatDetailsTab, QRCodeTab } from '../components/bookingManagement';
import { MaterialDesignIcons } from '@react-native-vector-icons/material-design-icons';
import LinearGradient from 'react-native-linear-gradient';
import { bookingDetails, checkInBooking, checkOutBooking, deleteBooking, extendBooking } from '../apis/booking';
import ConfirmationModal from '../components/modals/ConfirmationModal';
import BookingSuccessModal from '../components/modals/BookingSuccessModal';
import ExtendBookingModal from '../components/modals/ExtendBookingModal';
import { ToastContext } from '../context/ToastContext';
import Error from '../helpers/Error';
import { useFocusEffect } from '@react-navigation/native';
import AbaciLoader from '../components/AbaciLoader';
import { useSelector, useDispatch } from 'react-redux';
import { updateBooking } from '../../store/bookingSlice';

const BookingManagementScreen = ({ route, navigation }) => {
  const { bookingId, sourceView } = route.params || {};
  const [activeTab, setActiveTab] = useState('info');
  const [isTabBarVisible, setIsTabBarVisible] = useState(true);
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [showCheckoutConfirmationModal, setShowCheckoutConfirmationModal] = useState(false);
  const [showDeleteConfirmationModal, setShowDeleteConfirmationModal] = useState(false);
  const [showEditSuccessModal, setShowEditSuccessModal] = useState(false);
  const [bookingData, setBookingData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isTabLoading, setIsTabLoading] = useState(false);
  const [editSourceView, setEditSourceView] = useState(() => sourceView || 'calendar'); // Store source view for navigation
  const [showExtendModal, setShowExtendModal] = useState(false);
  const [extending, setExtending] = useState(false);

  const toastContext = useContext(ToastContext);
  const isDarkMode = useSelector(state => state.themeSlice.isDarkMode);
  const dispatch = useDispatch();

  useFocusEffect(
    useCallback(() => {
      if (bookingId) {
        fetchBookingDetails();
      }
    }, [bookingId])
  )
  
  // Store sourceView when it changes
  useEffect(() => {
    if (route?.params?.sourceView) {
      setEditSourceView(route.params.sourceView);
    }
  }, [route?.params?.sourceView]);

  // Check for edit success when screen comes into focus
  useEffect(() => {
    if (route?.params?.editSuccess) {
      setShowEditSuccessModal(true);
      // Preserve sourceView from edit navigation params if provided
      if (route?.params?.sourceView) {
        setEditSourceView(route.params.sourceView);
      }
      // Clear the param to avoid showing again
      navigation.setParams({ editSuccess: undefined });
    }
  }, [route?.params?.editSuccess, route?.params?.sourceView, navigation]);

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
    if (!bookingId) {
      // toastContext.showToast('Booking ID not found', 'short', 'error');
      // navigation.goBack();
      return;
    }
    
    setIsLoading(true);
    try {
      const response = await bookingDetails(bookingId);
      setBookingData(response);
    } catch (error) {
      let err_msg = Error(error);
      toastContext.showToast(err_msg, 'short', 'error');
      // navigation.goBack();
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

  // const handleCheckIn = () => {
  //   if (!booking?.id) {
  //     toastContext.showToast('Booking ID not found', 'short', 'error');
  //     return;
  //   }
  //   setShowConfirmationModal(true);
  // };

  // const handleConfirmCheckIn = async () => {
  //   const bookingId = booking?.id;
    
  //   setIsCheckingIn(true);
  //   try {
  //     setShowConfirmationModal(false);
  //     await checkInBooking(bookingId);
  //     toastContext.showToast('Booking checked-in successfully!', 'short', 'success');
  //     navigation.goBack();
  //   } catch (error) {
  //     let err_msg = Error(error);
  //     toastContext.showToast(err_msg, 'short', 'error');
  //   } finally {
  //     setIsCheckingIn(false);
  //   }
  // };

  const handleCheckOut = () => {
    if (!bookingId) {
      toastContext.showToast('Booking ID not found', 'short', 'error');
      return;
    }
    setShowCheckoutConfirmationModal(true);
  };

  const handleConfirmCheckOut = async () => {
    if (!bookingId) {
      toastContext.showToast('Booking ID not found', 'short', 'error');
      return;
    }
    
    setIsCheckingOut(true);
    try {
      setShowCheckoutConfirmationModal(false);
      await checkOutBooking(bookingId);
      toastContext.showToast('Booking checked-out successfully!', 'short', 'success');
      // Refresh booking details after checkout
      await fetchBookingDetails();
    } catch (error) {
      let err_msg = Error(error);
      toastContext.showToast(err_msg, 'short', 'error');
    } finally {
      setIsCheckingOut(false);
    }
  };

  const handleExtendBooking = async (bookingId, hours, minutes, seconds) => {
    if (!bookingId) {
      toastContext.showToast('Booking ID not found', 'short', 'error');
      return;
    }
    setExtending(true);
    try {
      // seconds parameter is passed by modal but not used by API
      console.log(bookingId, hours, minutes);
      const updated = await extendBooking(bookingId, hours, minutes);
      if (updated) {
        dispatch(updateBooking(updated));
        // Refresh booking details after extending
        await fetchBookingDetails();
      }
      toastContext.showToast(`Booking extended by ${hours}:${minutes}`, "short", "success");
      setShowExtendModal(false);
    } catch (error) {
      let err_msg = Error(error);
      toastContext.showToast(err_msg, "short", "error");
    } finally {
      setExtending(false);
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
    if (!bookingId) {
      toastContext.showToast('Booking ID not found', 'short', 'error');
      return;
    }
    navigation.navigate('NewBooking', {
      editMode: true,
      bookingId: bookingId,
      bookingData: bookingData,
      sourceView: editSourceView // Pass source view to NewBookingScreen
    });
  };
  
  const handleCloseEditSuccessModal = () => {
    setShowEditSuccessModal(false);
    // Refresh booking details after successful edit
    if (bookingId) {
      fetchBookingDetails();
    }
  };
  
  const handleGoHomeFromEditSuccess = () => {
    setShowEditSuccessModal(false);
    // Navigate back to MyBookingsScreen based on source view
    navigation.navigate('Bookings', {
      screen: 'MyBookings',
      params: {
        viewMode: editSourceView === 'list' ? 'list' : 'calendar'
      }
    });
  };

  const handleDeleteBooking = () => {
    if (!bookingId) {
      toastContext.showToast('Booking ID not found', 'short', 'error');
      return;
    }
    setShowDeleteConfirmationModal(true);
  };

  const handleConfirmDeleteBooking = async () => {
    
    setShowDeleteConfirmationModal(false);
    try {
      await deleteBooking(bookingId);
      toastContext.showToast('Booking cancelled successfully!', 'short', 'success');
      navigation.goBack();
    } catch (error) {
      let err_msg = Error(error);
      toastContext.showToast(err_msg, 'short', 'error');
    } finally {
      setShowDeleteConfirmationModal(false);
    }
  };


  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: isDarkMode ? Colors.dark_bg_color : '#F7F7F7' }]} edges={["left", "right"]}>
      <StatusBar 
        translucent={true}
        backgroundColor="transparent" 
        barStyle={isDarkMode ? "light-content" : "dark-content"} 
      />
      
      {/* Header */}
      <View style={styles.header}>
        <MaterialIcons
          name="chevron-left"
          size={30}
          color={isDarkMode ? Colors.white : Colors.font_gray}
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        />
        <Text style={[styles.headerTitle, { color: isDarkMode ? Colors.white : Colors.font_gray }]}>Booking Management</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Booking Details Section */}
      <View style={styles.section}>
        <View style={[styles.bookingHeader, { backgroundColor: isDarkMode ? Colors.dark_container : Colors.white }]}>
          <View style={styles.bookingHeaderLeft}>
            {bookingData?.status && bookingData?.status !== 'CHECKED_OUT' && (
              <View style={[styles.statusTag, { 
                backgroundColor: isDarkMode 
                  ? Colors.dark_container 
                  : getStatusTagColors(bookingData?.status).backgroundColor,
                borderColor: getStatusTagColors(bookingData?.status).textColor
              }]}>
                <Text style={[styles.statusText, { 
                  color: getStatusTagColors(bookingData?.status).textColor 
                }]}>
                  {getDisplayStatus(bookingData?.status)}
                </Text>
              </View>
            )}
            <Text style={[styles.bookingTitle, { color: isDarkMode ? Colors.white : '#4C4C4C' }]}>Booking Details</Text>
            <Text style={[styles.bookingId, { color: Colors.primary }]}>{bookingData?.booking_number || 'Loading...'}</Text>
          </View>
          <View style={styles.actionButtons}>
            {bookingData?.status !== 'CANCELLED' && 
              bookingData?.status !== 'NO_SHOW' && 
              bookingData?.status !== 'CHECKED_IN' && 
              bookingData?.status !== 'CHECKED_OUT' && 
              <View style={[styles.bookingHeaderVerticalDivider, { backgroundColor: isDarkMode ? Colors.dark_separator : '#E8EBEC' }]} />
              }
            {bookingData?.status === 'CHECKED_OUT' ? (
              <View style={styles.checkedOutButton}>
                <MaterialDesignIcons name="check-circle" size={15} color={Colors.black} />
                <Text style={styles.checkedOutText}>Checked Out</Text>
              </View>
            ) : bookingData?.status === 'CHECKED_IN' ? (
              <View style={styles.checkedInActionsContainer}>
                <TouchableOpacity
                  activeOpacity={0.8}
                  style={styles.extendButton}
                  onPress={() => setShowExtendModal(true)}
                  disabled={extending}
                >
                  <MaterialDesignIcons name="timer-plus-outline" size={18} color={Colors.primary} style={styles.extendButtonIcon} />
                  <Text style={styles.extendButtonText}>Extend stay</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.checkInButton, isCheckingOut && styles.checkInButtonDisabled]} 
                  onPress={handleCheckOut}
                  disabled={isCheckingOut}
                >
                  {isCheckingOut ? (
                    <ActivityIndicator size="small" color={Colors.white} style={styles.checkInIcon} />
                  ) : (
                    <Image source={require('../assets/images/clock_out.png')} style={styles.checkInIcon} />
                  )}
                  <Text style={styles.checkInText}>
                    {isCheckingOut ? 'Checking out...' : 'Check-out'}
                  </Text>
                </TouchableOpacity>
              </View>
            ) : null}
            {/* Check-in button - Commented out
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
            */}
            {bookingData?.status !== 'CHECKED_OUT' 
              && bookingData?.status !== 'NO_SHOW' 
              && bookingData?.status !== 'CANCELLED' 
              && bookingData?.status !== 'CHECKED_IN' 
              && bookingData?.status !== 'EXTENDED' 
              && (
              <TouchableOpacity style={styles.editButton} onPress={handleEditBooking}>
                <MaterialDesignIcons name="square-edit-outline" size={20} color={Colors.primary} />
                <Text style={styles.editButtonText}>Edit</Text>
              </TouchableOpacity>
            )}
            {bookingData?.status !== 'CANCELLED' 
              && bookingData?.status !== 'CHECKED_IN' 
              && bookingData?.status !== 'CHECKED_OUT' 
              && bookingData?.status !== 'NO_SHOW' 
              && bookingData?.status !== 'EXTENDED' 
              && (
              <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteBooking}>
                <MaterialDesignIcons name="close-circle-outline" size={22} color={Colors.white} />
                <Text style={styles.deleteButtonText}>Cancel</Text>
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
            <BoatDetailsTab bookingData={bookingData} isLoading={isLoading} isDarkMode={isDarkMode} />
          ) : (
            <QRCodeTab bookingData={bookingData} isLoading={isLoading} isDarkMode={isDarkMode} />
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
        {bookingData?.status !== 'CHECKED_OUT' && bookingData?.status !== 'CANCELLED' && bookingData?.status !== 'NO_SHOW' && (
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

      {/* Check-in Confirmation Modal - Commented out
      <ConfirmationModal
        isVisible={showConfirmationModal}
        onRequestClose={() => setShowConfirmationModal(false)}
        onConfirm={handleConfirmCheckIn}
        title="Check-in Confirmation"
        message={`Are you sure you want to check-in booking #${bookingData?.booking_number || ''}?`}
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
      */}

      {/* Check-out Confirmation Modal */}
      <ConfirmationModal
        isVisible={showCheckoutConfirmationModal}
        onRequestClose={() => setShowCheckoutConfirmationModal(false)}
        onConfirm={handleConfirmCheckOut}
        title="Check-out Confirmation"
        message={`Are you sure you want to check-out booking #${bookingData?.booking_number || ''}?`}
        confirmText="Check-out"
        cancelText="Cancel"
        showWarningIcon={true}
        warningIconName="check-circle"
        warningIconColor={Colors.primary}
        warningIconBgColor="rgba(117, 200, 173, 0.2)"
        confirmIconComponent={
          <Image 
            source={require('../assets/images/clock_out.png')} 
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
        message={`Are you sure you want to cancel booking #${bookingData?.booking_number || ''}?`}
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

      {/* Extend Booking Modal */}
      <ExtendBookingModal
        visible={showExtendModal}
        onClose={() => setShowExtendModal(false)}
        onExtend={handleExtendBooking}
        bookingItem={bookingData}
        extending={extending}
      />

      {/* Edit Success Modal */}
      <BookingSuccessModal
        visible={showEditSuccessModal}
        onClose={handleCloseEditSuccessModal}
        onGoHome={handleGoHomeFromEditSuccess}
        isEditMode={true}
        bookingData={bookingData}
      />
      <AbaciLoader visible={isLoading || isTabLoading || extending} />
    </SafeAreaView>
  );
};

export default BookingManagementScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
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
    padding: 20,
    borderRadius: 12,
  },
  bookingHeaderLeft: {
    gap: 4,
  },
  bookingTitle: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
  },
  bookingId: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  checkedInActionsContainer: {
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: 8,
  },
  bookingHeaderVerticalDivider: {
    width: 1,
    height: 60,
    marginLeft: 15,
  },
  checkInButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 6,
    minWidth: 125,
    height: 36,
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
  extendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: '#F8FFFC',
    gap: 6,
    minWidth: 120,
    height: 36,
  },
  extendButtonIcon: {
    marginRight: 0,
  },
  extendButtonText: {
    color: Colors.primary,
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.primary,
    gap: 6,
  },
  editButtonText: {
    color: Colors.primary,
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.red,
    backgroundColor: Colors.red,
    gap: 6,
  },
  deleteButtonText: {
    color: Colors.white,
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
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
    borderWidth: 1,
  },
  statusText: {
    fontSize: 11,
    fontFamily: 'Inter-SemiBold',
    textAlign: 'center',
  },
});
