import React, { useLayoutEffect, useState } from 'react';
import { StatusBar, StyleSheet, Text, View, TouchableOpacity } from 'react-native';
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

  const bookingData = booking;

  useLayoutEffect(() => {
    navigation.getParent()?.setOptions({
      tabBarStyle: { display: 'none' }
    });
  }, [navigation]);


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

      {activeTab === 'info' ? (
        <BoatDetailsTab bookingData={bookingData} />
      ) : (
        <QRCodeTab bookingData={bookingData} />
      )}

      {/* Bottom Tab Bar */}
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
});
