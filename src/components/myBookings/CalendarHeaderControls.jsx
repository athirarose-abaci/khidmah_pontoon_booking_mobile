import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, I18nManager } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import moment from 'moment';
import { Colors } from '../../constants/customStyles';

const CalendarHeaderControls = ({ calendarViewMode, onCalendarViewModeChange, currentMonth, onNavigateMonth, onToggleView, isDarkMode, }) => {

  const getHeaderText = () => {
    const date = moment(currentMonth);
    
    switch (calendarViewMode) {
      case 'day':
        // Format: "09 Tues - January"
        return date.format('DD ddd - MMMM');    
      case 'week':
        const weekStart = date.clone().startOf('week');
        const weekEnd = date.clone().endOf('week');
        
        // Format: "9 Jan - 15 Jan"
        return `${weekStart.format('D MMM')} - ${weekEnd.format('D MMM')}`;     
      case 'month':
      default:
        // Format: "January 2025"
        return date.format('MMMM YYYY');
    }
  };

  return (
    <View style={[styles.calendarHeader, { 
      backgroundColor: 'transparent',
      borderBottomColor: isDarkMode ? Colors.dark_separator : '#EFEFEF',
    }]}>
      <View style={styles.calendarViewDropdownContainer}>
        <Dropdown
          style={[styles.calendarViewDropdown, {
            backgroundColor: isDarkMode ? Colors.dark_separator : 'rgba(218, 218, 218, 0.25)',
            borderColor: 'transparent',
          }]}
          placeholderStyle={[styles.calendarViewPlaceholderStyle, {
            color: 'transparent',
            fontSize: 1,
            opacity: 0,
          }]}
          selectedTextStyle={[styles.calendarViewSelectedTextStyle, {
            color: 'transparent',
            fontSize: 1,
            opacity: 0,
          }]}
          iconStyle={{ width: 0, height: 0 }}
          data={[
            { label: 'Day', value: 'day' },
            { label: 'Week', value: 'week' },
            { label: 'Month', value: 'month' },
          ]}
          maxHeight={200}
          labelField="label"
          valueField="value"
          placeholder=""
          value={calendarViewMode}
          onChange={onCalendarViewModeChange}
          {...(I18nManager.isRTL ? {
            renderLeftIcon: () => (
              <Image 
                source={require('../../assets/images/calendar_view.png')} 
                style={styles.calendarViewImage}
                resizeMode="contain"
              />
            ),
            renderRightIcon: () => null
          } : {
            renderRightIcon: () => (
              <Image 
                source={require('../../assets/images/calendar_view.png')} 
                style={styles.calendarViewImage}
                resizeMode="contain"
              />
            ),
            renderLeftIcon: () => null
          })}
          itemContainerStyle={{
            backgroundColor: isDarkMode ? Colors.dark_container : Colors.white
          }}
          itemTextStyle={{
            color: isDarkMode ? Colors.white : Colors.black,
            fontFamily: 'Inter-Regular',
          }}
          activeColor={isDarkMode ? Colors.dark_separator : '#F0F0F0'}
          containerStyle={{
            backgroundColor: isDarkMode ? Colors.dark_container : Colors.white,
            borderRadius: 8,
            borderWidth: 1,
            borderColor: isDarkMode ? Colors.dark_separator : '#E0E0E0',
            minWidth: 120,
          }}
        />
      </View>
      <View style={[styles.monthNavContainer, { direction: 'ltr' }]}>
        <TouchableOpacity
          onPress={() => onNavigateMonth('prev')}
          style={styles.monthNavButton}
        >
          <Ionicons name="chevron-back" size={20} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={[styles.monthText, { color: isDarkMode ? Colors.white : Colors.primary }]}>
          {getHeaderText()}
        </Text>
        <TouchableOpacity
          onPress={() => onNavigateMonth('next')}
          style={styles.monthNavButton}
        >
          <Ionicons name="chevron-forward" size={20} color={Colors.primary} />
        </TouchableOpacity>
      </View>
      <TouchableOpacity
        onPress={onToggleView}
        style={[styles.viewToggleButton, {
          backgroundColor: isDarkMode ? Colors.dark_separator : 'rgba(218, 218, 218, 0.25)',
        }]}
      >
        <Image 
          source={require('../../assets/images/flip_views.png')} 
          style={styles.viewToggleImage}
          resizeMode="contain"
        />
      </TouchableOpacity>
    </View>
  );
};

export default CalendarHeaderControls;

const styles = StyleSheet.create({
  calendarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 15,
    marginTop: 0,
    marginBottom: 0,
  },
  calendarViewDropdownContainer: {
    width: 44,
  },
  calendarViewDropdown: {
    backgroundColor: 'rgba(218, 218, 218, 0.25)',
    borderRadius: 25,
    paddingHorizontal: 0,
    paddingVertical: 8,
    minHeight: 44,
    height: 44,
    borderWidth: 0,
    width: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  calendarViewPlaceholderStyle: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: Colors.primary,
  },
  calendarViewSelectedTextStyle: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: Colors.primary,
  },
  calendarViewIconStyle: {
    width: 20,
    height: 20,
  },
  calendarViewImage: {
    width: 20,
    height: 20,
    marginRight: 12,
  },
  monthNavContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  monthText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: Colors.primary,
    marginHorizontal: 8,
  },
  monthNavButton: {
    padding: 5,
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
});