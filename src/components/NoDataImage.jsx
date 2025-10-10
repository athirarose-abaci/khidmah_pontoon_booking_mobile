import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image } from 'react-native';
import { Colors } from '../constants/customStyles';

const NoDataImage = ({ 
  imageSource, 
  title, 
  subtitle, 
  onRefresh, 
  isDarkMode = false 
}) => {
  return (
    <View style={styles.container}>
      <Image 
        source={imageSource} 
        style={styles.image}
        resizeMode="contain"
      />
      
      <Text style={[
        styles.title,
        { color: isDarkMode ? Colors.white : '#4C4C4C' }
      ]}>
        {title}
      </Text>
      
      <Text style={[
        styles.subtitle,
        { color: isDarkMode ? Colors.white : Colors.font_gray }
      ]}>
        {subtitle}
      </Text>
      
      <TouchableOpacity
        style={styles.refreshButton}
        onPress={onRefresh}
        activeOpacity={0.7}
      >
        <Text style={styles.refreshButtonText}>Refresh</Text>
      </TouchableOpacity>
    </View>
  );
};

export default NoDataImage;

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  image: {
    width: '50%',
    height: 160,
    marginBottom: 20,
  },
  title: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 1,
  },
  subtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  refreshButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 35,
    paddingVertical: 6,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  refreshButtonText: {
    color: Colors.white,
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
  },
});
