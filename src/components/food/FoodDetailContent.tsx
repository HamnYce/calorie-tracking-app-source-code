import { FoodModel } from "@/src/models/food/foodModel";
import { ScrollView, View } from "react-native";
import { Button, Avatar, Modal } from "react-native-paper";
import { router } from "expo-router";
import { useState } from "react";
import {
  ConsumedEntry,
  InventoryEntry,
  UserInventoryModel,
} from "@/src/models/inventory/userInventoryModel";
import { Picker } from "@react-native-picker/picker";
import NutrientTable from "@/src/components/charts/NutrientTable";

export type DisplayType = "inventory" | "search" | "consumed";
export default function FoodDetailContent({
  foodModel,
  initialAmount: initialFoodAmount,
  initialFoodUnit,
  display,
}: {
  foodModel: FoodModel;
  initialAmount: number;
  initialFoodUnit: string;
  display: DisplayType;
}) {
  const [foodAmount, setFoodAmount] = useState(initialFoodAmount);
  const [foodUnit, setFoodUnit] = useState(initialFoodUnit);

  return (
    <ScrollView style={{ flex: 1, flexDirection: "column" }}>
      <Avatar.Image
        size={140}
        source={{ uri: foodModel.imageUri }}
        style={{ alignSelf: "center" }}
      />
      <NutrientTable
        nutrients={foodModel.information.nutrients}
        nutrientUnitMultiplier={
          foodAmount / foodModel.information.amounts[foodModel.information.units.indexOf(foodUnit)]
        }
      />

      <View style={{ flex: 1, flexDirection: "row" }}>
        <Picker style={{ flex: 1 }} selectedValue={foodAmount} onValueChange={setFoodAmount}>
          {display == "consumed"
            ? [
                <Picker.Item
                  key={initialFoodAmount}
                  label={initialFoodAmount.toString()}
                  value={initialFoodAmount}
                />,
              ]
            : [...Array(100).keys()].map((i) => (
                <Picker.Item key={i} label={"" + (i + 1)} value={1 + i} />
              ))}
        </Picker>

        <Picker style={{ flex: 1 }} selectedValue={foodUnit} onValueChange={setFoodUnit}>
          {display == "consumed"
            ? [
                <Picker.Item
                  key={initialFoodUnit}
                  label={initialFoodUnit}
                  value={initialFoodUnit}
                />,
              ]
            : foodModel.information.units.map((unit) => (
                <Picker.Item key={unit} label={unit} value={unit} />
              ))}
        </Picker>
      </View>

      {display != "consumed" && (
        <View
          style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-evenly" }}
        >
          <Button
            mode="contained"
            style={{
              alignSelf: "center",
              margin: 10,
            }}
            onPress={() => {
              UserInventoryModel.setEntry(
                new InventoryEntry({
                  food: foodModel,
                  amount: foodAmount,
                  unit: foodUnit,
                }),
              );
              router.back();
            }}
          >
            {display == "search" ? "Add To Inventory" : "Save Changes"}
          </Button>
          {display == "inventory" && (
            <Button
              mode="contained"
              style={{ alignSelf: "center", margin: 10 }}
              onPress={() => {
                UserInventoryModel.addConsumed(
                  new ConsumedEntry({
                    consumedType: foodModel.type,
                    foodModel: foodModel,
                    recipeModel: null,
                    amount: foodAmount,
                    unit: foodUnit,
                    date: new Date(),
                  }),
                );
                const gramsHave =
                  initialFoodAmount /
                  foodModel.information.amounts[
                    foodModel.information.units.indexOf(initialFoodUnit)
                  ];

                const gramsConsumed =
                  foodAmount /
                  foodModel.information.amounts[foodModel.information.units.indexOf(foodUnit)];

                const gramsDiff = gramsHave - gramsConsumed;

                if (gramsDiff <= 0) {
                  UserInventoryModel.removeEntry({
                    id: foodModel.id,
                    type: foodModel.type,
                  });
                } else {
                  UserInventoryModel.setEntry(
                    new InventoryEntry({
                      food: foodModel,
                      amount:
                        gramsDiff *
                        foodModel.information.amounts[
                          foodModel.information.units.indexOf(initialFoodUnit)
                        ],
                      unit: initialFoodUnit,
                    }),
                  );
                }
                router.back();
              }}
            >
              Consume
            </Button>
          )}
        </View>
      )}
    </ScrollView>
  );
}
