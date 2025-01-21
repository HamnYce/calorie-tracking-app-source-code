import firestore from "@react-native-firebase/firestore";

export class NutrientInfo {
  amount: number;
  unit: string;

  constructor({ amount, unit }: { amount: number; unit: string }) {
    this.amount = amount;
    this.unit = unit;
  }

  toString() {
    return `${this.amount}${this.unit}`;
  }
}

export class FoodInformationModel {
  nutrients: Map<string, NutrientInfo>;
  id: number;
  type: string;
  amounts: number[];
  units: string[];

  static foodDoc = firestore().collection("spoonacular").doc("food");

  constructor({
    id,
    type,
    nutrients,
    amounts,
    units,
  }: {
    id: number;
    type: string;
    nutrients: Map<string, NutrientInfo>;
    amounts: number[];
    units: string[];
  }) {
    this.id = id;
    this.type = type;
    this.nutrients = nutrients;
    this.amounts = amounts;
    this.units = units;
  }

  static async load(id: number, type: string) {
    const nutrientQuerySnapshot = await FoodInformationModel.nutrientsRef(id, type).get();

    const metaQuerySnapshot = await FoodInformationModel.metaRef(id, type).get();
    const metaData = metaQuerySnapshot.data()!;

    var amounts: number[] = [];
    for (const amount of metaData["amounts"]) {
      amounts.push(parseFloat(amount));
    }

    var units: string[] = [];
    for (const unit of metaData["units"]) {
      units.push(unit);
    }

    var docs = nutrientQuerySnapshot.docs;

    var nutrients: Map<string, NutrientInfo> = new Map<string, NutrientInfo>();

    for (const doc of docs) {
      var data = doc.data();
      nutrients.set(data["name"], new NutrientInfo({ amount: data["amount"], unit: data["unit"] }));
    }

    return new FoodInformationModel({
      id: id,
      type: type,
      amounts: amounts,
      units: units,
      nutrients: nutrients,
    });
  }

  async save() {
    FoodInformationModel.metaRef(this.id, this.type).set({
      amounts: this.amounts,
      units: this.units,
    });
    for (const entry of this.nutrients.entries()) {
      FoodInformationModel.nutrientsRef(this.id, this.type).add({
        name: entry[0],
        amount: entry[1].amount,
        unit: entry[1].unit,
      });
    }
  }

  static async exists(id: number, type: string) {
    var informationRef = FoodInformationModel.foodDoc
      .collection(type)
      .doc(`${id}`)
      .collection("information");
    var doc = await informationRef.get();
    return doc.docs.length > 0;
  }

  static metaRef(id: number, type: string) {
    return FoodInformationModel.foodDoc
      .collection(type)
      .doc(`${id}`)
      .collection("information")
      .doc("meta");
  }

  static nutrientsRef(id: number, type: string) {
    return FoodInformationModel.foodDoc
      .collection(type)
      .doc(`${id}`)
      .collection("information")
      .doc("nutrients")
      .collection("entries");
  }
}
