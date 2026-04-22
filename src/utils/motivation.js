function hashSeed(value) {
  return value.split('').reduce((total, character) => total + character.charCodeAt(0), 0);
}

function pickMessage(messages, seed) {
  return messages[hashSeed(seed) % messages.length];
}

export function getCoachMessage({ profile, dayKey, todayStats }) {
  const strongMessages = [
    'You are stacking clean wins. Protect the eating window, finish the workout, and let boring discipline do the heavy lifting.',
    'This is how body recomposition starts looking real: simple meals, a tighter schedule, and zero drama around the work.',
    'Keep repeating the basics. Fat loss and muscle gain both respond to the days where you do the obvious things well.',
  ];

  const steadyMessages = [
    'You are not behind, but you are not finished either. Tighten the next meal and close the workout before the day drifts.',
    'The plan is still alive if you act now. One solid meal and one short workout can still turn this into a good day.',
    'Consistency is built in the middle of the day, not at the start. Finish what is still open.',
  ];

  const strictMessages = [
    'Motivation is optional. Discipline is not. Log the food, respect the window, and move your body before excuses get louder.',
    'You do not need a perfect day. You need an honest one. Stop negotiating with the plan and complete the next task.',
    'The goal is still 200 lbs. That only happens if today stops being casual and starts being controlled.',
  ];

  let tier = 'steady';

  if (todayStats.completedTasks >= todayStats.totalTasks - 1 && todayStats.fastingCompliant) {
    tier = 'strong';
  }

  if (todayStats.completedTasks <= 1 || !todayStats.fastingCompliant) {
    tier = 'strict';
  }

  const messagePools = {
    strong: strongMessages,
    steady: steadyMessages,
    strict: strictMessages,
  };

  let action = 'Repeat the same structure tomorrow.';

  if (!todayStats.mealCount) {
    action = `Start your first meal inside the ${profile.initialFastingProtocol} window and make it protein-forward.`;
  } else if (!todayStats.workoutCompleted) {
    action = 'Finish today’s workout before the day gets away from you.';
  } else if (!todayStats.weightLogged) {
    action = 'Log the weigh-in soon so the trend stays real, not guessed.';
  } else if (!todayStats.fastingCompliant) {
    action = 'Close the kitchen on time tonight and reset the standard immediately.';
  }

  return {
    tier,
    title:
      tier === 'strong'
        ? 'Coach says: keep stacking wins'
        : tier === 'steady'
          ? 'Coach says: finish strong'
          : 'Coach says: tighten it up',
    message: pickMessage(messagePools[tier], dayKey),
    subline:
      todayStats.streak > 0
        ? `${todayStats.streak} disciplined day${todayStats.streak === 1 ? '' : 's'} in a row. Protect that momentum.`
        : 'The next disciplined day starts the next streak. Build it now.',
    action,
  };
}

export function getAlerts({
  now,
  mealsToday,
  fastingCompliant,
  workoutCompleted,
  daysSinceWeight,
  remainingToGoal,
  dayNutrition,
}) {
  const alerts = [];
  const currentHour = now.getHours();

  if (currentHour >= 12 && mealsToday.length === 0) {
    alerts.push('No meals are logged yet today. If you ate, log it. If you did not, stay sharp until the window opens.');
  }

  if (currentHour >= 17 && !workoutCompleted) {
    alerts.push('Workout is still not done. A 20-minute walk is enough to rescue the day.');
  }

  if (mealsToday.length >= 2 && dayNutrition.carbs >= 140) {
    alerts.push('Carbs are running high today. Make the next meal protein-first and lighter.');
  }

  if (mealsToday.length > 0 && !fastingCompliant) {
    alerts.push('You drifted outside the fasting structure. Close the day clean and reset tomorrow.');
  }

  if (daysSinceWeight > 7) {
    alerts.push('Weight has not been updated in over a week. Data keeps the plan honest.');
  }

  if (remainingToGoal > 30) {
    alerts.push(
      `${Math.round(remainingToGoal)} lbs still separate you from the goal. Small consistent days matter more than intensity spikes.`,
    );
  }

  return alerts.slice(0, 4);
}
