import React, { useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Animated, PanResponder } from 'react-native';
import { MaterialDesignIcons } from '@react-native-vector-icons/material-design-icons';
import { Colors, getNotificationConfig } from '../../constants/customStyles';
import { formatTimeAgo } from '../../helpers/timeHelper';

const NotificationCard = ({ 
  item, 
  onExtendStay, 
  onCheckout,
  onPress,
  onDelete
}) => {
  const config = getNotificationConfig(item?.type, item?.subject);
  const translateX = useRef(new Animated.Value(0)).current;
  const deleteButtonWidth = 80;

  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: (evt, gestureState) => {
      return Math.abs(gestureState.dx) > 10;
    },
    onPanResponderMove: (evt, gestureState) => {
      if (gestureState.dx < 0) {
        translateX.setValue(Math.max(gestureState.dx, -deleteButtonWidth));
      }
    },
    onPanResponderRelease: (evt, gestureState) => {
      if (gestureState.dx < -deleteButtonWidth / 2) {
        // Swipe threshold reached, show delete button
        Animated.spring(translateX, {
          toValue: -deleteButtonWidth,
          useNativeDriver: true,
        }).start();
      } else {
        // Snap back to original position
        Animated.spring(translateX, {
          toValue: 0,
          useNativeDriver: true,
        }).start();
      }
    },
  });

  const handleDelete = () => {
    if (onDelete) {
      onDelete(item?.id);
    }
    // Reset position after delete
    Animated.spring(translateX, {
      toValue: 0,
      useNativeDriver: true,
    }).start();
  };
  
  const renderIcon = () => {
    if (config.iconType === 'image' && config.iconSource) {
      return (
        <Image 
          source={config.iconSource} 
          style={{width: 30, height: 30, resizeMode: 'contain'}} 
          tintColor={config.iconColor}
        />
      );
    } else if (config.iconType === 'icon' && config.iconName) {
      return (
        <MaterialDesignIcons 
          name={config.iconName} 
          size={30} 
          color={config.iconColor} 
        />
      );
    }
    return null;
  };

  const handlePress = () => {
    if (onPress) {
      onPress(item);
    }
  };

  return (
    <View style={styles.container}>
      {/* Delete Button Background */}
      <View style={styles.deleteButtonContainer}>
        <TouchableOpacity 
          style={styles.deleteButton}
          onPress={handleDelete}
        >
          <MaterialDesignIcons name="delete-outline" size={24} color={Colors.white} />
          <Text style={styles.deleteButtonText}>Delete</Text>
        </TouchableOpacity>
      </View>

      {/* Main Card */}
      <Animated.View 
        style={[
          styles.notificationCard,
          { transform: [{ translateX }] }
        ]}
        {...panResponder.panHandlers}
      >
        <TouchableOpacity 
          style={styles.cardContent}
          onPress={handlePress}
          activeOpacity={0.7}
        >
          <View style={[styles.iconContainer, { 
            backgroundColor: config.backgroundColor
          }]}>
            {renderIcon()}
          </View>
          
          <View style={styles.textContent}>
            <View style={styles.titleRow}>
              <Text style={styles.notificationTitle}>{item?.subject}</Text>
              <Text style={styles.timeAgo}>{formatTimeAgo(item?.created_at)}</Text>
            </View>
            <Text style={styles.notificationMessage}>{item?.message}</Text>
            
            {item?.hasActions && (
              <View style={styles.actionButtons}>
                <TouchableOpacity 
                  style={styles.extendButton}
                  onPress={() => onExtendStay(item?.id)}
                >
                  <MaterialDesignIcons name="timer-plus-outline" size={16} color={Colors.primary} />
                  <Text style={styles.extendButtonText}>Extend stay</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.checkoutButton}
                  onPress={() => onCheckout(item?.id)}
                >
                  <Image source={require('../../assets/images/clock_out.png')} style={{width: 16, height: 16, resizeMode: 'contain'}} />
                  <Text style={styles.checkoutButtonText}>Check-out</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

export default NotificationCard;

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    marginBottom: 0,
  },
  deleteButtonContainer: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 80,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FF4444',
    borderRadius: 12,
  },
  deleteButton: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
  },
  deleteButtonText: {
    color: Colors.white,
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    marginTop: 4,
  },
  notificationCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    marginBottom: 0,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  cardContent: {
    flexDirection: 'row',
    // padding: 16,
    paddingHorizontal: 15,
    paddingVertical: 12,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 5,
  },
  textContent: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  notificationTitle: {
    fontSize: 14.5,
    fontFamily: 'Inter-SemiBold',
    color: Colors.heading_font,
    flex: 1,
    marginRight: 8,
  },
  timeAgo: {
    fontSize: 11,
    fontFamily: 'Inter-Regular',
    color: '#B0B0B0',
    fontStyle: 'italic',
  },
  notificationMessage: {
    fontSize: 13,
    fontFamily: 'Inter-Regular',
    color: Colors.font_gray,
    lineHeight: 20,
    marginBottom: 8,
  },
  actionButtons: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 8,
  },
  extendButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.primary,
    backgroundColor: Colors.white,
    gap: 6,
  },
  extendButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: Colors.primary,
  },
  checkoutButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: Colors.primary,
    gap: 6,
  },
  checkoutButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: Colors.white,
  },
});
