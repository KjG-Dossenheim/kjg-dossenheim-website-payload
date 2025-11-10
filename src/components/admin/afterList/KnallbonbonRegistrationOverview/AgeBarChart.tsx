'use client'

import React from 'react'
import { Bar, BarChart, CartesianGrid, LabelList, XAxis, YAxis } from 'recharts'
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'

export const description = 'A bar chart showing age distribution'

// Generate dynamic chart config based on data
const generateChartConfig = (data: { age: number; value: number }[]): ChartConfig => {
  const config: ChartConfig = {}
  const colors = [
    'hsl(var(--chart-1))',
    'hsl(var(--chart-2))',
    'hsl(var(--chart-3))',
    'hsl(var(--chart-4))',
    'hsl(var(--chart-5))',
  ]

  data.forEach((item, index) => {
    config[`age${item.age}`] = {
      label: `${item.age} Jahre`,
      color: colors[index % colors.length],
    }
  })

  return config
}

export const AgeBarChart: React.FC<{
  data: { age: number; value: number }[]
  className?: string
}> = ({ data, className }) => {
  // Transform data for BarChart - each age as a separate entry
  const chartData = data.map((item) => ({
    age: `${item.age} Jahre`,
    value: item.value,
    fill: `var(--color-age${item.age})`,
  }))

  const chartConfig = generateChartConfig(data)

  return (
    <ChartContainer
      config={chartConfig}
      className={`m-auto min-h-[200px] w-full ${className ?? ''}`}
    >
      <BarChart data={chartData}>
        <XAxis dataKey="age" tickLine={false} tickMargin={10} axisLine={false} />
        <Bar dataKey="value" radius={8}>
          <LabelList
            position="insideBottom"
            offset={12}
            className="fill-foreground"
            fontSize={12}
          />
        </Bar>
      </BarChart>
    </ChartContainer>
  )
}

export default AgeBarChart
