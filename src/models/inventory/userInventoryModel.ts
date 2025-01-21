import { FoodModel } from "../food/foodModel";
import firestore, { FirebaseFirestoreTypes } from "@react-native-firebase/firestore";
import auth from "@react-native-firebase/auth";
import { RecipeModel } from "../recipe/recipeModel";
import { Consumer } from "react-native-paper/lib/typescript/core/settings";
import { ColorSpace } from "react-native-reanimated";

export class InventoryEntry {
  food: FoodModel;
  amount: number;
  unit: string;

  constructor({ food, amount, unit }: { food: FoodModel; amount: number; unit: string }) {
    this.food = food;
    this.amount = amount;
    this.unit = unit;
  }
}

export class ConsumedEntry {
  type: "ingredient" | "product" | "recipe";
  foodModel: FoodModel | null;
  recipeModel: RecipeModel | null;
  amount: number;
  unit: string;
  date: Date;

  constructor({
    consumedType: type,
    foodModel,
    recipeModel,
    amount,
    unit,
    date,
  }: {
    consumedType: "ingredient" | "product" | "recipe";
    foodModel: FoodModel | null;
    recipeModel: RecipeModel | null;
    amount: number;
    unit: string;
    date: Date;
  }) {
    this.type = type;
    this.foodModel = foodModel;
    this.recipeModel = recipeModel;
    this.amount = amount;
    this.unit = unit;
    this.date = date;
  }
}

export class UserInventoryModel {
  inventory: InventoryEntry[];
  static inventoryRef = firestore().collection("inventory");
  consumed: ConsumedEntry[];

  constructor({ inventory, consumed }: { inventory: InventoryEntry[]; consumed: ConsumedEntry[] }) {
    this.inventory = inventory;
    this.consumed = consumed;
  }

  static async load() {
    var inventory: InventoryEntry[] = [];
    var querySnapshot = await UserInventoryModel.userEntriesRef().get();
    for (const doc of querySnapshot.docs) {
      var data = doc.data();
      var food = await FoodModel.load({ id: data["id"], type: data["type"] });
      inventory.push(
        new InventoryEntry({
          food: food,
          amount: data["amount"],
          unit: data["unit"],
        }),
      );
    }

    var consumed: ConsumedEntry[] = [];
    querySnapshot = await UserInventoryModel.consumedEntriesRef().orderBy("date").get();
    const now = Date.now() / 1000;
    for (const doc of querySnapshot.docs) {
      var data = doc.data();
      if (Math.abs(data["date"].toDate().getTime() / 1000 - now) > 84000) {
        continue;
      }
      consumed.push(
        new ConsumedEntry({
          consumedType: data["type"],
          foodModel:
            data["type"] != "recipe"
              ? await FoodModel.load({ id: data["id"], type: data["type"] })
              : null,
          recipeModel: data["type"] == "recipe" ? await RecipeModel.load(data["id"]) : null,
          amount: data["amount"],
          unit: data["unit"],
          date: data["date"].toDate(),
        }),
      );
    }
    return new UserInventoryModel({ inventory: inventory, consumed: consumed });
  }

  static async setEntry(entry: InventoryEntry) {
    UserInventoryModel.userEntriesRef().doc(`${entry.food.id}${entry.food.type}`).set({
      id: entry.food.id,
      type: entry.food.type,
      amount: entry.amount,
      unit: entry.unit,
    });
  }

  static async removeEntry({ id, type }: { id: number; type: string }) {
    UserInventoryModel.userEntriesRef().doc(`${id}${type}`).delete();
  }

  static async updateEntry(entry: InventoryEntry) {
    var entryRef = UserInventoryModel.userEntriesRef()
      .where("id", "==", entry.food.id)
      .where("type", "==", entry.food.type);

    var entryRefSnapShots = await entryRef.get();

    entryRefSnapShots.docs.forEach((doc) => {
      doc.ref.update({
        id: entry.food.id,
        type: entry.food.type,
        amount: entry.amount,
        unit: entry.unit,
      });
    });
  }

  static async addConsumed(consumedEntry: ConsumedEntry) {
    consumedEntry.date.setMilliseconds(0);
    UserInventoryModel.consumedEntriesRef().add({
      id: consumedEntry.foodModel?.id ?? consumedEntry.recipeModel?.id,
      type: consumedEntry.type,
      amount: consumedEntry.amount,
      unit: consumedEntry.unit,
      date: consumedEntry.date,
    });
  }

  static async removeConsumed({
    id,
    type,
    consumedDate,
  }: {
    id: number;
    type: string;
    consumedDate: Date;
  }) {
    const consumed = await UserInventoryModel.consumedEntriesRef()
      .where("id", "==", id)
      .where("type", "==", type)
      .where("date", "==", consumedDate)
      .get();
    await Promise.all(consumed.docs.map(async (doc) => await doc.ref.delete()));
  }

  static userEntriesRef() {
    return UserInventoryModel.inventoryRef.doc(auth().currentUser!.email!).collection("entries");
  }

  static consumedEntriesRef() {
    return UserInventoryModel.inventoryRef.doc(auth().currentUser!.email!).collection("consumed");
  }
}
