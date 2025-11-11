import { StatusBar, StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import React, { useContext, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import { Colors } from '../constants/customStyles';
import { MaterialIcons } from '@react-native-vector-icons/material-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Error from '../helpers/Error';
import { ToastContext } from '../context/ToastContext';
import { sendComplaint } from '../apis/system';
import AbaciLoader from '../components/AbaciLoader';
import CreateButton from '../components/newBooking/CreateButton';
import { Lucide } from '@react-native-vector-icons/lucide';
import { useNavigation } from '@react-navigation/native';
import useTabBarScroll from '../hooks/useTabBarScroll';

const MyTicketsScreen = () => {
  const isDarkMode = useSelector(state => state.themeSlice.isDarkMode);
  const insets = useSafeAreaInsets();
  const toastContext = useContext(ToastContext);
  const navigation = useNavigation();
  const { onScroll } = useTabBarScroll();

  const [isLoading, setIsLoading] = useState(false);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const handleSendComplaint = async () => {
    setIsLoading(true);
    try {
        const payload = {
            subject: subject.trim(),
            message: message.trim(),
        };
        const response = await sendComplaint(payload);
        toastContext.showToast(response?.message, 'short', 'success');
        setSubject('');
        setMessage('');
    } catch (error) {
        let err_msg = Error(error);
        toastContext.showToast(err_msg, 'short', 'error');
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['left', 'right']}>
      <StatusBar
        translucent={true}
        backgroundColor="transparent"
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
      />
      <View style={[ 
        styles.main_container, 
        { backgroundColor: isDarkMode ? Colors.dark_bg_color : '#F8F8F8' }
      ]}>
        <View style={styles.header_container}>
          <Text style={[ 
            styles.header_title, 
            { color: isDarkMode ? Colors.white : Colors.font_gray } 
          ]}>
            Support
          </Text>
        </View>

        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          onScroll={onScroll}
          scrollEventThrottle={16}
        >
          <View style={[ styles.card, { backgroundColor: isDarkMode ? Colors.dark_container : Colors.white } ]}>
            <View style={styles.cardHeader}>
              <MaterialIcons 
                name="attach-email" 
                size={24} 
                color={Colors.primary} 
              />
              <Text style={[
                styles.cardHeaderText,
                { color: isDarkMode ? Colors.white : Colors.label_light }
              ]}>
                Raise a complaint
              </Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={[ styles.label, { color: isDarkMode ? Colors.white : '#6E6E6E' } ]}>
                Title
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: isDarkMode ? Colors.size_bg_dark : '#F8F9FA',
                    color: isDarkMode ? Colors.white : Colors.font_gray,
                    // borderColor: isDarkMode ? Colors.input_border_dark : '#E0E0E0'
                  }
                ]}
                value={subject}
                onChangeText={setSubject}
                placeholder="Enter complaint title"
                placeholderTextColor={isDarkMode ? Colors.font_gray : '#C8C8C8'}
              />
            </View>

            {/* Message Input */}
            <View style={styles.inputGroup}>
              <Text style={[ styles.label, { color: isDarkMode ? Colors.white : '#6E6E6E' } ]}>
                Message
              </Text>
              <TextInput
                style={[
                  styles.input,
                  styles.textArea,
                  {
                    backgroundColor: isDarkMode ? Colors.size_bg_dark : '#F8F9FA',
                    color: isDarkMode ? Colors.white : Colors.font_gray,
                    // borderColor: isDarkMode ? Colors.input_border_dark : '#E0E0E0'
                  }
                ]}
                value={message}
                onChangeText={setMessage}
                placeholder="Enter your message"
                placeholderTextColor={isDarkMode ? Colors.font_gray : '#C8C8C8'}
                multiline
                numberOfLines={6}
                textAlignVertical="top"
              />
            </View>

            {/* Send Button */}
            <TouchableOpacity
              style={[ styles.sendButton, 
                { backgroundColor: Colors.primary }, 
                (!subject.trim() || !message.trim()) && styles.sendButtonDisabled 
              ]}
              onPress={handleSendComplaint}
              disabled={!subject.trim() || !message.trim()}
              activeOpacity={0.8}
            >
              <Text style={styles.sendButtonText}>Send</Text>
            </TouchableOpacity>

            <Text style={[
              styles.noteText,
              { color: isDarkMode ? Colors.dark_text_secondary : '#959595' }
            ]}>
              Note: This email is being sent to the helpdesk{'\n'}regarding your complaint. A copy will also be sent to{'\n'}your inbox.
            </Text>
          </View>
        </ScrollView>

        <CreateButton
            onPress={() => navigation.navigate('NewBooking')}
            icon={<Lucide name="calendar-plus" size={28} color={Colors.white} />}
            bottom={130 + insets.bottom}
            right={40}
        />
        <AbaciLoader visible={isLoading} />
      </View>
    </SafeAreaView>
  );
};

export default MyTicketsScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  main_container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 26,
    paddingBottom: 20,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 26,
    marginTop: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 1,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  cardHeaderText: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: Colors.font_gray,
    marginLeft: 12,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: Colors.font_gray,
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: Colors.font_gray,
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  sendButton: {
    backgroundColor: '#66C9A7',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  sendButtonDisabled: {
    backgroundColor: '#CCCCCC',
    opacity: 0.7,
  },
  sendButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: Colors.white,
  },
  noteText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#959595',
    lineHeight: 15,
    textAlign: 'left',
    paddingHorizontal: 8,
    marginBottom: 10,
    marginTop: 10,
  },
  fab: {
    position: 'absolute',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
});
