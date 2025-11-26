import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import { Colors } from '../../constants/customStyles';

const BerthSelector = ({ berthsData, selectedBerth, onBerthChange, isDarkMode, containerStyle, dropdownStyle }) => {
  return (
    <View style={[styles.berthDropdownContainer, containerStyle]}>
      <Dropdown
        style={[styles.berthDropdown, {
          backgroundColor: isDarkMode ? Colors.dark_container : '#F5F5F5',
          borderColor: isDarkMode ? Colors.dark_separator : 'transparent',
        }, dropdownStyle]}
        placeholderStyle={[styles.berthPlaceholderStyle, {
          color: isDarkMode ? Colors.font_gray : '#4C4C4C'
        }]}
        selectedTextStyle={[styles.berthSelectedTextStyle, {
          color: isDarkMode ? Colors.white : '#4C4C4C',
          fontFamily: 'Inter-Regular',
        }]}
        iconStyle={styles.berthIconStyle}
        data={berthsData.map(berth => ({
          label: berth?.name || `Berth ${berth?.id}`,
          value: berth?.id,
        }))}
        maxHeight={300}
        labelField="label"
        valueField="value"
        placeholder="Select berth"
        value={selectedBerth}
        onChange={onBerthChange}
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

export default BerthSelector;

const styles = StyleSheet.create({
  berthDropdownContainer: {
    paddingHorizontal: 0,
    marginTop: 8,
    paddingBottom: 0,
    marginLeft: 0,
    alignItems: 'flex-start',
    flex: 1,
    borderRadius: 6,
    overflow: 'visible',
  },
  berthDropdown: {
    backgroundColor: '#F5F5F5',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: 'transparent',
    minHeight: 36,
    height: 36,
    width: 140,
    minWidth: 140,
    maxWidth: 140,
  },
  berthPlaceholderStyle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#4C4C4C',
  },
  berthSelectedTextStyle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#4C4C4C',
  },
  berthIconStyle: {
    width: 20,
    height: 20,
  },
});

