import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { Lucide } from '@react-native-vector-icons/lucide';
import { Colors } from '../../constants/customStyles';

const PontoonDetailsTab = ({ 
  pontoonName, 
  setPontoonName, 
  berthName, 
  setBerthName 
}) => {
  return (
    <>
      {/* Pontoon Name */}
      <View style={styles.formInputContainer}>
        <View style={styles.formLabelContainer}>
          <Text style={styles.inputLabel}>Pontoon Name</Text>
          <Lucide name="asterisk" size={12} color="black" />
        </View>
        <TextInput
          style={styles.textInput}
          value={pontoonName}
          onChangeText={setPontoonName}
          placeholder="Enter pontoon name"
          placeholderTextColor="#C8C8C8"
        />
      </View>

      {/* Berth Name */}
      <View style={styles.formInputContainer}>
        <View style={styles.formLabelContainer}>
          <Text style={styles.inputLabel}>Berth Name</Text>
          <Lucide name="asterisk" size={12} color="black" />
        </View>
        <TextInput
          style={styles.textInput}
          value={berthName}
          onChangeText={setBerthName}
          placeholder="Enter berth name"
          placeholderTextColor="#C8C8C8"
        />
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  formInputContainer: {
    marginBottom: 20,
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
});

export default PontoonDetailsTab;
