import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useState } from 'react';
import { buildWeightChartData, formatDateKey, formatLongDate } from '../utils/calculations';

function formatWeight(weight) {
  return Number(weight).toFixed(1).replace('.0', '');
}

export default function WeightTracker({
  aboveGoal,
  currentWeight,
  goalProgress,
  idealRange,
  onAddWeight,
  profile,
  remainingToGoal,
  weightHistory,
}) {
  const [weightInput, setWeightInput] = useState(String(currentWeight));
  const [entryDate, setEntryDate] = useState(formatDateKey(new Date()));

  const chartData = buildWeightChartData(weightHistory);
  const latestEntry = chartData[chartData.length - 1];

  function handleSubmit(event) {
    event.preventDefault();
    onAddWeight({ weight: weightInput, date: entryDate });
  }

  return (
    <section className="panel">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="section-kicker">Weight &amp; Goal System</p>
          <h2 className="mt-2 text-2xl font-extrabold text-ink">Keep the trend visible</h2>
        </div>
        <div className="rounded-3xl bg-brand/5 px-4 py-3 text-sm text-slate-600">
          Update daily or weekly. Just do not disappear.
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="metric-card">
          <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Current</div>
          <div className="mt-2 text-2xl font-extrabold text-ink">
            {formatWeight(currentWeight)} lbs
          </div>
        </div>
        <div className="metric-card">
          <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Above goal</div>
          <div className="mt-2 text-2xl font-extrabold text-ink">
            {formatWeight(aboveGoal)} lbs
          </div>
        </div>
        <div className="metric-card">
          <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Remaining</div>
          <div className="mt-2 text-2xl font-extrabold text-ink">
            {formatWeight(remainingToGoal)} lbs
          </div>
        </div>
        <div className="metric-card">
          <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Ideal range</div>
          <div className="mt-2 text-2xl font-extrabold text-ink">
            {idealRange.minLbs}-{idealRange.maxLbs}
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-[28px] bg-slate-50/90 p-5">
        <div className="flex items-center justify-between gap-3">
          <span className="text-sm font-semibold text-slate-600">Progress toward 200 lbs</span>
          <span className="text-sm font-bold text-brand">{Math.round(goalProgress)}%</span>
        </div>
        <div className="mt-3 h-3 rounded-full bg-slate-200">
          <div
            className="h-3 rounded-full bg-gradient-to-r from-brand to-amberSoft"
            style={{ width: `${goalProgress}%` }}
          />
        </div>
        <p className="mt-3 text-sm text-slate-500">
          Profile baseline: {profile.age} years old, {profile.heightCm} cm, aiming for fat
          loss while keeping muscle.
        </p>
      </div>

      <div className="mt-6 h-72 rounded-[28px] border border-slate-200 bg-white p-4">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e7ede8" />
            <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={12} />
            <YAxis
              tickLine={false}
              axisLine={false}
              fontSize={12}
              domain={['dataMin - 5', 'dataMax + 5']}
            />
            <Tooltip
              formatter={(value) => [`${formatWeight(value)} lbs`, 'Weight']}
              labelFormatter={(label) => `Date: ${label}`}
            />
            <ReferenceLine
              y={profile.goalWeight}
              stroke="#245d44"
              strokeDasharray="5 5"
              ifOverflow="extendDomain"
              label={{ value: 'Goal', position: 'insideTopRight', fill: '#245d44', fontSize: 12 }}
            />
            <Line
              type="monotone"
              dataKey="weight"
              stroke="#ef7c57"
              strokeWidth={3}
              dot={{ r: 5, fill: '#ffffff', stroke: '#ef7c57', strokeWidth: 2 }}
              activeDot={{ r: 7 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <form className="mt-6 grid gap-4 sm:grid-cols-[1fr_1fr_auto]" onSubmit={handleSubmit}>
        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-slate-600">Weight (lbs)</span>
          <input
            className="field-input"
            type="number"
            min="100"
            max="500"
            step="0.1"
            value={weightInput}
            onChange={(event) => setWeightInput(event.target.value)}
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-slate-600">Date</span>
          <input
            className="field-input"
            type="date"
            value={entryDate}
            onChange={(event) => setEntryDate(event.target.value)}
          />
        </label>

        <div className="flex items-end">
          <button className="btn-primary w-full sm:w-auto" type="submit">
            Save weight
          </button>
        </div>
      </form>

      <p className="mt-4 text-sm text-slate-500">
        Latest recorded check-in:{' '}
        {latestEntry
          ? `${formatLongDate(latestEntry.date)} at ${formatWeight(latestEntry.weight)} lbs`
          : 'No data yet'}
      </p>
    </section>
  );
}
