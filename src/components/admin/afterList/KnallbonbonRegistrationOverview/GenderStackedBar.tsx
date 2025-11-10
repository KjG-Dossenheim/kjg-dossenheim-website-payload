import React from 'react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

type GenderCounts = { male: number; female: number; diverse: number; noInfo: number }

export function GenderStackedBar({
  counts,
  className,
}: {
  counts: GenderCounts
  className?: string
}) {
  const total =
    (counts.male || 0) + (counts.female || 0) + (counts.diverse || 0) + (counts.noInfo || 0)
  const labelMap = {
    male: 'Männlich',
    female: 'Weiblich',
    diverse: 'Divers',
    noInfo: 'k.A.',
  } as const
  const segments = [
    { key: 'male', value: counts.male || 0, color: 'var(--color-chart-1)' },
    { key: 'female', value: counts.female || 0, color: 'var(--color-chart-2)' },
    { key: 'diverse', value: counts.diverse || 0, color: 'var(--color-chart-3)' },
    { key: 'noInfo', value: counts.noInfo || 0, color: 'var(--color-chart-4)' },
  ] as const

  return (
    <div
      className={`bg-muted relative h-10 w-full overflow-hidden rounded-(--radius) opacity-90 ${className ?? ''}`}
      aria-label="Geschlechterverteilung"
    >
      {total === 0 ? (
        <div className="h-full w-full" />
      ) : (
        <div className="flex h-full w-full">
          <TooltipProvider>
            {segments.map((segment) => {
              const pct = (segment.value / total) * 100
              if (pct <= 0) return null
              return (
                <Tooltip key={segment.key}>
                  <TooltipTrigger asChild>
                    <div
                      style={{ width: `${pct}%`, backgroundColor: segment.color }}
                      className="text-background h-full text-center text-sm leading-10 font-medium"
                      aria-hidden="true"
                    >
                      {segment.value}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    {`${labelMap[segment.key]}: ${segment.value} (${Math.round(pct)}%)`}
                  </TooltipContent>
                </Tooltip>
              )
            })}
          </TooltipProvider>
        </div>
      )}
    </div>
  )
}
