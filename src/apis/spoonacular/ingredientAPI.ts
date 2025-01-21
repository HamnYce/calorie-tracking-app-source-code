import { PartialFoodModel } from "@/src/models/food/partialFoodModel";
import { SpoonacularAPI } from "./spoonacular";
import { FoodInformationModel, NutrientInfo } from "@/src/models/food/foodInformationModel";
import { FoodModel } from "@/src/models/food/foodModel";

export class IngredientAPI {
  static pathSegs = ["food", "ingredients"];

  static async search({ query, amount }: { query: string; amount: number }) {
    var limit = `${amount}`;

    var uri = await SpoonacularAPI.constructUri([...IngredientAPI.pathSegs, "search"], {
      query: query,
      number: limit,
    });

    var res = await fetch(uri);
    // if (res.status != 200) {
    //   console.log(`Ingredient search api return status ${res.status}: ${res.statusText}`);
    //   console.log("ripping from firebase");
    //   const foodModels = await PartialFoodModel.loadUpTo50Ingredients();
    //   return foodModels.slice(amount)
    // }
    var json = await res.json();

    var ingredients: any[] = json["results"];

    var partialFoodModels: PartialFoodModel[] = ingredients.map((ingredient) => {
      var image: string = ingredient["image"];
      var indexOfDot = image.indexOf(".");
      var imageName = image.substring(0, image.indexOf("."));
      var imageType = image.substring(indexOfDot + 1);

      var partialFoodModel = new PartialFoodModel({
        id: ingredient["id"],
        type: "ingredient",
        name: ingredient["name"],
        imageType: imageType,
        imageName: imageName,
      });

      partialFoodModel.save();

      return partialFoodModel;
    });

    return partialFoodModels;
  }

  static async getInformation({ partialFoodModel }: { partialFoodModel: PartialFoodModel }) {
    if (await FoodInformationModel.exists(partialFoodModel.id, partialFoodModel.type)) {
      var foodInfo = await FoodInformationModel.load(partialFoodModel.id, partialFoodModel.type);
      return FoodModel.fromPartial({
        partialFoodModel: partialFoodModel,
        information: foodInfo!,
      });
    }

    var uri = await SpoonacularAPI.constructUri(
      [...IngredientAPI.pathSegs, `${partialFoodModel.id}`, "information"],
      { amount: "1", unit: "g" },
    );

    var res = await fetch(uri);
    var json = await res.json();
    var nutrientsJson: any[] = json["nutrition"]["nutrients"];
    var sourceAmount: number = json["amount"];
    var sourceUnit: string = json["unit"];
    var targetUnits: string[] = [];
    for (const unit of json["possibleUnits"]) {
      targetUnits.push(unit);
    }

    var nutrients: Map<string, NutrientInfo> = new Map<string, NutrientInfo>();

    nutrientsJson.forEach((nutrient) => {
      nutrients.set(
        nutrient["name"],
        new NutrientInfo({ amount: nutrient["amount"], unit: nutrient["unit"] }),
      );
    });

    var amounts = [sourceAmount];
    var units = [sourceUnit];

    var conversions = await IngredientAPI.getAllUnitConversions({
      name: partialFoodModel.name,
      sourceAmount: sourceAmount,
      sourceUnit: sourceUnit,
      targetUnits: targetUnits,
    });

    var foodInformation = new FoodInformationModel({
      id: partialFoodModel.id,
      type: partialFoodModel.type,
      amounts: amounts.concat(...conversions.values()),
      units: units.concat(...conversions.keys()),
      nutrients: nutrients,
    });

    foodInformation.save();

    return FoodModel.fromPartial({
      partialFoodModel: partialFoodModel,
      information: foodInformation,
    });
  }

  static async getAllUnitConversions({
    name,
    sourceAmount,
    sourceUnit,
    targetUnits,
  }: {
    name: string;
    sourceAmount: number;
    sourceUnit: string;
    targetUnits: string[];
  }) {
    var conversions: Map<string, number> = new Map<string, number>();
    for (const targetUnit of targetUnits) {
      if (sourceUnit == targetUnit) {
        continue;
      }
      var uri = await SpoonacularAPI.constructUri(["recipes", "convert"], {
        sourceAmount: sourceAmount.toString(),
        sourceUnit: sourceUnit.toString(),
        targetUnit: targetUnit,
        ingredientName: name,
      });

      var res = await fetch(uri);
      if (!res.ok) {
        continue;
      }

      var json = await res.json();
      conversions.set(targetUnit, json["targetAmount"] + 0.01);

      await new Promise((r) => setTimeout(r, 1500));
    }
    return conversions;
  }
}
