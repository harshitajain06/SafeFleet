import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { signOut } from "firebase/auth";

import HomePage from "./Home";
import InformationPage from "./Information";
import RegisterScreen from "./Register";
import Login from "./index";

import AdminVehicleListScreen from "./AdminVehicleListScreen";
import DriverFormScreen from "./DriverFormScreen";
import StartTrackingScreen from "./StartTrackingScreen";
import VehicleTrackingScreen from "./VehicleTrackingScreen";

import { Colors } from "../../constants/Colors";
import { useColorScheme } from "../../hooks/useColorScheme";
import { auth } from "../../config/firebase";
import { useUserRole } from "../../hooks/useUserRole";
import RoleGuard from "../../components/RoleGuard";

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();
const Drawer = createDrawerNavigator();

const BottomTabs = () => {
  const colorScheme = useColorScheme();
  const { role, loading } = useUserRole();

  if (loading) return null;

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
        tabBarInactiveTintColor: "gray",
        tabBarStyle: {
          backgroundColor: Colors[colorScheme ?? "light"].background,
        },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === "Home") {
            iconName = focused ? "home" : "home-outline";
          } else if (route.name === "Information") {
            iconName = focused ? "car" : "car-outline";
          } else if (route.name === "Admin List") {
            iconName = focused ? "list" : "list-outline";
          } else if (route.name === "Track Vehicles") {
            iconName = focused ? "locate" : "locate-outline";
          } else if (route.name === "Fill Form") {
            iconName = focused ? "create" : "create-outline";
          } else if (route.name === "Driver Details") {
            iconName = focused ? "person" : "person-outline";
          } else if (route.name === "Start Tracking") {
            iconName = focused ? "navigate" : "navigate-outline";
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomePage} />
      {/* <Tab.Screen name="Information" component={InformationPage} /> */}

      {role === "admin" && (
        <>
          <Tab.Screen name="Admin List">
            {() => (
              <RoleGuard allowedRoles={["admin"]}>
                <AdminVehicleListScreen />
              </RoleGuard>
            )}
          </Tab.Screen>
          {/* <Tab.Screen name="Track Vehicles">
            {() => (
              <RoleGuard allowedRoles={['admin']}>
                <VehicleTrackingScreen />
              </RoleGuard>
            )}
          </Tab.Screen> */}
        </>
      )}

      {role === 'driver' && (
  <>
    <Tab.Screen name="Driver Details">
      {() => (
        <RoleGuard allowedRoles={['driver']}>
          <DriverFormScreen />
        </RoleGuard>
      )}
    </Tab.Screen>
    {/* <Tab.Screen name="Start Tracking">
      {() => (
        <RoleGuard allowedRoles={['driver']}>
          <StartTrackingScreen />
        </RoleGuard>
      )}
    </Tab.Screen> */}
  </>
)}

    </Tab.Navigator>
  );
};

const DrawerNavigator = () => {
  const navigation = useNavigation();

  const handleLogout = () => {
    signOut(auth)
      .then(() => {
        navigation.replace("Login");
      })
      .catch((err) => {
        console.error("Logout Error:", err);
        Alert.alert("Error", "Failed to logout. Please try again.");
      });
  };

  return (
    <Drawer.Navigator initialRouteName="MainTabs">
      <Drawer.Screen
        name="MainTabs"
        component={BottomTabs}
        options={{ title: "Home" }}
      />
      <Drawer.Screen
        name="Logout"
        component={BottomTabs}
        options={{
          title: "Logout",
          drawerIcon: ({ color, size }) => (
            <Ionicons name="log-out-outline" size={size} color={color} />
          ),
        }}
        listeners={{
          drawerItemPress: (e) => {
            e.preventDefault();
            handleLogout();
          },
        }}
      />
    </Drawer.Navigator>
  );
};

export default function StackLayout() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={Login} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="Drawer" component={DrawerNavigator} />
      <Stack.Screen
        name="VehicleTrackingScreen"
        component={VehicleTrackingScreen}
      />
    </Stack.Navigator>
  );
}
