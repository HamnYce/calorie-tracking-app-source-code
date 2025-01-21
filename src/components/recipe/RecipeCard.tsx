import { RecipeModel } from "@/src/models/recipe/recipeModel";
import { router } from "expo-router";
import { Card, useTheme } from "react-native-paper";

export default function RecipeCard({
  recipe,
  caloriesLeft,
  carbsLeft,
  fatLeft,
  proteinLeft,
}: {
  recipe: RecipeModel;
  caloriesLeft: number;
  carbsLeft: number;
  fatLeft: number;
  proteinLeft: number;
}) {
  var title = recipe.title.slice(0, 25) + (recipe.title.length > 25 ? "..." : "");

  return (
    <Card
      elevation={0}
      style={{
        width: 300,
        height: 200,
        shadowOpacity: 0,
        backgroundColor: "#ffff",
      }}
      contentStyle={{
        backgroundColor: "ffff",
        shadowOpacity: 0,
      }}
      onPress={() => {
        router.push({
          pathname: "/recipes/RecipeDetail",
          params: {
            recipeID: recipe.id,
            caloriesLeft: caloriesLeft,
            carbsLeft: carbsLeft,
            fatLeft: fatLeft,
            proteinLeft: proteinLeft,
          },
        });
      }}
    >
      <Card.Cover
        source={{ uri: recipe.imageURL }}
        style={{
          height: "94%",
          aspectRatio: 1.75,
        }}
      />
      <Card.Title style={{ flex: 1 }} titleStyle={{ alignSelf: "center" }} title={title} />
    </Card>
  );
}
