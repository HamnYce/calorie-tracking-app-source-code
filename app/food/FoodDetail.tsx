import { FoodModel, FoodType } from "@/src/models/food/foodModel";
import { View } from "react-native";
import { Appbar, ActivityIndicator, PaperProvider } from "react-native-paper";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { UserInventoryModel } from "@/src/models/inventory/userInventoryModel";
import { theme } from "@/src/constants/theme/theme";
import FoodDetailContent, { DisplayType } from "@/src/components/food/FoodDetailContent";
import _ from "radash";

// TODO: make rows smaller (IMPORTant)
export default function FoodDetail() {
  const params = useLocalSearchParams<{
    foodId: string;
    foodType: FoodType;
    initialAmount: string;
    initialFoodUnit: string;
    display: DisplayType;
    consumedDate: string;
  }>();
  const showDeleteButon = params.display == "consumed" || params.display == "inventory";
  const [foodModel, setFoodModel] = useState<FoodModel>();

  useEffect(() => {
    FoodModel.load({ id: parseInt(params.foodId), type: params.foodType }).then((model) => {
      setFoodModel(model);
    });
  }, []);

  return (
    <PaperProvider theme={theme}>
      <View style={{ flex: 1, flexDirection: "column", padding: 15 }}>
        <Appbar.Header statusBarHeight={0}>
          <Appbar.BackAction onPress={() => router.back()} />
          <Appbar.Content title={foodModel && _.capitalize(foodModel.name)} />
          {showDeleteButon && (
            <Appbar.Action
              icon="delete"
              onPress={() => {
                if (params.display == "inventory") {
                  UserInventoryModel.removeEntry({
                    id: foodModel!.id,
                    type: foodModel!.type,
                  });
                } else if (params.display == "consumed") {
                  UserInventoryModel.removeConsumed({
                    id: parseInt(params.foodId),
                    type: params.foodType,
                    consumedDate: new Date(params.consumedDate),
                  });
                }
                router.back();
              }}
            />
          )}
        </Appbar.Header>
        {foodModel ? (
          <FoodDetailContent
            foodModel={foodModel!}
            initialAmount={parseFloat(params.initialAmount) || foodModel!.information.amounts[0]}
            initialFoodUnit={params.initialFoodUnit || foodModel!.information.units[0]}
            display={params.display}
          />
        ) : (
          <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
            <ActivityIndicator />
          </View>
        )}
      </View>
    </PaperProvider>
  );
}
