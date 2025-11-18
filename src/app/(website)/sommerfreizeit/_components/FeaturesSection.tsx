'use client'

import React from 'react'
import { RichText } from '@payloadcms/richtext-lexical/react'
import { CardHeader, CardContent } from '@/components/ui/card'
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
      <CardHeader>
        <h2 className="text-center text-4xl font-bold">Was uns ausmacht</h2>
      </CardHeader>
      <CardContent>
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
      </CardContent>
    </section>
  )
}
