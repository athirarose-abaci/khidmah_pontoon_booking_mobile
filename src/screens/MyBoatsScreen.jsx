import { StatusBar, StyleSheet, Text, TouchableOpacity, View, FlatList, ActivityIndicator, } from "react-native";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@react-native-vector-icons/ionicons";
import { Lucide } from '@react-native-vector-icons/lucide';
import NoDataLottie from "../components/lottie/NoDataLottie"; 
import MyBoatsCard from "../components/cards/MyBoatsCard";
import { boatsData } from "../constants/dummyData";
import { Colors } from "../constants/customStyles";
import CreateButton from "../components/newBooking/CreateButton";
import useTabBarScroll from "../hooks/useTabBarScroll";
import { useNavigation } from "@react-navigation/native";

const MyBoatsScreen = () => {
  const data = boatsData; 

  const { onScroll, insets } = useTabBarScroll();

  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.safeArea} edges={["left", "right"]}>
      <StatusBar backgroundColor="#F7F7F7" barStyle="dark-content" />
      <View style={styles.main_container}>
        {/* Header */}
        <View style={styles.header_container}>
          <Text style={styles.header_title}>My Boats</Text>

          <TouchableOpacity
            activeOpacity={0.7}
            style={styles.addBoatButton}
            onPress={() => console.log("Add new boat")}
          >
            <Ionicons
              name="add-circle-outline"
              size={24}
              color={Colors.primary}
            />
            <Text style={styles.addBoatText}>Add new boat</Text>
          </TouchableOpacity>
        </View>

        {/* List */}
        <View style={styles.boat_list_conatiner}>
          {data.length === 0 ? (
            <View style={styles.noDataContainer}>
              <NoDataLottie isDarkMode={false} refreshControl={() => {}} />
            </View>
          ) : (
            <FlatList
              data={data}
              keyExtractor={(item) => item.id}
              numColumns={2}
              columnWrapperStyle={{ justifyContent: "space-between" }}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: insets.bottom + 50, paddingHorizontal: 16 }}
              renderItem={({ item }) => <MyBoatsCard item={item} />}
              ListFooterComponent={
                false ? (
                  <View style={{ paddingVertical: 20 }}>
                    <ActivityIndicator size="small" color={Colors.primary} />
                  </View>
                ) : null
              }
              onScroll={onScroll}
              scrollEventThrottle={16}
            />
          )}
        </View>
      </View>
      <CreateButton
        onPress={() => navigation.navigate('NewBooking')}
        icon={<Lucide name="calendar-plus" size={28} color={Colors.white} />}
        bottom={130 + insets.bottom}
        right={40}
      />
    </SafeAreaView>
  );
};

export default MyBoatsScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  main_container: {
    flex: 1,
    backgroundColor: Colors.bg_color,
  },
  header_container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 26,
    paddingVertical: 20,
    marginTop: 40,
  },
  header_title: {
    fontSize: 18,
    color: Colors.font_gray,
    fontFamily: "Inter-SemiBold",
  },
  addBoatButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  addBoatText: {
    marginLeft: 6,
    fontSize: 16,
    color: Colors.primary,
    fontFamily: "Inter-Medium",
  },
  boat_list_conatiner: {
    flex: 1,
    paddingHorizontal: 5,
  },
  noDataContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 500,
    paddingVertical: 50,
  },
});
