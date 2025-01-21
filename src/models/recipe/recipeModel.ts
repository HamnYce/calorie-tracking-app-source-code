import firestore, { FirebaseFirestoreTypes } from "@react-native-firebase/firestore";

export type DishType = "breakfast" | "main course" | "snack" | "side dish" | "salad";

type RecipeModelType = {
  id: number;
  title: string;
  imageURL: string;
  types: string[];
  cuisines: string[];
  intolerances: string[];
  instructions: string[];
  calories: number;
  carbs: number;
  protein: number;
  fat: number;
};

export class RecipeModel {
  id: number;
  title: string;
  imageURL: string;
  types: string[];
  cuisines: string[];
  intolerances: string[];
  instructions: string[];
  calories: number;
  carbs: number;
  protein: number;
  fat: number;

  static recipesCollection = firestore()
    .collection("spoonacular")
    .doc("recipes")
    .collection("recipes");

  constructor({
    id,
    title,
    imageURL,
    types,
    cuisines,
    intolerances,
    instructions,
    calories,
    carbs,
    protein,
    fat,
  }: RecipeModelType) {
    this.id = id;
    this.title = title;
    this.imageURL = imageURL;
    this.types = types;
    this.cuisines = cuisines;
    this.intolerances = intolerances;
    this.instructions = instructions;
    this.calories = calories;
    this.carbs = carbs;
    this.protein = protein;
    this.fat = fat;
  }

  static async load(id: number) {
    var recipeRef = RecipeModel.recipesCollection.doc(id.toString());
    var docSnapshot = await recipeRef.get();
    var data = docSnapshot.data();
    return RecipeModel.parseDocData(parseInt(docSnapshot.id), data!);
  }

  static async loadUpTo50Recipes() {
    const recipeRefs = await RecipeModel.recipesCollection.limit(50).get();
    return recipeRefs.docs.map((doc) => RecipeModel.parseDocData(parseInt(doc.id), doc.data()));
  }

  async save() {
    RecipeModel.recipesCollection.doc(this.id.toString()).set({
      title: this.title,
      imageURL: this.imageURL,
      types: this.types,
      cuisines: this.cuisines,
      intolerances: this.intolerances,
      instructions: this.instructions,
      calories: this.calories,
      carbs: this.carbs,
      protein: this.protein,
      fat: this.fat,
    });
  }

  static async loadRecipesOfType(type: DishType): Promise<RecipeModel[]> {
    var querySnapshot = await RecipeModel.recipesCollection
      .where("types", "array-contains", type)
      .get();

    return await Promise.all(querySnapshot.docs.map((doc) => RecipeModel.load(parseInt(doc.id))));
  }

  static parseDocData(id: number, data: FirebaseFirestoreTypes.DocumentData) {
    return new RecipeModel({
      id: id,
      title: data!["title"],
      imageURL: data!["imageURL"],
      types: data!["types"],
      cuisines: data!["cuisines"],
      intolerances: data!["intolerances"],
      instructions: data!["instructions"],
      calories: data!["calories"],
      carbs: data!["carbs"],
      protein: data!["protein"],
      fat: data!["fat"],
    });
  }
}
