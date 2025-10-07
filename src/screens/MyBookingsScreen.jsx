import { StatusBar, StyleSheet, Text, View, TouchableOpacity, TextInput, FlatList, ActivityIndicator, } from 'react-native';
import React, { useRef, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../constants/customStyles';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import { Lucide } from '@react-native-vector-icons/lucide';
import SubTabBar from '../components/tab_bars/SubTabBar';
import CalendarModal from '../components/modals/CalendarModal';
import { bookingsData } from '../constants/dummyData';
import NoDataLottie from '../components/lottie/NoDataLottie';
import MyBookingsCard from '../components/cards/MyBookingsCard';
import useTabBarScroll from '../hooks/useTabBarScroll';
import CreateButton from '../components/CreateButton';
import { useNavigation } from '@react-navigation/native';

const MyBookingsScreen = () => {
  const [activeTab, setActiveTab] = useState('All');
  const tabs = ['All','Checked In', 'Confirmed', 'Checked Out'];

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const selectedDateRef = useRef(null);

  const { onScroll, insets } = useTabBarScroll();

  const navigation = useNavigation();

  // Filter bookings based on active tab
  const getFilteredBookings = () => {
    if (activeTab === 'All') {
      return bookingsData;
    }
    
    return bookingsData.filter(booking => {
      if (activeTab === 'Checked In') {
        return booking.status === 'Checked In';
      }
      if (activeTab === 'Confirmed') {
        return booking.status === 'Confirmed';
      }
      if (activeTab === 'Checked Out') {
        return booking.status === 'Checked Out';
      }
      return true;
    });
  };

  const filteredBookings = getFilteredBookings();

  return (
    <SafeAreaView style={styles.safeArea} edges={["left", "right"]}>
      <StatusBar backgroundColor="#F7F7F7" barStyle="dark-content" />
      <View style={styles.main_container}>
        <View style={styles.header_container}>
          <Text style={styles.header_title}>My Bookings</Text>
          <TouchableOpacity activeOpacity={0.7}>
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
          {filteredBookings.length === 0 ? (
            <View style={styles.noDataContainer}>
              <NoDataLottie
                isDarkMode={false}
                refreshControl={() => {}}
              />
            </View>
          ) : (
            <FlatList
              data={filteredBookings}
              keyExtractor={item => item.id.toString()}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: insets.bottom + 280 }}
              renderItem={({ item }) => (
                <View style={styles.sectionContainer}>
                  <MyBookingsCard 
                    item={item} 
                    onPress={() => navigation.navigate('BookingManagement', { booking: item })}
                  />
                </View>
              )}
              refreshing={false}
              onRefresh={() => {}}
              onEndReachedThreshold={0.01}
              onEndReached={() => {
                // pagination 
              }}
              ListFooterComponent={
                false ? (
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