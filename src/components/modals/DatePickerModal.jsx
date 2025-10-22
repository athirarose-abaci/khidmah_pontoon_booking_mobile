import React from 'react';
import { Modal, View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { Colors } from '../../constants/customStyles';
import moment from 'moment';
import { useSelector } from 'react-redux';
import { Lucide } from '@react-native-vector-icons/lucide';

const DatePickerModal = ({
  visible,
  onClose,
  onDateSelect,
  selectedDate,
  title = "Select Date",
  minimumDate,
  maximumDate,
}) => {
  const isDarkMode = useSelector(state => state.themeSlice?.isDarkMode);
  const handleDateSelect = (day) => {
    const formattedDate = moment(day.dateString).format('DD/MM/YYYY');
    onDateSelect(formattedDate);
    onClose();
  };

  const getMarkedDates = () => {
    if (!selectedDate) return {};
    
    const calendarDate = moment(selectedDate, 'DD/MM/YYYY').format('YYYY-MM-DD');
    return {
      [calendarDate]: {
        selected: true,
        selectedColor: Colors.primary,
      }
    };
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={[styles.modalOverlay, { backgroundColor: isDarkMode ? 'rgba(0, 0, 0, 0.6)' : 'rgba(0, 0, 0, 0.5)' }]}>
        <View style={[styles.modalContent, { backgroundColor: isDarkMode ? Colors.dark_container : 'white' }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: isDarkMode ? Colors.white : Colors.black }]}>{title}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Lucide name="x" size={20} color={Colors.white} />
            </TouchableOpacity>
          </View>
          <Calendar
            key={isDarkMode ? 'dark' : 'light'}
            onDayPress={handleDateSelect}
            markedDates={getMarkedDates()}
            minDate={minimumDate}
            maxDate={maximumDate}
            style={{
              backgroundColor: isDarkMode ? Colors.dark_container : '#fff',
            }}
            theme={{
              backgroundColor: isDarkMode ? Colors.dark_container : '#fff',
              calendarBackground: isDarkMode ? Colors.dark_container : '#fff',
              textSectionTitleColor: isDarkMode ? Colors.white : '#000',
              selectedDayBackgroundColor: Colors.primary,
              selectedDayTextColor: '#ffffff',
              todayTextColor: Colors.primary,
              dayTextColor: isDarkMode ? Colors.white : '#2d4150',
              textDisabledColor: isDarkMode ? Colors.font_gray : '#d9e1e8',
              dotColor: Colors.primary,
              selectedDotColor: '#ffffff',
              arrowColor: isDarkMode ? Colors.white : Colors.primary,
              monthTextColor: isDarkMode ? Colors.white : '#2d4150',
              indicatorColor: Colors.primary,
              textDayHeaderColor: isDarkMode ? Colors.white : '#000'
            }}
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 20,
    paddingHorizontal: 15,
    alignItems: 'center',
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    marginBottom: 15,
    position: 'relative',
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Medium',
    color: '#333',
  },
  closeButton: {
    borderRadius: 6,
    backgroundColor: Colors.red,
    alignItems: 'center',
    justifyContent: 'center',
    width: 20,
    height: 20,
    position: 'absolute',
    right: 0,
  },
});

export default DatePickerModal;
