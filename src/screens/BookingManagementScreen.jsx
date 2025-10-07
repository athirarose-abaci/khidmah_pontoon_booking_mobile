import React, { useLayoutEffect, useState, useRef } from 'react';
import { StatusBar, StyleSheet, Text, View, TouchableOpacity, Image, ScrollView, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../constants/customStyles';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import { MaterialIcons } from '@react-native-vector-icons/material-icons';
import { BoatDetailsTab, QRCodeTab } from '../components/bookingManagement';
import { MaterialDesignIcons } from '@react-native-vector-icons/material-design-icons';
import LinearGradient from 'react-native-linear-gradient';

const BookingManagementScreen = ({ route, navigation }) => {
  const { booking } = route.params || {};
  const [activeTab, setActiveTab] = useState('info');
  const [isTabBarVisible, setIsTabBarVisible] = useState(true);
  const scrollY = useRef(new Animated.Value(0)).current;

  const bookingData = booking;

  useLayoutEffect(() => {
    navigation.getParent()?.setOptions({
      tabBarStyle: { display: 'none' }
    });
  }, [navigation]);

  const handleScroll = (event) => {
    const currentOffset = event.nativeEvent.contentOffset.y;
    const threshold = 20; 
    
    if (currentOffset > threshold && isTabBarVisible) {
      setIsTabBarVisible(false);
    } else if (currentOffset <= threshold && !isTabBarVisible) {
      setIsTabBarVisible(true);
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
            <Text style={styles.bookingTitle}>Booking Details</Text>
            <Text style={styles.bookingId}>#{bookingData.bookingId || bookingData.id}</Text>
          </View>
          <View style={styles.actionButtons}>
            <View style={styles.bookingHeaderVerticalDivider} />
            <TouchableOpacity style={styles.checkInButton}>
              <Image source={require('../assets/images/clock_in.png')} style={styles.checkInIcon} />
              <Text style={styles.checkInText}>Check-in</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.editButton}>
              <MaterialDesignIcons name="square-edit-outline" size={18} color={Colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.deleteButton}>
              <MaterialDesignIcons name="trash-can-outline" size={18} color={Colors.white} />
            </TouchableOpacity>
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
            <BoatDetailsTab bookingData={bookingData} />
          ) : (
            <QRCodeTab bookingData={bookingData} />
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
          onPress={() => setActiveTab('info')}
        >
          <MaterialDesignIcons 
            name="information-variant-circle" 
            size={30} 
            color={activeTab === 'info' ? Colors.white : '#6F6F6F'} 
          />
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tabButton, activeTab === 'qr' && styles.activeTabButton]}
          onPress={() => setActiveTab('qr')}
        >
          <Ionicons 
            name="qr-code" 
            size={28} 
            color={activeTab === 'qr' ? Colors.white : '#6F6F6F'} 
          />
        </TouchableOpacity>
        </LinearGradient>
      )}
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
    fontSize: 25,
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
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
    gap: 6,
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
});
