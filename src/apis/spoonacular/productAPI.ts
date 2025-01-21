import firestore from "@react-native-firebase/firestore";
import { SpoonacularAPI } from "./spoonacular";
import { PartialFoodModel } from "@/src/models/food/partialFoodModel";
import { FoodInformationModel, NutrientInfo } from "@/src/models/food/foodInformationModel";
import { FoodModel } from "@/src/models/food/foodModel";

export class ProductAPI {
  static pathSegs = ["food", "products"];
  static productsRef = firestore().collection("spoonacular").doc("foods").collection("products");

  static async search({ query, amount }: { query: string; amount: number }) {
    var limit = `${amount}`;
    var uri = await SpoonacularAPI.constructUri([...ProductAPI.pathSegs, "search"], {
      query: query,
      number: limit,
    });

    var res = await fetch(uri);
    // if (res.status != 200) {
    //   console.log(`Product search api return status ${res.status}: ${res.statusText}`);
    //   console.log("ripping from firebase");
    //   const foodModels = await PartialFoodModel.loadUpTo50Products();
    //   return foodModels.slice(amount)
    // }
    var json = await res.json();
    var products: any[] = json["products"];

    var parsedProducts: PartialFoodModel[] = products.map((product) => {
      var partialFoodModel = new PartialFoodModel({
        id: product["id"],
        type: "product",
        name: product["title"],
        imageType: product["imageType"],
        imageName: "",
      });

      partialFoodModel.save();
      return partialFoodModel;
    });

    return parsedProducts;
  }

  static async searchByUPC({ upc }: { upc: string }) {
    var uri = await SpoonacularAPI.constructUri([...ProductAPI.pathSegs ,"upc", upc], {});
    var res = await fetch(uri);
    if (res.status != 200) {
      console.log('failed upc scan, error: ', res.statusText)
    }
    console.log(res.body)
    var product = await res.json();

    var nutrientsJson: any[] = product["nutrition"]["nutrients"];
    var nutrients: Map<string, NutrientInfo> = new Map<string, NutrientInfo>();

    nutrientsJson.forEach((nutrient) => {
      nutrients.set(
        nutrient["name"],
        new NutrientInfo({ amount: nutrient["amount"], unit: nutrient["unit"] }),
      );
    });

    var foodInformation = new FoodInformationModel({
      id: product["id"],
      type: "product",
      amounts: [1],
      units: ["piece"],
      nutrients: nutrients,
    });

    foodInformation.save();

    var foodmodel = new FoodModel({
      id: product["id"],
      type: "product",
      name: product["title"],
      imageType: product["imageType"],
      imageName: "",
      information: foodInformation,
    });

    foodmodel.save();

    return foodmodel;
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
      [...ProductAPI.pathSegs, `${partialFoodModel.id}`],
      {},
    );

    var res = await fetch(uri);
    var json = await res.json();
    var nutrientsJson: any[] = json["nutrition"]["nutrients"];
    var nutrients: Map<string, NutrientInfo> = new Map<string, NutrientInfo>();

    nutrientsJson.forEach((nutrient) => {
      nutrients.set(
        nutrient["name"],
        new NutrientInfo({ amount: nutrient["amount"], unit: nutrient["unit"] }),
      );
    });

    var foodInformation = new FoodInformationModel({
      id: partialFoodModel.id,
      type: partialFoodModel.type,
      amounts: [1],
      units: ["piece"],
      nutrients: nutrients,
    });

    foodInformation.save();

    return FoodModel.fromPartial({
      partialFoodModel: partialFoodModel,
      information: foodInformation,
    });
  }
}
