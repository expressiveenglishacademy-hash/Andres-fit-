import { startTransition, useEffect, useState } from 'react';
import Dashboard from './components/Dashboard';
import FoodLog from './components/FoodLog';
import FastingTracker from './components/FastingTracker';
import WeightTracker from './components/WeightTracker';
import CoachMessage from './components/CoachMessage';
import FoodInventory from './components/FoodInventory';
import WorkoutSection from './components/WorkoutSection';
import defaultFoods from './data/defaultFoods';
import {
  buildConsistencyData,
  calculateGoalProgress,
  calculateIdealWeightRange,
  calculateStreak,
  formatDateKey,
  getAboveGoal,
  getCurrentTimeValue,
  getDaysSinceLastWeightEntry,
  getFastingStatus,
  getLatestWeight,
  getRemainingToGoal,
  isTimeWithinEatingWindow,
} from './utils/calculations';
import {
  analyzeMeal,
  buildInventorySuggestions,
  getDayNutritionSnapshot,
  recommendNextMeal,
} from './utils/foodLogic';
import { getAlerts, getCoachMessage } from './utils/motivation';

const profile = {
  gender: 'Male',
  age: 28,
  heightCm: 175,
  currentWeight: 250,
  goalWeight: 200,
  activityLevel: 'Sedentary',
  goal: 'Fat loss + muscle gain',
  eatingWindowStart: '10:00',
  initialFastingProtocol: '16:8',
  commonAvailableFoods: [
    'gallopinto',
    'eggs',
    'chicken',
    'rice',
    'tortillas',
    'cheese',
    'bread',
    'oatmeal',
    'fruits',
  ],
};

const workoutLibrary = [
  {
    id: 'walk-reset',
    title: '20-Minute Brisk Walk',
    duration: '20 min',
    focus: 'Low-impact calorie burn',
    steps: [
      '5 minutes easy pace to warm up.',
      '10 minutes brisk pace where talking is possible but not effortless.',
      '5 minutes cool down and deep breathing.',
    ],
    coachNote: 'This is the minimum standard on low-energy days. Finish it anyway.',
  },
  {
    id: 'home-strength',
    title: 'Beginner Home Strength Circuit',
    duration: '18 min',
    focus: 'Simple muscle-retention work',
    steps: [
      '3 rounds: 10 chair squats, 8 incline push-ups, 12 standing knee drives per side.',
      'Rest 45 to 60 seconds between rounds.',
      'Finish with a 20-second plank or wall plank after each round.',
    ],
    coachNote: 'Controlled reps matter more than speed. Keep the form clean.',
  },
  {
    id: 'mobility-walk',
    title: 'Mobility + Walk Combo',
    duration: '25 min',
    focus: 'Undo sedentary stiffness',
    steps: [
      '5 minutes of shoulder rolls, hip circles, and calf raises.',
      '15 minutes of steady walking.',
      '5 minutes of hamstring, hip-flexor, and chest stretching.',
    ],
    coachNote: 'Sedentary days pile up fast. Movement is part of the fat-loss job.',
  },
  {
    id: 'starter-burn',
    title: 'Starter Cardio Ladder',
    duration: '16 min',
    focus: 'Raise energy without crushing recovery',
    steps: [
      '4 rounds of 2 minutes marching in place plus 1 minute fast walk around the room.',
      'Take 30 seconds to reset between rounds if needed.',
      'Finish with light stretching for calves and hips.',
    ],
    coachNote: 'If you feel sluggish, this is your reset button. No excuses.',
  },
];

const storageKeys = {
  meals: 'nutrition-coach-meals',
  weightHistory: 'nutrition-coach-weight-history',
  inventory: 'nutrition-coach-inventory',
  fastingSettings: 'nutrition-coach-fasting-settings',
  workouts: 'nutrition-coach-workouts',
};

function readStorage(key, fallback) {
  if (typeof window === 'undefined') {
    return fallback;
  }

  try {
    const stored = window.localStorage.getItem(key);
    return stored ? JSON.parse(stored) : fallback;
  } catch {
    return fallback;
  }
}

function usePersistentState(key, fallbackValue) {
  const [value, setValue] = useState(() => readStorage(key, fallbackValue));

  useEffect(() => {
    window.localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue];
}

function createId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function sortMealsByDateAndTime(meals) {
  return [...meals].sort((left, right) =>
    `${left.date} ${left.time}`.localeCompare(`${right.date} ${right.time}`),
  );
}

function pickWorkout(dateKey) {
  const seed = dateKey.replaceAll('-', '');
  const index = Number(seed) % workoutLibrary.length;
  return workoutLibrary[index];
}

export default function App() {
  const [now, setNow] = useState(new Date());
  const [meals, setMeals] = usePersistentState(storageKeys.meals, []);
  const [weightHistory, setWeightHistory] = usePersistentState(
    storageKeys.weightHistory,
    [{ date: formatDateKey(new Date()), weight: profile.currentWeight }],
  );
  const [inventory, setInventory] = usePersistentState(
    storageKeys.inventory,
    profile.commonAvailableFoods,
  );
  const [fastingSettings, setFastingSettings] = usePersistentState(
    storageKeys.fastingSettings,
    {
      protocol: profile.initialFastingProtocol,
      eatingWindowStart: profile.eatingWindowStart,
      manualCompliance: {},
    },
  );
  const [workouts, setWorkouts] = usePersistentState(storageKeys.workouts, {});

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNow(new Date());
    }, 30000);

    return () => window.clearInterval(timer);
  }, []);

  const todayKey = formatDateKey(now);
  const todayWorkout = pickWorkout(todayKey);
  const idealRange = calculateIdealWeightRange(profile.heightCm);
  const currentWeight = getLatestWeight(weightHistory, profile.currentWeight);
  const aboveGoal = getAboveGoal(currentWeight, profile.goalWeight);
  const remainingToGoal = getRemainingToGoal(currentWeight, profile.goalWeight);
  const goalProgress = calculateGoalProgress(
    profile.currentWeight,
    currentWeight,
    profile.goalWeight,
  );

  const fastingStatus = getFastingStatus(
    fastingSettings.protocol,
    fastingSettings.eatingWindowStart,
    now,
  );

  const todayMeals = sortMealsByDateAndTime(
    meals
      .filter((meal) => meal.date === todayKey)
      .map((meal) => ({
        ...meal,
        isWithinWindow: isTimeWithinEatingWindow(
          meal.time,
          fastingSettings.eatingWindowStart,
          fastingSettings.protocol,
        ),
      })),
  );

  const todayNutrition = getDayNutritionSnapshot(todayMeals);
  const workoutCompleted = Boolean(workouts[todayKey]?.completed);
  const manualCompliance = fastingSettings.manualCompliance?.[todayKey];
  const autoFastingCompliance =
    todayMeals.length > 0 && todayMeals.every((meal) => meal.isWithinWindow);
  const fastingCompliant =
    typeof manualCompliance === 'boolean'
      ? manualCompliance
      : autoFastingCompliance;
  const weightLoggedToday = weightHistory.some((entry) => entry.date === todayKey);

  const todayTasks = [
    {
      label: 'Log a weigh-in or keep the weekly trend updated',
      done: weightLoggedToday,
      hint: 'Honest data makes the plan sharper.',
    },
    {
      label: 'Stay inside the fasting window',
      done: fastingCompliant,
      hint: `Eating window: ${fastingStatus.windowTimeRange}`,
    },
    {
      label: 'Log at least two controlled meals',
      done: todayMeals.length >= 2,
      hint: 'Protein first, carbs under control.',
    },
    {
      label: `Complete ${todayWorkout.title.toLowerCase()}`,
      done: workoutCompleted,
      hint: `${todayWorkout.duration} of beginner-friendly movement.`,
    },
  ];

  const completedTasks = todayTasks.filter((task) => task.done).length;
  const consistencyData = buildConsistencyData({
    meals,
    weightHistory,
    workouts,
    fastingLog: fastingSettings.manualCompliance,
    startTime: fastingSettings.eatingWindowStart,
    protocol: fastingSettings.protocol,
  });
  const streak = calculateStreak(consistencyData);
  const daysSinceWeight = getDaysSinceLastWeightEntry(weightHistory, todayKey);
  const nextMealRecommendation = recommendNextMeal(
    todayMeals,
    inventory,
    defaultFoods,
    fastingSettings.eatingWindowStart,
    fastingSettings.protocol,
  );
  const inventorySuggestions = buildInventorySuggestions(
    inventory,
    todayMeals,
    defaultFoods,
    fastingSettings.eatingWindowStart,
    fastingSettings.protocol,
  );

  const coachMessage = getCoachMessage({
    profile,
    dayKey: todayKey,
    todayStats: {
      completedTasks,
      totalTasks: todayTasks.length,
      mealCount: todayMeals.length,
      workoutCompleted,
      fastingCompliant,
      weightLogged: weightLoggedToday,
      dayNutrition: todayNutrition,
      streak,
      remainingToGoal,
      daysSinceWeight,
    },
  });

  const alerts = getAlerts({
    now,
    mealsToday: todayMeals,
    fastingCompliant,
    workoutCompleted,
    daysSinceWeight,
    remainingToGoal,
    dayNutrition: todayNutrition,
  });

  function handleAddMeal({ text, time }) {
    const cleanedText = text.trim();

    if (!cleanedText) {
      return;
    }

    const analysis = analyzeMeal(cleanedText, defaultFoods);
    const mealEntry = {
      id: createId(),
      date: todayKey,
      time: time || getCurrentTimeValue(new Date()),
      text: cleanedText,
      matchedFoods: analysis.matchedFoods.map((food) => food.name),
      totals: analysis.totals,
      feedback: analysis.feedback,
    };

    startTransition(() => {
      setMeals((currentMeals) => sortMealsByDateAndTime([...currentMeals, mealEntry]));
    });
  }

  function handleAddWeight({ weight, date }) {
    const parsedWeight = Number(weight);

    if (!parsedWeight || !date) {
      return;
    }

    startTransition(() => {
      setWeightHistory((currentHistory) => {
        const withoutSameDate = currentHistory.filter((entry) => entry.date !== date);
        return [...withoutSameDate, { date, weight: parsedWeight }].sort((left, right) =>
          left.date.localeCompare(right.date),
        );
      });
    });
  }

  function handleAddInventoryFood(foodName) {
    const cleanedFood = foodName.trim().toLowerCase();

    if (!cleanedFood) {
      return;
    }

    startTransition(() => {
      setInventory((currentInventory) => {
        if (currentInventory.some((item) => item.toLowerCase() === cleanedFood)) {
          return currentInventory;
        }

        return [...currentInventory, cleanedFood];
      });
    });
  }

  function handleRemoveInventoryFood(foodName) {
    startTransition(() => {
      setInventory((currentInventory) =>
        currentInventory.filter((item) => item.toLowerCase() !== foodName.toLowerCase()),
      );
    });
  }

  function handleProtocolChange(nextProtocol) {
    startTransition(() => {
      setFastingSettings((current) => ({
        ...current,
        protocol: nextProtocol,
      }));
    });
  }

  function handleEatingWindowStartChange(nextStartTime) {
    startTransition(() => {
      setFastingSettings((current) => ({
        ...current,
        eatingWindowStart: nextStartTime,
      }));
    });
  }

  function handleSetFastingCompliance(value) {
    startTransition(() => {
      setFastingSettings((current) => ({
        ...current,
        manualCompliance: {
          ...current.manualCompliance,
          [todayKey]: value,
        },
      }));
    });
  }

  function handleResetFastingCompliance() {
    startTransition(() => {
      setFastingSettings((current) => {
        const nextManualCompliance = { ...current.manualCompliance };
        delete nextManualCompliance[todayKey];

        return {
          ...current,
          manualCompliance: nextManualCompliance,
        };
      });
    });
  }

  function handleToggleWorkoutCompleted() {
    startTransition(() => {
      setWorkouts((currentWorkouts) => ({
        ...currentWorkouts,
        [todayKey]: {
          completed: !currentWorkouts[todayKey]?.completed,
          workoutId: todayWorkout.id,
          workoutTitle: todayWorkout.title,
        },
      }));
    });
  }

  return (
    <div className="min-h-screen bg-canvas bg-glow text-ink">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <Dashboard
          alerts={alerts}
          coachMessage={coachMessage}
          consistencyData={consistencyData}
          fastingStatus={fastingStatus}
          profile={profile}
          streak={streak}
          todayMeals={todayMeals}
          todayTasks={todayTasks}
          weightSummary={{
            currentWeight,
            goalWeight: profile.goalWeight,
            aboveGoal,
            remainingToGoal,
            idealRange,
            goalProgress,
          }}
        />

        <div className="mt-6 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-6">
            <FoodLog
              foods={defaultFoods}
              mealsToday={todayMeals}
              nextMealRecommendation={nextMealRecommendation}
              onAddMeal={handleAddMeal}
              todayNutrition={todayNutrition}
            />

            <WeightTracker
              aboveGoal={aboveGoal}
              currentWeight={currentWeight}
              goalProgress={goalProgress}
              idealRange={idealRange}
              onAddWeight={handleAddWeight}
              profile={profile}
              remainingToGoal={remainingToGoal}
              weightHistory={weightHistory}
            />

            <FastingTracker
              eatingWindowStart={fastingSettings.eatingWindowStart}
              fastingCompliant={fastingCompliant}
              fastingStatus={fastingStatus}
              manualCompliance={manualCompliance}
              mealsToday={todayMeals}
              onProtocolChange={handleProtocolChange}
              onResetCompliance={handleResetFastingCompliance}
              onSetCompliance={handleSetFastingCompliance}
              onStartTimeChange={handleEatingWindowStartChange}
              protocol={fastingSettings.protocol}
            />
          </div>

          <div className="space-y-6">
            <CoachMessage
              coachMessage={coachMessage}
              completedTasks={completedTasks}
              streak={streak}
              totalTasks={todayTasks.length}
            />

            <WorkoutSection
              completed={workoutCompleted}
              onToggleCompleted={handleToggleWorkoutCompleted}
              workout={todayWorkout}
            />

            <FoodInventory
              commonFoods={defaultFoods}
              inventory={inventory}
              onAddFood={handleAddInventoryFood}
              onRemoveFood={handleRemoveInventoryFood}
              suggestions={inventorySuggestions}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
