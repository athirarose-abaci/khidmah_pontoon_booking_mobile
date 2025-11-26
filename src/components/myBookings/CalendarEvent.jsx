import React from 'react';
import { Text, TouchableOpacity, View, StyleSheet } from 'react-native';
import { Svg, Defs, Pattern, Rect, Line } from 'react-native-svg';
import moment from 'moment';
import { Colors } from '../../constants/customStyles';

const CalendarEvent = ({ event, props, calendarViewMode, isDarkMode, onPress }) => {
  // Check if this is an occupancy block
  const isOccupancyBlock = event.isOccupancyBlock;

  // For non-day views (week, month)
  if (calendarViewMode !== 'day') {
    // Occupancy blocks only show in day view
    if (isOccupancyBlock) {
      return null;
    }

    const isCurrentUser = event.isCurrentCustomer;
    const isMoreIndicator = event.isMoreIndicator;
    const moreCount = event.moreCount || 0;
  
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
          borderRadius: 3,
          padding: 1,
          paddingHorizontal: 3,
          opacity,
          justifyContent: 'center',
          alignItems: 'center',
          top: `${props.style[1]?.top}` || 0,
          position: 'absolute',
          maxWidth: '95%',
          alignSelf: 'flex-start',
        }}
      >
        <Text
          numberOfLines={1}
          style={{
            color: Colors.white,
            fontSize: 9,
            fontFamily: 'Inter-SemiBold',
          }}
        >
          {isMoreIndicator 
            ? `+${moreCount} more` 
            : (event.booking?.boat?.name || 'Booking')}
        </Text>
      </TouchableOpacity>
    );
  }
  
  // For day view - handle occupancy blocks
  if (isOccupancyBlock) {
    const widthPercent = event.widthPercent || 100;
    const leftPercent = event.leftPercent || 0;
    const isAvailable = event.isAvailable;
    const isOccupied = event.isOccupied;
    const isNonWorkingHours = event.isNonWorkingHours || false;
    const selectedBoatAlreadyBooked = event.selectedBoatAlreadyBooked || false;

    // Format start and end times
    const startTime = event.start ? moment(event.start).format('h:mm A') : '';
    const endTime = event.end ? moment(event.end).format('h:mm A') : '';
    const timeRange = startTime && endTime ? `${startTime} - ${endTime}` : '';

    // Different colors for available, occupied blocks, selected boat bookings, and non-working hours
    const backgroundColor = isNonWorkingHours
      ? (isDarkMode ? Colors.dark_container : '#F5F5F5') 
      : isAvailable
      ? 'rgba(76, 175, 80, 0.2)' // Light green for available
      : selectedBoatAlreadyBooked
      ? 'rgba(33, 150, 243, 0.2)' // Blue for selected boat bookings
      : 'rgba(244, 67, 54, 0.2)'; // Red for occupied blocks

    // Make availability blocks clickable, but not occupied blocks or non-working hours
    const Component = isAvailable ? TouchableOpacity : View;
    const componentProps = isAvailable 
      ? { 
          activeOpacity: 0.7, 
          onPress: () => onPress && onPress(event) 
        }
      : {};

    return (
      <Component
        {...componentProps}
        style={{
          backgroundColor,
          borderRadius: 4,
          width: `${widthPercent}%`,
          left: `${leftPercent}%`,
          position: 'absolute',
          top: `${props.style[1]?.top}` || 0,
          height: `${props.style[1]?.height}` || 0,
          borderWidth: 1,
          borderColor: isNonWorkingHours
            ? (isDarkMode ? Colors.dark_separator : '#E0E0E0') // Light gray border for non-working hours
            : isAvailable 
            ? 'rgba(76, 175, 80, 0.4)' 
            : selectedBoatAlreadyBooked
            ? 'rgba(33, 150, 243, 0.4)' // Blue border for selected boat bookings
            : 'rgba(244, 67, 54, 0.6)', // Red border for occupied blocks
          overflow: 'hidden',
        }}
      >
        {/* Show diagonal stripes only for occupied blocks (not for non-working hours or selected boat bookings) */}
        {isOccupied && !isNonWorkingHours && !selectedBoatAlreadyBooked && (
          <Svg
            height="100%"
            width="100%"
            style={StyleSheet.absoluteFill}
          >
            <Defs>
              <Pattern
                id={`diagonal-stripe-${event.id}`}
                patternUnits="userSpaceOnUse"
                width="10"
                height="10"
              >
                <Line
                  x1="0"
                  y1="0"
                  x2="10"
                  y2="10"
                  stroke={isDarkMode ? 'rgba(244, 67, 54, 0.4)' : 'rgba(244, 67, 54, 0.4)'}
                  strokeWidth="1.5"
                />
              </Pattern>
            </Defs>
            <Rect
              width="100%"
              height="100%"
              fill={`url(#diagonal-stripe-${event.id})`}
            />
          </Svg>
        )}
        {/* Don't show time range and label for non-working hours */}
        {timeRange && !isNonWorkingHours && (
          <View style={{ padding: 4 }}>
            <Text
              numberOfLines={1}
              style={{
                color: isDarkMode ? Colors.white : Colors.black,
                fontSize: 9,
                fontFamily: 'Inter-Regular',
                fontWeight: '500',
              }}
            >
              {isAvailable ? 'Available' : (selectedBoatAlreadyBooked ? 'Your Booking' : 'Occupied')}
            </Text>
            <Text
              numberOfLines={1}
              style={{
                color: isDarkMode ? Colors.font_gray : '#666666',
                fontSize: 8,
                fontFamily: 'Inter-Regular',
                marginTop: 2,
              }}
            >
            {timeRange}
          </Text>
        </View>
        )}
      </Component>
    );
  }
  
  // For day view - regular booking events (absolute positioning)
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

