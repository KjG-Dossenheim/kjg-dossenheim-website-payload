'use client'

import { useEffect, useState } from 'react'
import { SlidingNumber } from '../ui/sliding-number'
import { toZonedTime } from 'date-fns-tz'

interface CountdownProps {
  targetDate: string
  textColor?: string
  timezone?: string
}

/**
 * A countdown timer component that displays the remaining time until a target date.
 *
 * @component
 * @param {CountdownProps} props - The component props
 * @param {string | Date} props.targetDate - The target date to count down to
 * @param {string} props.textColor - CSS class(es) for the text color styling
 * @param {string} [props.timezone='Etc/UTC'] - The timezone for the countdown calculation, defaults to NEXT_PUBLIC_DEFAULT_TIMEZONE environment variable or 'Etc/UTC'
 *
 * @returns {JSX.Element} A responsive countdown display showing days, hours, minutes, and seconds with animated sliding numbers
 *
 * @example
 * ```tsx
 * <Countdown
 *   targetDate="2024-12-31T23:59:59"
 *   textColor="text-white"
 *   timezone="Europe/Berlin"
 * />
 * ```
 */
export default function Countdown({
  targetDate,
  textColor,
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
  }, [targetDate, timezone])

  return (
    <div className="mx-auto flex justify-center gap-5">
      <div className={`${textColor}`}>
        <span className="inline-block font-mono text-4xl">
          <span aria-live="polite" aria-label="15">
            <SlidingNumber value={timeLeft.days} padStart={true} />
          </span>
        </span>
        <span className="sm:pl-1">Tage</span>
      </div>
      <div className={`${textColor}`}>
        <span className="inline-block font-mono text-4xl">
          <span aria-live="polite" aria-label="10">
            <SlidingNumber value={timeLeft.hours} padStart={true} />
          </span>
        </span>
        <span className="sm:pl-1">Stunden</span>
      </div>
      <div className={`${textColor}`}>
        <span className="inline-block font-mono text-4xl">
          <span aria-live="polite" aria-label="24">
            <SlidingNumber value={timeLeft.minutes} padStart={true} />
          </span>
        </span>
        <span className="sm:pl-1">Minuten</span>
      </div>
      <div className={`${textColor}`}>
        <span className="inline-block font-mono text-4xl">
          <span aria-live="polite" aria-label={`${timeLeft.seconds}`}>
            <SlidingNumber value={timeLeft.seconds} padStart={true} />
          </span>
        </span>
        <span className="sm:pl-1">Sekunden</span>
      </div>
    </div>
  )
}
