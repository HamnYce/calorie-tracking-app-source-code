import {
  createDrawerNavigator,
  DrawerItemList,
  DrawerContentScrollView,
} from "@react-navigation/drawer";
import { ActivityIndicator, Button, Card, useTheme } from "react-native-paper";
import Account from "./personal/Account";
import Profile from "./personal/Profile";
import Home from "./home/Home";
import auth from "@react-native-firebase/auth";
import { View } from "react-native";
import { BodyInfoModel, GoalsType } from "@/src/models/body_info/bodyInfoModel";
import { useEffect, useState } from "react";
import { UserInventoryModel } from "@/src/models/inventory/userInventoryModel";
import DashBoard from "@/src/components/charts/Dashboard";

const Drawer = createDrawerNavigator();

export default function LandingPage() {
  const theme = useTheme();
  const [bodyInfoModel, setBodyInfoModel] = useState<BodyInfoModel>();
  const [accrued, setAccrued] = useState<GoalsType>();

  useEffect(() => {
    BodyInfoModel.bodyInfoRef().onSnapshot(() => {
      BodyInfoModel.load().then((bodyInfoModel) => {
        setBodyInfoModel(bodyInfoModel!);
      });
    });
  }, []);

  useEffect(() => {
    UserInventoryModel.userEntriesRef().onSnapshot(() => {
      UserInventoryModel.load().then((userInventoryModel) => {
        let currentAccrued = { calorie: 0, carb: 0, fat: 0, protein: 0 };
        for (const entry of userInventoryModel.consumed) {
          if (entry.type == "product" || entry.type == "ingredient") {
            const multiplier =
              entry.amount /
              entry.foodModel!.information.amounts[
                entry.foodModel!.information.units.indexOf(entry.unit)
              ];

            currentAccrued.calorie +=
              multiplier * (entry.foodModel!.information.nutrients.get("Calories")?.amount! ?? 0);

            currentAccrued.carb +=
              multiplier *
              (entry.foodModel!.information.nutrients.get("Carbohydrates")?.amount! ?? 0);

            currentAccrued.fat +=
              multiplier * (entry.foodModel!.information.nutrients.get("Fat")?.amount! ?? 0);

            currentAccrued.protein +=
              multiplier * (entry.foodModel!.information.nutrients.get("Protein")?.amount! ?? 0);
          } else {
            // its a recipe
            currentAccrued.calorie += entry.recipeModel!.calories ?? 0;
            currentAccrued.carb += entry.recipeModel!.carbs ?? 0;
            currentAccrued.fat += entry.recipeModel!.fat ?? 0;
            currentAccrued.protein += entry.recipeModel!.protein ?? 0;
          }
        }
        setAccrued(currentAccrued);
      });
    });
  }, []);

  return (
    <Drawer.Navigator
      screenOptions={{
        headerStatusBarHeight: 0,
        headerTitleStyle: { color: theme.colors.primary },
      }}
      drawerContent={(props) => (
        <DrawerContentScrollView
          {...props}
          contentContainerStyle={{
            flex: 1,
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <View style={{ marginTop: -50 }}>
            <Card elevation={0}>
              <Card.Title
                titleNumberOfLines={2}
                titleVariant="labelMedium"
                title={"Signed in with: " + auth().currentUser!.email}
              />
            </Card>
            {accrued && bodyInfoModel ? (
              <DashBoard accrued={accrued} goals={bodyInfoModel.getCalorieFatProteinGoals()} />
            ) : (
              <ActivityIndicator />
            )}

            <DrawerItemList {...props} />
          </View>

          <Button
            icon="logout"
            style={{ alignSelf: "flex-end", marginRight: 10 }}
            onPress={() => auth().signOut()}
          >
            Sign out
          </Button>
        </DrawerContentScrollView>
      )}
    >
      <Drawer.Screen name="Home" component={Home} />
      <Drawer.Screen name="Account" component={Account} />
      <Drawer.Screen name="Profile" component={Profile} />
    </Drawer.Navigator>
  );
}
