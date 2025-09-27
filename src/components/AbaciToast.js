import React, {useContext} from 'react';
import { Text, View } from 'react-native';
import { ToastContext } from '../context/ToastContext';

export default function AbaciToast() {
  const toastContext = useContext(ToastContext);
  if (toastContext.toastVisibility) {
    return (
      <View
        // entering={BounceInUp}
        // exiting={BounceOutUp}
        style={{
          position: 'absolute',
          top: 50,
          width: '80%',
          minHeight: 50,
          backgroundColor: toastContext.toastType,
          alignSelf: 'center',
          borderRadius: 5,
          justifyContent: 'center',
          padding: 10,
          alignItems: 'center',
        }}>
        <Text
          style={{color: 'white', fontFamily: 'Poppins-Medium', fontSize: 15}}>
          {toastContext.toastMessage}
        </Text>
      </View>
    );
  } else {
    return null;
  }
}
