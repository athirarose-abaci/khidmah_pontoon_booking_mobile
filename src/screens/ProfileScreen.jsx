import { Image, StatusBar, StyleSheet, Text, View, TouchableOpacity, ScrollView, Switch } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Lucide } from '@react-native-vector-icons/lucide';
import { MaterialDesignIcons } from '@react-native-vector-icons/material-design-icons';
import React, { useContext, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../constants/customStyles';
import BackgroundImage from '../components/BackgroundImage';
import { boatsData } from '../constants/dummyData';
import useTabBarScroll from '../hooks/useTabBarScroll';
import { AntDesign } from '@react-native-vector-icons/ant-design';
import EditProfileModal from '../components/modals/EditProfileModal';
import AbaciLoader from '../components/AbaciLoader';
import { logout } from '../apis/auth';
import { setAuthState } from '../../store/authSlice';
import { clearCookies } from '../helpers/clearCookieHelper';
import { removeData } from '../helpers/asyncStorageHelper';
import { ToastContext } from '../context/ToastContext';
import { useDispatch } from 'react-redux';
import ConfirmationModal from '../components/modals/ConfirmationModal';
import Error from '../helpers/Error';

const ProfileScreen = () => {
  const { onScroll, insets } = useTabBarScroll();

  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isLogoutConfirmVisible, setIsLogoutConfirmVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const toastContext = useContext(ToastContext);
  const dispatch = useDispatch();

  const handleLogout = async () => {
    setIsLogoutConfirmVisible(false);
    setIsLoading(true);
    try {
      await logout();
      dispatch(setAuthState({}));
      clearCookies();
      await removeData('data');
      setIsLoading(false);
    } catch (error) {
      let err_msg = Error(error);
      toastContext.showToast(err_msg, 'short', 'error');
    }finally{
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['left', 'right']}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="dark-content"
      />
      <View style={styles.main_container}>
        <BackgroundImage source={require('../assets/images/profile_bg.png')}>
          <View style={styles.header_container}>
            <Text style={styles.header_title}>My Profile</Text>
          </View>
          <View style={styles.image_container}>
            <View style={styles.circle_background}>
              <Image source={require('../assets/images/profile_image.png')} style={styles.image} />
            </View>
          </View>
          <View style={styles.info_container}>
            <View style={styles.title_row}>
              <Text style={styles.info_title}>Casey Blake</Text>
              <TouchableOpacity 
                style={styles.edit_icon_container}
                onPress={() => setIsEditModalVisible(true)}
              >
                <Image 
                  source={require('../assets/images/edit_pencil.png')} 
                  style={styles.edit_icon}
                />
              </TouchableOpacity>
            </View>
            <Text style={styles.info_subtitle_id}>Yatch Owner ID</Text>
            <Text style={styles.info_subtitle_email}>caseyblake007@gmail.com</Text>
          </View>
          <ScrollView 
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollable_content}
            onScroll={onScroll}
            scrollEventThrottle={1}
            nestedScrollEnabled={true}
            bounces={true}
            alwaysBounceVertical={false}
            removeClippedSubviews={false}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.boat_container}>
              <View style={styles.boat_title_row}>
                <Text style={styles.boat_title}>My Boats</Text>
                <Text style={styles.boat_count}>{boatsData.length}{' '}boats</Text>
              </View>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.boats_scroll}
                nestedScrollEnabled={true}
                scrollEventThrottle={1}
              >
                {boatsData.map((boat) => (
                  <View key={boat.id} style={styles.boat_card}>
                    <View style={styles.boat_image_container}>
                      <Image source={boat.image} style={styles.boat_image} />
                      <View style={[styles.status_badge, { backgroundColor: boat.status === 'ACTIVE' ? '#4CAF50' : '#FF5722' }]}>
                        <Text style={styles.status_text}>{boat.status}</Text>
                      </View>
                      <LinearGradient
                        colors={['rgba(0, 0, 0, 0.3)', '#144655']}
                        locations={[0, 1]}
                        style={styles.overlay_content}
                      >
                        <Text style={styles.boat_name}>{boat.name}</Text>
                        <Text style={styles.boat_id}>{boat.boatId}</Text>
                        <View style={styles.size_container}>
                          <Text style={styles.size_text}>Size: {boat.size}</Text>
                        </View>
                      </LinearGradient>
                    </View>
                  </View>
                ))}
              </ScrollView>
            </View>
            <View style={styles.support_container}>
              <View style={styles.support_card}>
                <View style={styles.support_icon}>
                  <Lucide name="headset" size={30} color={Colors.primary} />
                </View>
                <View style={styles.support_content}>
                  <Text style={styles.support_label}>Customer Support</Text>
                  <Text style={styles.support_number}>+971 50 123 4567</Text>
                </View>
                <TouchableOpacity style={styles.copy_icon}>
                  <MaterialDesignIcons name="content-copy" size={25} color="#373737" />
                </TouchableOpacity>
              </View>
            </View>
            <View style={styles.options_container}>
              <View style={styles.option_item}>
                <View style={styles.option_left}>
                  <Lucide name="moon" size={25} color={Colors.primary} />
                  <Text style={styles.option_text}>Dark Mode</Text>
                </View>
                <Switch
                  trackColor={{
                    false: 'rgba(71, 170, 157, 0.42)',
                    true: Colors.primary,
                  }}
                  thumbColor={Colors.primary}
                  ios_backgroundColor="#E4E4E4"
                />
              </View>
              
              <View style={styles.option_item}>
                <View style={styles.option_left}>
                  <Lucide name="lock" size={25} color={Colors.primary} />
                  <Text style={styles.option_text}>Change Password</Text>
                </View>
                <Lucide name="chevron-right" size={25} color='#B6C7D9' />
              </View>
              
              <TouchableOpacity style={styles.option_item} onPress={() => setIsLogoutConfirmVisible(true)}>
                <View style={styles.option_left}>
                  <AntDesign name="logout" size={25} color="#FF5722" />
                  <Text style={[styles.option_text, { color: '#FF5722' }]}>Logout</Text>
                </View>
                <Lucide name="chevron-right" size={25} color="#FF5722" />
              </TouchableOpacity>
            </View>
          </ScrollView>
        </BackgroundImage>
      </View>
      
      <EditProfileModal
        visible={isEditModalVisible}
        onClose={() => setIsEditModalVisible(false)}
        onSave={(data) => {
          console.log('Profile updated:', data);
          // Handle profile update logic here
        }}
      />
      <ConfirmationModal
        isVisible={isLogoutConfirmVisible}
        onRequestClose={() => setIsLogoutConfirmVisible(false)}
        onConfirm={handleLogout}
        title="Logout"
        message="Are you sure you want to logout?"
        confirmText="Logout"
        cancelText="Cancel"
      />
      <AbaciLoader visible={isLoading} />
    </SafeAreaView>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  main_container: {
    flex: 1,
    backgroundColor: Colors.bg_color,
  },
  header_container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 26,
    paddingVertical: 20,
    marginTop: 40,
  },
  header_title: {
    fontSize: 18,
    color: Colors.white,
    fontFamily: 'Inter-SemiBold',
  },
  image_container: {
    width: '100%',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    paddingTop: 10,
    paddingBottom: 8,
    paddingLeft: 26,
  },
  circle_background: {
    width: 125,
    height: 125,
    borderRadius: 65,
    backgroundColor: '#FFF09E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: 125,
    height: 125,
    borderRadius: 65,
  },
  info_container: {
    paddingHorizontal: 26,
    paddingBottom: 8,
  },
  title_row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  edit_icon_container: {
    padding: 4,
  },
  edit_icon: {
    width: 20,
    height: 20,
    tintColor: '#00263A',
    resizeMode: 'contain',
  },
  info_title: {
    fontSize: 18,
    color: '#00263A',
    fontFamily: 'Inter-SemiBold',
  },
  info_subtitle_id: {
    fontSize: 14,
    color: '#353535',
    fontFamily: 'Inter-Regular',
  },
  info_subtitle_email: {
    fontSize: 14,
    color: Colors.font_gray,
    fontFamily: 'Inter-Regular',
  },
  scrollable_content: {
    paddingBottom: 120,
  },
  boat_container: {
    paddingLeft: 26,
    marginTop: 8,
  },
  boat_title_row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  boat_title: {
    fontSize: 18,
    color: Colors.font_gray,
    fontFamily: 'Inter-SemiBold',
  },
  boat_count: {
    fontSize: 14,
    color: Colors.font_gray,
    fontFamily: 'Inter-Regular',
    paddingRight: 26,
  },
  boats_scroll: {
    paddingRight: 26,
  },
  boat_card: {
    width: 195,
    height: 230,
    backgroundColor: 'white',
    borderRadius: 15,
    marginRight: 10,
    paddingHorizontal: 9,
    paddingVertical: 9,
  },
  boat_image_container: {
    flex: 1,
    borderRadius: 10,
    overflow: 'hidden',
    position: 'relative',
  },
  boat_image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  overlay_content: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 12,
  },
  status_badge: {
    position: 'absolute',
    top: 10,
    right: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  status_text: {
    color: 'white',
    fontSize: 10,
    fontFamily: 'Inter-SemiBold',
  },
  boat_name: {
    fontSize: 16,
    color: 'white',
    fontFamily: 'Inter-Bold',
    marginBottom: 4,
  },
  boat_id: {
    fontSize: 12,
    color: Colors.primary,
    fontFamily: 'Inter-Regular',
    marginBottom: 4,
  },
  size_container: {
    backgroundColor: Colors.white,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  size_text: {
    fontSize: 10,
    color: Colors.font_gray,
    fontFamily: 'Inter-Regular',
  },
  support_container: {
    paddingHorizontal: 26,
    marginTop: 20,
  },
  support_card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(127, 224, 196, 0.10)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  support_icon: {
    marginRight: 12,
  },
  support_content: {
    flex: 1,
    alignItems: 'center',
  },
  support_label: {
    fontSize: 12,
    color: '#373737',
    fontFamily: 'Inter-Regular',
    marginBottom: 2,
  },
  support_number: {
    fontSize: 16,
    color: '#373737',
    fontFamily: 'Inter-SemiBold',
  },
  copy_icon: {
    padding: 8,
  },
  options_container: {
    marginTop: 20,
    marginHorizontal: 26,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
  },
  option_item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 20,
  },
  option_left: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  option_text: {
    fontSize: 16,
    color: '#373737',
    fontFamily: 'Inter-Regular',
    marginLeft: 25,
  },
});
