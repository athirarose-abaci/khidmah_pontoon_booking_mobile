import React, {useEffect, useRef} from 'react';
import LottieView from 'lottie-react-native';
import {StyleSheet, View, Text, TouchableOpacity} from 'react-native';
import {Colors} from '../../constants/customStyles';

const NoDataLottie = ({isDarkMode = false, refreshControl}) => {
  const animation = useRef();
  useEffect(() => {
    animation.current.play();
  }, []);
  return (
    <View style={styles.lottie_container}>
      <LottieView
        style={styles.lottie_animation}
        ref={animation}
        source={require('../../assets/lottie/no-data.json')}
      />
      <Text
        style={[
          styles.noDataText,
          {color: isDarkMode ? Colors.white : Colors.black},
        ]}>
        No data found
      </Text>
      <TouchableOpacity
        style={{
          width: 100,
          height: 30,
          backgroundColor: Colors.primary,
          marginTop: 10,
          borderRadius: 5,
          alignItems: 'center',
          justifyContent: 'center',
        }}
        onPress={refreshControl}>
        <Text style={{color: Colors.white}}>Refresh</Text>
      </TouchableOpacity>
    </View>
  );
};

export default NoDataLottie;

const styles = StyleSheet.create({
  lottie_container: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  lottie_animation: {
    width: 60,
    height: 60,
  },
  noDataText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 10,
  },
});
