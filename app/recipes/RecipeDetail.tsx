import { RecipeModel } from "@/src/models/recipe/recipeModel";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { Button, Appbar, Card, DataTable, PaperProvider, Text, Icon } from "react-native-paper";
import { theme } from "@/src/constants/theme/theme";
import { View, ScrollView } from "react-native";
import _ from "radash";
import { ConsumedEntry, UserInventoryModel } from "@/src/models/inventory/userInventoryModel";

export default function RecipeDetail() {
  const params = useLocalSearchParams<{
    recipeID: string;
    isConsumed: string;
    consumedDate: string;
    caloriesLeft: string;
    carbsLeft: string;
    fatLeft: string;
    proteinLeft: string;
  }>();
  const [recipeModel, setRecipeModel] = useState<RecipeModel>();

  useEffect(() => {
    RecipeModel.load(parseInt(params.recipeID)).then((recipeModel) => setRecipeModel(recipeModel));
  }, []);

  return (
    <PaperProvider theme={theme}>
      <View style={{ flex: 1, flexDirection: "column", padding: 0 }}>
        <Appbar.Header statusBarHeight={0}>
          <Appbar.BackAction onPress={() => router.back()} />
          <View style={{ flex: 1 }} />
          {params.isConsumed === "true" && (
            <Appbar.Action
              icon="delete"
              onPress={() => {
                UserInventoryModel.removeConsumed({
                  id: parseInt(params.recipeID),
                  type: "recipe",
                  consumedDate: new Date(params.consumedDate),
                });
                router.back();
              }}
            />
          )}
        </Appbar.Header>
        <ScrollView style={{ flex: 1, flexDirection: "column", padding: 0 }}>
          {recipeModel && (
            <RecipeDetailContent
              recipeModel={recipeModel}
              isConsumed={!!params.isConsumed}
              caloriesLeft={parseInt(params.caloriesLeft) ?? 0}
              carbsLeft={parseInt(params.carbsLeft) ?? 0}
              fatLeft={parseInt(params.fatLeft) ?? 0}
              proteinLeft={parseInt(params.proteinLeft) ?? 0}
            />
          )}
        </ScrollView>
      </View>
    </PaperProvider>
  );
}

function RecipeDetailContent({
  recipeModel,
  isConsumed,
  caloriesLeft,
  carbsLeft,
  fatLeft,
  proteinLeft,
}: {
  recipeModel: RecipeModel;
  isConsumed: boolean;
  caloriesLeft: number;
  carbsLeft: number;
  fatLeft: number;
  proteinLeft: number;
}) {
  const nutrientNames = ["Calories (kcal)", "Carbohydrates (g)", "Protein (g)", "Fat (g)"];
  const nutrientValues = [
    recipeModel.calories,
    recipeModel.carbs,
    recipeModel.protein,
    recipeModel.fat,
  ];

  const amountsLeft = [caloriesLeft, carbsLeft, fatLeft, proteinLeft];
  const danger = nutrientValues.map((nutrientValue, i) => nutrientValue > amountsLeft[i]);

  return (
    <Card style={{ backgroundColor: "#fff", flex: 1 }}>
      <Card.Title
        title={recipeModel.title}
        titleVariant="titleMedium"
        titleStyle={{ alignSelf: "center" }}
      />
      <Card.Cover source={{ uri: recipeModel.imageURL }} style={{ borderRadius: 0 }} />
      <DataTable>
        {_.list(3).map((i) => (
          <DataTable.Row key={i}>
            <DataTable.Title>{nutrientNames[i]}</DataTable.Title>
            <DataTable.Cell textStyle={{ color: danger[i] ? "red" : "green" }}>
              {nutrientValues[i] ?? 0}{" "}
              {danger[i] && (
                <Icon source={"exclamation-thick"} size={20} color={danger[i] ? "red" : "green"} />
              )}
            </DataTable.Cell>
          </DataTable.Row>
        ))}
      </DataTable>

      <Card.Content>
        {recipeModel.instructions.map((instruction, i) => {
          return (
            <Text key={i} style={{ marginTop: 10, shadowOpacity: 0 }}>
              {instruction.split(":").join(") ")}
            </Text>
          );
        })}
        {!isConsumed && (
          <Button
            mode="contained"
            style={{ alignSelf: "center", margin: 10 }}
            onPress={() => {
              UserInventoryModel.addConsumed(
                new ConsumedEntry({
                  consumedType: "recipe",
                  foodModel: null,
                  recipeModel: recipeModel,
                  amount: 1,
                  unit: "g",
                  date: new Date(),
                }),
              );
              alert("Recipe Added");
            }}
          >
            Consume
          </Button>
        )}
      </Card.Content>
    </Card>
  );
}
