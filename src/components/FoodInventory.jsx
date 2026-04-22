import { useState } from 'react';

export default function FoodInventory({
  commonFoods,
  inventory,
  onAddFood,
  onRemoveFood,
  suggestions,
}) {
  const [foodInput, setFoodInput] = useState('');
  const normalizedInventory = inventory.map((food) => food.toLowerCase());

  function handleAddFood(event) {
    event.preventDefault();
    onAddFood(foodInput);
    setFoodInput('');
  }

  return (
    <section className="panel">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="section-kicker">Food Inventory System</p>
          <h2 className="mt-2 text-2xl font-extrabold text-ink">Use what is already at home</h2>
        </div>
        <div className="rounded-3xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
          Realistic suggestions. No complicated meal prep.
        </div>
      </div>

      <form className="mt-6 grid gap-3 sm:grid-cols-[1fr_auto]" onSubmit={handleAddFood}>
        <input
          className="field-input"
          placeholder="Add a food you have available"
          value={foodInput}
          onChange={(event) => setFoodInput(event.target.value)}
        />
        <button className="btn-primary" type="submit">
          Add food
        </button>
      </form>

      <div className="mt-4 flex flex-wrap gap-2">
        {commonFoods
          .filter((food) => !normalizedInventory.includes(food.name.toLowerCase()))
          .map((food) => (
            <button
              key={food.id}
              className="btn-secondary rounded-full px-4 py-2 text-xs"
              type="button"
              onClick={() => onAddFood(food.name)}
            >
              Add {food.name}
            </button>
          ))}
      </div>

      <div className="mt-6">
        <div className="mb-3 text-sm font-semibold text-slate-600">Available foods</div>
        <div className="flex flex-wrap gap-2">
          {inventory.length ? (
            inventory.map((food) => (
              <div key={food} className="chip gap-2 pr-2">
                <span>{food}</span>
                <button
                  className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500"
                  type="button"
                  onClick={() => onRemoveFood(food)}
                >
                  remove
                </button>
              </div>
            ))
          ) : (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50/80 p-4 text-sm text-slate-500">
              No foods entered yet. Add what you actually have so the app can guide the next meal.
            </div>
          )}
        </div>
      </div>

      <div className="mt-6">
        <div className="mb-3 text-sm font-semibold text-slate-600">Suggested meals from home inventory</div>
        <div className="space-y-3">
          {suggestions.length ? (
            suggestions.map((suggestion) => (
              <div key={suggestion.title} className="rounded-[28px] border border-slate-200 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="text-base font-bold text-ink">{suggestion.title}</div>
                  <span className="chip">{suggestion.time}</span>
                </div>
                <div className="mt-2 text-sm text-slate-600">{suggestion.portion}</div>
                <div className="mt-3 rounded-2xl bg-brand/5 px-3 py-2 text-sm text-slate-600">
                  {suggestion.reason}
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-[28px] border border-dashed border-slate-300 bg-slate-50/80 p-5 text-sm text-slate-500">
              Add more foods from your kitchen and the meal ideas will get more specific.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
