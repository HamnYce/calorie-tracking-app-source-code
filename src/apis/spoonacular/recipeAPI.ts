import firestore from "@react-native-firebase/firestore";
import { SpoonacularAPI } from "./spoonacular";
import { DishType, RecipeModel } from "@/src/models/recipe/recipeModel";

type RecipeSearchParameters = {
  includeIngredients: string[];
  amount: number;
  type: DishType;
};

export class RecipeAPI {
  static pathSegs = ["recipes", "complexSearch"];
  static recipesRef = firestore().collection("spoonacular").doc("recipes").collection("recipes");

  static async search({
    includeIngredients,
    type,
    amount,
  }: RecipeSearchParameters): Promise<RecipeModel[]> {
    var uri = await SpoonacularAPI.constructUri(RecipeAPI.pathSegs, {
      includeIngredients: includeIngredients.join(","),
      type: type,
      number: amount.toString(),
      sort: "random",
      ignorePantry: "true",
      fillIngredients: "true",
      instructionsRequired: "true",
      addRecipeInformation: "true",
      addRecipeNutrition: "true",
    });

    var recipeModels: RecipeModel[] = [];
    return recipeModels;
    var attempts = 0;
    do {
      if (attempts++) {
        uri.searchParams.delete("sort")
        uri.searchParams.delete("includeIngredients")
      }
      var res = await fetch(uri);
      console.log(res.status)
      if (res.status != 200) continue;
      var json = await res.json();
      var results: any[] = json["results"];

      recipeModels = results.map((result) => {
        var id: string = result["id"];
        var title: string = result["title"];
        var imageURL: string = result["image"];
        var types: string[] = result["dishTypes"];
        var cuisines: string[] = result["cuisines"];
        var instructions: string[] = result["analyzedInstructions"][0]["steps"].map(
          (step: any) => step["number"] + ":" + step["step"],
        );

        var nutrients = result["nutrition"]["nutrients"];
        var calories = nutrients.find((obj: any) => obj["name"] == "Calories")["amount"];
        var carbs = nutrients.find((obj: any) => obj["name"] == "Carbohydrates")["amount"];
        var protein = nutrients.find((obj: any) => obj["name"] == "Protein")["amount"];
        var fat = nutrients.find((obj: any) => obj["name"] == "Fat")["amount"];

        var recipeModel = new RecipeModel({
          id: parseInt(id),
          title: title,
          imageURL: imageURL,
          types: types,
          instructions: instructions,
          cuisines: cuisines,
          intolerances: uri.searchParams.get("intolerances")?.split(",") ?? [""],
          calories: calories,
          carbs: carbs,
          protein: protein,
          fat: fat,
        });
        recipeModel.save();
        return recipeModel;
      });
    } while (!recipeModels.length && attempts < 2);

    return recipeModels;
  }
}
