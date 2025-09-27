import {View, Modal, StyleSheet, StatusBar} from 'react-native';
import React, {useEffect, useRef} from 'react';
import LottieView from 'lottie-react-native';
import { useSelector } from 'react-redux';

const AbaciLoader = props => {
  const animation = useRef();
  const isDarkMode = useSelector(state => state.themeSlice.isDarkMode);

  useEffect(() => {
    // animation?.current?.play();
    if (props.visible) {
      animation?.current?.play();
    } else {
      animation?.current?.reset();
    }
  }, [props.visible]);

  return (
    // <Modal transparent={true} visible={props.visible}>
    //   <StatusBar 
    //     backgroundColor={Colors.black} 
    //     barStyle={"light-content"} 
    //   />
    //   <BlurView
    //     style={{position: 'absolute', top: 0, left: 0, right: 0, bottom: 0}}
    //     blurType="light"
    //     blurAmount={10}
    //     reducedTransparencyFallbackColor={Colors.white}
    //   />
    //   <View style={styles.lottie_container}>
    //     <LottieView
    //       style={{flex: 1}}
    //       source={Loader}
    //       ref={animation}
    //       autoPlay={props.visible}
    //       loop={props.visible}
    //     />
    //   </View>
    // </Modal>
    <Modal
      transparent={true}
      visible={props.visible}
      animationType="fade"  
      statusBarTranslucent={true}
    >
      <View
        style={[
          styles.overlay,
          {
            backgroundColor: isDarkMode
              ? 'rgba(0,0,0,0.6)'
              : 'rgba(255,255,255,0.6)',
          },
        ]}
      >        
        <LottieView
          style={styles.lottie}
          source={require('../assets/lottie/loader.json')}
          ref={animation}
          autoPlay={props.visible}
          loop={props.visible}
        />
      </View>
    </Modal>

  );
};

export default AbaciLoader;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)', 
    justifyContent: 'center',
    alignItems: 'center',
  },
  lottie: {
    width: 200,
    height: 200,
  },
});
