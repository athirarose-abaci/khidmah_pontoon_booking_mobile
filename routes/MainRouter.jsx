import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSelector } from 'react-redux';
import { MyBoatsTabs, MyBookingTabs, ProfileTabs, publicRoutes, TicketsTabs } from './index';
import { StyleSheet, Platform } from 'react-native';
import { Colors } from '../src/constants/customStyles';
import TabIcon from '../src/components/tab_bars/MainTabIcon';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const MainRouter = () => {
  const authState = useSelector(state => state.authSlice.authState);
  const insets = useSafeAreaInsets();

  return (
    <NavigationContainer>
      {authState?.authenticated ? (
      <Stack.Navigator>
        {publicRoutes.map((route, idx) => (
          <Stack.Screen 
            key={idx}
            name={route.name}
            component={route.component}
            options={{ headerShown: false }} />
        ))}
      </Stack.Navigator>
      ): (
        <Tab.Navigator
          screenOptions={{
            tabBarShowLabel: false,
            headerShown: false,
            tabBarStyle: [
              styles.tabBar,
              {
                height: 70 + insets.bottom,
                paddingBottom: insets.bottom,
              }
            ],
            tabBarActiveTintColor: Colors.primary,
            tabBarInactiveTintColor: Colors.tab_inactive
        }}>
        <Tab.Screen
          name="Bookings"
          component={MyBookingTabs}
          options={({route}) => ({
            tabBarIcon: ({focused}) => (
              <TabIcon 
                focused={focused}
                source={require('../src/assets/images/bookings.png')}
              />
            ),
          })}
        />
        <Tab.Screen
          name="Boats"
          component={MyBoatsTabs}
          options={({route}) => ({
            tabBarIcon: ({focused}) => (
              <TabIcon 
                focused={focused}
                source={require('../src/assets/images/boats.png')}
              />
            ),
          })}
        />
        <Tab.Screen
          name="Tickets"
          component={TicketsTabs}
          options={({route}) => ({
            tabBarIcon: ({focused}) => (
              <TabIcon 
                focused={focused}
                source={require('../src/assets/images/tickets.png')}
              />
            ),
          })}
        />
        <Tab.Screen
          name="Profile"
          component={ProfileTabs}
          options={({route}) => ({
            tabBarIcon: ({focused}) => (
              <TabIcon 
                focused={focused}
                source={require('../src/assets/images/profile.png')}
              />
            ),
          })}
        />
      </Tab.Navigator>
      )}
    </NavigationContainer>
  );
}

export default MainRouter;

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    left: 20,
    right: 20,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
    paddingTop: 15,
  },
});