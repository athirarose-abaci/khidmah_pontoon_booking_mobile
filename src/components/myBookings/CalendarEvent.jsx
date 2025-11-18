import React, { useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Svg, Defs, Pattern, Line, Rect, Image } from 'react-native-svg';
import moment from 'moment';
import { Colors } from '../../constants/customStyles';

const CalendarEvent = ({ event, props, calendarViewMode, isDarkMode, onPress }) => {
  if (event.isSelectedBoat) {
    const blockWidth = event.widthPercent !== undefined ? Math.min(100, Math.max(5, event.widthPercent)) : 100;
    const leftPos = event.leftPercent !== undefined ? event.leftPercent : 0;

    // Convert hex color to rgba for opacity
    const primaryRgb = '117, 200, 173'; // Colors.primary = '#75C8AD'
    
    // Get the calendar's provided style (which includes positioning)
    const calendarStyle = props?.style || {};
    const positioningStyle = Array.isArray(calendarStyle) ? calendarStyle[1] || {} : calendarStyle;
    const topValue = positioningStyle?.top ?? 0;
    const heightValue = positioningStyle?.height ?? 0;
    
    return (
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => onPress && onPress(event)}
        style={[
          Array.isArray(calendarStyle) ? calendarStyle[0] : {},
          {
            position: 'absolute',
            top: typeof topValue === 'number' ? `${topValue}%` : topValue || 0,
            height: typeof heightValue === 'number' ? `${heightValue}%` : heightValue || 0,
            width: `${blockWidth}%`,
            left: `${leftPos}%`,
            borderWidth: 1,
            borderColor: Colors.primary,
            // borderStyle: 'dashed',
            backgroundColor: `rgba(${primaryRgb}, 0.2)`,
            borderRadius: 1,
            zIndex: 10,
          }
        ]}
      />
    );
  }

// Handle availability blocks - show as unavailable blocks with stripes and dotted border
if (event.availabilityBlock || event.isFullyOccupied !== undefined || event.isAvailable !== undefined || event.status === 'OCCUPIED') {
  const blockWidth = event.widthPercent !== undefined ? Math.min(100, Math.max(5, event.widthPercent)) : 100;
  
  // Get the calendar's provided style (which includes positioning)
  const calendarStyle = props?.style || {};
  const positioningStyle = Array.isArray(calendarStyle) ? calendarStyle[1] || {} : calendarStyle;
  const topValue = positioningStyle?.top ?? 0;
  const heightValue = positioningStyle?.height ?? 0;

  // const [size, setSize] = useState({ width: 0, height: 0 });
  return (
    <View
      style={[
        Array.isArray(calendarStyle) ? calendarStyle[0] : {},
        {
          position: 'absolute',
          top: typeof topValue === 'number' ? `${topValue}%` : topValue || 0,
          height: typeof heightValue === 'number' ? `${heightValue}%` : heightValue || 0,
          width: `${blockWidth}%`,
          left: '0%',
          borderWidth: 2,
          borderColor: isDarkMode ? '#808080' : '#A0A0A0',
          borderStyle: 'dashed',
          borderRadius: 1,
          zIndex: 5,
          overflow: 'hidden',
          backgroundColor: isDarkMode ? '#606060' : '#C8C8C8',
        }
      ]}
      // onLayout={(event) => {
      //   const { width, height } = event.nativeEvent.layout;
      //   setSize({ width, height });
      // }}
    >
      {/* Diagonal stripe overlay using SVG pattern */}
      {/* {size.width > 0 && size.height > 0 && ( */}
      <Svg
        style={{
          // position: 'absolute',
          width: '150%',
          height: '150%',
          top: '-10%',
          left: '-10%',
        }}
        // viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <Defs>
          <Pattern
            id="diagonalStripes"
            patternUnits="userSpaceOnUse"
            width="8"
            height="8"
            patternTransform="rotate(45)"
          >
            <Rect
              x="0"
              y="0"
              width="2"
              height="10"
              fill={isDarkMode ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)'}
            />
            <Rect
              x="0"
              y="0"
              width="6"
              height="8"
              fill="transparent"
            />
          </Pattern>
        </Defs>
        <Rect
          x="0"
          y="0"
          width="100%"
          height="100%"
          fill="url(#diagonalStripes)"
        />
      </Svg>
      {/* )} */}
    </View>
  );
}

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

