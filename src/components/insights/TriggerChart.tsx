import { useMemo } from 'react'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from 'recharts'

interface TriggerChartProps {
  triggers: { name: string; value: number }[]
}

export default function TriggerChart({ triggers }: TriggerChartProps) {
  // Take top 6 triggers
  const chartData = useMemo(() => {
    return triggers.slice(0, 6)
  }, [triggers])

  if (chartData.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-sm text-text-secondary">
        No stress triggers analyzed yet. Start journaling to compile patterns.
      </div>
    )
  }

  // A nice set of red-amber gradient/color weights for the bars
  const colors = [
    'var(--color-danger)',
    '#E05252',
    'var(--color-warning)',
    '#DCA134',
    'var(--color-accent)',
    '#68B0FF',
  ]

  return (
    <div className="space-y-4">
      {/* Screen reader table alternative */}
      <div className="sr-only">
        <h4>Primary Stress Triggers Table</h4>
        <table>
          <thead>
            <tr>
              <th scope="col">Trigger</th>
              <th scope="col">Occurrences Count</th>
            </tr>
          </thead>
          <tbody>
            {chartData.map((row) => (
              <tr key={row.name}>
                <td>{row.name}</td>
                <td>{row.value} times</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Chart container */}
      <div className="h-64 w-full" aria-hidden="true">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 10, right: 10, left: 10, bottom: 5 }}
          >
            <XAxis
              type="number"
              stroke="var(--color-text-secondary)"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              allowDecimals={false}
            />
            <YAxis
              type="category"
              dataKey="name"
              stroke="var(--color-text-primary)"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              width={100}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--color-surface-raised)',
                borderColor: 'var(--color-border)',
                borderRadius: '8px',
                color: 'var(--color-text-primary)',
                fontSize: '12px',
              }}
              cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
            />
            <Bar
              dataKey="value"
              radius={[0, 4, 4, 0]}
              barSize={18}
            >
              {chartData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
