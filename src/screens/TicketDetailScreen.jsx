import React, { useContext, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, Image, Keyboard, KeyboardAvoidingView, Platform, RefreshControl, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View, Linking } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useIsFocused, useNavigation, useRoute } from '@react-navigation/native';
import { Colors, getTicketStatusColors, getDisplayTicketStatus } from '../constants/customStyles';
import { BASE_URL_IMAGE } from '../constants/baseUrl';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import { MaterialIcons } from '@react-native-vector-icons/material-icons';
import moment from 'moment';
import { fetchTicketById, fetchTicketConversations, replyToTicket } from '../apis/tickets';
import { ToastContext } from '../context/ToastContext';
import Error from '../helpers/Error';
import ChatFileSelector from '../components/ticket/ChatFileSelector';
import TicketMessage from '../components/ticket/TicketMessage';
import ImageView from 'react-native-image-viewing';
import { setTickets } from '../../store/ticketSlice';
import { useSocket } from '../components/WebSocketProvider';

const TicketDetailScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const toastContext = useContext(ToastContext);
  const insets = useSafeAreaInsets();
  const isFocused = useIsFocused();
  
  const authState = useSelector(state => state.authSlice.authState);
  const dispatch = useDispatch();
  const messages = useSelector(state => state.chatSlice.messages);
  const socket = useSocket();
  const isDarkMode = useSelector(state => state.themeSlice.isDarkMode);

  const ticketId = route?.params?.ticketId;

  const [ticketData, setTicketData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [message, setMessage] = useState('');
  const [conversation, setConversation] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [imageViewerVisible, setImageViewerVisible] = useState(false);
  const [imageViewerImages, setImageViewerImages] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const flatListRef = useRef(null);
  const [isUserAtBottom, setIsUserAtBottom] = useState(true);
  const [didInitialScroll, setDidInitialScroll] = useState(false);

  const [isSending, setIsSending] = useState(false);

  const scrollToBottom = (animated = true) => {
    requestAnimationFrame(() => {
      flatListRef.current?.scrollToEnd({ animated });
    });
  };

  useLayoutEffect(() => {
    navigation.getParent()?.setOptions({
      tabBarStyle: { display: 'none' }
    });
  }, [navigation]);

  useEffect(() => {
    if (isFocused) {
      loadTicket();
      loadConversation();
    }
  }, [isFocused]);

  // Socket events for viewing/leaving ticket
  useEffect(() => {
    if (socket && ticketId) {
      // Emit viewing_ticket when component mounts or ticketId changes
      socket.emit('viewing_ticket', { ticket_id: ticketId });
      
      // Return cleanup function to emit left_ticket when component unmounts
      return () => {
        if (socket && ticketId) {
          socket.emit('left_ticket', { ticket_id: ticketId });
        }
      };
    }
  }, [socket, ticketId, isFocused]);

  // Emit viewing_ticket when screen becomes focused
  useEffect(() => {
    if (socket && ticketId && isFocused) {
      socket.emit('viewing_ticket', { ticket_id: ticketId });
    }
  }, [socket, ticketId, isFocused]);

  const loadTicket = async () => {
    if (!ticketId) return;
    setIsLoading(true);
    try {
      const response = await fetchTicketById(ticketId);
      setTicketData(response);
      dispatch(setTickets(response));
    } catch (error) {
      const err_msg = Error(error);
      toastContext.showToast(err_msg, 'short', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const createdAt = useMemo(() => ticketData?.created_at || ticketData?.createdAt || ticketData?.created_on, [ticketData]);
  const updatedAt = useMemo(() => ticketData?.updated_at || ticketData?.updatedAt || ticketData?.modified_on, [ticketData]);

  const formatDate = (d) => {
    if (!d) return '';
    const m = moment(d);
    if (!m.isValid()) return '';
    return m.format('DD.MM.YY');
  };

  const loadConversation = async () => {
    setIsLoadingMessages(true);
    try {
      const response = await fetchTicketConversations(ticketId);
      setConversation(response);
      // Scroll to end after first conversation load only
      if (!didInitialScroll) {
        setTimeout(() => {
          scrollToBottom(true);
          setDidInitialScroll(true);
        }, 100);
      }
    } catch (error) {
      const err_msg = Error(error);
      toastContext.showToast(err_msg, 'short', 'error');
    } finally {
      setIsLoadingMessages(false);
    }
  };

  useEffect(() => {
    if (messages[ticketId] && messages[ticketId] !== null) {
      // If it's a single message object, add it to the conversation
      setConversation((prev) => {
        // Check if this message already exists to prevent duplicates
        const messageExists = prev.some(msg => msg.id === messages[ticketId].id);
        if (!messageExists) {
          return [...prev, messages[ticketId]];
        }
        return prev;
      });
      // Only auto-scroll if user is already at/near bottom
      if (isUserAtBottom) {
        setTimeout(() => {
          scrollToBottom(true);
        }, 100);
      }
    }
  }, [messages, ticketId, isUserAtBottom]);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([loadTicket(), loadConversation()]);
    } catch (error) {
      const err_msg = Error(error);
      toastContext.showToast(err_msg, 'short', 'error');
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (conversation?.length > 0) {
      setTimeout(() => {
        scrollToBottom(true);
      }, 100);
    }
  }, [conversation]);
  

  const handleSendReply = async () => {
    if(isSending) return;
    if (!message?.trim() && selectedFiles.length === 0) {
      toastContext.showToast('Please enter a message or select a file', 'short', 'warning');
      return;
    }
    try {
      setIsSending(true);
      const payload = { 
        ticket: ticketId, 
        message: message.trim() || '', 
        is_user: true, 
        file: null 
      };
      await replyToTicket(ticketId, payload, selectedFiles);

      setMessage('');
      setSelectedFiles([]);
      setShowFileUpload(false);
      Keyboard.dismiss(); 

      await loadConversation();

      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
      
    } catch (error) {
      const err_msg = Error(error);
      toastContext.showToast(err_msg, 'short', 'error');
    } finally {
      setIsSending(false);
    }
  };

  const handleFilePress = (file) => {
    if (!file) return;
    
    const fileUrl = file.startsWith('http') ? file : `${BASE_URL_IMAGE}${file}`;
    
    if (file.includes('.jpg') || file.includes('.jpeg') || file.includes('.png') || file.includes('.gif')) {
      setImageViewerImages([{ uri: fileUrl }]);
      setImageViewerVisible(true);
    } else {
      Linking.openURL(fileUrl).catch(() => {
        toastContext.showToast('This file type cannot be opened directly. Please download it to view.', 'short', 'warning');
      });
    }
  };


  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: isDarkMode ? Colors.dark_bg_color : Colors.bg_color }]} edges={["left","right","bottom"]}>
      <StatusBar 
        translucent={true}
        backgroundColor="transparent" 
        barStyle={isDarkMode ? "light-content" : "dark-content"} 
      />
       <KeyboardAvoidingView 
         style={{ flex: 1 }} 
         behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
         keyboardVerticalOffset={Platform.OS === 'ios' ? -30 : -20}
       >
        <View style={[styles.container, { backgroundColor: isDarkMode ? Colors.dark_bg_color : Colors.bg_color }]}>
        {/* Header like Booking Management */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backRow} onPress={() => navigation.goBack()} activeOpacity={0.7}>
            <MaterialIcons
              name="chevron-left"
              size={30}
              color={isDarkMode ? Colors.white : Colors.font_gray}
              style={styles.backButton}
            />
            <Text style={[styles.headerTitle, { color: isDarkMode ? Colors.white : Colors.font_gray }]}>Ticket Details</Text>
          </TouchableOpacity>
          <View style={styles.placeholder} />
        </View>

        {/* Ticket ID and Subject */}
        <View style={styles.ticketHeader}>
          {!!ticketData?.ticket_id && (
            <Text style={[styles.ticketId, { color: isDarkMode ? Colors.dark_text_secondary : Colors.font_gray }]}>Ticket #{ticketData?.ticket_id}</Text>
          )}
          {!!ticketData?.category && (
            <View style={styles.subjectRow}>
              <Text style={[styles.ticketSubject, { color: isDarkMode ? Colors.white : '#5C7E86' }]}>
                {(() => {
                  const categoryName = ticketData?.category?.name;
                  if (categoryName?.toLowerCase() === 'others' && ticketData?.subject) {
                    return `Others: ${ticketData.subject}`;
                  }
                  return categoryName;
                })()}
              </Text>
              {!!ticketData?.status && (
                <View style={[styles.statusBadge, { 
                  backgroundColor: isDarkMode 
                    ? Colors.dark_container 
                    : getTicketStatusColors(ticketData?.status).backgroundColor,
                  borderColor: getTicketStatusColors(ticketData?.status).borderColor 
                }]}>
                  <Text style={[styles.statusText, { 
                    color: getTicketStatusColors(ticketData?.status).textColor 
                  }]}>
                    {getDisplayTicketStatus(ticketData?.status)}
                  </Text>
                </View>
              )}
            </View>
          )}
        </View>

        <View style={[styles.metaContainer, { backgroundColor: isDarkMode ? Colors.dark_container : 'rgba(117, 200, 173, 0.05)' }]}>
          <View style={styles.metaCol}>
            <Text style={[styles.metaLabel, { color: isDarkMode ? Colors.dark_text_secondary : '#5C7E86' }]}>Date Raised</Text>
            <Text style={[styles.metaValue, { color: isDarkMode ? Colors.white : '#282828' }]}>{formatDate(createdAt)}</Text>
          </View>
          <View style={[styles.metaCol, styles.metaColRight]}>
            <Text style={[styles.metaLabel, styles.metaLabelRight, { color: isDarkMode ? Colors.dark_text_secondary : '#5C7E86' }]}>Last updated</Text>
            <Text style={[styles.metaValue, styles.metaValueRight, { color: isDarkMode ? Colors.white : '#282828' }]}>{formatDate(updatedAt)}</Text>
          </View>
        </View>

        <View 
          style={{ flex: 1 }}
        >
          <FlatList
            ref={flatListRef}
            data={conversation}
            keyExtractor={(it, idx) => `${it?.id || 'msg'}_${idx}_${it?.created_at || Date.now()}`}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 26, paddingTop: 10, paddingBottom: (insets?.bottom || 0) + 0 }}
            onContentSizeChange={() => {
              if (isUserAtBottom) {
                scrollToBottom(false);
              }
            }}
            onLayout={() => {
              if (!didInitialScroll) {
                scrollToBottom(false);
                setDidInitialScroll(true);
              }
            }}
            onScrollBeginDrag={() => showFileUpload && setShowFileUpload(false)}
            onScroll={(e) => {
              const { layoutMeasurement, contentOffset, contentSize } = e.nativeEvent;
              const threshold = 40; // px
              const isAtBottomNow = contentOffset.y + layoutMeasurement.height >= contentSize.height - threshold;
              setIsUserAtBottom(isAtBottomNow);
            }}
            scrollEventThrottle={16}
            renderItem={({ item }) => (
              <TicketMessage 
                item={item}
                authState={authState}
                onFilePress={handleFilePress}
              />
            )}
            keyboardShouldPersistTaps="handled"
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[Colors.primary]}
                tintColor={Colors.primary}
              />
            }
            ListEmptyComponent={
              isLoading || isLoadingMessages ? (
                <View style={{ paddingTop: 40, alignItems: 'center' }}>
                  <ActivityIndicator size="small" color={Colors.primary} />
                </View>
              ) : null
            }
          />
        </View>

        {/* File Upload Section - Above input bar */}
        {showFileUpload && (
          <View style={[styles.fileUploadSection, { backgroundColor: isDarkMode ? Colors.dark_bg_color : Colors.bg_color, borderTopColor: isDarkMode ? Colors.dark_separator : '#E5E5E5' }]}>
            <ChatFileSelector
              files={selectedFiles}
              onChange={setSelectedFiles}
              disabled={isLoading}
              maxFiles={3}
            />
          </View>
        )}

        {ticketData?.status?.toUpperCase() !== 'CLOSED' && (
          <View style={[styles.inputBarWrap, { backgroundColor: isDarkMode ? Colors.dark_bg_color : Colors.bg_color, marginBottom: 30 }]}>
            <View style={[styles.inputBar, { backgroundColor: isDarkMode ? Colors.dark_container : Colors.white }]}>
              <TouchableOpacity 
                style={styles.attachBtn} 
                onPress={() => setShowFileUpload(!showFileUpload)}
                activeOpacity={0.7}
              >
                <Ionicons name="attach" size={32} color={Colors.primary} />
              </TouchableOpacity>
              <TextInput
                style={[styles.input, { color: isDarkMode ? Colors.white : Colors.black }]}
                placeholder="Type a message"
                placeholderTextColor={isDarkMode ? Colors.dark_text_secondary : "#A8B6C2"}
                value={message}
                onChangeText={setMessage}
                multiline={true}
                textAlignVertical="top"
                maxLength={1000}
              />
              <TouchableOpacity style={styles.sendBtn} activeOpacity={0.8} onPress={handleSendReply}>
                <Ionicons name="send" size={20} color={Colors.white} />
              </TouchableOpacity>
            </View>
          </View>
        )}
        </View>
      </KeyboardAvoidingView>
      
      {/* Image Viewer */}
      <ImageView
        images={imageViewerImages}
        imageIndex={0}
        visible={imageViewerVisible}
        onRequestClose={() => setImageViewerVisible(false)}
        swipeToCloseEnabled={true}
        doubleTapToZoomEnabled={true}
      />
      
    </SafeAreaView>
  );
};

export default TicketDetailScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 26,
    paddingVertical: 16,
    marginTop: 24,
  },
  backBtn: {
    paddingRight: 10,
    paddingVertical: 6,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
  },
  headerSubtitle: {
    fontSize: 12,
    color: Colors.primary,
    fontFamily: 'Inter-SemiBold',
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
  backRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  placeholder: {
    width: 40,
  },
  ticketHeader: {
    paddingHorizontal: 26,
    marginTop: 6,
  },
  ticketId: {
    fontSize: 13,
    fontFamily: 'Inter-Regular',
    marginBottom: 4,
  },
  subjectRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  ticketSubject: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    lineHeight: 24,
    flex: 1,
    marginRight: 12,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
  },
  metaContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 26, 
    marginTop: 8,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 25,
  },
  metaCol: {
    flex: 1,
    marginRight: 8,
  },
  metaColRight: {
    alignItems: 'flex-start',
    marginRight: 0,
    marginLeft: 8,
  },
  metaLabel: {
    fontSize: 13,
    fontFamily: 'Inter-Medium',
  },
  metaLabelRight: {
    textAlign: 'right',
    alignSelf: 'flex-end',
    width: '100%',
  },
  metaValue: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    marginTop: 4,
  },
  metaValueRight: {
    textAlign: 'right',
    alignSelf: 'flex-end',
    width: '100%',
    marginRight: 20,
  },
  msgRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginTop: 16,
  },
  msgRowLeft: {
    justifyContent: 'flex-start',
  },
  msgRowRight: {
    justifyContent: 'flex-end',
  },
  msgBubble: {
    maxWidth: '78%',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  msgBubbleAgent: {
    backgroundColor: Colors.white,
  },
  msgBubbleOwner: {
    backgroundColor: '#E9F7F3',
  },
  msgAuthor: {
    fontSize: 12,
    color: Colors.primary,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 2,
  },
  msgText: {
    fontSize: 14,
    color: Colors.black,
    fontFamily: 'Inter-Regular',
  },
  fileUploadSection: {
    paddingHorizontal: 0,
    paddingVertical: 12,
    borderTopWidth: 1,
    marginTop: 8,
  },
  inputBarWrap: {
    paddingHorizontal: 26,
    paddingTop: 8,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 0,
    marginBottom: 0,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  attachBtn: {
    padding: 8,
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    paddingVertical: 8,
    paddingRight: 10,
    minHeight: 40,
    maxHeight: 120,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});


