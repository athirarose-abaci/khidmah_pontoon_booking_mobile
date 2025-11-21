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
  
  // For day view - handle occupancy blocks
  if (isOccupancyBlock) {
    const widthPercent = event.widthPercent || 100;
    const leftPercent = event.leftPercent || 0;
    const isAvailable = event.isAvailable;
    const isOccupied = event.isOccupied;
    const selectedBoatAlreadyBooked = event.selectedBoatAlreadyBooked || false;

    // Format start and end times
    const startTime = event.start ? moment(event.start).format('h:mm A') : '';
    const endTime = event.end ? moment(event.end).format('h:mm A') : '';
    const timeRange = startTime && endTime ? `${startTime} - ${endTime}` : '';

    // Different colors for available and occupied blocks
    const backgroundColor = isAvailable
      ? 'rgba(76, 175, 80, 0.2)' // Light green for available
      : 'rgba(158, 158, 158, 0.2)'; // Standard gray for occupied blocks

    // Make availability blocks clickable, but not occupied blocks
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
          borderColor: isAvailable 
            ? 'rgba(76, 175, 80, 0.4)' 
            : 'rgba(158, 158, 158, 0.6)', // Standard gray border for occupied blocks
          overflow: 'hidden',
        }}
      >
        {isOccupied && (
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
                  stroke={isDarkMode ? 'rgba(158, 158, 158, 0.3)' : 'rgba(117, 117, 117, 0.3)'}
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
        {timeRange && (
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
              {isAvailable ? 'Available' : 'Occupied'}
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

