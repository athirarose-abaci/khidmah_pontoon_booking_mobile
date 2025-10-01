import { StyleSheet, Text, TouchableOpacity, View, ScrollView } from 'react-native';
import React from 'react';
import { Colors } from '../../constants/customStyles';

const SubTabBar = ({ tabs, activeTab, onTabChange }) => {
  return (
    <View style={styles.container}>
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
                isActive && { backgroundColor: Colors.primary },
                idx !== tabs.length - 1 && { marginRight: 10 },
              ]}
            >
              <Text
                style={[
                  styles.tab_text,
                  isActive && { color: Colors.white, fontFamily: 'Inter-SemiBold' },
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
    backgroundColor: 'transparent',
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
    backgroundColor: '#E7E7E7',
  },
  tab_text: {
    fontSize: 12,
    color: '#6F6F6F',
    fontFamily: 'Inter-Regular',
  },
});