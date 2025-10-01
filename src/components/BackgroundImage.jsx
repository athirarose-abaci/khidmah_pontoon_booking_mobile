import React from 'react';
import { View, Image, StyleSheet } from 'react-native';

const BackgroundImage = ({ children, source, resizeMode = 'cover' }) => (
  <View style={styles.container}>
    <Image
      source={source}
      style={styles.backgroundImage}
      resizeMode={resizeMode}
    />
    {children}
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
});

export default BackgroundImage;