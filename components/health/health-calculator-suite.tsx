"use client";

import {
  AlertTriangle,
  Calculator,
  Check,
  Copy,
  Droplets,
  Flame,
  LockKeyhole,
  Percent,
  Target,
} from "lucide-react";
import {
  type ComponentType,
  type KeyboardEvent,
  type ReactNode,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ACTIVITY_LEVELS,
  calculateBmi,
  calculateBodyFat,
  calculateCalories,
  calculateHealthyWeight,
  calculateWater,
  decodeCaloriePlan,
  encodeCaloriePlan,
  formatNumber,
  getBmiCategory,
  getBodyFatCategory,
  isInRange,
  type Goal,
  type Pace,
  type SavedCaloriePlan,
  type Sex,
} from "@/lib/health-calculators";
import { cn } from "@/lib/utils";
import { BodyMetricVisual } from "@/components/health/body-metric-visual";

type ToolId = "bmi" | "calories" | "body-fat" | "water" | "weight";

const tools: {
  id: ToolId;
  label: string;
  shortLabel: string;
  description: string;
  icon: ComponentType<{ size?: number; strokeWidth?: number }>;
}[] = [
  {
    id: "bmi",
    label: "BMI",
    shortLabel: "BMI",
    description: "Check your adult body mass index and reference range.",
    icon: Calculator,
  },
  {
    id: "calories",
    label: "Calories & macros",
    shortLabel: "Calories",
    description: "Plan calories, protein, carbohydrates, and fat.",
    icon: Flame,
  },
  {
    id: "body-fat",
    label: "Body fat",
    shortLabel: "Body fat",
    description: "Estimate body composition from circumference measurements.",
    icon: Percent,
  },
  {
    id: "water",
    label: "Water",
    shortLabel: "Water",
    description: "Build a practical daily total-water starting point.",
    icon: Droplets,
  },
  {
    id: "weight",
    label: "Weight range",
    shortLabel: "Weight",
    description: "See the adult BMI reference range for your height.",
    icon: Target,
  },
];

const toneStyles = {
  blue: "border-sky-200 bg-sky-50 text-sky-800",
  green: "border-emerald-200 bg-emerald-50 text-emerald-800",
  gold: "border-amber-200 bg-amber-50 text-amber-900",
  red: "border-red-200 bg-red-50 text-red-800",
};

export function HealthCalculatorSuite() {
  const [activeTool, setActiveTool] = useState<ToolId>("bmi");
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);

  function handleTabKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    let nextIndex = index;
    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      nextIndex = (index + 1) % tools.length;
    } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      nextIndex = (index - 1 + tools.length) % tools.length;
    } else if (event.key === "Home") {
      nextIndex = 0;
    } else if (event.key === "End") {
      nextIndex = tools.length - 1;
    } else {
      return;
    }

    event.preventDefault();
    const nextTool = tools[nextIndex];
    setActiveTool(nextTool.id);
    tabRefs.current[nextIndex]?.focus();
  }

  return (
    <section aria-labelledby="calculator-suite-title">
      <h2 id="calculator-suite-title" className="sr-only">
        Health calculator suite
      </h2>

      <div
        className="grid grid-cols-2 gap-2 rounded-[1.6rem] border border-white/10 bg-white/7 p-2 shadow-[0_24px_80px_rgba(0,0,0,.12)] backdrop-blur sm:grid-cols-5"
        role="tablist"
        aria-label="Choose a health calculator"
      >
        {tools.map((tool, index) => {
          const Icon = tool.icon;
          const selected = activeTool === tool.id;

          return (
            <button
              key={tool.id}
              ref={(node) => {
                tabRefs.current[index] = node;
              }}
              id={`tool-tab-${tool.id}`}
              type="button"
              role="tab"
              aria-selected={selected}
              aria-controls={`tool-panel-${tool.id}`}
              tabIndex={selected ? 0 : -1}
              onClick={() => setActiveTool(tool.id)}
              onKeyDown={(event) => handleTabKeyDown(event, index)}
              className={cn(
                "group flex min-h-20 items-center gap-3 rounded-[1.15rem] px-3 text-left outline-none transition focus-visible:ring-2 focus-visible:ring-sage focus-visible:ring-offset-2 focus-visible:ring-offset-ink sm:flex-col sm:justify-center sm:gap-2 sm:text-center",
                tool.id === "weight" && "col-span-2 sm:col-span-1",
                selected
                  ? "bg-cream text-ink shadow-[0_12px_28px_rgba(0,0,0,.16)]"
                  : "text-white/62 hover:bg-white/8 hover:text-white",
              )}
            >
              <Icon size={18} strokeWidth={1.7} />
              <span className="text-[11px] font-bold uppercase tracking-[.1em]">
                <span className="sm:hidden">{tool.shortLabel}</span>
                <span className="hidden sm:inline">{tool.label}</span>
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-4">
        {tools.map((tool) => (
          <div
            key={tool.id}
            id={`tool-panel-${tool.id}`}
            role="tabpanel"
            aria-labelledby={`tool-tab-${tool.id}`}
            hidden={activeTool !== tool.id}
            tabIndex={0}
            className="outline-none"
          >
            {tool.id === "bmi" && <BmiCalculator />}
            {tool.id === "calories" && <CalorieCalculator />}
            {tool.id === "body-fat" && <BodyFatCalculator />}
            {tool.id === "water" && <WaterCalculator />}
            {tool.id === "weight" && <HealthyWeightCalculator />}
          </div>
        ))}
      </div>
    </section>
  );
}

function CalculatorFrame({
  title,
  description,
  inputs,
  children,
}: {
  title: string;
  description: string;
  inputs: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-[2rem] border border-ink/10 bg-paper shadow-[0_28px_90px_rgba(4,22,15,.18)]">
      <div className="grid lg:grid-cols-[.86fr_1.14fr]">
        <div className="bg-[#f0eadf] p-6 sm:p-8 lg:p-10">
          <p className="eyebrow text-terracotta">Your details</p>
          <h3 className="mt-4 font-display text-4xl font-medium tracking-[-.045em] text-ink">
            {title}
          </h3>
          <p className="mt-3 max-w-md text-sm leading-7 text-stone">{description}</p>
          <div className="mt-8">{inputs}</div>
        </div>
        <div className="relative overflow-hidden bg-[#113126] p-6 text-white sm:p-8 lg:p-10">
          <div className="pointer-events-none absolute -right-10 -top-16 size-64 rounded-full border border-white/8" />
          <div className="pointer-events-none absolute -right-2 -top-8 size-40 rounded-full border border-white/8" />
          <div className="relative">{children}</div>
        </div>
      </div>
    </div>
  );
}

function NumberField({
  id,
  label,
  value,
  min,
  max,
  step = 1,
  suffix,
  onChange,
}: {
  id: string;
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  suffix?: string;
  onChange: (value: number) => void;
}) {
  const valid = isInRange(value, min, max);
  const errorId = `${id}-error`;

  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm font-semibold text-ink">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type="number"
          inputMode="decimal"
          value={Number.isFinite(value) ? value : ""}
          min={min}
          max={max}
          step={step}
          aria-invalid={!valid}
          aria-describedby={!valid ? errorId : undefined}
          onChange={(event) => {
            const next = event.target.value;
            onChange(next === "" ? Number.NaN : Number.parseFloat(next));
          }}
          className={cn(
            "min-h-12 w-full rounded-xl border bg-white px-4 py-3 pr-14 text-base font-semibold tabular-nums text-ink outline-none transition focus:ring-2",
            valid
              ? "border-line focus:border-terracotta focus:ring-terracotta/15"
              : "border-red-400 focus:border-red-500 focus:ring-red-200",
          )}
        />
        {suffix && (
          <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-xs font-bold uppercase tracking-[.08em] text-stone">
            {suffix}
          </span>
        )}
      </div>
      {!valid && (
        <p id={errorId} className="mt-1.5 text-xs font-medium text-red-700">
          Enter a value from {min} to {max}.
        </p>
      )}
    </div>
  );
}

function SegmentedControl<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
}) {
  return (
    <fieldset>
      <legend className="mb-2 text-sm font-semibold text-ink">{label}</legend>
      <div className="grid grid-flow-col auto-cols-fr gap-2">
        {options.map((option) => (
          <label key={option.value} className="cursor-pointer">
            <input
              type="radio"
              className="peer sr-only"
              checked={value === option.value}
              onChange={() => onChange(option.value)}
            />
            <span className="flex min-h-12 items-center justify-center rounded-xl border border-line bg-white px-3 text-center text-sm font-semibold text-stone transition peer-checked:border-ink peer-checked:bg-ink peer-checked:text-white peer-focus-visible:ring-2 peer-focus-visible:ring-terracotta peer-focus-visible:ring-offset-2">
              {option.label}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

function ResultBadge({
  tone,
  children,
}: {
  tone: keyof typeof toneStyles;
  children: ReactNode;
}) {
  return (
    <span
      className={cn(
        "mt-5 inline-flex rounded-full border px-3.5 py-1.5 text-xs font-bold",
        toneStyles[tone],
      )}
    >
      {children}
    </span>
  );
}

function ResultHeading({
  label,
  value,
  unit,
  visual,
}: {
  label: string;
  value: string;
  unit: string;
  visual?: ReactNode;
}) {
  return (
    <div
      className={cn(
        visual && "grid items-start gap-6 sm:grid-cols-[minmax(0,1fr)_15rem]",
      )}
    >
      <div aria-live="polite">
        <p className="eyebrow text-sage">{label}</p>
        <p className="mt-4 font-display text-[4.4rem] font-medium leading-none tracking-[-.065em] sm:text-[5.5rem]">
          {value}
        </p>
        <p className="mt-2 text-sm text-white/55">{unit}</p>
      </div>
      {visual && <div className="w-full sm:max-w-60">{visual}</div>}
    </div>
  );
}

function StatGrid({
  stats,
}: {
  stats: { label: string; value: string; featured?: boolean }[];
}) {
  return (
    <div className="mt-7 grid gap-2 sm:grid-cols-3">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className={cn(
            "rounded-2xl border p-4",
            stat.featured
              ? "border-terracotta/50 bg-terracotta/15"
              : "border-white/10 bg-white/5",
          )}
        >
          <p className="text-[9px] font-bold uppercase tracking-[.16em] text-white/45">
            {stat.label}
          </p>
          <p className="mt-2 text-lg font-bold tabular-nums text-white">{stat.value}</p>
        </div>
      ))}
    </div>
  );
}

function ResultNote({ children }: { children: ReactNode }) {
  return (
    <div className="mt-7 border-t border-white/12 pt-6 text-xs leading-6 text-white/55">
      {children}
    </div>
  );
}

function InvalidResult() {
  return (
    <div className="flex min-h-[24rem] flex-col justify-center" aria-live="polite">
      <AlertTriangle className="text-amber-300" size={28} />
      <p className="mt-5 font-display text-3xl">Check your details.</p>
      <p className="mt-3 max-w-md text-sm leading-7 text-white/55">
        One or more values are outside the supported range. Correct the highlighted
        field to see your estimate.
      </p>
    </div>
  );
}

function BmiCalculator() {
  const [height, setHeight] = useState(165);
  const [weight, setWeight] = useState(65);
  const valid = isInRange(height, 120, 250) && isInRange(weight, 25, 350);
  const result = valid ? calculateBmi(height, weight) : null;
  const category = result ? getBmiCategory(result.bmi) : null;
  const marker = result
    ? Math.max(0, Math.min(100, ((result.bmi - 15) / 25) * 100))
    : 0;

  return (
    <CalculatorFrame
      title="Body mass index"
      description="A quick screening estimate for adults aged 20 and over."
      inputs={
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-1">
          <NumberField
            id="bmi-height"
            label="Height"
            value={height}
            min={120}
            max={250}
            suffix="cm"
            onChange={setHeight}
          />
          <NumberField
            id="bmi-weight"
            label="Weight"
            value={weight}
            min={25}
            max={350}
            step={0.1}
            suffix="kg"
            onChange={setWeight}
          />
        </div>
      }
    >
      {result && category ? (
        <>
          <ResultHeading
            label="Your BMI"
            value={formatNumber(result.bmi, 1)}
            visual={<BodyMetricVisual variant="bmi" bmi={result.bmi} />}
            unit="kg/m²"
          />
          <ResultBadge tone={category.tone}>{category.label}</ResultBadge>

          <div className="mt-8">
            <div
              className="relative h-2.5 overflow-hidden rounded-full"
              style={{
                background:
                  "linear-gradient(90deg,#7dd3fc 0 14%,#6ee7b7 14% 40%,#fcd34d 40% 60%,#fca5a5 60% 100%)",
              }}
              aria-hidden="true"
            >
              <span
                className="absolute top-1/2 size-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-white bg-ink shadow"
                style={{ left: `${marker}%` }}
              />
            </div>
            <div className="mt-2 flex justify-between text-[9px] font-bold tabular-nums text-white/38">
              <span>15</span>
              <span>18.5</span>
              <span>25</span>
              <span>30</span>
              <span>40+</span>
            </div>
          </div>

          <StatGrid
            stats={[
              {
                label: "Reference low",
                value: `${formatNumber(result.healthyLowKg, 1)} kg`,
              },
              {
                label: "Your weight",
                value: `${formatNumber(weight, 1)} kg`,
                featured: true,
              },
              {
                label: "Reference high",
                value: `${formatNumber(result.healthyHighKg, 1)} kg`,
              },
            ]}
          />
          <ResultNote>
            BMI is a screening measure, not a diagnosis. It does not account for
            muscle mass, pregnancy, age-related changes, or individual fat
            distribution. Discuss the result in the context of your overall health
            with a qualified clinician.
          </ResultNote>
        </>
      ) : (
        <InvalidResult />
      )}
    </CalculatorFrame>
  );
}

function CalorieCalculator() {
  const [sex, setSex] = useState<Sex>("male");
  const [age, setAge] = useState(30);
  const [height, setHeight] = useState(170);
  const [weight, setWeight] = useState(70);
  const [activity, setActivity] = useState<number>(1.55);
  const [goal, setGoal] = useState<Goal>("lose");
  const [pace, setPace] = useState<Pace>("moderate");
  const [restoreCode, setRestoreCode] = useState("");
  const [restoreMessage, setRestoreMessage] = useState<{
    text: string;
    ok: boolean;
  } | null>(null);
  const [copyState, setCopyState] = useState<"idle" | "copied" | "error">("idle");

  const valid =
    isInRange(age, 20, 99) &&
    isInRange(height, 120, 250) &&
    isInRange(weight, 35, 300) &&
    ACTIVITY_LEVELS.some((level) => level.value === activity);

  const plan: SavedCaloriePlan = {
    sex,
    age,
    heightCm: height,
    weightKg: weight,
    activity,
    goal,
    pace,
  };

  const result = valid ? calculateCalories(plan) : null;
  const saveCode = valid ? encodeCaloriePlan(plan) : "";

  async function copyCode() {
    if (!saveCode) return;
    try {
      await navigator.clipboard.writeText(saveCode);
      setCopyState("copied");
      window.setTimeout(() => setCopyState("idle"), 1800);
    } catch {
      setCopyState("error");
    }
  }

  function applyPlan(restored: SavedCaloriePlan) {
    setSex(restored.sex);
    setAge(restored.age);
    setHeight(restored.heightCm);
    setWeight(restored.weightKg);
    setActivity(restored.activity);
    setGoal(restored.goal);
    setPace(restored.pace);
  }

  function restorePlan() {
    const decoded = decodeCaloriePlan(restoreCode);
    if (!decoded) {
      setRestoreMessage({
        text: "That code does not look right. Check it and try again.",
        ok: false,
      });
      return;
    }

    applyPlan(decoded);
    setRestoreCode(encodeCaloriePlan(decoded));
    setRestoreMessage({ text: "Your plan has been restored.", ok: true });
  }

  return (
    <CalculatorFrame
      title="Calorie & macro plan"
      description="Estimate resting energy, maintenance calories, a goal-based target, and a practical macro split."
      inputs={
        <div className="space-y-5">
          <SegmentedControl
            label="Sex used by the equation"
            value={sex}
            options={[
              { value: "male", label: "Male" },
              { value: "female", label: "Female" },
            ]}
            onChange={setSex}
          />
          <div className="grid gap-5 sm:grid-cols-2">
            <NumberField
              id="calorie-age"
              label="Age"
              value={age}
              min={20}
              max={99}
              suffix="years"
              onChange={setAge}
            />
            <NumberField
              id="calorie-height"
              label="Height"
              value={height}
              min={120}
              max={250}
              suffix="cm"
              onChange={setHeight}
            />
          </div>
          <NumberField
            id="calorie-weight"
            label="Weight"
            value={weight}
            min={35}
            max={300}
            step={0.5}
            suffix="kg"
            onChange={setWeight}
          />
          <div>
            <label
              htmlFor="calorie-activity"
              className="mb-2 block text-sm font-semibold text-ink"
            >
              Activity level
            </label>
            <select
              id="calorie-activity"
              value={activity}
              onChange={(event) => setActivity(Number(event.target.value))}
              className="min-h-12 w-full rounded-xl border border-line bg-white px-4 py-3 text-sm font-semibold text-ink outline-none focus:border-terracotta focus:ring-2 focus:ring-terracotta/15"
            >
              {ACTIVITY_LEVELS.map((level) => (
                <option key={level.value} value={level.value}>
                  {level.label} — {level.detail}
                </option>
              ))}
            </select>
          </div>
          <SegmentedControl
            label="Goal"
            value={goal}
            options={[
              { value: "lose", label: "Lose" },
              { value: "maintain", label: "Maintain" },
              { value: "gain", label: "Gain" },
            ]}
            onChange={setGoal}
          />
          <div>
            <label
              htmlFor="calorie-pace"
              className="mb-2 block text-sm font-semibold text-ink"
            >
              Pace
            </label>
            <select
              id="calorie-pace"
              value={pace}
              disabled={goal === "maintain"}
              onChange={(event) => setPace(event.target.value as Pace)}
              className="min-h-12 w-full rounded-xl border border-line bg-white px-4 py-3 text-sm font-semibold text-ink outline-none transition focus:border-terracotta focus:ring-2 focus:ring-terracotta/15 disabled:cursor-not-allowed disabled:bg-white/45 disabled:text-stone"
            >
              <option value="gradual">Gradual — about 0.25 kg/week</option>
              <option value="moderate">Moderate — about 0.5 kg/week</option>
              <option value="faster">Faster — about 0.75 kg/week</option>
            </select>
            {goal === "maintain" && (
              <p className="mt-1.5 text-xs text-stone">
                Pace does not change a maintenance estimate.
              </p>
            )}
          </div>
        </div>
      }
    >
      {result ? (
        <>
          <ResultHeading
            label="Daily calorie target"
            value={formatNumber(result.target)}
            visual={
              <BodyMetricVisual
                variant="calories"
                sex={sex}
                bmi={calculateBmi(height, weight).bmi}
                calories={result.target}
                goal={goal}
                proteinCalories={result.proteinKcal}
                carbohydrateCalories={result.carbKcal}
                fatCalories={result.fatKcal}
              />
            }
            unit="estimated kcal per day"
          />
          {result.wasFloored && (
            <div className="mt-5 flex gap-3 rounded-2xl border border-amber-300/30 bg-amber-200/10 p-4 text-xs leading-5 text-amber-50">
              <AlertTriangle className="mt-0.5 shrink-0" size={16} />
              <p>
                The raw estimate was {formatNumber(result.calculatedTarget)} kcal.
                This tool displays a {formatNumber(result.displayFloor)} kcal floor.
                Do not use a very-low-calorie plan without medical supervision.
              </p>
            </div>
          )}

          <StatGrid
            stats={[
              {
                label: "Protein",
                value: `${formatNumber(result.proteinG)} g`,
                featured: true,
              },
              { label: "Carbohydrate", value: `${formatNumber(result.carbsG)} g` },
              { label: "Fat", value: `${formatNumber(result.fatG)} g` },
            ]}
          />
          <div className="mt-2 grid grid-cols-2 gap-2">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-[9px] font-bold uppercase tracking-[.16em] text-white/45">
                Resting energy
              </p>
              <p className="mt-2 text-lg font-bold tabular-nums">
                {formatNumber(result.rmr)} kcal
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-[9px] font-bold uppercase tracking-[.16em] text-white/45">
                Maintenance
              </p>
              <p className="mt-2 text-lg font-bold tabular-nums">
                {formatNumber(result.maintenance)} kcal
              </p>
            </div>
          </div>

          <div className="mt-7 rounded-2xl border border-white/12 bg-white/5 p-4 sm:p-5">
            <div className="flex items-center gap-2">
              <LockKeyhole size={15} className="text-sage" />
              <p className="text-xs font-bold uppercase tracking-[.13em]">
                Save without an account
              </p>
            </div>
            <p className="mt-2 text-xs leading-5 text-white/50">
              This code stores the inputs, not the result. It is generated locally
              and is never sent to our server.
            </p>
            <div className="mt-4 flex flex-col gap-2 sm:flex-row">
              <output className="flex min-h-11 flex-1 items-center justify-center rounded-xl bg-cream px-3 font-mono text-sm font-bold tracking-[.12em] text-ink">
                {saveCode}
              </output>
              <button
                type="button"
                onClick={copyCode}
                disabled={!saveCode}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-terracotta px-4 text-sm font-bold text-white transition hover:bg-terracotta-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cream disabled:opacity-50"
              >
                {copyState === "copied" ? <Check size={15} /> : <Copy size={15} />}
                {copyState === "copied"
                  ? "Copied"
                  : copyState === "error"
                    ? "Copy failed"
                    : "Copy code"}
              </button>
            </div>
            <div className="mt-3 flex flex-col gap-2 sm:flex-row">
              <label htmlFor="restore-plan-code" className="sr-only">
                Restore a saved plan code
              </label>
              <input
                id="restore-plan-code"
                value={restoreCode}
                maxLength={13}
                placeholder="KMH-XXXX-XXXX"
                onChange={(event) => {
                  setRestoreCode(event.target.value.toUpperCase());
                  setRestoreMessage(null);
                }}
                onKeyDown={(event) => {
                  if (event.key === "Enter") restorePlan();
                }}
                className="min-h-11 flex-1 rounded-xl border border-white/15 bg-white/8 px-3 font-mono text-sm uppercase tracking-[.1em] text-white outline-none placeholder:text-white/30 focus:border-sage"
              />
              <button
                type="button"
                onClick={restorePlan}
                className="min-h-11 rounded-xl border border-white/20 px-4 text-sm font-bold transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage"
              >
                Restore
              </button>
            </div>
            {restoreMessage && (
              <p
                className={cn(
                  "mt-2 text-xs font-semibold",
                  restoreMessage.ok ? "text-emerald-300" : "text-red-300",
                )}
                role="status"
              >
                {restoreMessage.text}
              </p>
            )}
          </div>

          <ResultNote>
            Resting energy uses the Mifflin–St Jeor equation; maintenance applies
            a standard activity multiplier. Macro targets are planning estimates,
            not prescriptions. Actual needs vary with health, training, body
            composition, medications, and metabolism.
          </ResultNote>
        </>
      ) : (
        <InvalidResult />
      )}
    </CalculatorFrame>
  );
}

function BodyFatCalculator() {
  const [sex, setSex] = useState<Sex>("male");
  const [height, setHeight] = useState(170);
  const [weight, setWeight] = useState(70);
  const [neck, setNeck] = useState(38);
  const [waist, setWaist] = useState(85);
  const [hip, setHip] = useState(95);

  const valid =
    isInRange(height, 120, 250) &&
    isInRange(weight, 25, 350) &&
    isInRange(neck, 20, 65) &&
    isInRange(waist, 40, 220) &&
    (sex === "male" || isInRange(hip, 50, 220)) &&
    (sex === "male" ? waist > neck : waist + hip > neck);

  const result = valid
    ? calculateBodyFat({
        sex,
        heightCm: height,
        weightKg: weight,
        neckCm: neck,
        waistCm: waist,
        hipCm: hip,
      })
    : null;
  const category = result ? getBodyFatCategory(sex, result.bodyFat) : null;

  return (
    <CalculatorFrame
      title="Body-fat estimate"
      description="The circumference method is useful for following a trend when you measure consistently."
      inputs={
        <div className="space-y-5">
          <SegmentedControl
            label="Sex used by the equation"
            value={sex}
            options={[
              { value: "male", label: "Male" },
              { value: "female", label: "Female" },
            ]}
            onChange={setSex}
          />
          <div className="grid gap-5 sm:grid-cols-2">
            <NumberField
              id="body-fat-height"
              label="Height"
              value={height}
              min={120}
              max={250}
              step={0.1}
              suffix="cm"
              onChange={setHeight}
            />
            <NumberField
              id="body-fat-weight"
              label="Weight"
              value={weight}
              min={25}
              max={350}
              step={0.1}
              suffix="kg"
              onChange={setWeight}
            />
            <NumberField
              id="body-fat-neck"
              label="Neck"
              value={neck}
              min={20}
              max={65}
              step={0.1}
              suffix="cm"
              onChange={setNeck}
            />
            <NumberField
              id="body-fat-waist"
              label={sex === "male" ? "Abdomen at navel" : "Natural waist"}
              value={waist}
              min={40}
              max={220}
              step={0.1}
              suffix="cm"
              onChange={setWaist}
            />
            {sex === "female" && (
              <NumberField
                id="body-fat-hip"
                label="Hip at widest point"
                value={hip}
                min={50}
                max={220}
                step={0.1}
                suffix="cm"
                onChange={setHip}
              />
            )}
          </div>
        </div>
      }
    >
      {result && category ? (
        <>
          <ResultHeading
            label="Estimated body fat"
            value={formatNumber(result.bodyFat, 1)}
            visual={
              <BodyMetricVisual
                variant="body-fat"
                sex={sex}
                bodyFat={result.bodyFat}
              />
            }
            unit="percent"
          />
          <ResultBadge tone={category.tone}>{category.label}</ResultBadge>
          <StatGrid
            stats={[
              {
                label: "Fat mass",
                value: `${formatNumber(result.fatMassKg, 1)} kg`,
              },
              {
                label: "Lean mass",
                value: `${formatNumber(result.leanMassKg, 1)} kg`,
                featured: true,
              },
              {
                label: "Waist : height",
                value: formatNumber(result.waistToHeight, 2),
              },
            ]}
          />
          <ResultNote>
            This is a rough circumference estimate, not a clinical body-composition
            measurement. Use the same tape position and conditions each time; small
            measurement changes can noticeably affect the result.
          </ResultNote>
        </>
      ) : (
        <InvalidResult />
      )}
    </CalculatorFrame>
  );
}

function WaterCalculator() {
  const [weight, setWeight] = useState(65);
  const [exercise, setExercise] = useState(30);
  const [climate, setClimate] = useState<"temperate" | "hot">("temperate");
  const valid =
    isInRange(weight, 25, 300) && isInRange(exercise, 0, 300);
  const result = valid
    ? calculateWater(weight, exercise, climate === "hot")
    : null;

  return (
    <CalculatorFrame
      title="Daily water guide"
      description="A practical total-water starting point that adjusts for exercise and heat."
      inputs={
        <div className="space-y-5">
          <NumberField
            id="water-weight"
            label="Weight"
            value={weight}
            min={25}
            max={300}
            step={0.1}
            suffix="kg"
            onChange={setWeight}
          />
          <NumberField
            id="water-exercise"
            label="Exercise today"
            value={exercise}
            min={0}
            max={300}
            suffix="min"
            onChange={setExercise}
          />
          <SegmentedControl
            label="Climate"
            value={climate}
            options={[
              { value: "temperate", label: "Temperate" },
              { value: "hot", label: "Hot / humid" },
            ]}
            onChange={setClimate}
          />
        </div>
      }
    >
      {result ? (
        <>
          <ResultHeading
            label="Daily total-water guide"
            value={formatNumber(result.totalLitres, 1)}
            visual={
              <BodyMetricVisual
                variant="water"
                litres={result.totalLitres}
                glasses={result.glasses}
              />
            }
            unit={`litres, or about ${result.glasses} × 250 ml glasses`}
          />
          <ResultBadge tone="blue">Food + all fluids count</ResultBadge>
          <StatGrid
            stats={[
              {
                label: "Base guide",
                value: `${formatNumber(result.baseLitres, 1)} L`,
              },
              {
                label: "Exercise",
                value: `+${formatNumber(result.exerciseLitres, 1)} L`,
                featured: true,
              },
              {
                label: "Climate",
                value: `+${formatNumber(result.climateLitres, 1)} L`,
              },
            ]}
          />
          <ResultNote>
            Total water includes plain water, other drinks, and water in food.
            Needs vary widely with sweat rate, weather, pregnancy, breastfeeding,
            medications, and kidney or heart conditions. Follow clinical advice if
            you have been given a fluid limit.
          </ResultNote>
        </>
      ) : (
        <InvalidResult />
      )}
    </CalculatorFrame>
  );
}

function HealthyWeightCalculator() {
  const [height, setHeight] = useState(170);
  const valid = isInRange(height, 120, 250);
  const result = valid ? calculateHealthyWeight(height) : null;
  const rangeLabel = useMemo(
    () =>
      result
        ? `${formatNumber(result.lowKg)}–${formatNumber(result.highKg)}`
        : "",
    [result],
  );

  return (
    <CalculatorFrame
      title="Weight reference range"
      description="See the weight range corresponding to an adult BMI of 18.5–24.9."
      inputs={
        <NumberField
          id="healthy-weight-height"
          label="Height"
          value={height}
          min={120}
          max={250}
          step={0.1}
          suffix="cm"
          onChange={setHeight}
        />
      }
    >
      {result ? (
        <>
          <ResultHeading
            label="BMI reference range"
            value={rangeLabel}
            visual={
              <BodyMetricVisual
                variant="weight"
                lowKg={result.lowKg}
                midpointKg={result.midpointKg}
                highKg={result.highKg}
              />
            }
            unit="kilograms"
          />
          <ResultBadge tone="green">Adult screening reference</ResultBadge>
          <StatGrid
            stats={[
              {
                label: "Lower",
                value: `${formatNumber(result.lowKg, 1)} kg`,
              },
              {
                label: "Midpoint",
                value: `${formatNumber(result.midpointKg, 1)} kg`,
                featured: true,
              },
              {
                label: "Upper",
                value: `${formatNumber(result.highKg, 1)} kg`,
              },
            ]}
          />
          <ResultNote>
            This is a broad screening range, not an “ideal” target. Muscle mass,
            build, health history, ethnicity, age, and fat distribution all affect
            how weight relates to health.
          </ResultNote>
        </>
      ) : (
        <InvalidResult />
      )}
    </CalculatorFrame>
  );
}
