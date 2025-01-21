import { PieChart } from "react-native-gifted-charts";
import { GoalsType } from "@/src/models/body_info/bodyInfoModel";
import { nutrientColors } from "@/src/constants/Colors";

export default function GoalsPieChart({
  accrued,
  goals,
}: {
  accrued: GoalsType;
  goals: GoalsType;
}) {
  const data = [
    { value: accrued.calorie / goals.calorie, color: nutrientColors.calories },
    { value: accrued.carb / goals.carb, color: nutrientColors.carbs },
    { value: accrued.fat / goals.fat, color: nutrientColors.fat },
    { value: accrued.protein / goals.protein, color: nutrientColors.protein },
  ];
  return <PieChart data={data} radius={45} />;
}
