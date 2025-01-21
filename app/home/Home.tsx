import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Recipes from "../recipes/RecipeList";
import { FAB, useTheme } from "react-native-paper";
import { useState } from "react";
import FoodList from "../food/FoodList";
import { router } from "expo-router";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { Platform } from "react-native";

const Tab = createBottomTabNavigator();

export default function Home() {
  const [open, setOpen] = useState(false);
  const theme = useTheme();
  return (
    <>
      <Tab.Navigator safeAreaInsets={{ bottom: 0 }} screenOptions={{ headerShown: false }}>
        <Tab.Screen
          name="Inventory"
          component={FoodList}
          options={{
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="fridge" color={color} size={size} />
            ),
          }}
        />
        <Tab.Screen
          name="Recipes"
          component={Recipes}
          options={{
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="book-open" color={color} size={size} />
            ),
          }}
        />
      </Tab.Navigator>
      <FAB.Group
        icon="plus"
        onPress={() => setOpen(!open)}
        visible
        onStateChange={() => false}
        color={theme.colors.primary}
        backdropColor="#fffa"
        style={{
          alignItems: "center",
        }}
        fabStyle={{
          width: 56,
          alignSelf: "center",
          marginBottom: 20,
          shadowColor: theme.colors.primaryContainer,
          shadowOffset: { width: 0, height: 0 },
        }}
        open={open}
        actions={[
          {
            label: "Search Food",
            icon: "magnify",
            onPress: () => router.push("/search/Search"),
          },
          {
            label: "Scan Barcode",
            icon: "barcode",
            onPress: () => router.push("/barcode/Barcode"),
          },
          // {
          //   label: "Classify an Image",
          //   icon: "camera",
          //   onPress: () => router.push('/classify/Classify'),
          // },
        ]}
      />
    </>
  );
}
