import React from 'react';
import { Modal, View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { Colors } from '../../constants/customStyles';
import moment from 'moment';

const DatePickerModal = ({
  visible,
  onClose,
  onDateSelect,
  selectedDate,
  title = "Select Date",
  minimumDate,
  maximumDate,
}) => {
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
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>{title}</Text>
          <Calendar
            onDayPress={handleDateSelect}
            markedDates={getMarkedDates()}
            minDate={minimumDate}
            maxDate={maximumDate}
            theme={{
              selectedDayBackgroundColor: Colors.primary,
              selectedDayTextColor: '#ffffff',
              todayTextColor: Colors.primary,
              dayTextColor: '#2d4150',
              textDisabledColor: '#d9e1e8',
              dotColor: Colors.primary,
              selectedDotColor: '#ffffff',
              arrowColor: Colors.primary,
              monthTextColor: '#2d4150',
              indicatorColor: Colors.primary,
              textDayFontFamily: 'Inter-Regular',
              textMonthFontFamily: 'Inter-Medium',
              textDayHeaderFontFamily: 'Inter-Medium',
              textDayFontWeight: '300',
              textMonthFontWeight: 'bold',
              textDayHeaderFontWeight: '300',
              textDayFontSize: 16,
              textMonthFontSize: 16,
              textDayHeaderFontSize: 13
            }}
          />
          <TouchableOpacity
            style={[styles.closeButton, {backgroundColor: Colors.primary}]}
            onPress={onClose}
          >
            <Text style={{ color: Colors.white, fontWeight: '600' }}>Close</Text>
          </TouchableOpacity>
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
  modalTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Medium',
    color: '#333',
    marginBottom: 15,
  },
  closeButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 10,
  },
});

export default DatePickerModal;
