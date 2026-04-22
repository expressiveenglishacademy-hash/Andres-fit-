export default function CoachMessage({
  coachMessage,
  completedTasks,
  streak,
  totalTasks,
}) {
  const toneStyles = {
    strong: 'from-brand to-brand/85 text-white',
    steady: 'from-amberSoft to-[#f6c36c] text-ink',
    strict: 'from-coral to-[#f09978] text-ink',
  };

  return (
    <section className="panel">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="section-kicker">Daily Coach System</p>
          <h2 className="mt-2 text-2xl font-extrabold text-ink">Your coach for today</h2>
        </div>
        <div className="rounded-3xl bg-slate-50 px-4 py-3 text-right">
          <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Task score</div>
          <div className="mt-1 text-2xl font-extrabold text-ink">
            {completedTasks}/{totalTasks}
          </div>
        </div>
      </div>

      <div
        className={`mt-6 rounded-[30px] bg-gradient-to-br p-6 shadow-float ${toneStyles[coachMessage.tier]}`}
      >
        <div className="text-xs uppercase tracking-[0.25em] opacity-70">{coachMessage.title}</div>
        <p className="mt-4 text-2xl font-display leading-tight">{coachMessage.message}</p>
        <p className="mt-4 text-sm leading-6 opacity-85">{coachMessage.subline}</p>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <div className="rounded-3xl border border-slate-200 p-4">
          <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Coach action</div>
          <div className="mt-2 text-base font-semibold text-ink">{coachMessage.action}</div>
        </div>
        <div className="rounded-3xl border border-slate-200 p-4">
          <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Current streak</div>
          <div className="mt-2 text-base font-semibold text-ink">
            {streak} disciplined day{streak === 1 ? '' : 's'}
          </div>
        </div>
      </div>
    </section>
  );
}
