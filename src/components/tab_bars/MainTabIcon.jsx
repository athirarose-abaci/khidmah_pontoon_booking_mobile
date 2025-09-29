import React from 'react';
import { View, Image } from 'react-native';
import { Colors } from '../../constants/customStyles';

const MainTabIcon = ({ focused, source, size = 35 }) => (
  <View style={{
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  }}>
    <Image
      source={source}
      tintColor={focused ? Colors.primary : Colors.tab_inactive}
      style={{ width: size, height: size }}
    />
    {focused && <View style={{
      position: 'absolute',
      bottom: -16,
      width: 23,
      height: 3.5,
      backgroundColor: Colors.primary,
      borderRadius: 2,
    }} />}
  </View>
);

export default MainTabIcon;
