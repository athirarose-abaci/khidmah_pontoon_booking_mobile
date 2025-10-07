import React, { useRef } from 'react';
import { StyleSheet } from 'react-native';
import LottieView from 'lottie-react-native';

const SuccessLottie = ({ style, autoPlay = true, loop = true, ...rest }) => {
  const animation = useRef(null);

  return (
    <LottieView
      ref={animation}
      source={require('../../assets/lottie/check.json')}
      style={[styles.default, style]}
      autoPlay={autoPlay}
      loop={loop}
      {...rest}
    />
  );
};

const styles = StyleSheet.create({
  default: {
    width: '65%',
    height: '65%',
    alignSelf: 'center',
  },
});

export default SuccessLottie;
