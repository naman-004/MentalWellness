import { useMemo } from 'react'
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from 'recharts'
import { JournalEntry } from '../../types/journal'

interface MoodDistributionProps {
  entries: JournalEntry[]
}

export default function MoodDistribution({ entries }: MoodDistributionProps) {
  const chartData = useMemo(() => {
    const activeEntries = entries.filter((e) => e.deletedAt === null)
    const counts = {
      Low: 0,
      Medium: 0,
      High: 0,
      Critical: 0,
    }

    let analyzedCount = 0
    activeEntries.forEach((entry) => {
      if (entry.aiAnalysis) {
        analyzedCount++
        const lvl = entry.aiAnalysis.stressLevel
        if (lvl === 'low') counts.Low++
        else if (lvl === 'medium') counts.Medium++
        else if (lvl === 'high') counts.High++
        else if (lvl === 'critical') counts.Critical++
      }
    })

    if (analyzedCount === 0) return []

    return [
      { name: 'Low Stress', value: counts.Low, color: 'var(--color-success)' },
      { name: 'Medium Stress', value: counts.Medium, color: 'var(--color-warning)' },
      { name: 'High Stress', value: counts.High, color: 'var(--color-danger)' },
      { name: 'Critical Stress', value: counts.Critical, color: 'var(--color-zen)' },
    ].filter((item) => item.value > 0)
  }, [entries])

  if (chartData.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-sm text-text-secondary">
        No analyzed journal entries to show stress distribution yet.
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Screen reader table alternative */}
      <div className="sr-only">
        <h4>Stress Level Distribution Table</h4>
        <table>
          <thead>
            <tr>
              <th scope="col">Stress Category</th>
              <th scope="col">Number of Entries</th>
            </tr>
          </thead>
          <tbody>
            {chartData.map((row) => (
              <tr key={row.name}>
                <td>{row.name}</td>
                <td>{row.value} entries</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Chart container */}
      <div className="h-64 w-full" aria-hidden="true">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
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
              verticalAlign="bottom"
              height={36}
              iconType="circle"
              formatter={(value) => <span className="text-xs text-text-secondary">{value}</span>}
            />
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={4}
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
