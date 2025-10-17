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
import { useDispatch } from 'react-redux';
import { setBookings, clearBookings } from '../../store/bookingSlice';
import { ToastContext } from '../context/ToastContext';
import AbaciLoader from '../components/AbaciLoader';

const MyBookingsScreen = () => {
  const toastContext = useContext(ToastContext);
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const dispatch = useDispatch();

  const [activeTab, setActiveTab] = useState('All');
  const tabs = BOOKING_TABS;

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const selectedDateRef = useRef(null);

  const [bookingsData, setBookingsData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const limit = 10;
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('null');
  const [isSearching, setIsSearching] = useState(false);
  const [hasMorePages, setHasMorePages] = useState(true);

  const { onScroll, insets } = useTabBarScroll();

  const fetchBookingsData = async (pageNumber, limit, isRefresh = false, searchQuery, status) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setIsLoading(true);
    }
    
    try {
      const response = await fetchBookings(pageNumber, limit, searchQuery, status);
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
          await fetchBookingsData(1, limit, true, searchQuery, getBackendStatus(activeTab));
          setIsSearching(false);
        })();
      }
    }, 500);
    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  useEffect(() => {
    if(isFocused) {
      dispatch(clearBookings());
      setPage(1);
      setHasMorePages(true);
      fetchBookingsData(1, limit, false, searchQuery, getBackendStatus(activeTab));
    }
  }, [activeTab, isFocused]);

  const refreshControl = () => {
    const defaultSearch = 'null';
    if(searchQuery !== defaultSearch) {
      setSearchQuery(defaultSearch);
    }
    dispatch(clearBookings());
    setPage(1);
    setHasMorePages(true);
    fetchBookingsData(1, limit, true, defaultSearch, getBackendStatus(activeTab));
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["left", "right"]}>
      <StatusBar backgroundColor="#F7F7F7" barStyle="dark-content" />
      <View style={styles.main_container}>
        <View style={styles.header_container}>
          <Text style={styles.header_title}>My Bookings</Text>
          <TouchableOpacity 
            activeOpacity={0.7}
            onPress={() => navigation.navigate('Notification')}
          >
            <Ionicons name="notifications" size={30} color="#6F6F6F" />
          </TouchableOpacity>
        </View>
        <View style={styles.filter_container}>
          <View style={styles.search_bar}>
            <Ionicons
              name="search-outline"
              size={22}
              color="#EFEFEF"
              style={{ marginHorizontal: 12 }}
            />
            <TextInput
              style={styles.search_input}
              placeholder="Search Bookings"
              placeholderTextColor={Colors.primary}
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

        <SubTabBar
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
        <View style={styles.booking_card_list}>
          {bookingsData.length === 0 ? (
            <View style={styles.noDataContainer}>
              <NoDataImage
                imageSource={require('../assets/images/no_booking.png')}
                title="No bookings yet"
                subtitle="You haven't made any bookings."
                onRefresh={refreshControl}
                isDarkMode={false}
              />
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
                      fetchBookingsData(1, limit, false, searchQuery, getBackendStatus(activeTab));
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
                  fetchBookingsData(page, limit, false, searchQuery, getBackendStatus(activeTab));
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
        onRangeSelected={newSelection => setShowDatePicker(false)}
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
});