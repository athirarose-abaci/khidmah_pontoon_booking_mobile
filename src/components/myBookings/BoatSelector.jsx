import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import { Colors } from '../../constants/customStyles';

const BoatSelector = ({ boatsData, selectedBoat, onBoatChange, isDarkMode, containerStyle }) => {
  return (
    <View style={[styles.boatDropdownContainer, containerStyle]}>
      <Dropdown
        style={[styles.boatDropdown, {
          backgroundColor: isDarkMode ? Colors.dark_container : '#F5F5F5',
          borderColor: isDarkMode ? Colors.dark_separator : 'transparent',
        }]}
        placeholderStyle={[styles.boatPlaceholderStyle, {
          color: isDarkMode ? Colors.font_gray : '#4C4C4C'
        }]}
        selectedTextStyle={[styles.boatSelectedTextStyle, {
          color: isDarkMode ? Colors.white : '#4C4C4C',
          fontFamily: 'Inter-Regular',
        }]}
        iconStyle={styles.boatIconStyle}
        data={boatsData.map(boat => ({
          label: boat?.name || `Boat ${boat?.id}`,
          value: boat?.id,
        }))}
        maxHeight={300}
        labelField="label"
        valueField="value"
        placeholder="Select boat"
        value={selectedBoat}
        onChange={onBoatChange}
        renderRightIcon={() => (
          <Ionicons 
            name="chevron-down" 
            size={20} 
            color={isDarkMode ? Colors.white : '#4C4C4C'} 
          />
        )}
        itemContainerStyle={{
          backgroundColor: isDarkMode ? Colors.dark_container : Colors.white
        }}
        itemTextStyle={{
          color: isDarkMode ? Colors.white : '#4C4C4C'
        }}
        activeColor={isDarkMode ? Colors.dark_separator : '#F0F0F0'}
        containerStyle={{
          backgroundColor: isDarkMode ? Colors.dark_container : Colors.white,
          borderRadius: 6,
          borderWidth: 1,
          borderColor: 'transparent',
        }}
      />
    </View>
  );
};

export default BoatSelector;

const styles = StyleSheet.create({
  boatDropdownContainer: {
    paddingHorizontal: 0,
    marginTop: 8,
    paddingBottom: 0,
    marginLeft: 0,
    alignItems: 'flex-start',
    flex: 1,
    borderRadius: 6,
    overflow: 'visible',
    minWidth: 0, // Allow flex to shrink properly
  },
  boatDropdown: {
    backgroundColor: '#F5F5F5',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: 'transparent',
    minHeight: 36,
    height: 36,
    width: '100%',
    maxWidth: 220,
    minWidth: 150, // Reduced from 180 to allow more flexibility
    flexShrink: 1, // Allow dropdown to shrink if needed
  },
  boatPlaceholderStyle: {
    fontSize: 17,
    fontFamily: 'Inter-Regular',
    color: '#4C4C4C',
  },
  boatSelectedTextStyle: {
    fontSize: 17,
    fontFamily: 'Inter-Regular',
    color: '#4C4C4C',
  },
  boatIconStyle: {
    width: 20,
    height: 20,
  },
});

