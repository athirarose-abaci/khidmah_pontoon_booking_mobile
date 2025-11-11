import { StatusBar, StyleSheet, Text, View, TouchableOpacity, TextInput, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import React, { useEffect, useRef, useState, useContext } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, BOOKING_TABS, getBackendStatus } from '../constants/customStyles';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import { Lucide } from '@react-native-vector-icons/lucide';
import SubTabBar from '../components/tab_bars/SubTabBar';
import CalendarModal from '../components/modals/CalendarModal';
import NoDataImage from '../components/NoDataImage';
import MyBookingsCard from '../components/cards/MyBookingsCard';
import useTabBarScroll from '../hooks/useTabBarScroll';
import CreateButton from '../components/newBooking/CreateButton';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import Error from '../helpers/Error';
import { fetchBookings } from '../apis/booking';
import { useDispatch, useSelector } from 'react-redux';
import { setBookings, clearBookings } from '../../store/bookingSlice';
import { ToastContext } from '../context/ToastContext';
import AbaciLoader from '../components/AbaciLoader';
import { fetchProfile } from '../apis/auth';
import moment from 'moment';

const MyBookingsScreen = () => {
  const toastContext = useContext(ToastContext);
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const dispatch = useDispatch();
  const isDarkMode = useSelector(state => state.themeSlice.isDarkMode);
  const [unreadCount, setUnreadCount] = useState(0);
  const liveNotifications = useSelector(state => state.notificationSlice.notifications);

  const [activeTab, setActiveTab] = useState('Upcoming');
  const tabs = BOOKING_TABS;

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const selectedDateRef = useRef(null);

  const [bookingsData, setBookingsData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const limit = 10;
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('null');
  const [isSearching, setIsSearching] = useState(false);
  const [hasMorePages, setHasMorePages] = useState(true);

  const { onScroll, insets } = useTabBarScroll();

  const lastProcessedNotifications = useRef({});
  const unreadCountRef = useRef(unreadCount);
  const isFirstFocus = useRef(true);

  useEffect(() => {
    selectedDateRef.current = selectedDate;
  }, [selectedDate]);
  
  useEffect(() => {
    if(isFocused) {
      const tabToUse = isFirstFocus.current ? 'Upcoming' : activeTab;
      if (isFirstFocus.current) {
        setActiveTab('Upcoming');
        isFirstFocus.current = false;
      }
      dispatch(clearBookings());
      setPage(1);
      setHasMorePages(true);
      fetchBookingsData(1, limit, false, searchQuery, getBackendStatus(tabToUse));
      selectedDateRef.current = null;
    }
  }, [activeTab, isFocused]);

  const fetchProfileData = async () => {
    try {
      const response = await fetchProfile();
      setUnreadCount(response?.unread_count || 0);
    } catch (error) {
      let err_msg = Error(error);
      toastContext.showToast(err_msg, 'short', 'error');
    }
  }

  useEffect(() => {
    unreadCountRef.current = unreadCount;
  }, [unreadCount]);

  useEffect(() => {
    if(isFocused) {
    fetchProfileData();
    }
  }, [isFocused]);

  // Track notifications similar to MyTicketsScreen
  useEffect(() => {
    if (!liveNotifications || Object.keys(liveNotifications).length === 0) return;

    Object.entries(liveNotifications).forEach(([notificationId, notificationData]) => {
      // Skip if we already processed this notification
      const notificationIdStr = notificationData?.id || notificationData?.[0]?.id;
      if (lastProcessedNotifications.current[notificationIdStr]) return;
      
      // Increment unread count for new notifications
      if (notificationData && !lastProcessedNotifications.current[notificationIdStr]) {
        setUnreadCount(prev => prev + 1);
        
        // Mark this notification as processed
        if (notificationIdStr) {
          lastProcessedNotifications.current[notificationIdStr] = true;
        }
      }
    });

    // Clean up old processed notifications (optional, to prevent memory leak)
    // if (Object.keys(lastProcessedNotifications.current).length > 100) {
    //   lastProcessedNotifications.current = {};
    // }
  }, [liveNotifications]);

  const fetchBookingsData = async (pageNumber, limit, isRefresh = false, searchQuery, status, dateRange) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setIsLoading(true);
    }
    
    try {
      const response = await fetchBookings(pageNumber, limit, searchQuery, status, dateRange);
      if (isRefresh || pageNumber === 1) {
        setBookingsData(response?.results || []);
        dispatch(setBookings(response?.results || []));
      } else {
        const newData = [...bookingsData, ...(response?.results || [])];
        setBookingsData(newData);
        dispatch(setBookings(newData));
      }
      
      setHasMorePages(!!response?.next);
      if(response?.next) {
        setPage(prevPage => prevPage + 1);
      }
    } catch (error) {
      let err_msg = Error(error);
      toastContext.showToast(err_msg, "short", "error");
    } finally {
      if (isRefresh) {
        setRefreshing(false);
      } else {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if(isFocused && searchQuery !== 'null') {
        setIsSearching(true);
        (async () => {
          dispatch(clearBookings());
          setPage(1);
          setHasMorePages(true);
          await fetchBookingsData(1, limit, true, searchQuery, getBackendStatus(activeTab), selectedDateRef.current);
          setIsSearching(false);
        })();
      }
    }, 500);
    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  const refreshControl = async () => {
    setIsRefreshing(true);
    const defaultSearch = 'null';
    if(searchQuery !== defaultSearch) {
      setSearchQuery(defaultSearch);
    }
    // Clear date filter on refresh
    setSelectedDate(null);
    selectedDateRef.current = null;
    dispatch(clearBookings());
    setPage(1);
    setHasMorePages(true);
    await fetchBookingsData(1, limit, true, defaultSearch, getBackendStatus(activeTab), null);
    setIsRefreshing(false);
  };

  const handleNotificationPress = () => {
    // Reset unread count when navigating to notifications
    setUnreadCount(0);
    navigation.navigate('Notification');
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: isDarkMode ? Colors.dark_bg_color : '#F7F7F7' }]} edges={["left", "right"]}>
      <StatusBar 
        translucent={true}
        backgroundColor="transparent" 
        barStyle={isDarkMode ? "light-content" : "dark-content"} 
      />
      
      <View style={[styles.main_container, { backgroundColor: isDarkMode ? Colors.dark_bg_color : Colors.bg_color }]}>
        <View style={styles.header_container}>
          <Text style={[styles.header_title, { color: isDarkMode ? Colors.white : Colors.font_gray }]}>My Bookings</Text>
          <TouchableOpacity 
            activeOpacity={0.7}
            onPress={handleNotificationPress}
            style={styles.notification_container}
          >
            <Ionicons name="notifications" size={30} color={isDarkMode ? Colors.white : "#6F6F6F"} />
            {unreadCount > 0 && (
              <View style={styles.notification_badge}>
                <Text style={styles.notification_badge_text}>
                  {unreadCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
        <View style={styles.filter_container}>
          <View style={[styles.search_bar, { backgroundColor: isDarkMode ? Colors.dark_container : Colors.white }]}>
            <Ionicons
              name="search-outline"
              size={22}
              color={isDarkMode ? Colors.white : "#EFEFEF"}
              style={{ marginHorizontal: 12 }}
            />
            <TextInput
              style={[styles.search_input, { color: isDarkMode ? Colors.white : Colors.black }]}
              placeholder="Search Bookings"
              placeholderTextColor={isDarkMode ? Colors.font_gray : Colors.primary}
              value={searchQuery!=='null' ? searchQuery : ''}
              onChangeText={text => setSearchQuery(text)}
            />
          </View>
          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.date_button}
            onPress={() => setShowDatePicker(true)}
          >
            <Ionicons name="calendar-outline" size={27} color={Colors.white} />
          </TouchableOpacity>
        </View>

        {/* Show active date filter */}
        {selectedDate?.startDate && selectedDate?.endDate && (
          <View style={[styles.dateFilterBadge, { 
            backgroundColor: isDarkMode ? Colors.dark_container : Colors.white,
            borderColor: isDarkMode ? Colors.dark_separator : Colors.border_line
          }]}>
            <Text style={[styles.dateFilterText, { 
              color: isDarkMode ? Colors.white : Colors.heading_font 
            }]}>
              {`${moment(selectedDate.startDate).format('DD MMM YYYY')} - ${moment(selectedDate.endDate).format('DD MMM YYYY')}`}
            </Text>
            <TouchableOpacity
              style={[styles.clearFilterBtn, { 
                backgroundColor: isDarkMode ? '#FF4444' : Colors.error 
              }]}
              onPress={() => {
                setSelectedDate(null);
                selectedDateRef.current = null;
                dispatch(clearBookings());
                setPage(1);
                setHasMorePages(true);
                fetchBookingsData(1, limit, false, searchQuery, getBackendStatus(activeTab), null);
              }}
            >
              <Ionicons name="close" size={14} color={Colors.white} />
            </TouchableOpacity>
          </View>
          )}

        <SubTabBar
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
        <View style={styles.booking_card_list}>
          {bookingsData.length === 0 ? (
            <View style={styles.noDataContainer}>
              {isRefreshing ? (
                <View style={styles.refreshLoaderContainer}>
                  <ActivityIndicator size="large" color={Colors.primary} />
                </View>
              ) : (
                <NoDataImage
                  imageSource={require('../assets/images/no_booking.png')}
                  title="No bookings yet"
                  subtitle="You haven't made any bookings."
                  onRefresh={refreshControl}
                  isDarkMode={isDarkMode}
                />
              )}
            </View>
          ) : (
            <FlatList
              data={bookingsData}
              keyExtractor={item => item.id.toString()}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: insets.bottom + 280 }}
              renderItem={({ item }) => (
                <View style={styles.sectionContainer}>
                  <MyBookingsCard 
                    item={item} 
                    onPress={() => navigation.navigate('BookingManagement', { booking: item })}
                    isCheckedInTab={activeTab === 'Checked In'}
                    onCheckoutSuccess={() => {
                      dispatch(clearBookings());
                      setPage(1);
                      setHasMorePages(true);
                      fetchBookingsData(1, limit, false, searchQuery, getBackendStatus(activeTab), selectedDateRef.current);
                    }}
                  />
                </View>
              )}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={refreshControl}
                  colors={[Colors.primary]}
                  tintColor={Colors.primary}
                />
              }
              onEndReachedThreshold={0.01}
              onEndReached={() => {
                if(hasMorePages && !isLoading) {
                  fetchBookingsData(page, limit, false, searchQuery, getBackendStatus(activeTab), selectedDateRef.current);
                }
              }}
              ListFooterComponent={
                isLoading ? (
                  <View style={{ paddingVertical: 20 }}>
                    <ActivityIndicator size="small" color={Colors.primary} />
                  </View>
                ) : null
              }
              onScroll={onScroll}
              scrollEventThrottle={16}
            />
          )}
        </View>
      </View>
      <CalendarModal
        visible={showDatePicker}
        onClose={() => setShowDatePicker(false)}
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
        selectedDateRef={selectedDateRef}
        onRangeSelected={(newSelection) => {
          setShowDatePicker(false)
          dispatch(clearBookings());
          setPage(1);
          fetchBookingsData(1, limit, false, searchQuery, getBackendStatus(activeTab), newSelection);
        }}
        onClear={() => {
          dispatch(clearBookings());
          setPage(1);
          fetchBookingsData(1, limit, false, searchQuery, getBackendStatus(activeTab), null);
        }}
      />

      <CreateButton
        onPress={() => navigation.navigate('NewBooking')}
        icon={<Lucide name="calendar-plus" size={28} color={Colors.white} />}
        bottom={130 + insets.bottom}
        right={40}
      />
      <AbaciLoader visible={isLoading} />
    </SafeAreaView>
  );
};

export default MyBookingsScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  main_container: {
    flex: 1,
    backgroundColor: Colors.bg_color,
  },
  header_container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 26,
    paddingVertical: 20,
    marginTop: 40,
  },
  header_title: {
    fontSize: 18,
    color: Colors.font_gray,
    fontFamily: 'Inter-SemiBold',
  },
  filter_container: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 15,
    paddingHorizontal: 26,
    backgroundColor: 'transparent',
  },
  search_bar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    height: 52,
    borderRadius: 26,
    paddingVertical: 0,
    paddingHorizontal: 12,
    marginRight: 14,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 0,
    borderWidth: 0,
    borderColor: 'transparent',
    overflow: 'hidden',
  },
  search_input: {
    flex: 1,
    paddingVertical: 0,
    paddingRight: 12,
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: Colors.black,
  },
  date_button: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  booking_card_list: {
    paddingHorizontal: 26,
  },
  noDataContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 500,
    paddingVertical: 50,
  },
  notification_container: {
    position: 'relative',
  },
  notification_badge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#FF4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  notification_badge_text: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    fontFamily: 'Inter-Bold',
  },
  dateFilterBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 26,
    marginTop: 0,
    marginBottom: 8,
    paddingHorizontal: 16,
    paddingVertical: 5,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
    borderWidth: 1,
    position: 'relative',
  },
  dateFilterText: {
    fontSize: 13,
    fontFamily: 'Inter-SemiBold',
    textAlign: 'center',
    flex: 1,
  },
  clearFilterBtn: {
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    right: 8,
  },
  refreshLoaderContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
});