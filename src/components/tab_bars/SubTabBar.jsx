import { StyleSheet, Text, TouchableOpacity, View, ScrollView } from 'react-native';
import React from 'react';
import { Colors } from '../../constants/customStyles';
import { useSelector } from 'react-redux';

const SubTabBar = ({ tabs, activeTab, onTabChange }) => {

  const isDarkMode = useSelector(state => state.themeSlice.isDarkMode);

  return (
    <View style={[styles.container, { backgroundColor: isDarkMode ? Colors.dark_bg_color : 'transparent' }]}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabs_container}
        bounces={false}
      >
        {tabs.map((label, idx) => {
          const isActive = activeTab === label;
          return (
            <TouchableOpacity
              key={label}
              activeOpacity={0.8}
              onPress={() => onTabChange(label)}
              style={[
                styles.tab_item,
                { 
                  backgroundColor: isActive 
                    ? Colors.primary 
                    : isDarkMode 
                      ? Colors.dark_container 
                      : '#E7E7E7'
                },
                idx !== tabs.length - 1 && { marginRight: 10 },
              ]}
            >
              <Text
                style={[
                  styles.tab_text,
                  { 
                    color: isActive 
                      ? Colors.white 
                      : isDarkMode 
                        ? Colors.white 
                        : '#6F6F6F'
                  },
                  isActive && { fontFamily: 'Inter-SemiBold' },
                ]}
              >
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

export default SubTabBar;

const styles = StyleSheet.create({
  container: {
    marginTop: 5,
    marginBottom: 8,
    paddingHorizontal: 28,
  },
  tabs_container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tab_item: {
    paddingHorizontal: 18.5,
    height: 28,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tab_text: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
  },
});