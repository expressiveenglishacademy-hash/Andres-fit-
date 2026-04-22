import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

function formatWeight(weight) {
  return Number(weight).toFixed(1).replace('.0', '');
}

export default function Dashboard({
  alerts,
  coachMessage,
  consistencyData,
  fastingStatus,
  profile,
  streak,
  todayMeals,
  todayTasks,
  weightSummary,
}) {
  return (
    <section className="space-y-5">
      <div className="grid gap-5 lg:grid-cols-[1.45fr_0.95fr]">
        <div className="panel overflow-hidden bg-gradient-to-br from-white via-white to-mist">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="max-w-3xl">
              <p className="section-kicker">Personal Nutrition Coach</p>
              <h1 className="mt-3 max-w-2xl font-display text-3xl leading-tight text-ink sm:text-4xl">
                Modern daily coaching for fat loss, muscle gain, and tighter discipline.
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
                Built around a hardcoded 16:8 fasting plan, simple food choices, and a
                steady push from 250 lbs toward 200 lbs.
              </p>
            </div>

            <div className="rounded-3xl bg-brand px-4 py-3 text-white shadow-float">
              <div className="text-xs uppercase tracking-[0.22em] text-white/70">
                Current plan
              </div>
              <div className="mt-1 text-xl font-extrabold">{profile.goal}</div>
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <div className="metric-card">
              <div className="text-xs uppercase tracking-[0.2em] text-slate-500">
                Start weight
              </div>
              <div className="mt-2 text-2xl font-extrabold text-ink">
                {formatWeight(profile.currentWeight)} lbs
              </div>
              <p className="mt-1 text-sm text-slate-500">Sedentary baseline</p>
            </div>

            <div className="metric-card">
              <div className="text-xs uppercase tracking-[0.2em] text-slate-500">
                Goal weight
              </div>
              <div className="mt-2 text-2xl font-extrabold text-ink">
                {formatWeight(profile.goalWeight)} lbs
              </div>
              <p className="mt-1 text-sm text-slate-500">Lean, stronger target</p>
            </div>

            <div className="metric-card">
              <div className="text-xs uppercase tracking-[0.2em] text-slate-500">
                Eating window
              </div>
              <div className="mt-2 text-2xl font-extrabold text-ink">
                {fastingStatus.windowTimeRange}
              </div>
              <p className="mt-1 text-sm text-slate-500">
                {fastingStatus.fastingHours}h fast / {fastingStatus.eatingHours}h eat
              </p>
            </div>
          </div>
        </div>

        <div className="panel">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="section-kicker">Consistency</p>
              <h2 className="mt-2 text-xl font-extrabold text-ink">7-day discipline view</h2>
            </div>
            <div className="rounded-2xl bg-brand/10 px-3 py-2 text-right">
              <div className="text-xs uppercase tracking-[0.2em] text-brand/70">Streak</div>
              <div className="text-2xl font-extrabold text-brand">{streak} days</div>
            </div>
          </div>

          <div className="mt-4 h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={consistencyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5ece6" />
                <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={12} />
                <YAxis
                  domain={[0, 4]}
                  tickCount={5}
                  tickLine={false}
                  axisLine={false}
                  fontSize={12}
                />
                <Tooltip
                  cursor={{ fill: 'rgba(36, 93, 68, 0.06)' }}
                  formatter={(value) => [`${value}/4 habits`, 'Consistency score']}
                />
                <Bar dataKey="score" radius={[12, 12, 0, 0]}>
                  {consistencyData.map((entry) => (
                    <Cell
                      key={entry.date}
                      fill={
                        entry.score >= 3
                          ? '#245d44'
                          : entry.score === 2
                            ? '#f4b450'
                            : '#ef7c57'
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <p className="mt-3 text-sm text-slate-500">
            Score is based on meals logged, fasting compliance, workout completion, and
            weight check-ins.
          </p>
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-3">
        <div className="panel">
          <p className="section-kicker">Today&apos;s Tasks</p>
          <h2 className="mt-2 text-xl font-extrabold text-ink">Stay on the rails</h2>
          <div className="mt-5 space-y-3">
            {todayTasks.map((task) => (
              <div
                key={task.label}
                className={`rounded-3xl border p-4 transition ${
                  task.done
                    ? 'border-brand/20 bg-brand/5'
                    : 'border-slate-200 bg-slate-50/80'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`mt-1 h-4 w-4 rounded-full border ${
                      task.done
                        ? 'border-brand bg-brand shadow-lg shadow-brand/20'
                        : 'border-slate-300 bg-white'
                    }`}
                  />
                  <div>
                    <div className="font-semibold text-ink">{task.label}</div>
                    <p className="mt-1 text-sm text-slate-500">{task.hint}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="panel">
          <p className="section-kicker">Meals Logged Today</p>
          <h2 className="mt-2 text-xl font-extrabold text-ink">Food accountability</h2>
          <div className="mt-5 space-y-3">
            {todayMeals.length ? (
              todayMeals.map((meal) => (
                <div key={meal.id} className="rounded-3xl border border-slate-200 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-sm font-bold text-ink">{meal.text}</div>
                    <span className="chip">{meal.time}</span>
                  </div>
                  <div className="mt-2 text-sm text-slate-500">
                    {meal.matchedFoods.length
                      ? `Detected foods: ${meal.matchedFoods.join(', ')}`
                      : 'Custom meal logged with manual text.'}
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50/80 p-5 text-sm text-slate-500">
                No meals logged yet. The first log sets the tone for the day.
              </div>
            )}
          </div>
        </div>

        <div className="panel">
          <p className="section-kicker">Fasting Status</p>
          <h2 className="mt-2 text-xl font-extrabold text-ink">{fastingStatus.statusLabel}</h2>
          <div className="mt-5 rounded-[28px] bg-brand p-5 text-white shadow-float">
            <div className="text-xs uppercase tracking-[0.22em] text-white/70">
              {fastingStatus.nextChangeLabel}
            </div>
            <div className="mt-2 text-4xl font-extrabold">{fastingStatus.countdown}</div>
            <p className="mt-3 text-sm text-white/80">
              Window today: {fastingStatus.windowTimeRange}
            </p>
          </div>
          <p className="mt-4 text-sm leading-6 text-slate-500">
            {fastingStatus.progressText}
          </p>
        </div>

        <div className="panel">
          <p className="section-kicker">Weight Progress</p>
          <h2 className="mt-2 text-xl font-extrabold text-ink">Closer, one clean week at a time</h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <div className="metric-card">
              <div className="text-xs uppercase tracking-[0.2em] text-slate-500">
                Current
              </div>
              <div className="mt-2 text-2xl font-extrabold text-ink">
                {formatWeight(weightSummary.currentWeight)} lbs
              </div>
            </div>
            <div className="metric-card">
              <div className="text-xs uppercase tracking-[0.2em] text-slate-500">
                Remaining
              </div>
              <div className="mt-2 text-2xl font-extrabold text-ink">
                {formatWeight(weightSummary.remainingToGoal)} lbs
              </div>
            </div>
          </div>

          <div className="mt-5 rounded-3xl bg-slate-50/90 p-4">
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm font-semibold text-slate-600">Goal progress</span>
              <span className="text-sm font-bold text-brand">
                {Math.round(weightSummary.goalProgress)}%
              </span>
            </div>
            <div className="mt-3 h-3 rounded-full bg-slate-200">
              <div
                className="h-3 rounded-full bg-gradient-to-r from-brand to-amberSoft"
                style={{ width: `${weightSummary.goalProgress}%` }}
              />
            </div>
            <p className="mt-3 text-sm text-slate-500">
              Ideal range for {profile.heightCm} cm: {weightSummary.idealRange.minLbs} to{' '}
              {weightSummary.idealRange.maxLbs} lbs
            </p>
          </div>
        </div>

        <div className="panel">
          <p className="section-kicker">Motivational Message</p>
          <h2 className="mt-2 text-xl font-extrabold text-ink">{coachMessage.title}</h2>
          <blockquote className="mt-5 rounded-[28px] bg-sand p-5 text-base font-semibold leading-7 text-ink">
            {coachMessage.message}
          </blockquote>
          <p className="mt-4 text-sm text-slate-500">{coachMessage.action}</p>
        </div>

        <div className="panel">
          <p className="section-kicker">Alerts</p>
          <h2 className="mt-2 text-xl font-extrabold text-ink">If you&apos;re slipping, it shows here</h2>
          <div className="mt-5 space-y-3">
            {alerts.length ? (
              alerts.map((alert) => (
                <div key={alert} className="rounded-3xl border border-coral/20 bg-coral/10 p-4">
                  <p className="text-sm font-semibold leading-6 text-ink">{alert}</p>
                </div>
              ))
            ) : (
              <div className="rounded-3xl border border-brand/20 bg-brand/5 p-4 text-sm text-slate-600">
                No major red flags right now. Keep repeating simple wins.
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
