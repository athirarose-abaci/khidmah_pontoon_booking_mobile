import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { Lucide } from '@react-native-vector-icons/lucide';
import { Colors } from '../../constants/customStyles';

const BookingDetailsTab = ({ 
  arrivalDate, 
  setArrivalDate, 
  arrivalTime, 
  setArrivalTime, 
  hours, 
  setHours, 
  minutes, 
  setMinutes, 
  departureDate, 
  setDepartureDate, 
  departureTime, 
  setDepartureTime 
}) => {
  return (
    <>
      {/* Arrival Date/Time Row */}
      <View style={styles.formInputRow}>
        <View style={styles.formInputContainer}>
          <View style={styles.formLabelContainer}>
            <Text style={styles.inputLabel}>Arrival Date</Text>
            <Lucide name="asterisk" size={12} color="black" />
          </View>
          <TextInput
            style={styles.textInput}
            value={arrivalDate}
            onChangeText={setArrivalDate}
            placeholder="Select date"
            placeholderTextColor="#C8C8C8"
          />
        </View>
        <View style={styles.formInputContainer}>
          <View style={styles.formLabelContainer}>
            <Text style={styles.inputLabel}>Arrival Time</Text>
            <Lucide name="asterisk" size={12} color="black" />
          </View>
          <TextInput
            style={styles.textInput}
            value={arrivalTime}
            onChangeText={setArrivalTime}
            placeholder="Select time"
            placeholderTextColor="#C8C8C8"
          />
        </View>
      </View>

      {/* Duration Row */}
      <View style={styles.bookingDurationContainer}>
        <Text style={styles.durationLabel}>Duration (Hours)</Text>
        <View style={styles.bookingDurationInputs}>
          <TextInput
            style={styles.bookingDurationInput}
            value={hours}
            onChangeText={setHours}
            placeholder="Hours"
            placeholderTextColor="#C8C8C8"
            keyboardType="numeric"
          />
          <Text style={styles.bookingDurationSeparator}>:</Text>
          <TextInput
            style={styles.bookingDurationInput}
            value={minutes}
            onChangeText={setMinutes}
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
            value={departureDate}
            onChangeText={setDepartureDate}
            placeholder="Select date"
            placeholderTextColor="#C8C8C8"
          />
        </View>
        <View style={styles.formInputContainer}>
          <View style={styles.formLabelContainer}>
            <Text style={styles.inputLabel}>Departure time</Text>
            <Lucide name="asterisk" size={12} color="black" />
          </View>
          <TextInput
            style={styles.textInput}
            value={departureTime}
            onChangeText={setDepartureTime}
            placeholder="Select time"
            placeholderTextColor="#C8C8C8"
          />
        </View>
      </View>
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
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#F8F9FA',
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
});

export default BookingDetailsTab;
