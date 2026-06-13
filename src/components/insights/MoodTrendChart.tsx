import { useMemo } from 'react'
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts'
import { JournalEntry } from '../../types/journal'
import { formatDate } from '../../utils/dateHelpers'

interface MoodTrendChartProps {
  entries: JournalEntry[]
}

export default function MoodTrendChart({ entries }: MoodTrendChartProps) {
  const chartData = useMemo(() => {
    // Sort entries oldest first for the trend graph
    const activeEntries = [...entries]
      .filter((e) => e.deletedAt === null)
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
      
    // Limit to last 30 entries for readability
    const recent = activeEntries.slice(-30)

    return recent.map((entry) => ({
      id: entry.id,
      date: formatDate(entry.createdAt),
      rawDate: entry.createdAt.split('T')[0],
      Mood: entry.moodScore,
      'Study Hours': entry.studyHours || 0,
    }))
  }, [entries])

  if (chartData.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-sm text-text-secondary">
        Add some journal entries to view your mood trend.
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Screen reader table description */}
      <div className="sr-only">
        <h4>Mood and Study Hours Trend Table</h4>
        <table>
          <thead>
            <tr>
              <th scope="col">Date</th>
              <th scope="col">Mood (1-10)</th>
              <th scope="col">Study Hours</th>
            </tr>
          </thead>
          <tbody>
            {chartData.map((row) => (
              <tr key={row.id}>
                <td>{row.rawDate}</td>
                <td>{row.Mood}/10</td>
                <td>{row['Study Hours']} hrs</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Chart container */}
      <div className="h-72 w-full" aria-hidden="true">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorMood" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-accent)" stopOpacity={0.4} />
                <stop offset="95%" stopColor="var(--color-accent)" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="colorStudy" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-zen)" stopOpacity={0.4} />
                <stop offset="95%" stopColor="var(--color-zen)" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="date"
              stroke="var(--color-text-secondary)"
              fontSize={11}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              yAxisId="left"
              stroke="var(--color-accent)"
              fontSize={11}
              domain={[0, 10]}
              tickLine={false}
              axisLine={false}
              allowDecimals={false}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              stroke="var(--color-zen)"
              fontSize={11}
              domain={[0, 'auto']}
              tickLine={false}
              axisLine={false}
              allowDecimals={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--color-surface-raised)',
                borderColor: 'var(--color-border)',
                borderRadius: '8px',
                color: 'var(--color-text-primary)',
                fontSize: '12px',
              }}
            />
            <Legend
              verticalAlign="top"
              height={36}
              iconType="circle"
              formatter={(value) => <span className="text-xs text-text-secondary">{value}</span>}
            />
            <Area
              yAxisId="left"
              type="monotone"
              dataKey="Mood"
              stroke="var(--color-accent)"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorMood)"
              activeDot={{ r: 5 }}
            />
            <Area
              yAxisId="right"
              type="monotone"
              dataKey="Study Hours"
              stroke="var(--color-zen)"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorStudy)"
              activeDot={{ r: 5 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
