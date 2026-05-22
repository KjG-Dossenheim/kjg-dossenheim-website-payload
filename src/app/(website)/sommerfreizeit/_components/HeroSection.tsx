import React from 'react'
import dynamic from 'next/dynamic'
import Image from 'next/image'
import DateComponent from '@/components/common/date'
import type { Media } from '@/payload-types'

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
  backgroundImage: Media | string | null | undefined
}

export default function HeroSection({
  title,
  motto,
  startDate,
  endDate,
  backgroundImage,
}: HeroSectionProps) {
  const bgUrl = typeof backgroundImage === 'string' ? undefined : backgroundImage?.url
  const bgAlt = typeof backgroundImage === 'string' ? title : backgroundImage?.alt || title

  return (
    <section className="background-cover relative h-screen! overflow-hidden text-center">
      {bgUrl && (
        <Image
          src={bgUrl}
          alt={bgAlt}
          className="object-cover object-right"
          fill
          priority
          sizes="100vw"
        />
      )}
      <div className="relative z-10 flex h-full flex-col items-center justify-center space-y-3 px-4">
        <div className="bg-primary rotate-3 px-4 py-2">
          <h1 className="text-primary-foreground text-4xl font-bold md:text-5xl lg:text-6xl">
            {title}
          </h1>
        </div>
        <div className="bg-primary mx-auto w-fit -rotate-3 px-4 py-2">
          <h2 className="text-primary-foreground text-xl md:text-2xl lg:text-3xl">{motto}</h2>
        </div>
        <div className="bg-primary mx-auto w-fit rotate-3 px-4 py-2">
          <p className="text-primary-foreground text-lg font-normal lg:text-xl">
            <DateComponent dateString={startDate} formatString="EEEE, d. MMMM" /> bis{' '}
            <DateComponent dateString={endDate} formatString="EEEE, d. MMMM" />
          </p>
        </div>
        <div className="bg-primary -rotate-3 px-4 py-2">
          <Countdown targetDate={startDate} textColor="text-primary-foreground" />
        </div>
      </div>
    </section>
  )
}
