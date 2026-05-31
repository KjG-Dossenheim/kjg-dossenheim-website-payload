'use client'

import React from 'react'
import { RichText } from '@payloadcms/richtext-lexical/react'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

interface Feature {
  id?: string | null | undefined
  title: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  description?: any
}

interface FeaturesSectionProps {
  eigenschaften: Feature[]
}

export default function FeaturesSection({ eigenschaften }: FeaturesSectionProps) {
  return (
    <section className="mx-auto max-w-(--breakpoint-sm) p-6">
      <div>
        <h2 className="text-center text-4xl font-bold sm:text-5xl">Was uns ausmacht</h2>
      </div>
      <div>
        <Accordion>
          {eigenschaften.map((eigenschaft) => (
            <AccordionItem key={eigenschaft.id} value={eigenschaft.id || ''}>
              <AccordionTrigger>{eigenschaft.title}</AccordionTrigger>
              <AccordionContent className="mb-2">
                {eigenschaft.description && <RichText data={eigenschaft.description} />}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  )
}
