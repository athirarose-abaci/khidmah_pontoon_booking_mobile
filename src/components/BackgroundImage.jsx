import React from 'react';
import { View, Image, StyleSheet } from 'react-native';

const BackgroundImage = ({ children }) => (
  <View style={styles.container}>
    <Image
            source={require('../assets/images/login_bg.png')}
            style={styles.backgroundImage}

      resizeMode="cover"
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