import firestore from "@react-native-firebase/firestore";
import { FoodModel, FoodType } from "./foodModel";

type PartialFoodModelConstructor = {
  id: number;
  type: FoodType;
  name: string;
  imageType: string;
  imageName: string;
};

export class PartialFoodModel {
  id: number;
  name: string;
  imageName: string;
  imageType: string;
  type: FoodType;
  imageUri: string;

  static foodDoc = firestore().collection("spoonacular").doc("food");

  constructor({ id, type, name, imageType, imageName }: PartialFoodModelConstructor) {
    this.id = id;
    this.type = type;
    this.name = name;
    this.imageType = imageType;
    this.imageName = imageName;

    if (type === "product") {
      this.imageUri = `https://spoonacular.com/productImages/${id}-90x90.${imageType}`;
    } else if (type === "ingredient") {
      this.imageUri = `https://spoonacular.com/cdn/ingredients_100x100/${imageName}.${imageType}`;
    } else {
      throw new Error("food is of unknown type");
    }
  }

  static async load({ id, type }: { id: number; type: FoodType }) {
    const doc = await PartialFoodModel.foodDoc.collection(`${type}`).doc(`${id}`).get();
    const data = doc.data()!;
    return new PartialFoodModel({
      id: id,
      type: type,
      imageType: data.imageType,
      imageName: data.imageName,
      name: data.name,
    });
  }

  static async loadUpTo50Ingredients() {
    const type = "ingredient";
    var querySnapshot = await PartialFoodModel.foodDoc.collection(type).get();
    const foodModels = await Promise.all(
      querySnapshot.docs.map(async (doc) => {
        const id = parseInt(doc.id);
        return await PartialFoodModel.load({id: id, type: type})
      }),
    );
    return foodModels
  }

  static async loadUpTo50Products() {
    const type = "product";
    var docs = await PartialFoodModel.foodDoc.collection(type).get();
    return await Promise.all(
      docs.docs.map(async (doc) => {
        const id = parseInt(doc.id);
        return PartialFoodModel.load({id, type });
      }),
    );
  }

  save() {
    const info = PartialFoodModel.foodDoc
      .collection(`${this.type}`)
      .doc(`${this.id}`)
      .set({
        name: this.name,
        type: this.type,
        imageType: this.imageType,
        imageName: this.imageName,
      })
      .then(() => {
        console.log("Document written with ID: ", this.id, "and info", info);
      })
      .catch((error) => {
        console.error("Error adding document: ", error);
      });
  }
}
