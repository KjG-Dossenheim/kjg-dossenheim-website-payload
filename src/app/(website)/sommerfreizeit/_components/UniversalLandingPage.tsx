import React from 'react'

import type { SommerfreizeitSetting } from '@/payload-types'
import AgeRangeSection from './AgeRangeSection'
import ContactSection from './ContactSection'
import FeaturesSection from './FeaturesSection'
import HeroSection from './HeroSection'

interface UniversalLandingPageProps {
  headline?: string | null
  subline?: string | null
  description?: string | null
  heroImage?: SommerfreizeitSetting['heroImage']
  alter?: string | null
  eigenschaften: SommerfreizeitSetting['eigenschaften']
  /** Jahr der Freizeit, die auf die vergangene folgt. Wird an die Ueberschrift angehaengt. */
  nextYear?: number | null
}

const FALLBACK_SUBLINE = 'Die nächste Freizeit ist in Planung.'
const FALLBACK_HEADLINE = 'Sommerfreizeit'

/** Ueberschriften, die bereits ein Jahr enthalten, bekommen keines angehaengt. */
const TRAILING_YEAR = /\b(19|20)\d{2}\s*$/

/**
 * Allgemeine Landing Page der Sommerfreizeit.
 * Wird angezeigt, sobald die verknuepfte Freizeit vorbei ist.
 */
export default function UniversalLandingPage({
  headline,
  subline,
  description,
  heroImage,
  alter,
  eigenschaften,
  nextYear,
}: UniversalLandingPageProps) {
  const baseTitle = headline?.trim() || FALLBACK_HEADLINE
  const title =
    nextYear != null && !TRAILING_YEAR.test(baseTitle) ? `${baseTitle} ${nextYear}` : baseTitle

  return (
    <section>
      <HeroSection
        title={title}
        subline={subline || FALLBACK_SUBLINE}
        backgroundImage={heroImage}
      />

      {description && (
        <section className="mx-auto max-w-(--breakpoint-sm) p-6 pt-10 text-center">
          <p className="text-muted-foreground text-lg md:text-xl">{description}</p>
        </section>
      )}

      {alter && <AgeRangeSection alter={alter} />}

      <section className="mx-auto" id="info">
        {eigenschaften && eigenschaften.length > 0 && (
          <FeaturesSection eigenschaften={eigenschaften} />
        )}

        <ContactSection />
      </section>
    </section>
  )
}
