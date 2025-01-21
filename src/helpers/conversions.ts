// Step 1: Calculate Your BMR
// For women, BMR = 655.1 + (9.563 x weight in kg) + (1.850 x height in cm) - (4.676 x age in years)
// For men, BMR = 66.47 + (13.75 x weight in kg) + (5.003 x height in cm) - (6.755 x age in years)

export function calculateBMR({
  weight,
  height,
  age,
  gender,
}: {
  weight: number;
  height: number;
  age: number;
  gender: string;
}) {
  if (gender == "female") {
    return 655.1 + 9.563 * weight + 1.85 * height - 4.676 * age;
  } else {
    return 66.47 + 13.75 * weight + 5.003 * height - 6.755 * age;
  }
}

// Step 2: Calculate Your AMR
// Sedentary (little or no exercise): AMR = BMR x 1.2
// Lightly active (exercise 1–3 days/week): AMR = BMR x 1.375
// Moderately active (exercise 3–5 days/week): AMR = BMR x 1.55
// Active (exercise 6–7 days/week): AMR = BMR x 1.725
// Very active (hard exercise 6–7 days/week): AMR = BMR x 1.9
export function calculateAMR({ bmr, activityLevel }: { bmr: number; activityLevel: string }) {
  switch (activityLevel) {
    case "sedentary":
      return bmr * 1.2;
    case "light":
      return bmr * 1.375;
    case "moderate":
      return bmr * 1.55;
    case "very":
      return bmr * 1.725;
    case "extra":
      return bmr * 1.9;
    default:
      return bmr;
  }
}

export function calculateCarbFatProteinSplit({ amr }: { amr: number }) {
  var carbs = (amr * 0.5) / 4;
  var fat = (amr * 0.3) / 9;
  var protein = (amr * 0.2) / 4;
  return [carbs, fat, protein].map((e) => parseFloat(e.toPrecision(1)));
}
