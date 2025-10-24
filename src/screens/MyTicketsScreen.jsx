import { StatusBar, StyleSheet, Text, TouchableOpacity, View, FlatList, TextInput, RefreshControl, ActivityIndicator } from 'react-native';
import React, { useState, useContext, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../constants/customStyles';
import Ionicons from '@react-native-vector-icons/ionicons';
import SubTabBar from '../components/tab_bars/SubTabBar';
import NoDataImage from '../components/NoDataImage';
import MyTicketsCard from '../components/cards/MyTicketsCard';
import CreateButton from '../components/newBooking/CreateButton';
import { Lucide } from '@react-native-vector-icons/lucide';
import useTabBarScroll from '../hooks/useTabBarScroll';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import CreateTicketModal from '../components/modals/CreateTicketModal';
import AbaciLoader from '../components/AbaciLoader';
import { ToastContext } from '../context/ToastContext';
import Error from '../helpers/Error';
import { fetchTickets } from '../apis/tickets';
import { useDispatch, useSelector } from 'react-redux';
import { setTickets, clearTickets } from '../../store/ticketSlice';
import moment from 'moment';
import { useRef } from 'react'; 

const MyTicketsScreen = () => {
  const toastContext = useContext(ToastContext);
  const [activeTab, setActiveTab] = useState('All');
  const [showCreateTicketModal, setShowCreateTicketModal] = useState(false);
  const tabs = ['All', 'Open', 'In Progress', 'Closed'];

  const { onScroll, insets } = useTabBarScroll();

  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const dispatch = useDispatch();
  const storedTickets = useSelector(state => state.ticketSlice.tickets);
  const isDarkMode = useSelector(state => state.themeSlice.isDarkMode);

  const [ticketsData, setTicketsData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [hasMorePages, setHasMorePages] = useState(true);
  const [page, setPage] = useState(1);
  const [isNavigatingToDetail, setIsNavigatingToDetail] = useState(false);
  const limit = 10;
  const [searchQuery, setSearchQuery] = useState('null');

  const messages = useSelector(state => state.chatSlice.messages);
  
  const ticketsDataRef = useRef(ticketsData);
  const lastProcessedMessages = useRef({});

  useEffect(() => {
    ticketsDataRef.current = ticketsData;
  }, [ticketsData]);



 useEffect(() => {
    ticketsDataRef.current = ticketsData;
  }, [ticketsData]);

  useEffect(() => {
    if (!messages || Object.keys(messages).length === 0) return;

    // Get current tickets data from ref
    const currentTickets = [...ticketsDataRef.current];
    let shouldUpdate = false;

    Object.entries(messages).forEach(([ticketId, messageData]) => {
      const numericTicketId = Number(ticketId);
      
      // Skip if we already processed this message
      const messageId = messageData?.id || messageData?.[0]?.id;
      if (lastProcessedMessages.current[messageId]) return;
      
      // Find the ticket in current data
      const ticketIndex = currentTickets.findIndex(
        ticket => ticket.id === numericTicketId || ticket.ticket_id === numericTicketId
      );
      
      if (ticketIndex !== -1) {
        // Increment unread count
        currentTickets[ticketIndex] = {
          ...currentTickets[ticketIndex],
          unread_message_count: (currentTickets[ticketIndex].unread_message_count || 0) + 1
        };
        shouldUpdate = true;
        
        // Mark this message as processed
        if (messageId) {
          lastProcessedMessages.current[messageId] = true;
        }
      }
    });

    // Update state if we made changes
    if (shouldUpdate) {
      setTicketsData(currentTickets);
      
      // Clean up old processed messages (optional, to prevent memory leak)
      if (Object.keys(lastProcessedMessages.current).length > 100) {
        lastProcessedMessages.current = {};
      }
    }
  }, [messages]);
  
  const handleTicketPress = (ticketId) => {
    setIsNavigatingToDetail(true);
    navigation.navigate('TicketDetail', { ticketId });
    // Reset loading state after a short delay to allow navigation
    setTimeout(() => {
      setIsNavigatingToDetail(false);
    }, 1000);
  };

  const statusForApi = (tab) => {
    if (tab === 'All') return undefined;
    if (tab === 'Open') return 'OPEN';
    if (tab === 'In Progress') return 'IN_PROGRESS';
    if (tab === 'Closed') return 'CLOSED';
    return undefined;
  };

  const fetchTicketsData = async (pageNumber, limitNumber, isRefresh = false, query, tab) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setIsLoading(true);
    }
    try {
      const response = await fetchTickets(pageNumber, limitNumber, query, statusForApi(tab));
      const results = response?.results || [];

      if (isRefresh || pageNumber === 1) {
        setTicketsData(results);
        dispatch(setTickets(results));
      } else {
        const newData = [...ticketsData, ...results];
        setTicketsData(newData);
        const appendedRaw = [...(storedTickets || []), ...results];
        dispatch(setTickets(appendedRaw));
      }

      setHasMorePages(!!response?.next);
      if (response?.next) {
        setPage((prev) => prev + 1);
      }
    } catch (error) {
      const errMsg = Error(error);
      toastContext.showToast(errMsg, 'short', 'error');
    } finally {
      if (isRefresh) {
        setRefreshing(false);
      } else {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (isFocused && searchQuery !== 'null') {
        setIsSearching(true);
        (async () => {
          dispatch(clearTickets());
          setPage(1);
          setHasMorePages(true);
          await fetchTicketsData(1, limit, true, searchQuery, activeTab);
          setIsSearching(false);
        })();
      }
    }, 500);
    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  useEffect(() => {
    if (isFocused) {
      dispatch(clearTickets());
      setPage(1);
      setHasMorePages(true);
      fetchTicketsData(1, limit, false, searchQuery, activeTab);
    }
  }, [activeTab, isFocused]);

  const refreshControl = () => {
    const defaultSearch = 'null';
    if (searchQuery !== defaultSearch) {
      setSearchQuery(defaultSearch);
    }
    dispatch(clearTickets());
    setPage(1);
    setHasMorePages(true);
    fetchTicketsData(1, limit, true, defaultSearch, activeTab);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["left", "right"]}>
      <StatusBar backgroundColor={isDarkMode ? Colors.bg_color : Colors.white} barStyle="dark-content" />
      <View style={[styles.main_container, { backgroundColor: isDarkMode ? Colors.dark_bg_color : Colors.bg_color }]}>
        <View style={styles.header_container}>
          <Text style={[styles.header_title, { color: isDarkMode ? Colors.white : Colors.font_gray }]}>My Tickets</Text>
          <TouchableOpacity
            activeOpacity={0.7}
            style={styles.addTicketButton}
            onPress={() => setShowCreateTicketModal(true)}
          >
            <Ionicons
              name="add-circle-outline"
              size={24}
              color={Colors.primary}
            />
            <Text style={styles.addTicketText}>Create ticket</Text>
          </TouchableOpacity>
        </View>

        {/* Search */}
        <View style={styles.filter_container}>
          <View style={[styles.search_bar, { backgroundColor: isDarkMode ? Colors.dark_container : Colors.white }]}>
            <Ionicons
              name="search-outline"
              size={22}
              color={isDarkMode ? Colors.white : "#EFEFEF"}
              style={{ marginHorizontal: 12 }}
            />
            <TextInput
              style={[styles.search_input, { color: isDarkMode ? Colors.white : Colors.black }]}
              placeholder="Search tickets"
              placeholderTextColor={isDarkMode ? Colors.font_gray : Colors.primary}
              value={searchQuery !== 'null' ? searchQuery : ''}
              onChangeText={(text) => setSearchQuery(text)}
            />
          </View>
        </View>

        <SubTabBar
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        <View style={styles.list_container}>
          {isSearching && (
            <View style={{ alignSelf: 'center', marginVertical: 10 }}>
              <ActivityIndicator size="small" color={Colors.primary} />
            </View>
          )}

          {ticketsData.length === 0 ? (
            <View style={styles.noDataContainer}>
              <NoDataImage
                imageSource={require('../assets/images/no_ticket.png')}
                title="No tickets yet"
                subtitle="You haven't raised any ticket"
                onRefresh={refreshControl}
                isDarkMode={isDarkMode}
              />
            </View>
          ) : (
            <FlatList
              data={ticketsData}
              keyExtractor={(item) => item.id?.toString?.()}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: insets.bottom + 300 }}
              renderItem={({ item }) => (
                <View style={styles.sectionContainer}>
                  <MyTicketsCard 
                    item={item} 
                    onPress={() => handleTicketPress(item?.id)}
                  />
                </View>
              )}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={refreshControl}
                  colors={[Colors.primary]}
                  tintColor={Colors.primary}
                />
              }
              onEndReachedThreshold={0.01}
              onEndReached={() => {
                if (hasMorePages && !isLoading) {
                  fetchTicketsData(page, limit, false, searchQuery, activeTab);
                }
              }}
              ListFooterComponent={
                isLoading ? (
                  <View style={{ paddingVertical: 20 }}>
                    <ActivityIndicator size="small" color={Colors.primary} />
                  </View>
                ) : null
              }
              onScroll={onScroll}
              scrollEventThrottle={16}
            />
          )}
        </View>
      </View>
      <CreateButton
        onPress={() => navigation.navigate('NewBooking')}
        icon={<Lucide name="calendar-plus" size={28} color={Colors.white} />}
        bottom={130 + insets.bottom}
        right={40}
      />
      
      <CreateTicketModal
        visible={showCreateTicketModal}
        onClose={() => setShowCreateTicketModal(false)}
        onCreated={(created) => {
          // Optimistically add the created ticket to the local list
          setTicketsData(prev => [created, ...prev]);
        }}
      />
      <AbaciLoader visible={isLoading} />
      <AbaciLoader visible={isNavigatingToDetail} />
    </SafeAreaView>
  )
}

export default MyTicketsScreen

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  main_container: {
    flex: 1,
    backgroundColor: Colors.bg_color,
  },
  header_container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 26,
    paddingVertical: 20,
    marginTop: 40,
  },
  header_title: {
    fontSize: 18,
    color: Colors.font_gray,
    fontFamily: 'Inter-SemiBold',
  },
  addTicketButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addTicketText: {
    marginLeft: 6,
    fontSize: 16,
    color: Colors.primary,
    fontFamily: 'Inter-Medium',
  },
  filter_container: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
    marginBottom: 15,
    paddingHorizontal: 26,
    backgroundColor: 'transparent',
  },
  search_bar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    height: 52,
    borderRadius: 26,
    paddingVertical: 0,
    paddingHorizontal: 12,
    marginRight: 0,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 0,
    borderWidth: 0,
    borderColor: 'transparent',
    overflow: 'hidden',
  },
  search_input: {
    flex: 1,
    paddingVertical: 0,
    paddingRight: 12,
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: Colors.black,
  },
  list_container: {
    paddingHorizontal: 26,
  },
  sectionContainer: {
    width: '100%',
  },
  noDataContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 500,
    paddingVertical: 50,
  },
})