import { PartialFoodModel } from "@/src/models/food/partialFoodModel";
import { Image } from "react-native";
import { Card } from "react-native-paper";
import { router } from "expo-router";
import { IngredientAPI } from "@/src/apis/spoonacular/ingredientAPI";
import { ProductAPI } from "@/src/apis/spoonacular/productAPI";
import { useState } from "react";

type PartialFoodTileProps = {
  partialFoodModel: PartialFoodModel;
};

export default function PartialFoodTile({ partialFoodModel }: PartialFoodTileProps) {
  const [disabled, setDisabled] = useState(false);
  return (
    <Card
      disabled={disabled}
      onPress={() => {
        const api = partialFoodModel.type === "product" ? ProductAPI : IngredientAPI;

        setDisabled(true);
        api.getInformation({ partialFoodModel: partialFoodModel }).then((productModel) => {
          router.push({
            pathname: "/food/FoodDetail",
            params: {
              foodId: productModel.id,
              foodType: productModel.type,
              display: "search"
            },
          });
          setDisabled(false)
        });
      }}
    >
      <Card.Title
        title={partialFoodModel.name.charAt(0).toUpperCase() + partialFoodModel.name.slice(1)}
        titleStyle={{ marginLeft: 10 }}
        left={() => (
          <Image
            source={{ uri: partialFoodModel.imageUri }}
            style={{ width: 56, aspectRatio: 1 }}
          />
        )}
      />
    </Card>
  );
}
