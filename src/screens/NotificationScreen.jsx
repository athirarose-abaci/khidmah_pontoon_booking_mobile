import { StyleSheet, Text, View, TouchableOpacity, FlatList, StatusBar, RefreshControl, ActivityIndicator, ScrollView } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import React, { useCallback, useContext, useLayoutEffect, useState } from 'react'
import { Ionicons } from '@react-native-vector-icons/ionicons'
import { Colors } from '../constants/customStyles'
import NotificationCard from '../components/cards/NotificationCard'
import NoDataImage from '../components/NoDataImage'
import { ToastContext } from '../context/ToastContext'
import Error from '../helpers/Error'
import AbaciLoader from '../components/AbaciLoader'
import { fetchNotifications } from '../apis/system'
import { useFocusEffect } from '@react-navigation/native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

const NotificationScreen = ({ navigation }) => {
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMorePages, setHasMorePages] = useState(true);
  const limit = 10;
  const insets = useSafeAreaInsets();

  const toastContext = useContext(ToastContext);

  useLayoutEffect(() => {
    navigation.getParent()?.setOptions({
      tabBarStyle: { display: 'none' }
    });
  }, [navigation]);

  useFocusEffect(
    useCallback(() => {
      setPage(1);
      setHasMorePages(true);
      fetchNotificationsData(1, limit, false);
    }, [])
  )

  const fetchNotificationsData = async (pageNumber, limitNumber, isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setIsLoading(true);
    }
    
    try {
      const response = await fetchNotifications(pageNumber, limitNumber);
      
      if (isRefresh || pageNumber === 1) {
        setNotifications(response?.results || []);
      } else {
        const newData = [...notifications, ...(response?.results || [])];
        setNotifications(newData);
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
    console.log('Extend stay for notification:', notificationId);
  };

  const handleCheckout = (notificationId) => {
    console.log('Checkout for notification:', notificationId);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["left", "right"]}>
      <StatusBar backgroundColor="#F7F7F7" barStyle="dark-content" />
      
      {/* Fixed Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={24} color={Colors.font_gray} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
      </View>

      {/* Scrollable Notifications List */}
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refreshControl}
            colors={[Colors.primary]}
            tintColor={Colors.primary}
          />
        }
      >
        <View style={styles.notification_card_list}>
          {notifications.length === 0 ? (
            <View style={styles.noDataContainer}>
              <NoDataImage
                imageSource={require('../assets/images/no_notification.png')}
                title="No notifications yet"
                subtitle="You don't have any notifications at the moment."
                onRefresh={refreshControl}
                isDarkMode={false}
              />
            </View>
          ) : (
            <View>
              {notifications.map((item) => (
                <View key={item.id.toString()} style={styles.sectionContainer}>
                  <NotificationCard 
                    item={item}
                    onExtendStay={handleExtendStay}
                    onCheckout={handleCheckout}
                  />
                </View>
              ))}
              {isLoading && (
                <View style={{ paddingVertical: 20, alignItems: 'center' }}>
                  <ActivityIndicator size="small" color={Colors.primary} />
                </View>
              )}
            </View>
          )}
        </View>
      </ScrollView>
      <AbaciLoader visible={isLoading} />
    </SafeAreaView>
  )
}

export default NotificationScreen

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.bg_color,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    marginTop: 40,
    backgroundColor: Colors.bg_color,
  },
  backButton: {
    marginRight: 15,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: Colors.font_gray,
  },
  scrollView: {
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
    minHeight: 400,
    paddingVertical: 50,
  },
})