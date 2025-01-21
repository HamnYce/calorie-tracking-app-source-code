import { ScrollView, View } from "react-native";
import { ActivityIndicator, Text } from "react-native-paper";
import { useEffect, useState } from "react";
import { UserInventoryModel } from "@/src/models/inventory/userInventoryModel";
import { InventoryEntryTile } from "@/src/components/inventory/InventoryEntryTile";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { ConsumedEntryTile } from "@/src/components/inventory/ConsumedEntryTile";
import ConsumedRecipeCard from "@/src/components/recipe/ConsumedRecipeCard";
import _ from "radash";

const Tab = createMaterialTopTabNavigator();

export default function FoodList() {
  function Inventory() {
    return (
      <ScrollView style={{ flex: 1, backgroundColor: "white", padding: 15 }}>
        {loading ? (
          <ActivityIndicator />
        ) : (
          userInventory!.inventory.map((entry) => {
            return (
              <View key={entry.food.id}>
                <InventoryEntryTile inventoryEntry={entry} />
                <View style={{ margin: 10 }} />
              </View>
            );
          })
        )}
      </ScrollView>
    );
  }

  function Consumed() {
    return (
      <ScrollView
        style={{
          flex: 1,
          backgroundColor: "white",
          padding: 15,
        }}
      >
        {loading ? (
          <ActivityIndicator />
        ) : (
          [...userInventory!.consumed].reverse().map((entry) => {
            if (entry.type == "recipe") {
              return (
                <View
                  style={{ alignSelf: "center" }}
                  key={entry.recipeModel!.id + entry.date.toString()}
                >
                  <ConsumedRecipeCard consumedEntry={entry} />
                  <View style={{ margin: 10 }} />
                </View>
              );
            } else {
              return (
                <View key={entry.foodModel!.id + entry.date.toString()}>
                  <ConsumedEntryTile consumedEntry={entry} />
                  <View style={{ margin: 10 }} />
                </View>
              );
            }
          })
        )}
      </ScrollView>
    );
  }

  const [userInventory, setUserInventory] = useState<UserInventoryModel>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    UserInventoryModel.load().then((model) => {
      setUserInventory(model);
      setLoading(false);
    });

    UserInventoryModel.userEntriesRef().onSnapshot(() => {
      setLoading(true);
      UserInventoryModel.load().then((model) => {
        setUserInventory(model);
        setLoading(false);
      });
    });
  }, []);

  return (
    <Tab.Navigator>
      <Tab.Screen name="Nutri-Vault" component={Inventory} />
      <Tab.Screen name="Consumed" component={Consumed} />
    </Tab.Navigator>
  );
}
