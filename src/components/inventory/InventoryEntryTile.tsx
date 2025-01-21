import { Image } from "react-native";
import { InventoryEntry } from "@/src/models/inventory/userInventoryModel";
import { Card, Text, useTheme } from "react-native-paper";
import { router } from "expo-router";


export function InventoryEntryTile({ inventoryEntry }: { inventoryEntry: InventoryEntry }) {
  const theme = useTheme();
  return (
    <Card
      onPress={() => {
        router.push({
          pathname: "/food/FoodDetail",
          params: {
            foodId: inventoryEntry.food.id,
            foodType: inventoryEntry.food.type,
            initialAmount: inventoryEntry.amount.toString(),
            initialFoodUnit: inventoryEntry.unit,
            display: "inventory"
          },
        });
      }}
      style={{ backgroundColor: 'white',shadowOpacity: 1, shadowColor: theme.colors.primaryContainer }}
    >
      <Card.Title
        style={{ padding: 20 }}
        title={inventoryEntry.food.name.charAt(0).toUpperCase() + inventoryEntry.food.name.slice(1)}
        titleStyle={{marginLeft: 10}}
        left={() => (
          <Image
            source={{ uri: inventoryEntry.food.imageUri }}
            style={{ width: 56, aspectRatio: 1 }}
          />
        )}
        right={() => (
          <Text style={{color: theme.colors.primary}}>
            {inventoryEntry.amount +
              " " +
              inventoryEntry.unit +
              (inventoryEntry.amount > 1 ? "s" : "")}
          </Text>
        )}
      />
    </Card>
  );
}
