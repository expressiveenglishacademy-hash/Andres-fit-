import { formatTime, parseProtocol } from './calculations';

function normalize(value) {
  return value.toLowerCase().trim();
}

function uniqueById(items) {
  return items.filter(
    (item, index, array) => index === array.findIndex((candidate) => candidate.id === item.id),
  );
}

function sumTotals(foods) {
  return foods.reduce(
    (totals, food) => ({
      protein: totals.protein + Number(food.protein || 0),
      carbs: totals.carbs + Number(food.carbs || 0),
      fats: totals.fats + Number(food.fats || 0),
      calories: totals.calories + Number(food.calories || 0),
    }),
    {
      protein: 0,
      carbs: 0,
      fats: 0,
      calories: 0,
    },
  );
}

function hasFood(inventory, foodName) {
  return inventory.some((item) => normalize(item) === normalize(foodName));
}

function addMinutes(timeValue, minutesToAdd) {
  const [hours, minutes] = timeValue.split(':').map(Number);
  const totalMinutes = (hours * 60 + minutes + minutesToAdd) % 1440;
  const normalized = (totalMinutes + 1440) % 1440;
  const nextHours = Math.floor(normalized / 60);
  const nextMinutes = normalized % 60;
  return `${String(nextHours).padStart(2, '0')}:${String(nextMinutes).padStart(2, '0')}`;
}

function buildMealSlots(startTime, protocol) {
  const { eatingHours } = parseProtocol(protocol);
  const totalEatingMinutes = eatingHours * 60;

  return [
    formatTime(startTime),
    formatTime(addMinutes(startTime, Math.max(150, Math.floor(totalEatingMinutes / 2)))),
    formatTime(addMinutes(startTime, Math.max(240, totalEatingMinutes - 75))),
  ];
}

export function matchFoodsFromText(text, foods) {
  const normalizedText = normalize(text);

  return uniqueById(
    foods.filter((food) =>
      [food.name, ...(food.aliases || [])].some((alias) =>
        normalizedText.includes(normalize(alias)),
      ),
    ),
  );
}

export function analyzeMeal(text, foods) {
  const matchedFoods = matchFoodsFromText(text, foods);
  const totals = sumTotals(matchedFoods);
  const feedback = [];

  if (!matchedFoods.length) {
    feedback.push('Meal logged. Keep the portions honest and anchor the next meal with protein.');
  }

  if (totals.protein >= 25) {
    feedback.push('Good protein balance. This helps muscle retention while cutting fat.');
  } else {
    feedback.push('Protein is light. Add eggs or chicken next time so the meal works harder for you.');
  }

  if (totals.carbs >= 55 && totals.protein < 25) {
    feedback.push('Too many carbs in one meal. Tighten the starch and pair the next meal with lean protein.');
  } else if (totals.carbs >= 70) {
    feedback.push('Carbs ran high here. Keep the next meal lighter and more controlled.');
  }

  if (totals.calories >= 700 || totals.fats >= 28) {
    feedback.push('Try adding a lighter next meal so the full day stays under control.');
  }

  if (matchedFoods.length >= 3 && totals.protein >= 20 && totals.carbs <= 55) {
    feedback.push('This is a balanced, repeatable meal. Keep winning with simple combinations like this.');
  }

  return {
    matchedFoods,
    totals,
    feedback: feedback.slice(0, 3),
  };
}

export function getDayNutritionSnapshot(meals) {
  return meals.reduce(
    (totals, meal) => ({
      protein: totals.protein + Number(meal.totals?.protein || 0),
      carbs: totals.carbs + Number(meal.totals?.carbs || 0),
      fats: totals.fats + Number(meal.totals?.fats || 0),
      calories: totals.calories + Number(meal.totals?.calories || 0),
    }),
    {
      protein: 0,
      carbs: 0,
      fats: 0,
      calories: 0,
    },
  );
}

export function buildInventorySuggestions(
  inventory,
  mealsToday,
  foods,
  startTime = '10:00',
  protocol = '16:8',
) {
  const suggestions = [];
  const [firstSlot, secondSlot, thirdSlot] = buildMealSlots(startTime, protocol);
  const normalizedInventory = inventory.map((item) => normalize(item));
  const dayTotals = getDayNutritionSnapshot(mealsToday);

  if (hasFood(normalizedInventory, 'gallopinto') && hasFood(normalizedInventory, 'eggs')) {
    suggestions.push({
      title: 'Gallopinto + eggs bowl',
      time: firstSlot,
      portion: '1 cup gallopinto and 2 eggs. Add fruit on the side only if you still feel hungry.',
      reason: 'This gives a steady first meal and better protein than a carb-only start.',
    });
  }

  if (hasFood(normalizedInventory, 'chicken') && hasFood(normalizedInventory, 'rice')) {
    suggestions.push({
      title: 'Chicken and rice plate',
      time: secondSlot,
      portion:
        dayTotals.carbs >= 120
          ? '1 palm of chicken with 1/2 cup rice. Keep this version tighter because carbs are already climbing.'
          : '1 to 1.5 palms of chicken with 3/4 cup rice.',
      reason: 'Chicken keeps the day protein-forward and supports muscle while cutting.',
    });
  }

  if (hasFood(normalizedInventory, 'oatmeal') && hasFood(normalizedInventory, 'fruits')) {
    suggestions.push({
      title: 'Oatmeal and fruit reset meal',
      time: firstSlot,
      portion: '3/4 cup oatmeal with one serving of fruit. Add eggs on the side if protein is behind.',
      reason: 'Easy, realistic, and better than grabbing bread or tortillas when energy dips.',
    });
  }

  if (hasFood(normalizedInventory, 'eggs') && hasFood(normalizedInventory, 'tortillas')) {
    suggestions.push({
      title: 'Egg and tortilla wrap',
      time: thirdSlot,
      portion:
        dayTotals.carbs >= 120
          ? '2 eggs with 1 tortilla and salsa if available. Keep it lighter tonight.'
          : '2 eggs with 2 tortillas and a little cheese.',
      reason: 'Simple final meal that is easy to repeat without overthinking.',
    });
  }

  if (hasFood(normalizedInventory, 'bread') && hasFood(normalizedInventory, 'cheese')) {
    suggestions.push({
      title: 'Bread and cheese rescue snack',
      time: secondSlot,
      portion: '1 slice of bread with a light amount of cheese. Add eggs or chicken if this becomes a full meal.',
      reason: 'Useful when you need something fast, but keep it portion-controlled.',
    });
  }

  if (!suggestions.length && foods.length) {
    suggestions.push({
      title: 'Protein-first fallback plate',
      time: secondSlot,
      portion: 'Start with eggs or chicken, then add a small carb portion only if you still need it.',
      reason: 'Even with limited inventory, protein first keeps the day cleaner.',
    });
  }

  return suggestions.slice(0, 3);
}

export function recommendNextMeal(
  mealsToday,
  inventory,
  foods,
  startTime = '10:00',
  protocol = '16:8',
) {
  const dayTotals = getDayNutritionSnapshot(mealsToday);
  const suggestions = buildInventorySuggestions(inventory, mealsToday, foods, startTime, protocol);

  if (!mealsToday.length) {
    return {
      title: 'Open the window with structure',
      body: 'Start around the eating window opening with eggs plus gallopinto, or oatmeal plus eggs. Do not start the day with random carbs alone.',
    };
  }

  if (dayTotals.protein < 70 && hasFood(inventory, 'chicken')) {
    return {
      title: 'Next meal needs more protein',
      body: 'Have chicken first, then add a smaller rice portion if you still need it. Protein is behind and that is the priority.',
    };
  }

  if (dayTotals.carbs >= 130) {
    return {
      title: 'Keep the next meal lighter',
      body: 'Use eggs or chicken with fruit, and skip extra bread, tortillas, or more rice this round.',
    };
  }

  if (suggestions.length) {
    return {
      title: `Next meal around ${suggestions[0].time}`,
      body: `${suggestions[0].title}. ${suggestions[0].portion}`,
    };
  }

  return {
    title: 'Keep the next plate simple',
    body: 'Use a protein source first, then add only one carb source in a moderate portion.',
  };
}
