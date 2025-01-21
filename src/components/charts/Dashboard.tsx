import { ProgressBar, Text, useTheme } from "react-native-paper";
import { View } from "react-native";
import { GoalsType } from "@/src/models/body_info/bodyInfoModel";
import GoalsPieChart from "@/src/components/charts/GoalsPieChart";
import { nutrientColors } from "@/src/constants/Colors";

export default function DashBoard({ accrued, goals }: { accrued: GoalsType; goals: GoalsType }) {
  return (
    <View
      style={{
        padding: 10,
        width: "100%",
        borderRadius: 10,
      }}
    >
      <View style={{ flexDirection: "row" }}>
        <View style={{ alignSelf: "center" }}>
          <GoalsPieChart accrued={accrued} goals={goals} />
        </View>
        <View style={{ margin: 10 }} />
        <View style={{ width: "100%", flex: 1 }}>
          <GoalProgressBar
            name="Carbs"
            accrued={accrued.carb}
            goal={goals.carb}
            barColor={nutrientColors.carbs}
          />
          <View style={{ margin: 5 }} />
          <GoalProgressBar
            name="Fat"
            accrued={accrued.fat}
            goal={goals.fat}
            barColor={nutrientColors.fat}
          />
          <View style={{ margin: 5 }} />
          <GoalProgressBar
            name="Protein"
            accrued={accrued.protein}
            goal={goals.protein}
            barColor={nutrientColors.protein}
          />
        </View>
      </View>
      <View style={{ margin: 5 }} />
      <View>
        <GoalProgressBar
          name="Calories"
          accrued={accrued.calorie}
          goal={goals.calorie}
          barColor={nutrientColors.calories}
        />
      </View>
    </View>
  );
}

function GoalProgressBar({
  name,
  accrued,
  goal,
  barColor: color,
}: {
  name: string;
  accrued: number;
  goal: number;
  barColor: string;
}) {
  const theme = useTheme();
  const progress = isNaN(accrued / goal) ? 0 : accrued / goal;
  const textColor = progress > 1 ? theme.colors.error : undefined;

  return (
    <View style={{ flexDirection: "column", width: "100%" }}>
      <View style={{ justifyContent: "space-between", flexDirection: "row" }}>
        <Text variant="bodySmall">{name}</Text>
        <Text variant="bodySmall" style={{ color: textColor }}>
          {accrued.toFixed(1)} / {goal.toFixed(1)} {name == "Calories" ? "kcal" : "g"}
        </Text>
      </View>
      <ProgressBar
        style={{ height: 20, borderRadius: 50, width: "100%" }}
        progress={progress}
        color={color}
      />
    </View>
  );
}
