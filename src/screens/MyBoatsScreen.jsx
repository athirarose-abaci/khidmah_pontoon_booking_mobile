import { StatusBar, StyleSheet, Text, TouchableOpacity, View, FlatList, RefreshControl, ActivityIndicator, TextInput } from "react-native";
import React, { useState, useContext, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@react-native-vector-icons/ionicons";
import { Lucide } from '@react-native-vector-icons/lucide';
import NoDataImage from "../components/NoDataImage"; 
import MyBoatsCard from "../components/cards/MyBoatsCard";
import AbaciLoader from "../components/AbaciLoader";
import { Colors } from "../constants/customStyles";
import CreateButton from "../components/newBooking/CreateButton";
import useTabBarScroll from "../hooks/useTabBarScroll";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import { ToastContext } from "../context/ToastContext";
import Error from "../helpers/Error";
import { fetchBoats } from "../apis/boat";
import { useDispatch, useSelector } from "react-redux";
import { setBoats, clearBoats } from "../../store/boatSlice";

const MyBoatsScreen = () => {
  const toastContext = useContext(ToastContext);
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const dispatch = useDispatch();
  const isDarkMode = useSelector(state => state.themeSlice.isDarkMode);

  const [boatsData, setBoatsData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const limit = 10;
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('null');
  const [isSearching, setIsSearching] = useState(false);
  const [hasMorePages, setHasMorePages] = useState(true);

  const { onScroll, insets } = useTabBarScroll();

  useEffect(() => {
    if(isFocused) {
      dispatch(clearBoats());
      setPage(1);
      setHasMorePages(true);
      fetchBoatsData(1, limit, false, searchQuery);
    }
  }, [isFocused]);

  const fetchBoatsData = async (pageNumber, limit, isRefresh = false, searchQuery) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setIsLoading(true);
    }
    
    try {
      const response = await fetchBoats(pageNumber, limit, searchQuery);
      
      if (isRefresh || pageNumber === 1) {
        // For refresh or first page, replace the data
        setBoatsData(response?.results || []);
        dispatch(setBoats(response?.results || []));
      } else {
        // For pagination, append the data
        const newData = [...boatsData, ...(response?.results || [])];
        setBoatsData(newData);
        dispatch(setBoats(newData));
      }
      
      // Update pagination state
      setHasMorePages(!!response?.next);
      if(response?.next) {
        setPage(prevPage => prevPage + 1);
      }
    } catch (error) {
      let err_msg = Error(error);
      toastContext.showToast(err_msg, "short", "error");
    } finally {
      if (isRefresh) {
        setRefreshing(false);
      } else {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if(isFocused && searchQuery !== 'null') {
        setIsSearching(true);
        (async () => {
          dispatch(clearBoats());
          setPage(1);
          setHasMorePages(true);
          await fetchBoatsData(1, limit, true, searchQuery);
          setIsSearching(false);
        })();
      }
    }, 500);
    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);


  const refreshControl = () => {
    const defaultSearch = 'null';
    if(searchQuery !== defaultSearch) {
      setSearchQuery(defaultSearch);
    }
    dispatch(clearBoats());
    setPage(1);
    setHasMorePages(true);
    fetchBoatsData(1, limit, true, defaultSearch);
  };

  const handleAddBoat = () => {
    navigation.navigate('AddBoat');
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["left", "right"]}>
      <StatusBar backgroundColor={isDarkMode ? Colors.dark_bg_color : "#F7F7F7"} barStyle={isDarkMode ? "light-content" : "dark-content"} />
      <View style={[styles.main_container, { backgroundColor: isDarkMode ? Colors.dark_bg_color : Colors.bg_color }]}>
        {/* Header */}
        <View style={styles.header_container}>
          <Text style={[styles.header_title, { color: isDarkMode ? Colors.white : Colors.font_gray }]}>My Boats</Text>

          <TouchableOpacity
            activeOpacity={0.7}
            style={styles.addBoatButton}
            onPress={handleAddBoat}
          >
            <Ionicons name="add-circle-outline" size={24} color={Colors.primary} />
            <Text style={styles.addBoatText}>Add new boat</Text>
          </TouchableOpacity>
        </View>

        {/* Search */}
        <View style={styles.filter_container}>
          <View style={[styles.search_bar, { backgroundColor: isDarkMode ? Colors.dark_container : Colors.white }]}>
            <Ionicons
              name="search-outline"
              size={22}
              color={isDarkMode ? Colors.white : "#EFEFEF"}
              style={{ marginHorizontal: 12 }}
            />
            <TextInput
              style={[styles.search_input, { color: isDarkMode ? Colors.white : Colors.black }]}
              placeholder="Search boats"
              placeholderTextColor={isDarkMode ? Colors.font_gray : Colors.primary}
              value={searchQuery!=='null' ? searchQuery : ''}
              onChangeText={text => setSearchQuery(text)}
            />
          </View>
        </View>

        {isSearching && (
          <View style={{ alignSelf: 'center', marginVertical: 10 }}>
            <ActivityIndicator size="small" color={Colors.primary} />
          </View>
        )}

        <View style={styles.boat_list_conatiner}>
          {boatsData.length === 0 ? (
            <View style={styles.noDataContainer}>
              <NoDataImage
                imageSource={require('../assets/images/no_boats.png')}
                title="No boats yet"
                subtitle="You haven't added any boat"
                onRefresh={refreshControl}
                isDarkMode={isDarkMode}
              />
            </View>
          ) : (
            <FlatList
              data={boatsData}
              keyExtractor={(item) => item.id.toString()}
              numColumns={2}
              columnWrapperStyle={boatsData.length % 2 === 1 ? { justifyContent: "flex-start" } : { justifyContent: "space-between" }}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{
                paddingBottom: insets.bottom + 50,
                paddingHorizontal: 16,
              }}
              renderItem={({ item, index }) => (
                <MyBoatsCard 
                  item={item} 
                  isLastItem={index === boatsData.length - 1 && boatsData.length % 2 === 1}
                />
              )}
              onScroll={onScroll}
              scrollEventThrottle={16}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={refreshControl}
                  colors={[Colors.primary]}
                  tintColor={Colors.primary}
                />
              }
              onEndReachedThreshold={0.01}
              onEndReached={() => {
                if(hasMorePages && !isLoading) {
                  fetchBoatsData(page, limit, false, searchQuery);
                }
              }}
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
      <AbaciLoader visible={isLoading} />
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
  filter_container: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
    marginBottom: 15,
    paddingHorizontal: 26,
    backgroundColor: 'transparent',
  },
  search_bar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    height: 52,
    borderRadius: 26,
    paddingVertical: 0,
    paddingHorizontal: 12,
    marginRight: 0,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 0,
    borderWidth: 0,
    borderColor: 'transparent',
    overflow: 'hidden',
  },
  search_input: {
    flex: 1,
    paddingVertical: 0,
    paddingRight: 12,
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: Colors.black,
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
