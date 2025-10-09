import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../src/screens/LoginScreen';
import MyBookingsScreen from '../src/screens/MyBookingsScreen';
import NewBookingScreen from '../src/screens/NewBookingScreen';
import BookingManagementScreen from '../src/screens/BookingManagementScreen';
import MyBoatsScreen from '../src/screens/MyBoatsScreen';
import BoatDetailScreen from '../src/screens/BoatDetailScreen';
import AddBoatScreen from '../src/screens/AddBoatScreen';
import MyTicketsScreen from '../src/screens/MyTicketsScreen';
import ProfileScreen from '../src/screens/ProfileScreen';

const Stack = createNativeStackNavigator();

const publicRoutes = [
    { name: 'Login', component: LoginScreen }
]

const MyBookingTabs = () => {
    return(
        <Stack.Navigator initialRouteName="MyBookings">
            <Stack.Screen name="MyBookings" component={MyBookingsScreen} options={{headerShown: false}}/>
            <Stack.Screen name="NewBooking" component={NewBookingScreen} options={{headerShown: false}}/>
            <Stack.Screen name="BookingManagement" component={BookingManagementScreen} options={{headerShown: false}}/>
        </Stack.Navigator>
    )
}
const MyBoatsTabs = () => {
    return(
        <Stack.Navigator initialRouteName="MyBoats">
            <Stack.Screen name="MyBoats" component={MyBoatsScreen} options={{headerShown: false}}/>
            <Stack.Screen name="BoatDetail" component={BoatDetailScreen} options={{headerShown: false}}/>
            <Stack.Screen name="AddBoat" component={AddBoatScreen} options={{headerShown: false}}/>
            <Stack.Screen name="NewBooking" component={NewBookingScreen} options={{headerShown: false}}/>
        </Stack.Navigator>
    )
}
const TicketsTabs = () => {
    return(
        <Stack.Navigator initialRouteName="MyTickets">
            <Stack.Screen name="MyTickets" component={MyTicketsScreen} options={{headerShown: false}}/>
            <Stack.Screen name="NewBooking" component={NewBookingScreen} options={{headerShown: false}}/>
        </Stack.Navigator>
    )
}
const ProfileTabs = () => {
    return(
        <Stack.Navigator initialRouteName="ProfileHome">
            <Stack.Screen name="ProfileHome" component={ProfileScreen} options={{headerShown: false}}/>
        </Stack.Navigator>
    )
}

export { publicRoutes, MyBookingTabs, MyBoatsTabs, TicketsTabs, ProfileTabs };