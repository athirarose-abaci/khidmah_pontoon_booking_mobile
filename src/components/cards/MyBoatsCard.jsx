import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";
import React from "react";
import { useNavigation } from "@react-navigation/native";
import { Colors } from "../../constants/customStyles";
import { useSelector } from "react-redux";
import { BASE_URL_IMAGE } from "../../constants/baseUrl";
import { useTranslation } from "react-i18next";

const MyBoatsCard = ({ item, isLastItem = false }) => {
  const navigation = useNavigation();
  const isDarkMode = useSelector(state => state.themeSlice.isDarkMode);

  const { t } = useTranslation();

  const handlePress = () => {
    navigation.navigate('BoatDetail', { boatId: item.id });
  };

  const getImageUri = () => {
    if (item?.images?.length > 0) {
      const imageUrl = item.images[0].image;
      
      if (!imageUrl) {
        return require("../../assets/images/no_image.jpg");
      }
      
      // If URL starts with http://, replace with https://
      if (typeof imageUrl === 'string' && imageUrl.startsWith('http://')) {
        return { uri: imageUrl.replace('http://', 'https://') };
      }
      
      // If it's a relative path, prepend BASE_URL_IMAGE
      if (typeof imageUrl === 'string' && !imageUrl.startsWith('http')) {
        return { uri: `${BASE_URL_IMAGE}${imageUrl}` };
      }
      
      // Otherwise use as is
      return { uri: imageUrl };
    }
    
    return require("../../assets/images/no_image.jpg");
  };

  const imageUri = getImageUri();

  return (
    <TouchableOpacity style={[styles.card, { backgroundColor: isDarkMode ? Colors.dark_container : Colors.white }, isLastItem && styles.lastItemCard]} onPress={handlePress} activeOpacity={0.7}>
      <Image source={imageUri} style={styles.image} />

      <View
        style={[
          styles.statusTag,
          { backgroundColor: item.status === 'INACTIVE' ? '#BE2222' : Colors.primary },
        ]}
      >
        <Text style={styles.statusText}>{item.status}</Text>
      </View>

      <Text style={[styles.boatName, { color: isDarkMode ? Colors.white : Colors.black }]}>{item.name}</Text>
      <Text style={[styles.boatId]}>{item.registration_number}</Text>
        <Text style={[styles.boatSize, { backgroundColor: isDarkMode ? Colors.size_bg_dark : Colors.size_bg_light }]}>
        {t('length')}: {item.length} ft
      </Text>
    </TouchableOpacity>
  );
};

export default MyBoatsCard;

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginVertical: 6,
    marginHorizontal: 4,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  lastItemCard: {
    flex: 0,
    width: '48%',
  },
  image: {
    width: "100%",
    height: 100,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    marginBottom: 8,
  },
  statusTag: {
    position: "absolute",
    top: 20,
    right: 20,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 10,
    color: Colors.white,
    fontFamily: "Inter-Medium",
  },
  boatName: {
    fontSize: 14.5,
    fontFamily: "Inter-SemiBold",
    color: Colors.black,
    marginTop: 6,
  },
  boatId: {
    fontSize: 12,
    color: Colors.primary,
    fontFamily: "Inter-Medium",
  },
  boatSize: {
    fontSize: 11,
    color: Colors.font_gray,
    marginTop: 4,
    borderRadius: 12,
    paddingVertical: 1,
    paddingHorizontal: 7,
    alignSelf: 'flex-start',
  },
});
