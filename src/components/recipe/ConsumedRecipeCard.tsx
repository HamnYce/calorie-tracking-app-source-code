import { ConsumedEntry } from "@/src/models/inventory/userInventoryModel";
import { RecipeModel } from "@/src/models/recipe/recipeModel";
import { router } from "expo-router";
import { Card, useTheme } from "react-native-paper";

export default function ConsumedRecipeCard({ consumedEntry }: { consumedEntry: ConsumedEntry }) {
  var title = consumedEntry.recipeModel!.title.slice(0, 25) + (consumedEntry.recipeModel!.title.length > 25 ? "..." : "");

  return (
    <Card
      elevation={0}
      style={{
        width: 300,
        height: 200,
        backgroundColor: "#ffff",
        shadowOpacity: 0,
      }}
      contentStyle={{
        backgroundColor: "ffff",
        shadowOpacity: 0,
      }}
      onPress={() => {
        router.push({
          pathname: "/recipes/RecipeDetail",
          params: {
            recipeID: consumedEntry.recipeModel!.id,
            isConsumed: "true",
            consumedDate: consumedEntry.date.toString(),
          },
        });
      }}
    >
      <Card.Cover
        source={{ uri: consumedEntry.recipeModel!.imageURL }}
        style={{
          height: "94%",
          aspectRatio: 1.75,
        }}
      />
      <Card.Title style={{ flex: 1 }} titleStyle={{ alignSelf: "center" }} title={title} />
    </Card>
  );
}
