import { StatusBar, StyleSheet, Text, View, TouchableOpacity, TextInput, } from 'react-native';
import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../constants/customStyles';
import Ionicons from '@react-native-vector-icons/ionicons';
import SubTabBar from '../components/tab_bars/SubTabBar';

const MyBookingsScreen = () => {
  const [activeTab, setActiveTab] = useState('All');

  const tabs = ['Checked In', 'All', 'Upcoming', 'Completed'];

  return (
    <SafeAreaView style={styles.safeArea} edges={['left', 'right', 'bottom']}>
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
          <TouchableOpacity activeOpacity={0.8} style={styles.date_button}>
            <Ionicons name="calendar-outline" size={23} color={Colors.white} />
          </TouchableOpacity>
        </View>

        <SubTabBar 
          tabs={tabs} 
          activeTab={activeTab} 
          onTabChange={setActiveTab} 
        />
      </View>
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
    paddingHorizontal: 28,
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
    paddingHorizontal: 28,
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
});