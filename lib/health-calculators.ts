export type Sex = "male" | "female";
export type Goal = "lose" | "maintain" | "gain";
export type Pace = "gradual" | "moderate" | "faster";

export const ACTIVITY_LEVELS = [
  {
    value: 1.2,
    label: "Sedentary",
    detail: "Mostly seated; little planned exercise",
  },
  {
    value: 1.375,
    label: "Lightly active",
    detail: "Light exercise 1–3 days each week",
  },
  {
    value: 1.55,
    label: "Moderately active",
    detail: "Moderate exercise 3–5 days each week",
  },
  {
    value: 1.725,
    label: "Very active",
    detail: "Hard exercise 6–7 days each week",
  },
  {
    value: 1.9,
    label: "Extra active",
    detail: "Hard training plus a physical job",
  },
] as const;

const DEFICIT_BY_PACE: Record<Pace, number> = {
  gradual: 250,
  moderate: 500,
  faster: 750,
};

const SURPLUS_BY_PACE: Record<Pace, number> = {
  gradual: 250,
  moderate: 350,
  faster: 500,
};

const PROTEIN_PER_KG: Record<Goal, number> = {
  lose: 2,
  maintain: 1.6,
  gain: 1.8,
};

export function calculateBmi(heightCm: number, weightKg: number) {
  const heightM = heightCm / 100;
  const bmi = weightKg / heightM ** 2;

  return {
    bmi,
    healthyLowKg: 18.5 * heightM ** 2,
    healthyHighKg: 24.9 * heightM ** 2,
  };
}

export function getBmiCategory(bmi: number) {
  if (bmi < 18.5) return { label: "Underweight", tone: "blue" as const };
  if (bmi < 25) return { label: "Healthy range", tone: "green" as const };
  if (bmi < 30) return { label: "Overweight", tone: "gold" as const };
  return { label: "Obesity range", tone: "red" as const };
}

export function calculateCalories(input: {
  sex: Sex;
  age: number;
  heightCm: number;
  weightKg: number;
  activity: number;
  goal: Goal;
  pace: Pace;
}) {
  const { sex, age, heightCm, weightKg, activity, goal, pace } = input;
  const rmr =
    10 * weightKg +
    6.25 * heightCm -
    5 * age +
    (sex === "male" ? 5 : -161);
  const maintenance = rmr * activity;

  let calculatedTarget = maintenance;
  if (goal === "lose") calculatedTarget -= DEFICIT_BY_PACE[pace];
  if (goal === "gain") calculatedTarget += SURPLUS_BY_PACE[pace];

  const displayFloor = sex === "male" ? 1500 : 1200;
  const target = Math.max(displayFloor, calculatedTarget);
  const wasFloored = calculatedTarget < displayFloor;

  const desiredProteinG = weightKg * PROTEIN_PER_KG[goal];
  const proteinG = Math.min(desiredProteinG, (target * 0.4) / 4);
  const proteinKcal = proteinG * 4;
  const fatKcal = target * 0.25;
  const fatG = fatKcal / 9;
  const carbKcal = Math.max(0, target - proteinKcal - fatKcal);
  const carbsG = carbKcal / 4;

  return {
    rmr,
    maintenance,
    calculatedTarget,
    target,
    wasFloored,
    displayFloor,
    proteinG,
    proteinKcal,
    carbsG,
    carbKcal,
    fatG,
    fatKcal,
  };
}

export function calculateBodyFat(input: {
  sex: Sex;
  heightCm: number;
  weightKg: number;
  neckCm: number;
  waistCm: number;
  hipCm: number;
}) {
  const { sex, heightCm, weightKg, neckCm, waistCm, hipCm } = input;
  const circumference =
    sex === "male" ? waistCm - neckCm : waistCm + hipCm - neckCm;

  if (circumference <= 0) return null;

  const bodyFat =
    sex === "male"
      ? 495 /
          (1.0324 -
            0.19077 * Math.log10(circumference) +
            0.15456 * Math.log10(heightCm)) -
        450
      : 495 /
          (1.29579 -
            0.35004 * Math.log10(circumference) +
            0.221 * Math.log10(heightCm)) -
        450;

  if (!Number.isFinite(bodyFat)) return null;

  const boundedBodyFat = Math.min(60, Math.max(2, bodyFat));
  const fatMassKg = (weightKg * boundedBodyFat) / 100;

  return {
    bodyFat: boundedBodyFat,
    fatMassKg,
    leanMassKg: weightKg - fatMassKg,
    waistToHeight: waistCm / heightCm,
  };
}

export function getBodyFatCategory(sex: Sex, bodyFat: number) {
  const thresholds =
    sex === "male" ? [6, 14, 18, 25] : [14, 21, 25, 32];

  if (bodyFat < thresholds[0])
    return { label: "Essential range", tone: "blue" as const };
  if (bodyFat < thresholds[1])
    return { label: "Athletic range", tone: "green" as const };
  if (bodyFat < thresholds[2])
    return { label: "Fitness range", tone: "green" as const };
  if (bodyFat < thresholds[3])
    return { label: "Average range", tone: "gold" as const };
  return { label: "Above average", tone: "red" as const };
}

export function calculateWater(
  weightKg: number,
  exerciseMinutes: number,
  hotClimate: boolean,
) {
  const baseLitres = (weightKg * 35) / 1000;
  const exerciseLitres = (exerciseMinutes / 30) * 0.35;
  const climateLitres = hotClimate ? 0.5 : 0;
  const totalLitres = baseLitres + exerciseLitres + climateLitres;

  return {
    baseLitres,
    exerciseLitres,
    climateLitres,
    totalLitres,
    glasses: Math.round(totalLitres / 0.25),
  };
}

export function calculateHealthyWeight(heightCm: number) {
  const heightM = heightCm / 100;
  const lowKg = 18.5 * heightM ** 2;
  const highKg = 24.9 * heightM ** 2;

  return {
    lowKg,
    highKg,
    midpointKg: (lowKg + highKg) / 2,
  };
}

export function isInRange(value: number, min: number, max: number) {
  return Number.isFinite(value) && value >= min && value <= max;
}

export function formatNumber(value: number, digits = 0) {
  return value.toLocaleString("en-US", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

const GOAL_CODES: Record<Goal, number> = {
  lose: 0,
  maintain: 1,
  gain: 2,
};
const GOALS_FROM_CODE: Goal[] = ["lose", "maintain", "gain"];
const ACTIVITY_VALUES = ACTIVITY_LEVELS.map((level) => level.value);

export type SavedCaloriePlan = {
  sex: Sex;
  age: number;
  heightCm: number;
  weightKg: number;
  activity: number;
  goal: Goal;
  pace: Pace;
};

export function encodeCaloriePlan(plan: SavedCaloriePlan) {
  const sexDigit = plan.sex === "male" ? 0 : 1;
  const age = Math.min(99, Math.max(20, Math.round(plan.age)));
  const height = Math.min(250, Math.max(120, Math.round(plan.heightCm)));
  const weightX2 = Math.min(
    600,
    Math.max(70, Math.round(plan.weightKg * 2)),
  );
  const activityIndex =
    ACTIVITY_VALUES.findIndex((value) => value === plan.activity) + 1;
  const paceIndex = ["gradual", "moderate", "faster"].indexOf(plan.pace);

  const decimal = [
    sexDigit,
    String(age).padStart(2, "0"),
    String(height).padStart(3, "0"),
    String(weightX2).padStart(3, "0"),
    activityIndex,
    GOAL_CODES[plan.goal],
    paceIndex,
  ].join("");

  const encoded = Number.parseInt(decimal, 10)
    .toString(36)
    .toUpperCase()
    .padStart(8, "0");

  return `KMH-${encoded.slice(0, 4)}-${encoded.slice(4, 8)}`;
}

export function decodeCaloriePlan(code: string): SavedCaloriePlan | null {
  const cleaned = code.trim().toUpperCase().replace(/^KMH-?/, "").replaceAll("-", "");
  if (!/^[A-Z0-9]{8}$/.test(cleaned)) return null;

  const decimalValue = Number.parseInt(cleaned, 36);
  if (!Number.isFinite(decimalValue)) return null;
  const decimal = String(decimalValue).padStart(12, "0");
  if (decimal.length !== 12) return null;

  const sexDigit = Number.parseInt(decimal[0], 10);
  const age = Number.parseInt(decimal.slice(1, 3), 10);
  const heightCm = Number.parseInt(decimal.slice(3, 6), 10);
  const weightX2 = Number.parseInt(decimal.slice(6, 9), 10);
  const activityIndex = Number.parseInt(decimal[9], 10);
  const goalIndex = Number.parseInt(decimal[10], 10);
  const paceIndex = Number.parseInt(decimal[11], 10);

  const activity = ACTIVITY_VALUES[activityIndex - 1];
  const goal = GOALS_FROM_CODE[goalIndex];
  const pace = (["gradual", "moderate", "faster"] as Pace[])[paceIndex];

  if (
    (sexDigit !== 0 && sexDigit !== 1) ||
    !isInRange(age, 20, 99) ||
    !isInRange(heightCm, 120, 250) ||
    !isInRange(weightX2, 70, 600) ||
    activity === undefined ||
    goal === undefined ||
    pace === undefined
  ) {
    return null;
  }

  return {
    sex: sexDigit === 0 ? "male" : "female",
    age,
    heightCm,
    weightKg: weightX2 / 2,
    activity,
    goal,
    pace,
  };
}
