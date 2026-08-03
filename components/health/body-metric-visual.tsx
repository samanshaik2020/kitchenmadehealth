import type { Goal, Sex } from "@/lib/health-calculators";
import { cn } from "@/lib/utils";

type BodyMetricVisualProps =
  | {
      variant: "bmi";
      bmi: number;
    }
  | {
      variant: "calories";
      sex: Sex;
      bmi: number;
      calories: number;
      goal: Goal;
      proteinCalories: number;
      carbohydrateCalories: number;
      fatCalories: number;
    }
  | {
      variant: "body-fat";
      sex: Sex;
      bodyFat: number;
    }
  | {
      variant: "water";
      litres: number;
      glasses: number;
    }
  | {
      variant: "weight";
      lowKg: number;
      midpointKg: number;
      highKg: number;
    };

const palette = {
  cream: "#f6f2e9",
  sage: "#9dad82",
  terracotta: "#c9623f",
  sky: "#76c9dd",
  gold: "#e6bd62",
  ink: "#10261d",
};

export function BodyMetricVisual(props: BodyMetricVisualProps) {
  return (
    <figure className="overflow-hidden rounded-[1.35rem] border border-white/12 bg-white/[.045] shadow-[inset_0_1px_rgba(255,255,255,.04)]">
      <div className="flex items-center justify-between px-4 pt-3.5">
        <p className="text-[8px] font-bold uppercase tracking-[.2em] text-white/42">
          Body visual
        </p>
        <div className="flex items-center gap-1.5 text-[8px] font-bold uppercase tracking-[.14em] text-sage">
          <span className="size-1.5 rounded-full bg-sage shadow-[0_0_0_3px_rgba(157,173,130,.12)]" />
          Live
        </div>
      </div>

      {props.variant === "bmi" && <BmiVisual bmi={props.bmi} />}
      {props.variant === "calories" && <CalorieVisual {...props} />}
      {props.variant === "body-fat" && <BodyFatVisual {...props} />}
      {props.variant === "water" && <WaterVisual {...props} />}
      {props.variant === "weight" && <WeightRangeVisual {...props} />}
    </figure>
  );
}

function VisualCanvas({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 300 216"
      role="img"
      aria-label={label}
      className={cn("mt-1 block aspect-[300/216] w-full", className)}
    >
      <g aria-hidden="true">
        <circle cx="150" cy="101" r="80" fill="none" stroke="white" strokeOpacity=".055" />
        <circle cx="150" cy="101" r="58" fill="none" stroke="white" strokeOpacity=".045" />
        <path d="M28 197H272" stroke="white" strokeOpacity=".1" />
      </g>
      {children}
    </svg>
  );
}

function HumanShape({
  fill = "none",
  stroke = "none",
  strokeWidth = 1.5,
  sex = "male",
}: {
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  sex?: Sex;
}) {
  const torso =
    sex === "female"
      ? "M-8 50C-22 52-31 62-33 77L-39 121C-40 129-36 134-30 132L-22 93C-21 108-20 119-25 133L-20 153-17 185C-16 195-7 196-5 187L0 142 5 187C7 196 16 195 17 185L20 153 25 133C20 119 21 108 22 93L30 132C36 134 40 129 39 121L33 77C31 62 22 52 8 50L0 56Z"
      : "M-9 50C-26 52-34 63-36 78L-42 123C-43 131-38 136-32 133L-24 93-21 128-18 185C-18 195-7 197-5 187L0 138 5 187C7 197 18 195 18 185L21 128 24 93 32 133C38 136 43 131 42 123L36 78C34 63 26 52 9 50L0 56Z";

  return (
    <>
      <circle cx="0" cy="29" r="15.5" fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
      <path d={torso} fill={fill} stroke={stroke} strokeLinejoin="round" strokeWidth={strokeWidth} />
    </>
  );
}

function Person({
  id,
  x,
  scaleX = 1,
  scaleY = 1,
  sex = "male",
  fill = palette.cream,
  fillOpacity = 1,
  stroke = "none",
  strokeOpacity = 1,
  children,
}: {
  id: string;
  x: number;
  scaleX?: number;
  scaleY?: number;
  sex?: Sex;
  fill?: string;
  fillOpacity?: number;
  stroke?: string;
  strokeOpacity?: number;
  children?: React.ReactNode;
}) {
  return (
    <g transform={`translate(${x} 5)`}>
      <g
        style={{
          transform: `scale(${scaleX}, ${scaleY})`,
          transformOrigin: "0px 101px",
          transition: "transform 420ms cubic-bezier(.2,.75,.25,1)",
        }}
      >
        <defs>
          <clipPath id={id}>
            <HumanShape sex={sex} fill="white" />
          </clipPath>
        </defs>
        <g opacity={fillOpacity}>
          <HumanShape sex={sex} fill={fill} />
        </g>
        {children && <g clipPath={`url(#${id})`}>{children}</g>}
        {stroke !== "none" && (
          <g opacity={strokeOpacity}>
            <HumanShape sex={sex} stroke={stroke} />
          </g>
        )}
      </g>
    </g>
  );
}

function bmiWidth(bmi: number) {
  const bounded = Math.max(14, Math.min(45, bmi));
  return 0.72 + ((bounded - 14) / 31) * 0.9;
}

function BmiVisual({ bmi }: { bmi: number }) {
  const userScale = bmiWidth(bmi);
  const referenceScale = bmiWidth(22);

  return (
    <>
      <VisualCanvas
        label={`A reference BMI figure beside your BMI figure. Your figure changes width with your BMI of ${bmi.toFixed(1)}.`}
      >
        <path d="M150 17V196" stroke="white" strokeDasharray="3 7" strokeOpacity=".09" />
        <text x="78" y="22" textAnchor="middle" fill="white" fillOpacity=".38" fontSize="8" fontWeight="700" letterSpacing="1.4">
          REFERENCE
        </text>
        <text x="222" y="22" textAnchor="middle" fill={palette.sage} fontSize="8" fontWeight="700" letterSpacing="1.4">
          YOUR BMI
        </text>
        <Person
          id="bmi-reference-person"
          x={78}
          scaleX={referenceScale}
          scaleY={0.86}
          fill={palette.cream}
          fillOpacity={0.28}
          stroke={palette.cream}
          strokeOpacity={0.38}
        />
        <Person
          id="bmi-user-person"
          x={222}
          scaleX={userScale}
          scaleY={0.86}
          fill={palette.sage}
          stroke={palette.cream}
          strokeOpacity={0.38}
        />
      </VisualCanvas>
      <figcaption className="grid grid-cols-2 border-t border-white/10 text-center">
        <VisualValue label="Reference" value="BMI 22.0" />
        <VisualValue label="Your result" value={`BMI ${bmi.toFixed(1)}`} featured />
      </figcaption>
    </>
  );
}

function CalorieVisual({
  sex,
  bmi,
  calories,
  goal,
  proteinCalories,
  carbohydrateCalories,
  fatCalories,
}: Extract<BodyMetricVisualProps, { variant: "calories" }>) {
  const total = Math.max(1, proteinCalories + carbohydrateCalories + fatCalories);
  const proteinHeight = (proteinCalories / total) * 160;
  const carbohydrateHeight = (carbohydrateCalories / total) * 160;
  const fatHeight = (fatCalories / total) * 160;
  const bottom = 197;
  const goalLabel = goal === "lose" ? "Loss plan" : goal === "gain" ? "Gain plan" : "Maintenance";

  return (
    <>
      <VisualCanvas label={`A person filled with the macro proportions in your ${calories.toFixed(0)} calorie ${goalLabel.toLowerCase()}.`}>
        <path d="M53 64C33 88 35 132 55 152" fill="none" stroke={palette.terracotta} strokeLinecap="round" strokeOpacity=".55" />
        <path d="M247 64C267 88 265 132 245 152" fill="none" stroke={palette.sage} strokeLinecap="round" strokeOpacity=".55" />
        <Person
          id="calorie-macro-person"
          x={150}
          sex={sex}
          scaleX={Math.max(0.82, Math.min(1.2, bmiWidth(bmi) * 0.94))}
          scaleY={0.92}
          fill={palette.cream}
          fillOpacity={0.08}
          stroke={palette.cream}
          strokeOpacity={0.55}
        >
          <rect x="-55" y={bottom - fatHeight} width="110" height={fatHeight} fill={palette.gold} />
          <rect
            x="-55"
            y={bottom - fatHeight - carbohydrateHeight}
            width="110"
            height={carbohydrateHeight}
            fill={palette.sage}
          />
          <rect
            x="-55"
            y={bottom - fatHeight - carbohydrateHeight - proteinHeight}
            width="110"
            height={proteinHeight}
            fill={palette.terracotta}
          />
        </Person>
        <circle cx="58" cy="55" r="3" fill={palette.terracotta} />
        <circle cx="242" cy="55" r="3" fill={palette.sage} />
      </VisualCanvas>
      <figcaption className="grid grid-cols-3 border-t border-white/10 text-center">
        <LegendValue label="Protein" color={palette.terracotta} />
        <LegendValue label="Carbs" color={palette.sage} />
        <LegendValue label="Fat" color={palette.gold} />
      </figcaption>
    </>
  );
}

function BodyFatVisual({
  sex,
  bodyFat,
}: Extract<BodyMetricVisualProps, { variant: "body-fat" }>) {
  const outerScale = 0.82 + (Math.max(2, Math.min(55, bodyFat)) / 55) * 0.52;
  const leanScale = sex === "female" ? 0.72 : 0.78;

  return (
    <>
      <VisualCanvas label={`A layered person showing an estimated ${bodyFat.toFixed(1)} percent body fat around lean mass.`}>
        <path d="M64 106H236" stroke={palette.terracotta} strokeDasharray="2 6" strokeOpacity=".28" />
        <Person
          id="body-fat-outer-person"
          x={150}
          sex={sex}
          scaleX={outerScale}
          scaleY={0.92}
          fill={palette.terracotta}
          fillOpacity={0.78}
          stroke={palette.cream}
          strokeOpacity={0.4}
        />
        <Person
          id="body-fat-lean-person"
          x={150}
          sex={sex}
          scaleX={leanScale}
          scaleY={0.88}
          fill={palette.cream}
          fillOpacity={0.88}
        />
        <path d="M217 56h21" stroke={palette.terracotta} strokeOpacity=".75" />
        <text x="242" y="59" fill="white" fillOpacity=".5" fontSize="8" fontWeight="700" letterSpacing="1">
          FAT
        </text>
        <path d="M205 128h33" stroke={palette.cream} strokeOpacity=".55" />
        <text x="242" y="131" fill="white" fillOpacity=".5" fontSize="8" fontWeight="700" letterSpacing="1">
          LEAN
        </text>
      </VisualCanvas>
      <figcaption className="grid grid-cols-2 border-t border-white/10 text-center">
        <LegendValue label="Lean tissue" color={palette.cream} />
        <LegendValue label="Fat estimate" color={palette.terracotta} />
      </figcaption>
    </>
  );
}

function WaterVisual({
  litres,
  glasses,
}: Extract<BodyMetricVisualProps, { variant: "water" }>) {
  const fillRatio = Math.max(0.28, Math.min(0.88, litres / 5.5));
  const fillTop = 197 - fillRatio * 168;

  return (
    <>
      <VisualCanvas label={`A person filled with water to illustrate your daily guide of ${litres.toFixed(1)} litres, about ${glasses} glasses.`}>
        <path d="M63 62C44 80 42 112 56 130" fill="none" stroke={palette.sky} strokeLinecap="round" strokeOpacity=".45" />
        <path d="M237 62C256 80 258 112 244 130" fill="none" stroke={palette.sky} strokeLinecap="round" strokeOpacity=".45" />
        <Person
          id="water-person"
          x={150}
          scaleX={0.94}
          scaleY={0.92}
          fill={palette.cream}
          fillOpacity={0.08}
          stroke={palette.cream}
          strokeOpacity={0.5}
        >
          <rect x="-50" y={fillTop} width="100" height={197 - fillTop} fill={palette.sky} opacity=".92" />
          <path
            d={`M-50 ${fillTop + 1}C-30 ${fillTop - 6}-15 ${fillTop + 8} 3 ${fillTop + 1}S33 ${fillTop - 5} 50 ${fillTop + 1}`}
            fill="none"
            stroke={palette.cream}
            strokeOpacity=".75"
            strokeWidth="2"
          />
        </Person>
        <path d="M224 71C224 71 214 83 214 91a10 10 0 0 0 20 0c0-8-10-20-10-20Z" fill={palette.sky} opacity=".8" />
        <path d="M244 111C244 111 238 119 238 124a6 6 0 0 0 12 0c0-5-6-13-6-13Z" fill={palette.sky} opacity=".45" />
      </VisualCanvas>
      <figcaption className="border-t border-white/10 px-4 py-3 text-center">
        <p className="text-[8px] font-bold uppercase tracking-[.15em] text-white/38">Daily visual guide</p>
        <p className="mt-1 text-xs font-bold tabular-nums text-sky-200">
          {litres.toFixed(1)} L · about {glasses} glasses
        </p>
      </figcaption>
    </>
  );
}

function WeightRangeVisual({
  lowKg,
  midpointKg,
  highKg,
}: Extract<BodyMetricVisualProps, { variant: "weight" }>) {
  return (
    <>
      <VisualCanvas label={`Three people illustrating the reference weight range from ${lowKg.toFixed(1)} to ${highKg.toFixed(1)} kilograms, with a midpoint of ${midpointKg.toFixed(1)} kilograms.`}>
        <path d="M54 44V188M246 44V188" stroke={palette.sage} strokeDasharray="2 6" strokeOpacity=".3" />
        <Person
          id="weight-low-person"
          x={73}
          scaleX={bmiWidth(18.5) * 0.76}
          scaleY={0.77}
          fill={palette.cream}
          fillOpacity={0.12}
          stroke={palette.cream}
          strokeOpacity={0.34}
        />
        <Person
          id="weight-mid-person"
          x={150}
          scaleX={bmiWidth(21.7) * 0.86}
          scaleY={0.9}
          fill={palette.sage}
          stroke={palette.cream}
          strokeOpacity={0.34}
        />
        <Person
          id="weight-high-person"
          x={227}
          scaleX={bmiWidth(24.9) * 0.76}
          scaleY={0.77}
          fill={palette.terracotta}
          fillOpacity={0.4}
          stroke={palette.cream}
          strokeOpacity={0.34}
        />
      </VisualCanvas>
      <figcaption className="grid grid-cols-3 border-t border-white/10 text-center">
        <VisualValue label="Lower" value={`${lowKg.toFixed(1)} kg`} />
        <VisualValue label="Midpoint" value={`${midpointKg.toFixed(1)} kg`} featured />
        <VisualValue label="Upper" value={`${highKg.toFixed(1)} kg`} />
      </figcaption>
    </>
  );
}

function VisualValue({
  label,
  value,
  featured = false,
}: {
  label: string;
  value: string;
  featured?: boolean;
}) {
  return (
    <div className="px-2 py-3">
      <p className="text-[7px] font-bold uppercase tracking-[.14em] text-white/34">{label}</p>
      <p className={cn("mt-1 text-[10px] font-bold tabular-nums text-white/65", featured && "text-sage")}>
        {value}
      </p>
    </div>
  );
}

function LegendValue({ label, color }: { label: string; color: string }) {
  return (
    <div className="flex items-center justify-center gap-1.5 px-1 py-3 text-[8px] font-bold uppercase tracking-[.1em] text-white/52">
      <span className="size-1.5 rounded-full" style={{ backgroundColor: color }} />
      {label}
    </div>
  );
}
