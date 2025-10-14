import { StatusBar, StyleSheet, Text, TouchableOpacity, View, FlatList, TextInput } from 'react-native';
import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../constants/customStyles';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import SubTabBar from '../components/tab_bars/SubTabBar';
import NoDataImage from '../components/NoDataImage';
import MyTicketsCard from '../components/cards/MyTicketsCard';
import { ticketsData } from '../constants/dummyData';
import CreateButton from '../components/newBooking/CreateButton';
import { Lucide } from '@react-native-vector-icons/lucide';
import useTabBarScroll from '../hooks/useTabBarScroll';
import { useNavigation } from '@react-navigation/native';

const MyTicketsScreen = () => {
  const [activeTab, setActiveTab] = useState('Open');
  const tabs = ['Open', 'In Progress', 'Closed'];

  const { onScroll, insets } = useTabBarScroll();

  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.safeArea} edges={["left", "right"]}>
      <StatusBar backgroundColor="#F7F7F7" barStyle="dark-content" />
      <View style={styles.main_container}>
        <View style={styles.header_container}>
          <Text style={styles.header_title}>My Tickets</Text>
          <TouchableOpacity
            activeOpacity={0.7}
            style={styles.addTicketButton}
            onPress={() => console.log("Add new boat")}
          >
            <Ionicons
              name="add-circle-outline"
              size={24}
              color={Colors.primary}
            />
            <Text style={styles.addTicketText}>Create ticket</Text>
          </TouchableOpacity>
        </View>

        {/* Search */}
        <View style={styles.filter_container}>
          <View style={styles.search_bar}>
            <Ionicons
              name="search-outline"
              size={22}
              color="#EFEFEF"
              style={{ marginHorizontal: 12 }}
            />
            <TextInput
              style={styles.search_input}
              placeholder="Search tickets"
              placeholderTextColor={Colors.primary}
            />
          </View>
        </View>

        <SubTabBar
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        <View style={styles.list_container}>
          {
            (ticketsData.filter(t => activeTab === 'Open' ? t.status === 'Open' : activeTab === 'In Progress' ? t.status === 'In Progress' : t.status === 'Closed')).length === 0 ? (
              <View style={styles.noDataContainer}>
                <NoDataImage
                  imageSource={require('../assets/images/no_ticket.png')}
                  title="No tickets Added"
                  subtitle="You haven't raised any ticket"
                  onRefresh={() => {}}
                  isDarkMode={false}
                />
              </View>
            ) : (
              <FlatList
                data={ticketsData.filter(t => activeTab === 'Open' ? t.status === 'Open' : activeTab === 'In Progress' ? t.status === 'In Progress' : t.status === 'Closed')}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 120 }}
                renderItem={({ item }) => (
                  <View style={styles.sectionContainer}>
                    <MyTicketsCard item={item} />
                  </View>
                )}
                refreshing={false}
                onRefresh={() => {}}
                onEndReachedThreshold={0.01}
                onEndReached={() => {}}
                ListFooterComponent={null}
                onScroll={onScroll}
                scrollEventThrottle={16}
              />
            )
          }
        </View>
      </View>
      <CreateButton
        onPress={() => navigation.navigate('NewBooking')}
        icon={<Lucide name="calendar-plus" size={28} color={Colors.white} />}
        bottom={130 + insets.bottom}
        right={40}
      />
    </SafeAreaView>
  )
}

export default MyTicketsScreen

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
    color: Colors.font_gray,
    fontFamily: 'Inter-SemiBold',
  },
  addTicketButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addTicketText: {
    marginLeft: 6,
    fontSize: 16,
    color: Colors.primary,
    fontFamily: 'Inter-Medium',
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
  list_container: {
    paddingHorizontal: 26,
  },
  sectionContainer: {
    width: '100%',
  },
  noDataContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 500,
    paddingVertical: 50,
  },
})