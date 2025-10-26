'use client'

import { useEffect, useState } from 'react'
import { SlidingNumber } from '../ui/sliding-number'
import { Card } from '../ui/card'
import { toZonedTime } from 'date-fns-tz'

interface CountdownProps {
  targetDate: string
  textColor?: string
  bgColor?: string
  timezone?: string
}

export default function Countdown({
  targetDate,
  textColor,
  bgColor,
  timezone = process.env.NEXT_PUBLIC_DEFAULT_TIMEZONE ?? 'Etc/UTC',
}: CountdownProps) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  })

  useEffect(() => {
    const targetDateInTimezone = toZonedTime(new Date(targetDate), timezone)
    const target = targetDateInTimezone.getTime()

    const interval = setInterval(() => {
      const nowInTimezone = toZonedTime(new Date(), timezone)
      const now = nowInTimezone.getTime()
      const difference = target - now

      if (difference <= 0) {
        clearInterval(interval)
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 })
        return
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24))
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((difference % (1000 * 60)) / 1000)

      setTimeLeft({ days, hours, minutes, seconds })
    }, 1000)

    return () => clearInterval(interval)
  }, [targetDate])

  return (
    <div className="flex flex-wrap justify-center gap-2 sm:gap-3 md:gap-4">
      <Card
        className={`${bgColor} ${textColor} flex flex-col items-center rounded-lg p-2 sm:p-3 md:p-4`}
      >
        <span className="text-2xl font-bold sm:text-3xl md:text-4xl">
          <SlidingNumber value={timeLeft.days} padStart={true} />
        </span>
        <span className="text-xs sm:text-sm">Tage</span>
      </Card>
      <Card
        className={`${bgColor} ${textColor} flex flex-col items-center rounded-lg p-2 sm:p-3 md:p-4`}
      >
        <span className="text-2xl font-bold sm:text-3xl md:text-4xl">
          <SlidingNumber value={timeLeft.hours} padStart={true} />
        </span>
        <span className="text-xs sm:text-sm">Stunden</span>
      </Card>
      <Card
        className={`${bgColor} ${textColor} flex flex-col items-center rounded-lg p-2 sm:p-3 md:p-4`}
      >
        <span className="text-2xl font-bold sm:text-3xl md:text-4xl">
          <SlidingNumber value={timeLeft.minutes} padStart={true} />
        </span>
        <span className="text-xs sm:text-sm">Minuten</span>
      </Card>
      <Card
        className={`${bgColor} ${textColor} flex flex-col items-center rounded-lg p-2 sm:p-3 md:p-4`}
      >
        <span className="text-2xl font-bold sm:text-3xl md:text-4xl">
          <SlidingNumber value={timeLeft.seconds} padStart={true} />
        </span>
        <span className="text-xs sm:text-sm">Sekunden</span>
      </Card>
    </div>
  )
}
