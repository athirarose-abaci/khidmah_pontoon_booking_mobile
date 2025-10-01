import React from 'react';
import {TouchableOpacity, StyleSheet} from 'react-native';
import {Colors} from '../constants/customStyles';

const CreateButton = ({
  onPress,
  icon,
  iconSize = 24,
  iconColor = Colors.white,
  backgroundColor = Colors.primary,
  size = 56,
  bottom = 20,
  right = 20,
  style,
  ...props
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.fab,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor,
          bottom,
          right,
        },
        style,
      ]}
      onPress={onPress}
      {...props}>
      {icon}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
});

export default CreateButton;
