import { Image } from "react-native";
import { ConsumedEntry } from "@/src/models/inventory/userInventoryModel";
import { Card, Text, useTheme } from "react-native-paper";
import { router } from "expo-router";
import _ from "radash";

export function ConsumedEntryTile({ consumedEntry }: { consumedEntry: ConsumedEntry }) {
  const theme = useTheme();

  return (
    <Card
      onPress={() => {
        router.push({
          pathname: "/food/FoodDetail",
          params: {
            foodId: consumedEntry.foodModel!.id,
            foodType: consumedEntry.foodModel!.type,
            initialAmount: consumedEntry.amount.toString(),
            initialFoodUnit: consumedEntry.unit,
            display: "consumed",
            consumedDate: consumedEntry.date.toString(),
          },
        });
      }}
      style={{
        backgroundColor: "white",
        shadowOpacity: 1,
        shadowColor: theme.colors.primaryContainer,
      }}
    >
      <Card.Title
        style={{ padding: 20 }}
        title={_.capitalize(consumedEntry.foodModel!.name)}
        titleStyle={{ marginLeft: 10 }}
        left={() => (
          <Image
            source={{ uri: consumedEntry.foodModel!.imageUri }}
            style={{ width: 56, aspectRatio: 1 }}
          />
        )}
        right={() => (
          <Text style={{ color: theme.colors.primary }}>
            {consumedEntry.amount +
              " " +
              consumedEntry.unit +
              (consumedEntry.amount > 1 ? "s" : "")}
          </Text>
        )}
      />
    </Card>
  );
}
