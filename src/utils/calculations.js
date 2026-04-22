function padNumber(value) {
  return String(value).padStart(2, '0');
}

function createDateFromKey(dateKey) {
  return new Date(`${dateKey}T12:00:00`);
}

function minutesFromTime(timeValue) {
  const [hours, minutes] = timeValue.split(':').map(Number);
  return hours * 60 + minutes;
}

function timeFromMinutes(totalMinutes) {
  const normalizedMinutes = ((totalMinutes % 1440) + 1440) % 1440;
  const hours = Math.floor(normalizedMinutes / 60);
  const minutes = normalizedMinutes % 60;
  return `${padNumber(hours)}:${padNumber(minutes)}`;
}

function buildDateWithTime(date, timeValue) {
  const [hours, minutes] = timeValue.split(':').map(Number);
  const nextDate = new Date(date);
  nextDate.setHours(hours, minutes, 0, 0);
  return nextDate;
}

function addHours(date, hours) {
  const nextDate = new Date(date);
  nextDate.setHours(nextDate.getHours() + hours);
  return nextDate;
}

function addDays(date, days) {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + days);
  return nextDate;
}

function formatDuration(ms) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const totalMinutes = Math.floor(totalSeconds / 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours === 0) {
    return `${minutes}m`;
  }

  return `${hours}h ${padNumber(minutes)}m`;
}

export function lbsToKg(lbs) {
  return Number(lbs) / 2.20462;
}

export function kgToLbs(kg) {
  return Number(kg) * 2.20462;
}

export function formatDateKey(input = new Date()) {
  const date = typeof input === 'string' ? createDateFromKey(input) : new Date(input);
  return `${date.getFullYear()}-${padNumber(date.getMonth() + 1)}-${padNumber(date.getDate())}`;
}

export function formatFriendlyDate(dateKey) {
  return createDateFromKey(dateKey).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

export function formatLongDate(dateKey) {
  return createDateFromKey(dateKey).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatTime(timeValue) {
  const [hours, minutes] = timeValue.split(':').map(Number);
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function getCurrentTimeValue(date = new Date()) {
  return `${padNumber(date.getHours())}:${padNumber(date.getMinutes())}`;
}

export function parseProtocol(protocol) {
  const [fastingHours, eatingHours] = protocol.split(':').map(Number);
  return {
    fastingHours,
    eatingHours,
  };
}

export function sortWeightHistory(weightHistory) {
  return [...weightHistory].sort((left, right) => left.date.localeCompare(right.date));
}

export function getLatestWeight(weightHistory, fallbackWeight) {
  if (!weightHistory.length) {
    return fallbackWeight;
  }

  const sortedHistory = sortWeightHistory(weightHistory);
  return Number(sortedHistory[sortedHistory.length - 1].weight);
}

export function calculateIdealWeightRange(heightCm) {
  const heightMeters = Number(heightCm) / 100;
  const minKg = 21.5 * heightMeters * heightMeters;
  const maxKg = 24.9 * heightMeters * heightMeters;

  return {
    minLbs: Math.round(kgToLbs(minKg)),
    maxLbs: Math.round(kgToLbs(maxKg)),
  };
}

export function getAboveGoal(currentWeight, goalWeight) {
  return Math.max(Number(currentWeight) - Number(goalWeight), 0);
}

export function getRemainingToGoal(currentWeight, goalWeight) {
  return Math.max(Number(currentWeight) - Number(goalWeight), 0);
}

export function calculateGoalProgress(startWeight, currentWeight, goalWeight) {
  const fullDistance = Number(startWeight) - Number(goalWeight);

  if (fullDistance <= 0) {
    return 100;
  }

  const coveredDistance = Number(startWeight) - Number(currentWeight);
  const percent = (coveredDistance / fullDistance) * 100;
  return Math.max(0, Math.min(percent, 100));
}

export function getEatingWindowBounds(startTime, protocol) {
  const { eatingHours } = parseProtocol(protocol);
  const startMinutes = minutesFromTime(startTime);
  const endMinutes = (startMinutes + eatingHours * 60) % 1440;

  return {
    startMinutes,
    endMinutes,
    wrapsNextDay: endMinutes <= startMinutes,
  };
}

export function isTimeWithinEatingWindow(timeValue, startTime, protocol) {
  const { startMinutes, endMinutes, wrapsNextDay } = getEatingWindowBounds(
    startTime,
    protocol,
  );
  const currentMinutes = minutesFromTime(timeValue);

  if (!wrapsNextDay) {
    return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
  }

  return currentMinutes >= startMinutes || currentMinutes <= endMinutes;
}

export function getFastingStatus(protocol, startTime, now = new Date()) {
  const { fastingHours, eatingHours } = parseProtocol(protocol);
  const startToday = buildDateWithTime(now, startTime);
  const endToday = addHours(startToday, eatingHours);
  let isEatingWindow = false;
  let nextChange = startToday;
  let nextChangeLabel = 'Eating starts in';

  if (now < startToday) {
    isEatingWindow = false;
    nextChange = startToday;
    nextChangeLabel = 'Eating starts in';
  } else if (now >= startToday && now < endToday) {
    isEatingWindow = true;
    nextChange = endToday;
    nextChangeLabel = 'Fasting resumes in';
  } else {
    isEatingWindow = false;
    nextChange = addDays(startToday, 1);
    nextChangeLabel = 'Eating starts in';
  }

  const endTime = timeFromMinutes(minutesFromTime(startTime) + eatingHours * 60);

  return {
    fastingHours,
    eatingHours,
    isEatingWindow,
    statusLabel: isEatingWindow ? 'Eating window open' : 'Currently fasting',
    nextChangeLabel,
    countdown: formatDuration(nextChange.getTime() - now.getTime()),
    nextChangeAt: formatTime(
      `${padNumber(nextChange.getHours())}:${padNumber(nextChange.getMinutes())}`,
    ),
    windowTimeRange: `${formatTime(startTime)} - ${formatTime(endTime)}`,
    progressText: isEatingWindow
      ? 'Keep portions in control before the window closes.'
      : 'Use water, black coffee, or tea and let the fast do its job.',
  };
}

export function buildWeightChartData(weightHistory) {
  return sortWeightHistory(weightHistory).map((entry) => ({
    ...entry,
    label: formatFriendlyDate(entry.date),
    weight: Number(entry.weight),
  }));
}

export function buildConsistencyData({
  meals = [],
  weightHistory = [],
  workouts = {},
  fastingLog = {},
  startTime = '10:00',
  protocol = '16:8',
}) {
  const rows = [];
  const today = new Date();

  for (let offset = 6; offset >= 0; offset -= 1) {
    const currentDate = addDays(today, -offset);
    const dateKey = formatDateKey(currentDate);
    const dayMeals = meals.filter((meal) => meal.date === dateKey);
    const mealLogged = dayMeals.length > 0;
    const weightLogged = weightHistory.some((entry) => entry.date === dateKey);
    const workoutDone = Boolean(workouts[dateKey]?.completed);
    const manualFastingResult = fastingLog?.[dateKey];
    const fastingMet =
      typeof manualFastingResult === 'boolean'
        ? manualFastingResult
        : mealLogged &&
          dayMeals.every((meal) =>
            isTimeWithinEatingWindow(meal.time, startTime, protocol),
          );
    const score =
      Number(weightLogged) + Number(mealLogged) + Number(fastingMet) + Number(workoutDone);

    rows.push({
      date: dateKey,
      label: formatFriendlyDate(dateKey),
      score,
      mealLogged,
      weightLogged,
      fastingMet,
      workoutDone,
      disciplineDay: mealLogged && fastingMet && workoutDone,
    });
  }

  return rows;
}

export function calculateStreak(consistencyData) {
  let streak = 0;

  for (let index = consistencyData.length - 1; index >= 0; index -= 1) {
    if (consistencyData[index].disciplineDay) {
      streak += 1;
    } else {
      break;
    }
  }

  return streak;
}

export function getDaysSinceLastWeightEntry(weightHistory, todayKey = formatDateKey(new Date())) {
  if (!weightHistory.length) {
    return Number.POSITIVE_INFINITY;
  }

  const sortedHistory = sortWeightHistory(weightHistory);
  const lastEntry = createDateFromKey(sortedHistory[sortedHistory.length - 1].date);
  const today = createDateFromKey(todayKey);
  const diffInMs = today.getTime() - lastEntry.getTime();

  return Math.round(diffInMs / (1000 * 60 * 60 * 24));
}
