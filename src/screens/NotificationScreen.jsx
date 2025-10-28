// NotificationScreen.jsx - updated version for setNotifications
import { StyleSheet, Text, View, TouchableOpacity, FlatList, StatusBar, RefreshControl, ActivityIndicator, ScrollView } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import React, { useCallback, useContext, useLayoutEffect, useState, useEffect } from 'react'
import { Ionicons } from '@react-native-vector-icons/ionicons'
import { Colors } from '../constants/customStyles'
import NotificationCard from '../components/cards/NotificationCard'
import NoDataImage from '../components/NoDataImage'
import { ToastContext } from '../context/ToastContext'
import Error from '../helpers/Error'
import AbaciLoader from '../components/AbaciLoader'
import { deleteNotification, fetchNotifications } from '../apis/system'
import { useFocusEffect, useIsFocused } from '@react-navigation/native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useSelector, useDispatch } from 'react-redux'
import { removeNotification } from '../../store/notificationSlice'
import ConfirmationModal from '../components/modals/ConfirmationModal'
import { useSocket } from '../components/WebSocketProvider'

const NotificationScreen = ({ navigation }) => {
  const [apiNotifications, setApiNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMorePages, setHasMorePages] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [notificationToDelete, setNotificationToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const limit = 10;
  const insets = useSafeAreaInsets();
  const isFocused = useIsFocused();

  const toastContext = useContext(ToastContext);
  const dispatch = useDispatch();
  const isDarkMode = useSelector(state => state.themeSlice.isDarkMode);
  const liveNotifications = useSelector(state => state.notificationSlice.notifications);
  const socket = useSocket();

  useLayoutEffect(() => {
    navigation.getParent()?.setOptions({
      tabBarStyle: { display: 'none' }
    });
  }, [navigation]);


  const allNotifications = React.useMemo(() => {
    let liveNotificationsArray = [];
    
    if (liveNotifications && typeof liveNotifications === 'object') {
      if (liveNotifications?.id || liveNotifications?.created_at) {
        liveNotificationsArray = [liveNotifications];
      } 
      else if (Object.keys(liveNotifications).length > 0) {
        liveNotificationsArray = Object.values(liveNotifications);
      }
    }
    
    else if (Array.isArray(liveNotifications)) {
      liveNotificationsArray = liveNotifications;
    }

    const merged = [...liveNotificationsArray, ...apiNotifications];
    
    // Remove duplicates based on notification ID
    const uniqueNotifications = merged.reduce((acc, current) => {
      // Find if this notification already exists in the accumulator
      const existingIndex = acc.findIndex(item => item.id === current.id);
      
      if (existingIndex === -1) {
        // If not found, add it
        acc.push(current);
      } else {
        // If found, prefer the live version over API version
        // Check if current is from live notifications (not in apiNotifications)
        const isFromLive = liveNotificationsArray.some(live => live.id === current.id);
        if (isFromLive) {
          acc[existingIndex] = current;
        }
      }
      return acc;
    }, []);
    
    // Sort by created_at in descending order (newest first)
    return uniqueNotifications.sort((a, b) => {
      const dateA = new Date(a.created_at);
      const dateB = new Date(b.created_at);
      
      // Handle invalid dates by putting them at the end
      if (isNaN(dateA.getTime()) && isNaN(dateB.getTime())) return 0;
      if (isNaN(dateA.getTime())) return 1;
      if (isNaN(dateB.getTime())) return -1;
      
      return dateB - dateA; 
    });
  }, [apiNotifications, liveNotifications]);

  useFocusEffect(
    useCallback(() => {
      setPage(1);
      setHasMorePages(true);
      fetchNotificationsData(1, limit, false);
    }, [])
  );

  useEffect(() => {
      socket.emit('viewing_notification');
    return () => {
      if (socket && socket.connected) {
      socket.emit('left_notification');
    }
  };
  }, [socket, isFocused]);

  const fetchNotificationsData = async (pageNumber, limitNumber, isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setIsLoading(true);
    }
    
    try {
      const response = await fetchNotifications(pageNumber, limitNumber);
      
      const apiResults = response?.results || [];
      
      if (isRefresh || pageNumber === 1) {
        setApiNotifications(apiResults);
      } else {
        const newData = [...apiNotifications, ...apiResults];
        setApiNotifications(newData);
      }
      
      setHasMorePages(!!response?.next);
      if(response?.next) {
        setPage(prevPage => prevPage + 1);
      }
    } catch (error) {
      let err_msg = Error(error);
      toastContext.showToast(err_msg, 'short', 'error');
    } finally {
      if (isRefresh) {
        setRefreshing(false);
      } else {
        setIsLoading(false);
      }
    }
  };

  const refreshControl = () => {
    setPage(1);
    setHasMorePages(true);
    fetchNotificationsData(1, limit, true);
  };

  const handleExtendStay = (notificationId) => {
    // console.log('Extend stay for notification:', notificationId);
  };

  const handleCheckout = (notificationId) => {
    // console.log('Checkout for notification:', notificationId);
  };

  const handleDeleteNotification = (notificationId) => {
    setNotificationToDelete(notificationId);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!notificationToDelete) {
      return;
    }
    
    setIsDeleting(true);
    try {
      await deleteNotification(notificationToDelete);
      toastContext.showToast('Notification deleted successfully!', 'short', 'success');
      
      setApiNotifications(prevNotifications => 
        prevNotifications.filter(notification => notification.id !== notificationToDelete)
      );
      
      dispatch(removeNotification(notificationToDelete));
      
      setPage(1);
      setHasMorePages(true);
      fetchNotificationsData(1, limit, false);
      
    } catch (error) {
      let err_msg = Error(error);
      toastContext.showToast(err_msg, 'short', 'error');
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
      setNotificationToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    if (!isDeleting) {
      setShowDeleteModal(false);
      setNotificationToDelete(null);
    }
  };

  const handleNotificationPress = (notification) => {
    
    if (notification?.type === 'BOOKING' && notification?.foreign_key) {
      const booking = {
        id: notification?.foreign_key,
        // booking_number: notification?.message?.match(/#BK-\d+/)?.[0] || `#BK-${notification?.foreign_key?.toString()?.padStart(6, '0')}`
      };
      
      navigation.navigate('BookingManagement', { booking });
    } else if (notification?.type === 'TICKET' && notification?.foreign_key) {
      navigation.navigate('TicketDetail', { ticketId: notification?.foreign_key });
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: isDarkMode ? Colors.dark_bg_color : Colors.bg_color }]} edges={["left", "right"]}>
      <StatusBar 
        translucent={true}
        backgroundColor="transparent" 
        barStyle={isDarkMode ? "light-content" : "dark-content"} 
      />
      
      {/* Fixed Header */}
      <View style={[styles.header, { backgroundColor: isDarkMode ? Colors.dark_bg_color : Colors.bg_color }]}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={24} color={isDarkMode ? Colors.white : Colors.font_gray} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: isDarkMode ? Colors.white : Colors.font_gray }]}>Notifications</Text>
      </View>

      {/* Notifications FlatList */}
      <FlatList
        data={allNotifications}
        keyExtractor={(item) => `notification-${item.id}`}
        renderItem={({ item }) => (
          <View style={styles.sectionContainer}>
            <NotificationCard 
              item={item}
              onExtendStay={handleExtendStay}
              onCheckout={handleCheckout}
              onPress={handleNotificationPress}
              onDelete={handleDeleteNotification}
            />
          </View>
        )}
        style={styles.flatList}
        contentContainerStyle={[
          styles.notification_card_list,
          { paddingBottom: insets.bottom + 100 }
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refreshControl}
            colors={[Colors.primary]}
            tintColor={Colors.primary}
          />
        }
        ListEmptyComponent={
          <View style={styles.noDataContainer}>
            <NoDataImage
              imageSource={require('../assets/images/no_notification.png')}
              title="No notifications yet"
              subtitle="You don't have any notifications at the moment."
              onRefresh={refreshControl}
              isDarkMode={isDarkMode}
            />
          </View>
        }
        ListFooterComponent={
          isLoading ? (
            <View style={{ paddingVertical: 20, alignItems: 'center' }}>
              <ActivityIndicator size="small" color={Colors.primary} />
            </View>
          ) : null
        }
        onEndReached={() => {
          if (hasMorePages && !isLoading) {
            fetchNotificationsData(page, limit, false);
          }
        }}
        onEndReachedThreshold={0.1}
      />
      <AbaciLoader visible={isLoading || isDeleting} />
      
      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isVisible={showDeleteModal}
        onRequestClose={isDeleting ? undefined : handleCancelDelete}
        onConfirm={isDeleting ? undefined : handleConfirmDelete}
        title="Delete Notification"
        message="Are you sure you want to delete this notification? This action cannot be undone."
        confirmText={isDeleting ? "Deleting..." : "Delete"}
        cancelText="Cancel"
        confirmButtonColor={isDeleting ? "#CCCCCC" : "#FF4444"}
        warningIconName="delete-outline"
        warningIconColor="#FF4444"
      />
    </SafeAreaView>
  )
}

export default NotificationScreen

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    marginTop: 40,
  },
  backButton: {
    marginRight: 15,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
  },
  flatList: {
    flex: 1,
  },
  notification_card_list: {
    paddingHorizontal: 26,
    paddingBottom: 20,
  },
  sectionContainer: {
    marginBottom: 5,
    marginTop: 10,
  },
  noDataContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 550,
    paddingVertical: 50,
  },
})