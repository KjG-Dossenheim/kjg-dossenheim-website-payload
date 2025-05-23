import React from 'react'
import Link from 'next/link'
import Date from 'src/components/date'
import { ChevronDown, ChevronRight } from 'lucide-react'
import Countdown from '@/components/Countdown'
import { Button } from '@/components/ui/button'

interface HeroSectionProps {
  title: string
  motto: string | null | undefined
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
    <section className="mx-auto space-y-12 px-4 py-24 text-center">
      <div>
        <h1 className="text-4xl leading-none font-extrabold tracking-tight md:text-5xl lg:text-6xl">
          {title}
        </h1>
        <h2 className="text-xl md:text-2xl lg:text-3xl">{motto}</h2>
      </div>
      <div className="space-y-2">
        <Countdown targetDate={startDate} />
        <p className="text-lg font-normal sm:px-16 lg:px-48 lg:text-xl">
          <Date dateString={startDate} formatString="EEEE, d. MMMM yyyy" /> bis{' '}
          <Date dateString={endDate} formatString="EEEE, d. MMMM yyyy" />
        </p>
      </div>
      <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
        <Button asChild>
          <Link href={anmeldungWebsite} target="_blank">
            <span className="flex items-center gap-2">
              Jetzt anmelden <ChevronRight />
            </span>
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="#info">
            <span className="flex items-center gap-2">
              Informationen <ChevronDown />
            </span>
          </Link>
        </Button>
      </div>
    </section>
  )
}
