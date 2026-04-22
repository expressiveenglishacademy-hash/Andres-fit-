export default function WorkoutSection({ completed, onToggleCompleted, workout }) {
  return (
    <section className="panel">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="section-kicker">Exercise Recommendations</p>
          <h2 className="mt-2 text-2xl font-extrabold text-ink">Today&apos;s beginner workout</h2>
        </div>
        <div
          className={`rounded-full px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] ${
            completed ? 'bg-brand/10 text-brand' : 'bg-coral/10 text-coral'
          }`}
        >
          {completed ? 'Completed' : 'Still open'}
        </div>
      </div>

      <div className="mt-6 rounded-[30px] bg-gradient-to-br from-sand to-white p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h3 className="text-2xl font-extrabold text-ink">{workout.title}</h3>
            <p className="mt-2 text-sm text-slate-600">{workout.focus}</p>
          </div>
          <div className="rounded-3xl bg-white px-4 py-3 text-right shadow-sm">
            <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Duration</div>
            <div className="mt-1 text-lg font-bold text-ink">{workout.duration}</div>
          </div>
        </div>

        <div className="mt-5 space-y-3">
          {workout.steps.map((step) => (
            <div key={step} className="rounded-3xl border border-white/80 bg-white/80 p-4 text-sm text-slate-600">
              {step}
            </div>
          ))}
        </div>

        <div className="mt-5 rounded-3xl bg-brand/5 p-4 text-sm font-semibold leading-6 text-slate-700">
          {workout.coachNote}
        </div>

        <button className="btn-primary mt-5 w-full sm:w-auto" type="button" onClick={onToggleCompleted}>
          {completed ? 'Mark as not done' : 'Mark workout complete'}
        </button>
      </div>
    </section>
  );
}
