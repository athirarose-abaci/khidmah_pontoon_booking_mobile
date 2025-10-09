import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";
import React from "react";
import { useNavigation } from "@react-navigation/native";
import { Colors } from "../../constants/customStyles";

const MyBoatsCard = ({ item, isLastItem = false }) => {
  const navigation = useNavigation();

  const handlePress = () => {
    navigation.navigate('BoatDetail', { boatId: item.id });
  };

  const imageUri =
    item?.images?.length > 0
      ? { uri: item.images[0].image }
      : require("../../assets/images/no_image.jpg"); 

  return (
    <TouchableOpacity style={[styles.card, isLastItem && styles.lastItemCard]} onPress={handlePress} activeOpacity={0.7}>
      <Image source={imageUri} style={styles.image} />

      <View
        style={[
          styles.statusTag,
          { backgroundColor: item.status === 'INACTIVE' ? '#BE2222' : Colors.primary },
        ]}
      >
        <Text style={styles.statusText}>{item.status}</Text>
      </View>

      <Text style={styles.boatName}>{item.name}</Text>
      <Text style={styles.boatId}>{item.registration_number}</Text>
      <Text style={styles.boatSize}>
        Size: {item.length} x {item.width}
      </Text>
    </TouchableOpacity>
  );
};

export default MyBoatsCard;

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: Colors.white,
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
    fontSize: 12,
    color: Colors.white,
    fontFamily: "Inter-Medium",
  },
  boatName: {
    fontSize: 16,
    fontFamily: "Inter-SemiBold",
    color: Colors.black,
    marginTop: 6,
  },
  boatId: {
    fontSize: 14,
    color: Colors.primary,
    fontFamily: "Inter-Medium",
  },
  boatSize: {
    fontSize: 13,
    color: Colors.font_gray,
    marginTop: 4,
  },
});
