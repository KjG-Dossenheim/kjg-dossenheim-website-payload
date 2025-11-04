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
import { Check } from 'lucide-react'

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
      <CardHeader>
        <h1 className="text-center text-4xl font-bold">Teilnehmerbeitrag</h1>
      </CardHeader>
      <div className="grid grid-cols-1 gap-6 p-6 sm:grid-cols-2 sm:items-stretch md:grid-cols-3">
        {pricing.map((item) => (
          <Card key={item.name}>
            <CardHeader>
              <CardTitle>{item.name}</CardTitle>
              <CardDescription>{item.beschreibung}</CardDescription>
            </CardHeader>
            <CardContent>
              <span>
                <strong className="text-primary text-3xl font-bold sm:text-4xl">
                  {item.price}€
                </strong>
                <span className="text-primary text-sm font-medium">/pro Teilnehmer</span>
              </span>
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
                <h2 className="font-medium">Inklusive:</h2>
                <ul className="list-none space-y-2">
                  {item.eigenschaften.map((eigenschaft) => (
                    <li className="flex space-x-2" id={eigenschaft.id || ''} key={eigenschaft.id}>
                      <Check className="text-primary size-4" />
                      <span className="text-sm">{eigenschaft.name}</span>
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
