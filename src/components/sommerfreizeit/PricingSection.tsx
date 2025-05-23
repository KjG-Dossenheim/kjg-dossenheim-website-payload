import React from 'react'
import Link from 'next/link'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface PricingItem {
  name: string
  price: number
  beschreibung: string
  eigenschaften: Array<{
    id?: string | null | undefined
    name: string
  }>
}

interface PricingSectionProps {
  pricing: PricingItem[]
  anmeldungWebsite: string
}

export default function PricingSection({ pricing, anmeldungWebsite }: PricingSectionProps) {
  return (
    <section>
      <h1 className="py-8 text-center text-4xl font-bold">Teilnehmerbeitrag</h1>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:items-stretch md:grid-cols-3 md:gap-8">
        {pricing.map((item) => (
          <Card key={item.name}>
            <CardHeader className="h-28">
              <CardTitle>{item.name}</CardTitle>
              <CardDescription>{item.beschreibung}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mt-2 sm:mt-4">
                <strong className="text-primary text-3xl font-bold sm:text-4xl">
                  {item.price}€
                </strong>
                <span className="text-primary text-sm font-medium">/pro Teilnehmer</span>
              </p>
            </CardContent>
            <CardContent>
              <Button asChild className="mx-auto w-full">
                <Link href={anmeldungWebsite} target="_blank">
                  Jetzt anmelden
                </Link>
              </Button>
            </CardContent>
            <CardFooter>
              <div>
                <p className="text-lg font-medium sm:text-xl">Inklusive:</p>
                <ul className="mt-2 space-y-2 sm:mt-4">
                  {item.eigenschaften.map((eigenschaft) => (
                    <li className="flex" id={eigenschaft.id || ''} key={eigenschaft.id}>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth="1.5"
                        stroke="currentColor"
                        className="text-primary size-5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M4.5 12.75l6 6 9-13.5"
                        />
                      </svg>
                      <span>{eigenschaft.name}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
    </section>
  )
}
