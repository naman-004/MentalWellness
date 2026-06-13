import { useMemo } from 'react'
import { HeatmapCell } from '../../utils/insightComputer'

interface StressHeatmapProps {
  heatmap: HeatmapCell[]
}

export default function StressHeatmap({ heatmap }: StressHeatmapProps) {
  const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  const weeks = [
    { index: 2, label: '2 Weeks Ago' },
    { index: 1, label: 'Last Week' },
    { index: 0, label: 'This Week' },
  ]

  const getCellColor = (value: number) => {
    switch (value) {
      case 1:
        return 'bg-success/80 border-success/30 text-white'
      case 2:
        return 'bg-warning/80 border-warning/30 text-white'
      case 3:
        return 'bg-danger/60 border-danger/20 text-white'
      case 4:
        return 'bg-danger/90 border-danger/35 text-white'
      default:
        return 'bg-surface-raised/40 border-border/30 text-text-secondary'
    }
  }

  const getCellLabel = (value: number) => {
    switch (value) {
      case 1:
        return 'Low Stress'
      case 2:
        return 'Medium Stress'
      case 3:
        return 'High Stress'
      case 4:
        return 'Critical Stress'
      default:
        return 'No Log'
    }
  }

  // Find a cell in the dataset
  const getCell = (weekIndex: number, dayName: string): HeatmapCell => {
    return (
      heatmap.find((c) => c.weekIndex === weekIndex && c.weekday === dayName) || {
        weekday: dayName,
        weekIndex,
        value: 0,
        count: 0,
      }
    )
  }

  const hasData = useMemo(() => {
    return heatmap.some((c) => c.value > 0)
  }, [heatmap])

  if (!hasData) {
    return (
      <div className="h-64 flex items-center justify-center text-sm text-text-secondary">
        No stress pattern data recorded in the last 21 days. Log entries to generate your stress map.
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Screen reader table alternative */}
      <div className="sr-only">
        <h4>Weekly Stress Heatmap Table</h4>
        <table>
          <thead>
            <tr>
              <th scope="col">Week</th>
              {weekdays.map((day) => (
                <th scope="col" key={day}>
                  {day}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {weeks.map((wk) => (
              <tr key={wk.index}>
                <th scope="row">{wk.label}</th>
                {weekdays.map((day) => {
                  const cell = getCell(wk.index, day)
                  return <td key={day}>{getCellLabel(cell.value)}</td>
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Visual Heatmap Grid */}
      <div className="p-4 rounded-xl bg-surface/50 border border-border space-y-4" aria-hidden="true">
        <div className="overflow-x-auto">
          <div className="min-w-[480px] space-y-3">
            {/* Header: Weekdays */}
            <div className="grid grid-cols-8 gap-2 items-center text-center">
              <div className="text-left text-xs font-semibold text-text-secondary pr-2">Timeline</div>
              {weekdays.map((day) => (
                <div key={day} className="text-xs font-semibold text-text-secondary">
                  {day}
                </div>
              ))}
            </div>

            {/* Heatmap Rows */}
            <div className="space-y-2">
              {weeks.map((wk) => (
                <div key={wk.index} className="grid grid-cols-8 gap-2 items-center text-center">
                  <div className="text-left text-xs text-text-secondary font-medium truncate pr-2">
                    {wk.label}
                  </div>
                  {weekdays.map((day) => {
                    const cell = getCell(wk.index, day)
                    const colorClass = getCellColor(cell.value)
                    const label = getCellLabel(cell.value)
                    return (
                      <div
                        key={day}
                        title={`${wk.label}, ${day}: ${label}`}
                        className={`h-10 rounded-md border flex flex-col items-center justify-center transition duration-150 hover:scale-105 cursor-pointer relative group ${colorClass}`}
                      >
                        <span className="text-[10px] font-bold">
                          {cell.value > 0 ? getCellLabel(cell.value).split(' ')[0] : ''}
                        </span>
                        
                        {/* Hover Tooltip tooltip */}
                        <div className="absolute bottom-full mb-2 hidden group-hover:block z-20 bg-surface-raised border border-border text-text-primary text-[10px] rounded py-1 px-2 pointer-events-none whitespace-nowrap shadow-xl">
                          {label} {cell.count > 0 ? `(${cell.count} entry)` : ''}
                        </div>
                      </div>
                    )
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Legend / Key */}
        <div className="flex flex-wrap items-center justify-end gap-3 pt-2 border-t border-border/40 text-xs text-text-secondary">
          <span>Stress Level Legend:</span>
          <div className="flex items-center gap-1">
            <span className="w-3.5 h-3.5 rounded border border-border/30 bg-surface-raised/40" />
            <span>No Log</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-3.5 h-3.5 rounded border border-success/30 bg-success/80" />
            <span>Low</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-3.5 h-3.5 rounded border border-warning/30 bg-warning/80" />
            <span>Medium</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-3.5 h-3.5 rounded border border-danger/20 bg-danger/60" />
            <span>High</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-3.5 h-3.5 rounded border border-danger/35 bg-danger/90" />
            <span>Critical</span>
          </div>
        </div>
      </div>
    </div>
  )
}
