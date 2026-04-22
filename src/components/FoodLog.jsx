import { useState } from 'react';
import { getCurrentTimeValue } from '../utils/calculations';

function formatMacro(value) {
  return Math.round(Number(value || 0));
}

export default function FoodLog({
  foods,
  mealsToday,
  nextMealRecommendation,
  onAddMeal,
  todayNutrition,
}) {
  const [mealText, setMealText] = useState('');
  const [mealTime, setMealTime] = useState(getCurrentTimeValue());

  function handleQuickAdd(foodName) {
    setMealText((currentText) =>
      currentText.trim() ? `${currentText}, ${foodName}` : foodName,
    );
  }

  function handleSubmit(event) {
    event.preventDefault();

    if (!mealText.trim()) {
      return;
    }

    onAddMeal({
      text: mealText,
      time: mealTime,
    });

    setMealText('');
    setMealTime(getCurrentTimeValue());
  }

  return (
    <section className="panel">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="section-kicker">Food Logging System</p>
          <h2 className="mt-2 text-2xl font-extrabold text-ink">Track meals with simple text</h2>
        </div>
        <div className="rounded-3xl bg-brand/5 px-4 py-3 text-sm text-slate-600">
          Free text works. Quick buttons work. Keep it honest.
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-4">
        <div className="metric-card">
          <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Protein</div>
          <div className="mt-2 text-2xl font-extrabold text-ink">
            {formatMacro(todayNutrition.protein)}g
          </div>
        </div>
        <div className="metric-card">
          <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Carbs</div>
          <div className="mt-2 text-2xl font-extrabold text-ink">
            {formatMacro(todayNutrition.carbs)}g
          </div>
        </div>
        <div className="metric-card">
          <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Fats</div>
          <div className="mt-2 text-2xl font-extrabold text-ink">
            {formatMacro(todayNutrition.fats)}g
          </div>
        </div>
        <div className="metric-card">
          <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Calories</div>
          <div className="mt-2 text-2xl font-extrabold text-ink">
            {formatMacro(todayNutrition.calories)}
          </div>
        </div>
      </div>

      <form className="mt-6 grid gap-4" onSubmit={handleSubmit}>
        <div className="grid gap-4 lg:grid-cols-[1fr_180px]">
          <textarea
            className="field-input min-h-[120px] resize-none"
            placeholder="Example: eggs, gallopinto, and fruit"
            value={mealText}
            onChange={(event) => setMealText(event.target.value)}
          />
          <div className="space-y-3">
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-600">
                Meal time
              </span>
              <input
                className="field-input"
                type="time"
                value={mealTime}
                onChange={(event) => setMealTime(event.target.value)}
              />
            </label>
            <button className="btn-primary w-full" type="submit">
              Log meal
            </button>
          </div>
        </div>

        <div>
          <div className="mb-3 text-sm font-semibold text-slate-600">
            Quick add common foods
          </div>
          <div className="flex flex-wrap gap-2">
            {foods.map((food) => (
              <button
                key={food.id}
                className="btn-secondary rounded-full px-4 py-2 text-xs"
                type="button"
                onClick={() => handleQuickAdd(food.name)}
              >
                {food.name}
              </button>
            ))}
          </div>
        </div>
      </form>

      <div className="mt-6 rounded-[28px] bg-brand p-5 text-white shadow-float">
        <div className="text-xs uppercase tracking-[0.22em] text-white/70">
          Next meal recommendation
        </div>
        <div className="mt-2 text-xl font-extrabold">{nextMealRecommendation.title}</div>
        <p className="mt-3 text-sm leading-6 text-white/85">{nextMealRecommendation.body}</p>
      </div>

      <div className="mt-6">
        <div className="mb-3 text-sm font-semibold text-slate-600">Meals logged today</div>
        <div className="space-y-3">
          {mealsToday.length ? (
            mealsToday.map((meal) => (
              <div key={meal.id} className="rounded-[28px] border border-slate-200 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="text-base font-bold text-ink">{meal.text}</div>
                    <div className="mt-1 text-sm text-slate-500">
                      {meal.matchedFoods.length
                        ? `Detected: ${meal.matchedFoods.join(', ')}`
                        : 'Manual text entry'}
                    </div>
                  </div>
                  <span className="chip">{meal.time}</span>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-4">
                  <div className="rounded-2xl bg-slate-50 px-3 py-2 text-sm">
                    <div className="text-xs uppercase tracking-[0.2em] text-slate-400">
                      Protein
                    </div>
                    <div className="mt-1 font-bold text-ink">
                      {formatMacro(meal.totals?.protein)}g
                    </div>
                  </div>
                  <div className="rounded-2xl bg-slate-50 px-3 py-2 text-sm">
                    <div className="text-xs uppercase tracking-[0.2em] text-slate-400">
                      Carbs
                    </div>
                    <div className="mt-1 font-bold text-ink">
                      {formatMacro(meal.totals?.carbs)}g
                    </div>
                  </div>
                  <div className="rounded-2xl bg-slate-50 px-3 py-2 text-sm">
                    <div className="text-xs uppercase tracking-[0.2em] text-slate-400">
                      Fats
                    </div>
                    <div className="mt-1 font-bold text-ink">
                      {formatMacro(meal.totals?.fats)}g
                    </div>
                  </div>
                  <div className="rounded-2xl bg-slate-50 px-3 py-2 text-sm">
                    <div className="text-xs uppercase tracking-[0.2em] text-slate-400">
                      Calories
                    </div>
                    <div className="mt-1 font-bold text-ink">
                      {formatMacro(meal.totals?.calories)}
                    </div>
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  {meal.feedback?.map((line) => (
                    <div
                      key={line}
                      className="rounded-2xl border border-brand/10 bg-brand/5 px-3 py-2 text-sm text-slate-600"
                    >
                      {line}
                    </div>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-[28px] border border-dashed border-slate-300 bg-slate-50/80 p-5 text-sm text-slate-500">
              No meals logged yet. A clear first meal makes the rest of the day easier.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
