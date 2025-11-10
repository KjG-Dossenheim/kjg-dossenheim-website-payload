import React from 'react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

export const AgeStackedBar: React.FC<{
  data: { age: number; value: number }[]
  className?: string
}> = ({ data, className }) => {
  const total = data.reduce((sum, item) => sum + item.value, 0)

  // Define colors - cycle through chart colors
  const colors = [
    'hsl(var(--chart-1))',
    'hsl(var(--chart-2))',
    'hsl(var(--chart-3))',
    'hsl(var(--chart-4))',
    'hsl(var(--chart-5))',
  ]

  return (
    <div
      className={`bg-muted relative h-10 w-full overflow-hidden rounded-(--radius) opacity-90 ${className ?? ''}`}
      aria-label="Altersverteilung"
    >
      {total === 0 ? (
        <div className="h-full w-full" />
      ) : (
        <div className="flex h-full w-full">
          <TooltipProvider>
            {data.map((section, index) => {
              const pct = (section.value / total) * 100
              if (pct <= 0) return null
              return (
                <Tooltip key={section.age}>
                  <TooltipTrigger asChild>
                    <div
                      style={{
                        width: `${pct}%`,
                        backgroundColor: colors[index % colors.length],
                      }}
                      className="text-background h-full text-center text-sm leading-10 font-medium"
                      aria-hidden
                    >
                      {section.value}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    {`${section.age} Jahre: ${section.value} (${Math.round(pct)}%)`}
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
