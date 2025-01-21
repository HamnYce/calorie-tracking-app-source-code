import { RecipeAPI } from "@/src/apis/spoonacular/recipeAPI";
import { UserInventoryModel } from "@/src/models/inventory/userInventoryModel";
import { RecipeModel } from "@/src/models/recipe/recipeModel";
import { useEffect, useState } from "react";
import { View } from "react-native";
import { ScrollView } from "react-native";
import { ActivityIndicator, Text } from "react-native-paper";
import RecipeCard from "@/src/components/recipe/RecipeCard";
import { RefreshControl } from "react-native-gesture-handler";
import { shuffleArray } from "@/src/helpers/utility";
import { BodyInfoModel } from "@/src/models/body_info/bodyInfoModel";
import GoalsPieChart from "@/src/components/charts/GoalsPieChart";

// meal types: "main course" | "side dish" | "breakfast" | "snack" | "salad";
export default function Recipes() {
  const mealTypes: ("breakfast" | "main course" | "snack")[] = [
    "breakfast",
    "main course",
    "snack",
  ]; //, "side dish",  "salad"];
  const [recipes, setRecipes] = useState<{
    [keys: string]: RecipeModel[];
  }>({
    breakfast: [],
    "main course": [],
    snack: [],
  });
  const [userInventory, setUserInventory] = useState<UserInventoryModel>();
  const [recipesLoaded, setRecipesLoaded] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [caloriesLeft, setCaloriesLeft] = useState(0);
  const [carbsLeft, setCarbsLeft] = useState(0);
  const [fatLeft, setFatLeft] = useState(0);
  const [proteinLeft, setProteinLeft] = useState(0);

  useEffect(() => {
    UserInventoryModel.load().then((inv) => {
      BodyInfoModel.load().then((body) => {
        const goals = body.getCalorieFatProteinGoals();

        for (const entry of inv.consumed) {
          if (entry.type == "product" || entry.type == "ingredient") {
            const multiplier =
              entry.amount /
              entry.foodModel!.information.amounts[
                entry.foodModel!.information.units.indexOf(entry.unit)
              ];

            goals.calorie -=
              multiplier * (entry.foodModel!.information.nutrients.get("Calories")?.amount! ?? 0);

            goals.carb -=
              multiplier *
              (entry.foodModel!.information.nutrients.get("Carbohydrates")?.amount! ?? 0);

            goals.fat -=
              multiplier * (entry.foodModel!.information.nutrients.get("Fat")?.amount! ?? 0);

            goals.protein -=
              multiplier * (entry.foodModel!.information.nutrients.get("Protein")?.amount! ?? 0);
          } else {
            // its a recipe
            goals.calorie == entry.recipeModel!.calories ?? 0;
            goals.carb -= entry.recipeModel!.carbs ?? 0;
            goals.fat -= entry.recipeModel!.fat ?? 0;
            goals.protein -= entry.recipeModel!.protein ?? 0;
          }
        }
        setCaloriesLeft(goals.calorie);
        setCarbsLeft(goals.carb);
        setFatLeft(goals.fat);
        setProteinLeft(goals.protein);
      });

      setUserInventory(inv);
    });
  }, []);

  useEffect(() => {
    if (!userInventory || recipesLoaded) return;

    var ingredients = userInventory.inventory.filter((food) => food.food.type == "ingredient");
    var ingredientNames = ingredients.map((food) => food.food.name);
    var updatedRecipes: { [keys: string]: RecipeModel[] } = {
      breakfast: [],
      "main course": [],
      snack: [],
    };
    const usedRecipes = new Set();

    Promise.all(
      mealTypes.map(async (mealType) => {
        var recipes: RecipeModel[] = [];

        await RecipeAPI.search({
          includeIngredients: ingredientNames,
          type: mealType,
          amount: 1,
        });

        return recipes;
      }),
    ).then((recipeModelsList) => {
      for (let i = 0; i < mealTypes.length; i++) {
        const mealType = mealTypes[i];
        const recipeModels = recipeModelsList[i];
        for (const recipeModel of recipeModels) {
          if (usedRecipes.has(recipeModel.id)) continue;
          usedRecipes.add(recipeModel.id);
          updatedRecipes[mealType].push(recipeModel);
        }
      }

      RecipeModel.loadUpTo50Recipes().then((cachedRecipeModels) => {
        for (const recipeModel of shuffleArray(cachedRecipeModels)) {
          for (const mealType of mealTypes) {
            if (
              recipeModel.types.includes(mealType) &&
              updatedRecipes[mealType].length < 5 &&
              !usedRecipes.has(recipeModel.id)
            ) {
              updatedRecipes[mealType].push(recipeModel);
            }
          }
        }

        setRecipes(updatedRecipes);
        setRecipesLoaded(true);
      });
    });
  }, [userInventory]);

  function onRefresh() {
    setRefreshing(true);
    setRecipesLoaded(false);

    UserInventoryModel.load().then((inv) => {
      setUserInventory(inv);
      setRefreshing(false);
    });
  }

  return (
    <ScrollView
      style={{ flex: 1, padding: 15, backgroundColor: "#fff" }}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor="#0000"
          colors={["#0000"]}
        />
      }
    >
      {recipesLoaded ? (
        mealTypes.map((mealType) => {
          return (
            <View key={mealType} style={{ marginTop: 10 }}>
              <Text variant="titleLarge">
                {mealType.charAt(0).toUpperCase() + mealType.slice(1)}
              </Text>
              <View style={{ margin: 10 }} />

              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {recipes[mealType].map((recipeModel) => (
                  <RecipeCard
                    key={mealType + recipeModel.id}
                    recipe={recipeModel}
                    caloriesLeft={caloriesLeft}
                    proteinLeft={proteinLeft}
                    fatLeft={fatLeft}
                    carbsLeft={carbsLeft}
                  />
                ))}
              </ScrollView>
            </View>
          );
        })
      ) : (
        <ActivityIndicator />
      )}
      <View style={{ marginBottom: 60 }} />
    </ScrollView>
  );
}
