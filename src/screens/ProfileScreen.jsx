import { Image, StatusBar, StyleSheet, Text, View, TouchableOpacity, ScrollView, Switch, Clipboard } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Lucide } from '@react-native-vector-icons/lucide';
import { MaterialDesignIcons } from '@react-native-vector-icons/material-design-icons';
import React, { useContext, useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../constants/customStyles';
import BackgroundImage from '../components/BackgroundImage';
import useTabBarScroll from '../hooks/useTabBarScroll';
import { AntDesign } from '@react-native-vector-icons/ant-design';
import { MaterialIcons } from '@react-native-vector-icons/material-icons';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import EditProfileModal from '../components/modals/EditProfileModal';
import AbaciLoader from '../components/AbaciLoader';
import { fetchProfile, logout } from '../apis/auth';
import { setAuthState } from '../../store/authSlice';
import { clearCookies } from '../helpers/clearCookieHelper';
import { removeData } from '../helpers/asyncStorageHelper';
import { ToastContext } from '../context/ToastContext';
import { useDispatch, useSelector } from 'react-redux';
import ConfirmationModal from '../components/modals/ConfirmationModal';
import Error from '../helpers/Error';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import { BASE_URL_IMAGE } from '../constants/baseUrl';
import { fetchBoats } from '../apis/boat';
import { fetchOrganizationSettings } from '../apis/system';
import { setIsDarkMode } from '../../store/themeSlice';

const ProfileScreen = () => {
  const { onScroll, insets } = useTabBarScroll();

  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isLogoutConfirmVisible, setIsLogoutConfirmVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [profileData, setProfileData] = useState(null);
  const [boatsData, setBoatsData] = useState([]);
  const [boatsCount, setBoatsCount] = useState(0);
  const [organizationSettingsData, setOrganizationSettingsData] = useState(null);

  const isFocused = useIsFocused();
  const navigation = useNavigation();

  const toastContext = useContext(ToastContext);
  const dispatch = useDispatch();
  const currentAuthState = useSelector(state => state.authSlice.authState);
  const isDarkMode = useSelector(state => state.themeSlice.isDarkMode);

  useEffect(() => {
    if (isFocused) {
      fetchProfileData();
      fetchBoatsData();
      fetchOrganizationSettingsData();
    }
  }, [isFocused]);

  const fetchProfileData = async () => {
    setIsLoading(true);
    try {
      const response = await fetchProfile();
      setProfileData(response);
    } catch (error) {
      let err_msg = Error(error);
      toastContext.showToast(err_msg, 'short', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchBoatsData = async () => {
    setIsLoading(true);
    try {
      const response = await fetchBoats(1, 10);
      setBoatsCount(response?.count || 0);
      setBoatsData(response?.results || []);
    } catch (error) {
      let err_msg = Error(error);
      toastContext.showToast(err_msg, 'short', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchOrganizationSettingsData = async () => {
    setIsLoading(true);
    try {
      const response = await fetchOrganizationSettings();
      setOrganizationSettingsData(response);
    } catch (error) {
      let err_msg = Error(error);
      toastContext.showToast(err_msg, 'short', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const transformImage = (imageUrl) => {
    if (!imageUrl) return null;

    // Check if it's a string and doesn't already start with http or https
    if (typeof imageUrl === 'string' && !imageUrl.startsWith('http')) {
      return BASE_URL_IMAGE + imageUrl;
    }

    return imageUrl;
  };

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
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyPhoneNumber = () => {
    if (organizationSettingsData?.phone) {
      Clipboard.setString(organizationSettingsData?.phone);
      // toastContext.showToast('Phone number copied to clipboard', 'short', 'success');
    }
  };

  const handleBoatPress = (boatId) => {
    navigation.navigate('ProfileBoatDetail', { boatId: boatId });
  };

  const handleThemeToggle = () => {
    setIsLoading(true);
    dispatch(setIsDarkMode(!isDarkMode));
    // Simple timeout to show loader briefly
    setTimeout(() => {
      setIsLoading(false);
    }, 500);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['left', 'right']}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle={isDarkMode ? "light-content" : "dark-content"}
      />
      <View style={styles.main_container}>
        <BackgroundImage 
          source={isDarkMode ? require('../assets/images/profile_bg_dark.png') : require('../assets/images/profile_bg.png')}
        >
          <View style={styles.header_container}>
            <Text style={styles.header_title}>My Profile</Text>
          </View>
          <View style={styles.image_container}>
            <View style={styles.circle_background}>
            {/* <Image
                source={
                  currentAuthState?.avatar 
                    ? currentAuthState?.avatar?.startsWith('file://') || currentAuthState?.avatar?.startsWith('content://')
                      ? { uri: currentAuthState?.avatar }
                      : { uri: transformImage(currentAuthState?.avatar) }
                    : require('../assets/images/no_image_avatar.png')
                }
                style={styles.image}
                resizeMode="cover"
              /> */}
            <Image
                source={
                  currentAuthState?.avatar ? { uri: transformImage(currentAuthState?.avatar) } : require('../assets/images/no_image_avatar.png')
                }
                style={styles.image}
                resizeMode="cover"
              />
            </View>
          </View>
          <View style={styles.info_container}>
            <View style={styles.title_row}>
              <Text style={[styles.info_title, { color: isDarkMode ? Colors.primary : '#00263A' }]}>{currentAuthState?.full_name}</Text>
              <TouchableOpacity
                style={styles.edit_icon_container}
                onPress={() => setIsEditModalVisible(true)}
              >
                <Image
                  source={require('../assets/images/edit_pencil.png')}
                  style={[styles.edit_icon, { tintColor: isDarkMode ? Colors.white : '#00263A' }]}
                />
              </TouchableOpacity>
            </View>
            <Text style={[styles.info_subtitle_id, { color: isDarkMode ? Colors.white : '#353535' }]}>{currentAuthState?.staff_id || ''}</Text>
            <Text style={[styles.info_subtitle_email, { color: isDarkMode ? Colors.white : Colors.font_gray }]}> {currentAuthState?.email} </Text>
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
                <Text style={styles.boat_count}>{boatsCount} boats</Text>
              </View>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.boats_scroll}
                nestedScrollEnabled={true}
                scrollEventThrottle={1}
              >
                {boatsData.map(boat => (
                  <TouchableOpacity 
                    key={boat?.id} 
                    style={[styles.boat_card, { backgroundColor: isDarkMode ? Colors.dark_container : 'white' }]}
                    onPress={() => handleBoatPress(boat?.id)}
                    activeOpacity={0.8}
                  >
                    <View style={styles.boat_image_container}>
                      <Image 
                        source={
                          boat?.images && boat.images.length > 0 
                            ? { uri: boat.images[0].image } 
                            : require('../assets/images/no_image.jpg')
                        } 
                        style={styles.boat_image} 
                      />
                      <View
                        style={[
                          styles.status_badge,
                          {
                            backgroundColor:
                              boat?.status === 'ACTIVE' ? '#4CAF50' : '#FF5722',
                          },
                        ]}
                      >
                        <Text style={styles.status_text}>{boat?.status}</Text>
                      </View>
                      <LinearGradient
                        colors={['rgba(0, 0, 0, 0.3)', '#1C1D20']}
                        locations={[0, 1]}
                        style={styles.overlay_content}
                      >
                        <Text style={styles.boat_name}>{boat?.name}</Text>
                        <Text style={styles.boat_id}>{boat?.registration_number}</Text>
                        <View style={[styles.size_container, { backgroundColor: isDarkMode ? '#1C1D20' : 'white' }]}>
                          <Text style={[styles.size_text, { color: isDarkMode ? Colors.white : Colors.font_gray }]}>
                            Size: {boat?.length} x {boat?.width} ft
                          </Text>
                        </View>
                      </LinearGradient>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
            <View style={styles.support_container}>
              <View style={[styles.support_card, { backgroundColor: isDarkMode ? Colors.dark_container : 'rgba(127, 224, 196, 0.10)' }]}>
                <View style={styles.support_icon}>
                  <Lucide name="headset" size={30} color={Colors.primary} />
                </View>
                <View style={styles.support_content}>
                  <Text style={[styles.support_label, { color: isDarkMode ? Colors.white : '#373737' }]}>Customer Support</Text>
                  <Text style={[styles.support_number, { color: isDarkMode ? Colors.white : '#373737' }]}>{organizationSettingsData?.phone}</Text>
                </View>
                <TouchableOpacity style={styles.copy_icon} onPress={handleCopyPhoneNumber}>
                  <MaterialDesignIcons
                    name="content-copy"
                    size={25}
                    color={isDarkMode ? Colors.white : '#373737'}
                  />
                </TouchableOpacity>
              </View>
            </View>
            <View style={[styles.options_container, { backgroundColor: isDarkMode ? Colors.dark_container : 'white' }]}>
              <View style={styles.option_item}>
                <View style={styles.option_left}>
                  <Lucide name="moon" size={23} color={Colors.primary} />
                  <Text style={[styles.option_text, { color: isDarkMode ? Colors.white : '#373737' }]}>Dark Mode</Text>
                </View>
                <Switch
                  trackColor={{
                    false: 'rgba(71, 170, 157, 0.42)',
                    true: Colors.primary,
                  }}
                  thumbColor={Colors.primary}
                  ios_backgroundColor="#E4E4E4"
                  onValueChange={handleThemeToggle}
                  value={isDarkMode}
                  disabled={isLoading}
                />
              </View>

              {/* <View style={styles.option_item}>
                <View style={styles.option_left}>
                  <Lucide name="lock" size={25} color={Colors.primary} />
                  <Text style={styles.option_text}>Change Password</Text>
                </View>
                <Lucide name="chevron-right" size={25} color="#B6C7D9" />
              </View> */}

              <TouchableOpacity
                style={styles.option_item}
                onPress={() => setIsLogoutConfirmVisible(true)}
              >
                <View style={styles.option_left}>
                  <AntDesign name="logout" size={23} color="#FF5722" />
                  <Text style={[styles.option_text, { color: '#FF5722' }]}>
                    Logout
                  </Text>
                </View>
                <Lucide name="chevron-right" size={23} color="#FF5722" />
              </TouchableOpacity>
            </View>
          </ScrollView>
        </BackgroundImage>
      </View>

      <EditProfileModal
        visible={isEditModalVisible}
        onRequestClose={() => setIsEditModalVisible(false)}
        profileInfo={profileData?.user}
        onProfileUpdate={updateProfileData => {
          setProfileData(updateProfileData);
          setIsEditModalVisible(false);
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
        warningIconComponent={
          <MaterialIcons name="logout" size={24} color="#FF6B6B" />
        }
        confirmIconComponent={
          <Ionicons name="exit-outline" size={20} color="white" />
        }
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
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
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
    // tintColor: '#00263A',
    resizeMode: 'contain',
  },
  info_title: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
  },
  info_subtitle_id: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  info_subtitle_email: {
    fontSize: 14,
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
    fontSize: 15,
    color: Colors.font_gray,
    fontFamily: 'Inter-SemiBold',
  },
  boat_count: {
    fontSize: 13,
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
    fontSize: 14,
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
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  size_text: {
    fontSize: 10,
    fontFamily: 'Inter-Regular',
  },
  support_container: {
    paddingHorizontal: 26,
    marginTop: 20,
  },
  support_card: {
    flexDirection: 'row',
    alignItems: 'center',
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
    fontFamily: 'Inter-Regular',
    marginBottom: 2,
  },
  support_number: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
  copy_icon: {
    padding: 8,
  },
  options_container: {
    marginTop: 20,
    marginHorizontal: 26,
    borderRadius: 15,
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
    fontSize: 14.5,
    fontFamily: 'Inter-Regular',
    marginLeft: 25,
  },
});
