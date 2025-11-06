import React from 'react'
import Link from 'next/link'
import Date from '@/components/common/date'
import { ChevronDown, User } from 'lucide-react'
import Countdown from '@/components/common/Countdown'
import { Button } from '@/components/ui/button'
import { CardHeader } from '@/components/ui/card'
import { SparklesText } from '@/components/ui/sparkles-text'

interface HeroSectionProps {
  title: string
  motto?: string | null | undefined
  startDate: string
  endDate: string
  anmeldungWebsite: string
}

export default function HeroSection({
  title,
  motto,
  startDate,
  endDate,
  anmeldungWebsite,
}: HeroSectionProps) {
  return (
    <section className="flex flex-col items-center justify-center text-center">
      <CardHeader className="space-y-4">
        <SparklesText
          className="text-4xl font-bold md:text-5xl lg:text-6xl"
          animationDuration={1.5}
          regenerationInterval={200}
          lifespanRange={{ min: 10, max: 20 }}
        >
          {title}
        </SparklesText>
        <h2 className="text-xl md:text-2xl lg:text-3xl">{motto}</h2>
      </CardHeader>
      <CardHeader className="space-y-2">
        <Countdown targetDate={startDate} />
        <p className="text-lg font-normal lg:text-xl">
          <Date dateString={startDate} formatString="EEEE, d. MMMM yyyy" /> bis{' '}
          <Date dateString={endDate} formatString="EEEE, d. MMMM yyyy" />
        </p>
      </CardHeader>
      <CardHeader className="flex w-full flex-col gap-2 sm:flex-row sm:justify-center sm:gap-4">
        <Button asChild data-umami-event="Sommerfreizeit Anmeldung Hero CTA">
          <Link href={anmeldungWebsite} target="_blank" className="space-x-2">
            Jetzt anmelden <User />
          </Link>
        </Button>
        <Button asChild variant="outline" data-umami-event="Sommerfreizeit Info Hero CTA">
          <Link href="#info" className="space-x-2">
            Informationen <ChevronDown />
          </Link>
        </Button>
      </CardHeader>
    </section>
  )
}
