import { StatusBar, StyleSheet, View, Text, TouchableOpacity, TextInput, ScrollView, FlatList, ActivityIndicator, RefreshControl, Image, Dimensions } from 'react-native';
import React, { useEffect, useRef, useState, useContext, useMemo, useCallback } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, BOOKING_TABS, getBackendStatus } from '../constants/customStyles';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import { Lucide } from '@react-native-vector-icons/lucide';
import SubTabBar from '../components/tab_bars/SubTabBar';
import CalendarModal from '../components/modals/CalendarModal';
import NoDataImage from '../components/NoDataImage';
import MyBookingsCard from '../components/cards/MyBookingsCard';
import useTabBarScroll from '../hooks/useTabBarScroll';
import useBookingEventCalculations from '../hooks/useBookingEventCalculations';
import CreateButton from '../components/newBooking/CreateButton';
import { useNavigation, useIsFocused, useFocusEffect } from '@react-navigation/native';
import Error from '../helpers/Error';
import { fetchBookings, fetchBookingsForCalendar } from '../apis/booking';
import { useDispatch, useSelector } from 'react-redux';
import { setBookings, clearBookings } from '../../store/bookingSlice';
import { ToastContext } from '../context/ToastContext';
import AbaciLoader from '../components/AbaciLoader';
import { fetchProfile } from '../apis/auth';
import moment from 'moment';
import { Calendar } from 'react-native-big-calendar';
import { fetchBerths } from '../apis/berth';
import { fetchBoatsList } from '../apis/boat';
import { fetchPontoons } from '../apis/pontoon';
import CalendarHeaderControls from '../components/myBookings/CalendarHeaderControls';
import BerthSelector from '../components/myBookings/BerthSelector';
import BoatSelector from '../components/myBookings/BoatSelector';
import CalendarEvent from '../components/myBookings/CalendarEvent';
import useBoatOccupancyBlocks, { convertOccupancyBlocksToEvents } from '../hooks/useBoatOccupancyBlocks';

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
  const [viewMode, setViewMode] = useState('calendar'); 
  const [calendarViewMode, setCalendarViewMode] = useState('month'); 
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [isPontoonLoading, setIsPontoonLoading] = useState(true);
  const [pontoonsData, setPontoonsData] = useState([]);
  const [berthsData, setBerthsData] = useState([]);
  const [selectedBerth, setSelectedBerth] = useState(null);
  const [isBerthLoading, setIsBerthLoading] = useState(true);
  const [boatsData, setBoatsData] = useState([]);
  const [selectedBoat, setSelectedBoat] = useState(null);
  const [isBoatLoading, setIsBoatLoading] = useState(false);

  const [bookingsData, setBookingsData] = useState([]);
  const [calendarBookingsData, setCalendarBookingsData] = useState([]);
  const [berthSettings, setBerthSettings] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isTransitionLoading, setIsTransitionLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const limit = 10;
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('null');
  const [isSearching, setIsSearching] = useState(false);
  const [hasMorePages, setHasMorePages] = useState(true);
  const [isCreateButtonVisible, setIsCreateButtonVisible] = useState(true);

  const { onScroll: onTabBarScroll, insets } = useTabBarScroll();
  
  const handleScroll = (event) => {
    onTabBarScroll(event);
    
    const currentOffset = event.nativeEvent.contentOffset.y;
    const threshold = 20;
    
    if (currentOffset > threshold && isCreateButtonVisible) {
      setIsCreateButtonVisible(false);
    } else if (currentOffset <= threshold && !isCreateButtonVisible) {
      setIsCreateButtonVisible(true);
    }
  };

  const lastProcessedNotifications = useRef({});
  const unreadCountRef = useRef(unreadCount);
  const isFirstFocus = useRef(true);

  // Get selected berth data
  const selectedBerthData = useMemo(() => {
    return berthsData.find(berth => berth.id === selectedBerth);
  }, [berthsData, selectedBerth]);

  // Calculate occupancy blocks for selected boat in day view
  const occupancyBlocks = useBoatOccupancyBlocks(
    calendarBookingsData,
    selectedBoat,
    calendarViewMode === 'day' ? currentMonth : null,
    selectedBerthData,
    berthSettings,
    boatsData
  );

  // Calculate event tracks and positions using custom hook
  const bookingsForCalculations = viewMode === 'calendar' ? calendarBookingsData : bookingsData;
  const { calendarEvents: regularCalendarEvents } = useBookingEventCalculations(
    bookingsForCalculations,
    selectedBerthData,
    calendarViewMode,
    berthSettings,
    selectedBoat,
    calendarViewMode === 'day' ? currentMonth : null,
  );

  // Replace calendar events with occupancy blocks when boat is selected in day view
  const calendarEvents = useMemo(() => {
    // When boat is selected in day view, show ONLY occupancy blocks (no regular events)
    if (calendarViewMode === 'day' && selectedBoat) {
      if (occupancyBlocks.length > 0) {
        // Convert occupancy blocks to calendar events - show ONLY occupancy blocks
        const selectedBoatObj = boatsData.find(boat => boat.id === selectedBoat);
        return convertOccupancyBlocksToEvents(occupancyBlocks, selectedBoatObj, selectedBerthData);
      }
      // If no occupancy blocks, return empty array to avoid showing regular events
      return [];
    }
    // For non-day views or when no boat is selected, show regular calendar events
    return regularCalendarEvents;
  }, [calendarViewMode, selectedBoat, occupancyBlocks, regularCalendarEvents, boatsData, selectedBerthData]);

  useEffect(() => {
    selectedDateRef.current = selectedDate;
  }, [selectedDate]);

  // Show loader when navigating to this screen
  useFocusEffect(
    useCallback(() => {
      // Show transition loader when screen is about to be focused
      setIsTransitionLoading(true);
      
      return () => {
        // Cleanup when screen loses focus
        setIsTransitionLoading(false);
      };
    }, [])
  );

  // Fetch pontoons on component mount
  useEffect(() => {
    if (isFocused) {
      fetchPontoonsData();
      if (viewMode === 'calendar') {
        fetchBoatsData();
      }
    }
  }, [isFocused]);

  // Fetch boats when switching to calendar view
  useEffect(() => {
    if (isFocused && viewMode === 'calendar' && boatsData.length === 0) {
      fetchBoatsData();
    }
  }, [viewMode, isFocused]);

  const fetchPontoonsData = async () => {
    setIsPontoonLoading(true);
    try {
      const response = await fetchPontoons();
      const pontoons = Array.isArray(response)
        ? response
        : (response?.results && Array.isArray(response?.results) ? response?.results : []);
      
      // Store pontoons data for later lookup
      setPontoonsData(pontoons);
      
      // Use the first pontoon to fetch berths
      if (Array.isArray(pontoons) && pontoons.length > 0) {
        await fetchBerthsData(pontoons[0].id);
      } else {
        setBerthsData([]);
      }
    } catch (error) {
      let err_msg = Error(error);
      toastContext.showToast(err_msg, 'short', 'error');
    } finally {
      setIsPontoonLoading(false);
    }
  };

  const fetchBerthsData = async (pontoonId) => {
    setIsBerthLoading(true);
    try {
      const response = await fetchBerths(pontoonId);
      console.log('response berth settings---------------------------------------------------------------', response);
      const berths = Array.isArray(response)
        ? response
        : (response?.results && Array.isArray(response?.results) ? response?.results : []);
      setBerthsData(berths);
      
      // Auto-select the first berth
      if (Array.isArray(berths) && berths.length > 0) {
        setSelectedBerth(berths[0].id);
      } else {
        setSelectedBerth(null);
      }
    } catch (error) {
      let err_msg = Error(error);
      toastContext.showToast(err_msg, 'short', 'error');
    } finally {
      setIsBerthLoading(false);
    }
  };

  const fetchBoatsData = async () => {
    setIsBoatLoading(true);
    try {
      const response = await fetchBoatsList();
      const boats = Array.isArray(response) ? response : (response?.results || []);
      setBoatsData(boats);
    } catch (error) {
      let err_msg = Error(error);
      toastContext.showToast(err_msg, 'short', 'error');
    } finally {
      setIsBoatLoading(false);
    }
  };
  
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

      if (viewMode === 'calendar') {
        if (!isBerthLoading && !isPontoonLoading && selectedBerth) {
          fetchCalendarBookings();
        }
      } else {
        fetchBookingsData(1, limit, false, searchQuery, getBackendStatus(tabToUse));
      }
      selectedDateRef.current = null;
    }
  }, [activeTab, isFocused, viewMode, isBerthLoading, isPontoonLoading, selectedBerth]);

  // Hide transition loader once initial data is loaded
  useEffect(() => {
    if (isFocused && !isLoading && !isPontoonLoading && !isBerthLoading && !isBoatLoading) {
      // Small delay to ensure smooth transition
      const timer = setTimeout(() => {
        setIsTransitionLoading(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isFocused, isLoading, isPontoonLoading, isBerthLoading, isBoatLoading]);

  useEffect(() => {
    if (isFocused && viewMode === 'calendar' && selectedBerth && !isFirstFocus.current && !isBerthLoading && !isPontoonLoading) {
      fetchCalendarBookings();
    }
  }, [selectedBerth, isBerthLoading, isPontoonLoading]);

  useEffect(() => {
    if (calendarViewMode !== 'day' || viewMode !== 'calendar') {
      setSelectedBoat(null);
    }
  }, [calendarViewMode, viewMode]);

  useEffect(() => {
    if (!isFocused) {
      setSelectedBoat(null);
    }
  }, [isFocused]);

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

  // Fetch bookings for calendar view using the calendar API
  const fetchCalendarBookings = async () => {
    if (!selectedBerth) {
      return;
    }   
    setIsLoading(true);
    try {
      const startOfMonth = moment(currentMonth).startOf('month').format('YYYY-MM-DD');
      const endOfMonth = moment(currentMonth).endOf('month').format('YYYY-MM-DD');
      const dateRange = { startDate: startOfMonth, endDate: endOfMonth };
      
      const response = await fetchBookingsForCalendar(dateRange, selectedBerth);
      console.log('response calendar bookings', response);
      const bookings = response?.data || [];
      setCalendarBookingsData(bookings);
      setBerthSettings(response?.berth_settings || []);
      setHasMorePages(false);
      setPage(1);
    } catch (error) {
      let err_msg = Error(error);
      toastContext.showToast(err_msg, "short", "error");
    } finally {
      setIsLoading(false);
    }
  };

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
      // Search only works in list view, not calendar view
      if(isFocused && searchQuery !== 'null' && viewMode === 'list') {
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
  }, [searchQuery, viewMode]);

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
    
    if (viewMode === 'calendar') {
      if (selectedBerth && !isBerthLoading) {
        await fetchCalendarBookings();
      }
    } else {
      await fetchBookingsData(1, limit, true, defaultSearch, getBackendStatus(activeTab), null);
    }
    setIsRefreshing(false);
  };

  const handleNotificationPress = () => {
    setUnreadCount(0);
    navigation.navigate('Notification');
  };

  useEffect(() => {
    if (isFocused && viewMode === 'calendar' && selectedBerth && !isBerthLoading && !isFirstFocus.current) {
      fetchCalendarBookings();
    }
  }, [currentMonth]);

  const handleMonthChange = (date) => {
    setCurrentMonth(date);
  };

  const handleEventPress = (event) => {
    // Handle availability blocks - navigate to NewBooking with prefill data
    if (event?.isOccupancyBlock && event?.isAvailable) {
      if (event?.selectedBoatId && event?.berthData) {
        const prefillData = {
          selectedBoatId: event?.selectedBoatId,
          berthName: event?.berthData?.name,
          // Convert Date objects to ISO strings for serialization
          startDate: event?.start instanceof Date ? event?.start?.toISOString() : event?.start,
          endDate: event?.end instanceof Date ? event?.end?.toISOString() : event?.end,
        };
        
        // Include pontoon name if available in berth data
        if (event?.berthData?.pontoon?.name) {
          prefillData.pontoonName = event?.berthData?.pontoon?.name;
        }
        
        navigation.navigate('NewBooking', {
          prefillData
        });
      }
      return;
    }
    
    // Handle regular booking events
    if (event?.booking && event?.isCurrentCustomer) {
      navigation.navigate('BookingManagement', { booking: event?.booking });
    }
  };

  const handleCellPress = (date) => {
    setCurrentMonth(date);
    setCalendarViewMode('day');
  };

  const navigateMonth = (direction) => {
    const newMonth = new Date(currentMonth);
    if (direction === 'prev') {
      newMonth.setMonth(newMonth.getMonth() - 1);
    } else {
      newMonth.setMonth(newMonth.getMonth() + 1);
    }
    setCurrentMonth(newMonth);
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
          <Text style={[styles.header_title, { color: isDarkMode ? Colors.white : Colors.font_gray }]}>
            My Bookings
          </Text>
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
              value={searchQuery !== 'null' ? searchQuery : ''}
              onChangeText={text => setSearchQuery(text)}
            />
          </View>
          <TouchableOpacity
            activeOpacity={0.8}
            style={[styles.date_button, {
              backgroundColor: isDarkMode ? Colors.dark_container : Colors.white,
            }]}
            onPress={() => setShowDatePicker(true)}
          >
            <Ionicons name="calendar-outline" size={27} color={Colors.primary} />
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
                if (viewMode === 'calendar') {
                  if (selectedBerth && !isBerthLoading) {
                    fetchCalendarBookings();
                  }
                } else {
                  fetchBookingsData(1, limit, false, searchQuery, getBackendStatus(activeTab), null);
                }
              }}
            >
              <Ionicons name="close" size={14} color={Colors.white} />
            </TouchableOpacity>
          </View>
        )}

        {viewMode === 'list' && (
          <SubTabBar
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />
        )}

        {viewMode === 'calendar' ? (
          <ScrollView
            style={styles.scrollContainer}
            showsVerticalScrollIndicator={false}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
          >
            <View style={styles.booking_card_list_calendar}>
              {!isPontoonLoading && !isBerthLoading && selectedBerth && (
                <View style={[styles.calendarContainer, {
                  borderColor: isDarkMode ? Colors.dark_separator : '#EFEFEF',
                  borderWidth: 1,
                  backgroundColor: isDarkMode ? Colors.dark_container : Colors.white,
                }]}>
                  <CalendarHeaderControls
                    calendarViewMode={calendarViewMode}
                    onCalendarViewModeChange={item => setCalendarViewMode(item.value)}
                    currentMonth={currentMonth}
                    onNavigateMonth={navigateMonth}
                    onToggleView={() => setViewMode('list')}
                    isDarkMode={isDarkMode}
                  />
                  <View style={styles.selectorsContainer}>
                    <BerthSelector
                      berthsData={berthsData}
                      selectedBerth={selectedBerth}
                      onBerthChange={item => setSelectedBerth(item.value)}
                      isDarkMode={isDarkMode}
                    />
                    {calendarViewMode === 'day' && (
                      <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                        <BoatSelector
                          boatsData={boatsData}
                          selectedBoat={selectedBoat}
                          onBoatChange={item => setSelectedBoat(item.value)}
                          isDarkMode={isDarkMode}
                        />
                        {selectedBoat && (
                          <TouchableOpacity
                            activeOpacity={0.7}
                            onPress={() => setSelectedBoat(null)}
                            style={styles.clearButton}
                          >
                            <Ionicons 
                              name="close-circle" 
                              size={25} 
                              color={isDarkMode ? Colors.white : '#666666'} 
                            />
                          </TouchableOpacity>
                        )}
                      </View>
                    )}
                  </View>
                  <View style={[styles.calendarWrapper, {
                    borderColor: isDarkMode ? Colors.dark_separator : '#E5E5E5',
                    backgroundColor: isDarkMode ? Colors.dark_container : Colors.white,
                  }]}>
                    <Calendar
                      key={`${isDarkMode ? 'dark' : 'light'}-${calendarViewMode}-calendar`}
                      events={calendarEvents}
                      height={Dimensions.get('window').height - 250}
                      mode={calendarViewMode}
                      date={currentMonth}
                      onSwipeEnd={handleMonthChange}
                      onPressEvent={handleEventPress}
                      onPressCell={handleCellPress}
                      showNowIndicator={false}
                      ampm={true}
                      style={{
                        paddingTop: 0,
                        paddingHorizontal: 10,
                        backgroundColor: isDarkMode ? Colors.dark_container : Colors.white,
                      }}
                      theme={{
                        palette: {
                          primary: {
                            main: Colors.primary,
                            contrastText: Colors.white,
                          },
                          gray: {
                            '100': isDarkMode ? Colors.dark_separator : '#F5F5F5',
                            '200': isDarkMode ? '#4A4D52' : '#E0E0E0',
                            '300': isDarkMode ? '#5A5D62' : '#D0D0D0',
                            '500': isDarkMode ? Colors.font_gray : '#999999',
                            '800': isDarkMode ? Colors.white : Colors.black,
                          },
                          text: {
                            primary: isDarkMode ? Colors.white : Colors.black,
                            secondary: isDarkMode ? Colors.font_gray : '#666666',
                          },
                          nowIndicator: 'transparent',
                        },
                      }}
                      eventTextStyle={{
                        color: Colors.white,
                        fontSize: 12,
                        fontFamily: 'Inter-SemiBold',
                      }}
                      renderEvent={(event, props) => (
                        <CalendarEvent
                          event={event}
                          props={props}
                          calendarViewMode={calendarViewMode}
                          isDarkMode={isDarkMode}
                          onPress={handleEventPress}
                        />
                      )}
                    />
                    {/*   eventCellStyle={(event, props) => {
                    //   // For non-day views (week, month), use standard styling without positioning
                    //   const isCurrentUser = event.isCurrentCustomer;
  
                    //   const backgroundColor = isCurrentUser
                    //     ? Colors.primary
                    //     : (isDarkMode ? '#D0D0D0' : Colors.dark_text_secondary);
                    
                    //   const opacity = isCurrentUser ? 1 : 0.7;
                    //   if (calendarViewMode !== 'day') {
                    //     // For other customers' bookings
                    //     if (!event.isCurrentCustomer) {
                    //       return {
                    //         backgroundColor,
                    //         borderRadius: 4,
                    //         padding: 2,
                    //         opacity,
                    //         justifyContent: 'center',
                    //         alignItems: 'center',
                    //         top: `${props.style[1]?.top}` || 0,
                    //         position: 'absolute',
                    //       };
                    //     }
                    //     // For current customer's bookings, use primary color
                    //     return {
                    //       backgroundColor,
                    //       borderRadius: 4,
                    //       padding: 2,
                    //       opacity,
                    //       justifyContent: 'center',
                    //       alignItems: 'center',
                    //       top: `${props.style[1]?.top}` || 0,
                    //       position: 'absolute',
                    //     };
                    //   }
                      
                    //   // For day view only, apply horizontal positioning based on boat length
                    //   const widthPercent = event.widthPercent || 100;
                    //   const leftPercent = event.leftPercent || 0;
                    //   const bufferPercent = event.bufferPercent || 0;
                    //   const totalWidth = widthPercent + bufferPercent;
                    //   console.log(widthPercent,'widthPercent', leftPercent,'leftPercent', bufferPercent,'bufferPercent', totalWidth,'totalWidth', 'event');
                      
                    //   // For other customers' bookings
                    //   if (!event.isCurrentCustomer) {
                    //     return {
                    //       backgroundColor,
                    //       borderRadius: 4,
                    //       padding: 4, 
                    //       opacity,
                    //       width: `${totalWidth}%`,
                    //       left: `${leftPercent}%`,
                    //       position: 'absolute',
                    //       top: `${props.style[1]?.top}` || 0,
                    //       height: `${props.style[1]?.height}` || 0,
                    //       justifyContent: 'flex-start',
                    //       alignItems: 'flex-start',
                    //     };
                    //   }
                    //   // For current customer's bookings, use primary color
                    //   return {
                    //     backgroundColor,
                    //     borderRadius: 4,
                    //     padding: 4, 
                    //     opacity,
                    //     width: `${totalWidth}%`,
                    //     left: `${leftPercent}%`,
                    //     position: 'absolute',
                    //     top: `${props.style[1]?.top}` || 0,
                    //     height: `${props.style[1]?.height}` || 0,
                    //     justifyContent: 'flex-start',
                    //     alignItems: 'flex-start',
                    //   };
                    // }} */}
                  </View>
                </View>
              )}
            </View>
          </ScrollView>
        ) : (
          <View style={[styles.listContainer, {
            borderColor: isDarkMode ? Colors.dark_separator : '#EFEFEF',
            borderWidth: 1,
            backgroundColor: isDarkMode ? Colors.dark_container : Colors.white,
          }]}>
            {/* List View Header */}
            <View style={[styles.listHeader, { 
              backgroundColor: 'transparent',
            }]}>
              <Text style={[styles.bookingListHeading, {
                color: isDarkMode ? Colors.white : Colors.black,
              }]}>Booking List</Text>
              <TouchableOpacity
                onPress={() => setViewMode('calendar')}
                style={[styles.viewToggleButton, {
                  backgroundColor: isDarkMode ? Colors.dark_separator : 'rgba(218, 218, 218, 0.25)',
                }]}
              >
                <Image 
                  source={require('../assets/images/flip_list.png')} 
                  style={styles.viewToggleImage}
                  resizeMode="contain"
                />
              </TouchableOpacity>
            </View>
            {bookingsData.length === 0 ? (
              <View style={styles.noDataContainer}>
                <NoDataImage
                  imageSource={require('../assets/images/no_booking.png')}
                  title="No bookings yet"
                  subtitle="You haven't made any bookings."
                  onRefresh={refreshControl}
                  isDarkMode={isDarkMode}
                />
              </View>
            ) : (
              <FlatList
                style={styles.booking_card_list}
                data={bookingsData}
                keyExtractor={item => item.id.toString()}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: insets.bottom + 100, paddingHorizontal: 8 }}
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
                onScroll={handleScroll}
                scrollEventThrottle={16}
              />
            )}
          </View>
        )}
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
          if (viewMode === 'calendar') {
            if (selectedBerth && !isBerthLoading) {
              fetchCalendarBookings();
            }
          } else {
            fetchBookingsData(1, limit, false, searchQuery, getBackendStatus(activeTab), newSelection);
          }
        }}
        onClear={() => {
          dispatch(clearBookings());
          setPage(1);
          if (viewMode === 'calendar') {
            if (selectedBerth && !isBerthLoading) {
              fetchCalendarBookings();
            }
          } else {
            fetchBookingsData(1, limit, false, searchQuery, getBackendStatus(activeTab), null);
          }
        }}
      />

      {isCreateButtonVisible && (
        <CreateButton
          onPress={() => navigation.navigate('NewBooking')}
          icon={<Lucide name="calendar-plus" size={28} color={Colors.white} />}
          bottom={130 + insets.bottom}
          right={40}
        />
      )}
      <AbaciLoader visible={isLoading || isTransitionLoading} />
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
  filter_container: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 15,
    paddingHorizontal: 25,
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
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
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
  scrollContainer: {
    flex: 1,
  },
  booking_card_list_calendar: {
    paddingHorizontal: 0,
  },
  calendarContainer: {
    paddingHorizontal: 0,
    paddingTop: 0,
    paddingBottom: 30,
    marginHorizontal: 26,
    marginTop: 10,
    marginBottom: 10,
    borderRadius: 12,
    overflow: 'hidden',
    minHeight: 750,
  },
  calendarWrapper: {
    position: 'relative',
    borderWidth: 1,
    borderRadius: 0,
    padding: 0,
    paddingTop: 10,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    marginTop: 10,
    marginHorizontal: 10,
  },
  refreshLoaderContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  selectorsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingHorizontal: 12,
    marginTop: -14,
    paddingBottom: 8,
  },
  clearButton: {
    marginTop: 8,
    marginLeft: 6,
    padding: 6,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    flex: 1,
    marginHorizontal: 25,
    marginTop: 0,
    borderRadius: 12,
    overflow: 'hidden',
  },
  listHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 15,
  },
  bookingListHeading: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
  },
  viewToggleButton: {
    padding: 12,
    marginRight: 0,
    borderRadius: 25,
  },
  viewToggleImage: {
    width: 20,
    height: 20,
  },
  booking_card_list: {
    flex: 1,
    paddingTop: 0,
  },
  sectionContainer: {
    marginBottom: 8,
  },
});