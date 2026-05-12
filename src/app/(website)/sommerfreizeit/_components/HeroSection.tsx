import React from 'react'
import dynamic from 'next/dynamic'
import DateComponent from '@/components/common/date'
import { BackgroundLines } from '@/components/ui/background-lines'

const Countdown = dynamic(() => import('@/components/common/Countdown'), {
  loading: () => <div className="h-16 animate-pulse rounded bg-gray-200" />,
})

interface HeroSectionProps {
  title: string
  motto?: string | null | undefined
  startDate: string
  endDate: string
  signupStartDate?: string | null
  pretixEventId: string
}

export default function HeroSection({ title, motto, startDate, endDate }: HeroSectionProps) {
  return (
    <BackgroundLines className="relative h-screen! overflow-hidden text-center">
      <section className="relative z-10 flex h-full flex-col items-center justify-center space-y-6 px-4">
        <div className="space-y-4">
          <h1 className="text-4xl font-bold md:text-5xl lg:text-6xl">{title}</h1>
          <h2 className="text-xl md:text-2xl lg:text-3xl">{motto}</h2>
        </div>
        <div className="space-y-2">
          <Countdown targetDate={startDate} />
          <p className="text-lg font-normal lg:text-xl">
            <DateComponent dateString={startDate} formatString="EEEE, d. MMMM yyyy" /> bis{' '}
            <DateComponent dateString={endDate} formatString="EEEE, d. MMMM yyyy" />
          </p>
        </div>
      </section>
    </BackgroundLines>
  )
}
