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
  description?: any
}

interface FeaturesSectionProps {
  eigenschaften: Feature[]
}

export default function FeaturesSection({ eigenschaften }: FeaturesSectionProps) {
  return (
    <section className="mx-auto max-w-(--breakpoint-sm)">
      <h2 className="mb-5 text-center text-4xl font-bold">Was uns ausmacht</h2>
      <Accordion type="single" collapsible>
        {eigenschaften.map((eigenschaft) => (
          <AccordionItem key={eigenschaft.id} value={eigenschaft.id || ''}>
            <AccordionTrigger>{eigenschaft.title}</AccordionTrigger>
            <AccordionContent className="mb-2">
              {eigenschaft.description && <RichText data={eigenschaft.description} />}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  )
}
