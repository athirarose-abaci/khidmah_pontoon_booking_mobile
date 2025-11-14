import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import moment from 'moment';
import { Colors } from '../../constants/customStyles';

const CalendarEvent = ({ event, props, calendarViewMode, isDarkMode, onPress }) => {
  // For non-day views (week, month)
  if (calendarViewMode !== 'day') {
    const isCurrentUser = event.isCurrentCustomer;
  
    const backgroundColor = isCurrentUser
      ? Colors.primary
      : (isDarkMode ? '#D0D0D0' : Colors.dark_text_secondary);
  
    const opacity = isCurrentUser ? 1 : 0.7;
  
    return (
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => onPress && onPress(event)}
        style={{
          backgroundColor,
          borderRadius: 4,
          padding: 2,
          opacity,
          justifyContent: 'center',
          alignItems: 'center',
          top: `${props.style[1]?.top}` || 0,
          position: 'absolute',
        }}
      >
        <Text
          numberOfLines={1}
          style={{
            color: Colors.white,
            fontSize: 10,
            fontFamily: 'Inter-SemiBold',
          }}
        >
          {event.booking?.boat?.name || 'Booking'}
        </Text>
      </TouchableOpacity>
    );
  }
  
  // For day view (absolute positioning)
  const widthPercent = event.widthPercent || 100;
  const leftPercent = event.leftPercent || 0;
  const bufferPercent = event.bufferPercent || 0;
  const totalWidth = widthPercent + bufferPercent;

  const isCurrentUser = event.isCurrentCustomer;
  const backgroundColor = isCurrentUser
    ? Colors.primary
    : (isDarkMode ? '#D0D0D0' : Colors.dark_text_secondary);

  const opacity = event.isOverflow
    ? 0.5
    : (isCurrentUser ? 1 : 0.7);

  // Format start and end times for day view
  const startTime = event.start ? moment(event.start).format('h:mm A') : '';
  const endTime = event.end ? moment(event.end).format('h:mm A') : '';
  const timeRange = startTime && endTime ? `${startTime} - ${endTime}` : '';

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={() => onPress && onPress(event)}
      style={{
        backgroundColor,
        borderRadius: 4,
        padding: 4, 
        opacity,
        width: `${totalWidth}%`,
        left: `${leftPercent}%`,
        position: 'absolute',
        top: `${props.style[1]?.top}` || 0,
        height: `${props.style[1]?.height}` || 0,
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
      }}
    >
      <Text
        numberOfLines={1}
        style={{
          color: Colors.white,
          fontSize: 11,
          fontFamily: 'Inter-SemiBold',
        }}
      >
        {event.booking?.boat?.name || 'Booking'}
      </Text>
      {timeRange ? (
        <Text
          numberOfLines={1}
          style={{
            color: Colors.white,
            fontSize: 9,
            fontFamily: 'Inter-Regular',
            opacity: 0.9,
          }}
        >
          {timeRange}
        </Text>
      ) : null}
    </TouchableOpacity>
  );
};

export default CalendarEvent;

