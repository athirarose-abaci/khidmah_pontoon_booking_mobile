import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { Lucide } from '@react-native-vector-icons/lucide';
import { Colors } from '../../constants/customStyles';
import DatePickerModal from '../modals/DatePickerModal';
import CustomTimePickerModal from '../modals/CustomTimePickerModal';
import moment from 'moment';

const BookingDetailsTab = ({ 
  bookingDetails,
  onBookingDetailsChange,
  berthsData = [],
  pontoonName = '',
  berthName = ''
}) => {
  const [showArrivalDatePicker, setShowArrivalDatePicker] = useState(false);
  const [showArrivalTimePicker, setShowArrivalTimePicker] = useState(false);
  
  useEffect(() => {
    if (berthsData && berthsData.length > 0 && berthName) {
      
      const selectedBerth = berthsData.find(berth => berth.name === berthName);
      if (selectedBerth && selectedBerth.default_duration) {
        
        const durationParts = selectedBerth.default_duration.split(':');
        if (durationParts.length >= 2) {
          const hours = durationParts[0];
          const minutes = durationParts[1];
          
          
          onBookingDetailsChange('hours', hours);
          onBookingDetailsChange('minutes', minutes);
        }
      }
    }
  }, [berthName]); 

  useEffect(() => {
    const { arrivalDate, arrivalTime, hours, minutes } = bookingDetails || {};
    if (arrivalDate && arrivalTime && hours && minutes) {
      try {
        const arrivalDateObj = moment(arrivalDate, 'DD/MM/YYYY');
        
        const [arrivalHour, arrivalMinute] = arrivalTime.split(':').map(Number);
        
        arrivalDateObj.hour(arrivalHour).minute(arrivalMinute);
        
        const durationHours = parseInt(hours) || 0;
        const durationMinutes = parseInt(minutes) || 0;
        
        const departureDateObj = arrivalDateObj.clone().add(durationHours, 'hours').add(durationMinutes, 'minutes');
        
        const departureDate = departureDateObj.format('DD/MM/YYYY');
        const departureTime = departureDateObj.format('HH:mm');
        
        const currentDepartureDate = bookingDetails?.departureDate || '';
        const currentDepartureTime = bookingDetails?.departureTime || '';
        
        if (departureDate !== currentDepartureDate || departureTime !== currentDepartureTime) {
          onBookingDetailsChange('departureDate', departureDate);
          onBookingDetailsChange('departureTime', departureTime);
        }
      } catch (error) {
        console.log('Error calculating departure date:', error);
      }
    }
  }, [bookingDetails?.arrivalDate, bookingDetails?.arrivalTime, bookingDetails?.hours, bookingDetails?.minutes]);

  // Time picker handlers
  const handleArrivalTimeConfirm = (hours, minutes) => {
    const timeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    onBookingDetailsChange('arrivalTime', timeString);
    setShowArrivalTimePicker(false);
  };


  const generateTimeOptions = () => {
    const hours = [];
    const minutes = [];
    
    for (let i = 0; i < 24; i++) {
      hours.push(i);
    }
    
    for (let i = 0; i < 60; i++) {
      minutes.push(i);
    }
    
    return { hours, minutes };
  };

  const { hours: hourOptions, minutes: minuteOptions } = generateTimeOptions();
   
  return (
    <>
      {/* Arrival Date/Time Row */}
      <View style={styles.formInputRow}>
        <View style={styles.formInputContainer}>
          <View style={styles.formLabelContainer}>
            <Text style={styles.inputLabel}>Arrival Date</Text>
            <Lucide name="asterisk" size={12} color="black" />
          </View>
          <View style={styles.inputWithIcon}>
            <TextInput
              style={[styles.textInput, styles.textInputWithIcon]}
              value={bookingDetails?.arrivalDate || ''}
              onChangeText={(value) => onBookingDetailsChange('arrivalDate', value)}
              placeholder="Select date"
              placeholderTextColor="#C8C8C8"
              editable={false}
            />
            <TouchableOpacity 
              style={styles.calendarIcon}
              onPress={() => setShowArrivalDatePicker(true)}
            >
              <Lucide name="calendar" size={20} color={Colors.primary}/>
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.formInputContainer}>
          <View style={styles.formLabelContainer}>
            <Text style={styles.inputLabel}>Arrival Time</Text>
            <Lucide name="asterisk" size={12} color="black" />
          </View>
          <View style={styles.inputWithIcon}>
            <TextInput
              style={[styles.textInput, styles.textInputWithIcon]}
              value={bookingDetails?.arrivalTime || ''}
              placeholder="Select time"
              placeholderTextColor="#C8C8C8"
              editable={false}
            />
            <TouchableOpacity 
              style={styles.calendarIcon}
              onPress={() => setShowArrivalTimePicker(true)}
            >
              <Lucide name="clock" size={20} color={Colors.primary}/>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Duration Row */}
      <View style={styles.bookingDurationContainer}>
        <Text style={styles.durationLabel}>Duration (Hours)</Text>
        <View style={styles.bookingDurationInputs}>
          <TextInput
            style={styles.bookingDurationInput}
            value={bookingDetails?.hours || ''}
            onChangeText={(value) => onBookingDetailsChange('hours', value)}
            placeholder="Hours"
            placeholderTextColor="#C8C8C8"
            keyboardType="numeric"
          />
          <Text style={styles.bookingDurationSeparator}>:</Text>
          <TextInput
            style={styles.bookingDurationInput}
            value={bookingDetails?.minutes || ''}
            onChangeText={(value) => onBookingDetailsChange('minutes', value)}
            placeholder="Minutes"
            placeholderTextColor="#C8C8C8"
            keyboardType="numeric"
          />
        </View>
      </View>

      {/* Departure Date/Time Row */}
      <View style={styles.formInputRow}>
        <View style={styles.formInputContainer}>
          <View style={styles.formLabelContainer}>
            <Text style={styles.inputLabel}>Departure Date</Text>
            <Lucide name="asterisk" size={12} color="black" />
          </View>
          <TextInput
            style={styles.textInput}
            value={bookingDetails?.departureDate || ''}
            placeholder="Auto-calculated"
            placeholderTextColor="#C8C8C8"
            editable={false}
          />
        </View>
        <View style={styles.formInputContainer}>
          <View style={styles.formLabelContainer}>
            <Text style={styles.inputLabel}>Departure time</Text>
            <Lucide name="asterisk" size={12} color="black" />
          </View>
          <TextInput
            style={styles.textInput}
            value={bookingDetails?.departureTime || ''}
            placeholder="Auto-calculated"
            placeholderTextColor="#C8C8C8"
            editable={false}
          />
        </View>
      </View>

      {/* Date Picker Modals */}
      <DatePickerModal
        visible={showArrivalDatePicker}
        onClose={() => setShowArrivalDatePicker(false)}
        onDateSelect={(value) => onBookingDetailsChange('arrivalDate', value)}
        selectedDate={bookingDetails?.arrivalDate || ''}
        title="Select Arrival Date"
        minimumDate={new Date().toISOString().split('T')[0]} 
      />


      {/* Custom Time Picker Modals */}
      <CustomTimePickerModal
        visible={showArrivalTimePicker}
        onClose={() => setShowArrivalTimePicker(false)}
        onConfirm={handleArrivalTimeConfirm}
        currentTime={bookingDetails?.arrivalTime || ''}
        title="Select Arrival Time"
        hourOptions={hourOptions}
        minuteOptions={minuteOptions}
      />


    </>
  );
};

const styles = StyleSheet.create({
  formInputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  formInputContainer: {
    flex: 1,
    marginHorizontal: 5,
  },
  formLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  inputLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#333',
    marginRight: 4,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: Colors.sub_heading_font,
  },
  bookingDurationContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  durationLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#333',
    marginBottom: 12,
  },
  bookingDurationInputs: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bookingDurationInput: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#333',
    width: 80,
    textAlign: 'center',
  },
  bookingDurationSeparator: {
    fontSize: 18,
    fontFamily: 'Inter-Medium',
    color: '#333',
    marginHorizontal: 8,
  },
  inputWithIcon: {
    position: 'relative',
  },
  textInputWithIcon: {
    paddingRight: 50,
  },
  calendarIcon: {
    position: 'absolute',
    right: 12,
    top: '50%',
    transform: [{ translateY: -10 }],
    // padding: 4,
  },
});

export default BookingDetailsTab;
