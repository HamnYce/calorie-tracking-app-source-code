import { FoodInformationModel } from "./foodInformationModel";
import { PartialFoodModel } from "./partialFoodModel";
import firestore, { FirebaseFirestoreTypes } from "@react-native-firebase/firestore";

export type FoodType = "product" | "ingredient";

export class FoodModel {
  id: number;
  name: string;
  imageName: string;
  imageType: string;
  type: FoodType;
  information: FoodInformationModel;
  imageUri: string;

  static foodDoc = firestore().collection("spoonacular").doc("food");

  constructor({
    id,
    type,
    name,
    imageType,
    imageName,
    information,
  }: {
    id: number;
    type: FoodType;
    name: string;
    imageType: string;
    imageName: string;
    information: FoodInformationModel;
  }) {
    this.id = id;
    this.type = type;
    this.name = name;
    this.imageType = imageType;
    this.imageName = imageName;
    this.information = information;
    if (type == "product") {
      this.imageUri = `https://spoonacular.com/productImages/${id}-90x90.${imageType}`;
    } else if (type == "ingredient") {
      this.imageUri = `https://spoonacular.com/cdn/ingredients_100x100/${imageName}.${imageType}`;
    } else {
      throw "Invalid type";
    }
  }

  static fromPartial({
    partialFoodModel,
    information,
  }: {
    partialFoodModel: PartialFoodModel;
    information: FoodInformationModel;
  }) {
    return new FoodModel({
      id: partialFoodModel.id,
      type: partialFoodModel.type,
      name: partialFoodModel.name,
      imageType: partialFoodModel.imageType,
      imageName: partialFoodModel.imageName,
      information: information,
    });
  }

  static async load({ id, type }: { id: number; type: FoodType }) {
    var foodRef = FoodModel.foodDoc.collection(type).doc(`${id}`);
    var docSnapshot = await foodRef.get();
    var information = await FoodInformationModel.load(id, type);
    return FoodModel.parseDoc(id, type, docSnapshot, information);
  }

  toPartial() {
    return new PartialFoodModel({
      id: this.id,
      type: this.type,
      name: this.name,
      imageType: this.imageType,
      imageName: this.imageName,
    });
  }

  async save() {
    FoodModel.foodDoc.collection(this.type).doc(`${this.id}`).set({
      name: this.name,
      type: this.type,
      imageType: this.imageType,
      imageName: this.imageName,
    });
  }

  static parseDoc(
    id: number,
    type: FoodType,
    doc: FirebaseFirestoreTypes.DocumentSnapshot<FirebaseFirestoreTypes.DocumentData>,
    information: FoodInformationModel,
  ) {
    var data = doc.data();
    return new FoodModel({
      id: id,
      type: type,
      name: data!["name"],
      imageType: data!["imageType"],
      imageName: data!["imageName"],
      information: information,
    });
  }

  static ingredientRef() {
    return FoodModel.foodDoc.collection("ingredient");
  }

  static productRef() {
    return FoodModel.foodDoc.collection("product");
  }
}
