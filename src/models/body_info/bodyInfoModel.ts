import firestore from "@react-native-firebase/firestore";
import auth from "@react-native-firebase/auth";
import {
  calculateAMR,
  calculateBMR,
  calculateCarbFatProteinSplit,
} from "@/src/helpers/conversions";
// TODO: move intoleraces and cuisines to their own seperate model
export type GoalsType = {
  calorie: number;
  carb: number;
  fat: number;
  protein: number;
};
export type Gender = "M" | "F";
export type ActivityLevel =
  | "sedentary"
  | "light"
  | "moderate"
  | "very"
  | "extra";
export type Intolerance =
  | "Dairy"
  | "Egg"
  | "Gluten"
  | "Grain"
  | "Peanut"
  | "Seafood"
  | "Sesame"
  | "Shellfish"
  | "Soy"
  | "Sulfite"
  | "Tree Nut"
  | "Wheat";
export type Cuisine =
  | "African"
  | "Asian"
  | "American"
  | "British"
  | "Cajun"
  | "Caribbean"
  | "Chinese"
  | "Eastern European"
  | "European"
  | "French"
  | "German"
  | "Greek"
  | "Indian"
  | "Irish"
  | "Italian"
  | "Japanese"
  | "Jewish"
  | "Korean"
  | "Latin American"
  | "Mediterranean"
  | "Mexican"
  | "Middle Eastern"
  | "Nordic"
  | "Southern"
  | "Spanish"
  | "Thai"
  | "Vietnamese";

export class BodyInfoModel {
  static profilesRef = firestore().collection("profiles");
  static genders = <Gender[]>["M", "F"];
  static activityLevels = <ActivityLevel[]>[
    "sedentary",
    "light",
    "moderate",
    "very",
    "extra",
  ];
  static intolerances = <Intolerance[]>[
    "Dairy",
    "Egg",
    "Gluten",
    "Grain",
    "Peanut",
    "Seafood",
    "Sesame",
    "Shellfish",
    "Soy",
    "Sulfite",
    "Tree Nut",
    "Wheat",
  ];
  static cuisines = <Cuisine[]>[
    "African",
    "Asian",
    "American",
    "British",
    "Cajun",
    "Caribbean",
    "Chinese",
    "Eastern European",
    "European",
    "French",
    "German",
    "Greek",
    "Indian",
    "Irish",
    "Italian",
    "Japanese",
    "Korean",
    "Latin American",
    "Mediterranean",
    "Mexican",
    "Middle Eastern",
    "Nordic",
    "Southern",
    "Spanish",
    "Thai",
    "Vietnamese",
  ];

  height: number;
  weight: number;
  dateOfBirth: Date;
  gender: Gender;
  activityLevel: ActivityLevel;
  intolerances: Intolerance[] = [];
  cuisines: Cuisine[] = [];

  constructor({
    height,
    weight,
    dateOfBirth,
    gender,
    activityLevel,
    intolerances,
    cuisines,
  }: {
    height: number;
    weight: number;
    dateOfBirth: Date;
    gender: Gender;
    activityLevel: ActivityLevel;
    intolerances: Intolerance[];
    cuisines: Cuisine[];
  }) {
    this.height = height;
    this.weight = weight;
    this.dateOfBirth = dateOfBirth;
    this.gender = gender;
    this.activityLevel = activityLevel;
    this.intolerances = intolerances;
    this.cuisines = cuisines;
  }

  async save() {
    BodyInfoModel.bodyInfoRef().set({
      height: this.height,
      weight: this.weight,
      dateOfBirth: this.dateOfBirth,
      gender: this.gender,
      activityLevel: this.activityLevel,
      intolerances: this.intolerances,
      cuisines: this.cuisines,
    });
  }

  async update({
    height,
    weight,
    dateOfBirth,
    gender,
    activityLevel,
    intolerances,
    cuisines,
  }: {
    height?: number;
    weight?: number;
    dateOfBirth: Date;
    gender?: Gender;
    activityLevel?: ActivityLevel;
    intolerances?: Intolerance[];
    cuisines?: Cuisine[];
  }) {
    this.height = height ?? this.height;
    this.weight = weight ?? this.weight;
    this.dateOfBirth = dateOfBirth ?? this.dateOfBirth;
    this.gender = gender ?? this.gender;
    this.activityLevel = activityLevel ?? this.activityLevel;
    this.intolerances = intolerances ?? this.intolerances;
    this.cuisines = cuisines ?? this.cuisines;
    this.save();
  }

  getAge() {
    var diff_ms = Date.now() - this.dateOfBirth.getTime();
    var age_dt = new Date(diff_ms);
    return Math.abs(age_dt.getUTCFullYear() - 1970);
  }

  getCalorieGoal() {
    var bmr = calculateBMR({
      weight: this.weight,
      height: this.height,
      age: this.getAge(),
      gender: this.gender,
    });
    return calculateAMR({ bmr: bmr, activityLevel: this.activityLevel });
  }

  getBmi() {
    return this.weight / (((this.height / 100) * this.height) / 100);
  }

  getCalorieFatProteinGoals() {
    let [carb, fat, protein] = this.getCarbFatProteinGoals();
    return {
      calorie: this.getCalorieGoal(),
      carb: carb,
      fat: fat,
      protein: protein,
    };
  }

  getCarbFatProteinGoals() {
    return calculateCarbFatProteinSplit({ amr: this.getCalorieGoal() });
  }

  static async load() {
    var querySnapshot = await BodyInfoModel.bodyInfoRef().get();
    var data = querySnapshot.data()!;
    return new BodyInfoModel({
      height: data["height"] + 0.0,
      weight: data["weight"] + 0.0,
      dateOfBirth: data["dateOfBirth"].toDate(),
      gender: data["gender"],
      activityLevel: data["activityLevel"],
      intolerances: data["intolerances"],
      cuisines: data["cuisines"],
    });
  }

  static async saveDefault() {
    const defaultDate = new Date()
    defaultDate.setFullYear(defaultDate.getFullYear() - 13)
    var bodyInfo = new BodyInfoModel({
      height: 160,
      weight: 60,
      dateOfBirth: defaultDate,
      gender: BodyInfoModel.genders[0],
      activityLevel: BodyInfoModel.activityLevels[0],
      intolerances: [],
      cuisines: [],
    });
    await bodyInfo.save();
    return bodyInfo;
  }

  static bodyInfoRef() {
    return BodyInfoModel.profilesRef
      .doc(auth().currentUser!.email!)
      .collection("bodyInfo")
      .doc("info");
  }
}
