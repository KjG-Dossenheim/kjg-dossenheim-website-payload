'use client'

import { useEffect, useState } from 'react'

interface CountdownProps {
  targetDate: string
}

export default function Countdown({ targetDate }: CountdownProps) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  })

  useEffect(() => {
    const target = new Date(targetDate).getTime()

    const interval = setInterval(() => {
      const now = new Date().getTime()
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
      <div className="flex flex-col items-center rounded-lg bg-primary/10 p-2 dark:bg-primary sm:p-3 md:p-4">
        <span className="text-2xl font-bold text-primary dark:text-white sm:text-3xl md:text-4xl">
          {timeLeft.days}
        </span>
        <span className="text-xs text-gray-600 dark:text-secondary-50 sm:text-sm">Tage</span>
      </div>
      <div className="flex flex-col items-center rounded-lg bg-primary/10 p-2 dark:bg-primary sm:p-3 md:p-4">
        <span className="text-2xl font-bold text-primary dark:text-white sm:text-3xl md:text-4xl">
          {timeLeft.hours}
        </span>
        <span className="text-xs text-gray-600 dark:text-secondary-50 sm:text-sm">Stunden</span>
      </div>
      <div className="flex flex-col items-center rounded-lg bg-primary/10 p-2 dark:bg-primary sm:p-3 md:p-4">
        <span className="text-2xl font-bold text-primary dark:text-white sm:text-3xl md:text-4xl">
          {timeLeft.minutes}
        </span>
        <span className="text-xs text-gray-600 dark:text-secondary-50 sm:text-sm">Minuten</span>
      </div>
      <div className="flex flex-col items-center rounded-lg bg-primary/10 p-2 dark:bg-primary sm:p-3 md:p-4">
        <span className="text-2xl font-bold text-primary dark:text-white sm:text-3xl md:text-4xl">
          {timeLeft.seconds}
        </span>
        <span className="text-xs text-gray-600 dark:text-secondary-50 sm:text-sm">Sekunden</span>
      </div>
    </div>
  )
}
