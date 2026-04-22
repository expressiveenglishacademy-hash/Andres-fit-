export default function FastingTracker({
  eatingWindowStart,
  fastingCompliant,
  fastingStatus,
  manualCompliance,
  mealsToday,
  onProtocolChange,
  onResetCompliance,
  onSetCompliance,
  onStartTimeChange,
  protocol,
}) {
  const mealsOutsideWindow = mealsToday.filter((meal) => !meal.isWithinWindow);

  return (
    <section className="panel">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="section-kicker">Fasting System</p>
          <h2 className="mt-2 text-2xl font-extrabold text-ink">Stay tight with the window</h2>
        </div>
        <div className="rounded-3xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
          Flexible for 16:8 now and 18:6 later.
        </div>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-slate-600">
            Fasting protocol
          </span>
          <select
            className="field-input"
            value={protocol}
            onChange={(event) => onProtocolChange(event.target.value)}
          >
            <option value="16:8">16:8</option>
            <option value="18:6">18:6</option>
          </select>
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-slate-600">
            Eating window start
          </span>
          <input
            className="field-input"
            type="time"
            value={eatingWindowStart}
            onChange={(event) => onStartTimeChange(event.target.value)}
          />
        </label>
      </div>

      <div className="mt-6 rounded-[28px] bg-gradient-to-br from-brand to-brand/85 p-5 text-white shadow-float">
        <div className="text-xs uppercase tracking-[0.22em] text-white/70">
          {fastingStatus.statusLabel}
        </div>
        <div className="mt-2 text-4xl font-extrabold">{fastingStatus.countdown}</div>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl bg-white/10 p-3">
            <div className="text-xs uppercase tracking-[0.2em] text-white/70">Window</div>
            <div className="mt-1 text-lg font-bold">{fastingStatus.windowTimeRange}</div>
          </div>
          <div className="rounded-2xl bg-white/10 p-3">
            <div className="text-xs uppercase tracking-[0.2em] text-white/70">Protocol</div>
            <div className="mt-1 text-lg font-bold">{protocol}</div>
          </div>
          <div className="rounded-2xl bg-white/10 p-3">
            <div className="text-xs uppercase tracking-[0.2em] text-white/70">Next change</div>
            <div className="mt-1 text-lg font-bold">{fastingStatus.nextChangeAt}</div>
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-[28px] bg-slate-50/90 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-sm font-semibold text-slate-700">Compliance check</div>
            <div className="mt-1 text-sm text-slate-500">
              Status source:{' '}
              {typeof manualCompliance === 'boolean' ? 'manual override' : 'meal log auto-check'}
            </div>
          </div>
          <div
            className={`rounded-full px-3 py-1.5 text-xs font-bold uppercase tracking-[0.18em] ${
              fastingCompliant
                ? 'bg-brand/10 text-brand'
                : 'bg-coral/10 text-coral'
            }`}
          >
            {fastingCompliant ? 'On plan' : 'Needs correction'}
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <button className="btn-secondary" type="button" onClick={() => onSetCompliance(true)}>
            Mark compliant
          </button>
          <button className="btn-secondary" type="button" onClick={() => onSetCompliance(false)}>
            Mark off plan
          </button>
          {typeof manualCompliance === 'boolean' ? (
            <button className="btn-primary" type="button" onClick={onResetCompliance}>
              Use meal log again
            </button>
          ) : null}
        </div>
      </div>

      <div className="mt-6 space-y-3">
        {mealsOutsideWindow.length ? (
          mealsOutsideWindow.map((meal) => (
            <div
              key={meal.id}
              className="rounded-3xl border border-coral/20 bg-coral/10 p-4 text-sm text-slate-600"
            >
              <span className="font-semibold text-ink">{meal.time}</span> was logged outside the
              current eating window: {meal.text}
            </div>
          ))
        ) : (
          <div className="rounded-3xl border border-brand/20 bg-brand/5 p-4 text-sm text-slate-600">
            No logged meals are outside the window right now. Keep the cutoff clean.
          </div>
        )}
      </div>
    </section>
  );
}
