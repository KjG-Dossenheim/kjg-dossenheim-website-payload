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
import { ArrowRight, Check } from 'lucide-react'

interface PricingItem {
  name: string
  price: number
  beschreibung: string
  default?: boolean | null
  eigenschaften: Array<{
    id?: string | null | undefined
    name: string
  }>
}

interface PricingSectionProps {
  pricing: PricingItem[]
  signupStartDate?: string | null
  pretixEventId?: string | null
}

export default function PricingSection({ pricing, signupStartDate }: PricingSectionProps) {
  const signupOpen = !signupStartDate || new Date() >= new Date(signupStartDate)

  return (
    <section className="mx-auto space-y-6 p-6">
      <div className="text-center">
        <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">Teilnehmerbeitrag</h2>
        <p className="text-muted-foreground text-lg">Wähle das passende Paket für dich aus</p>
      </div>
      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3 lg:p-6">
        {pricing.map((item) => {
          return (
            <Card
              key={item.name}
              className="relative flex flex-col transition-all duration-300 hover:shadow-xl"
            >
              <CardHeader>
                <CardTitle className="text-2xl">{item.name}</CardTitle>
                <CardDescription className="mt-2 text-base">{item.beschreibung}</CardDescription>
              </CardHeader>

              <CardContent className="grow">
                <div className="mb-6">
                  <div className="flex items-baseline">
                    <span className="text-5xl font-bold tracking-tight">{item.price}€</span>
                    <span className="text-muted-foreground ml-2 text-base font-medium">
                      / Teilnehmer
                    </span>
                  </div>
                </div>

                <div className="mb-6">
                  <h3 className="mb-4 text-sm font-semibold tracking-wide uppercase">Inklusive:</h3>
                  <ul className="space-y-3">
                    {item.eigenschaften.map((eigenschaft) => (
                      <li
                        className="flex items-start gap-3"
                        id={eigenschaft.id || ''}
                        key={eigenschaft.id}
                      >
                        <div className="bg-primary/10 text-primary mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full">
                          <Check className="size-3.5 stroke-3" />
                        </div>
                        <span className="text-sm leading-relaxed">{eigenschaft.name}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>

              <CardFooter className="flex flex-col gap-1 pt-0">
                {signupOpen ? (
                  <Button asChild className="h-12 w-full text-base transition-all" size="lg">
                    <Link href="/sommerfreizeit/buchen/">Jetzt Buchen</Link>
                  </Button>
                ) : (
                  <>
                    <Button disabled className="h-12 w-full text-base transition-all" size="lg">
                      Jetzt Buchen
                    </Button>
                  </>
                )}
              </CardFooter>
            </Card>
          )
        })}
      </div>
      <div className="mx-auto max-w-(--breakpoint-sm) px-6">
        <Card>
          <CardHeader>
            <CardTitle>Schon gebucht?</CardTitle>
          </CardHeader>
          <CardFooter>
            <Button asChild variant="outline" size="lg">
              <Link href="/sommerfreizeit/anmelden/" className="space-x-2">
                Anmeldung abschließen <ArrowRight className="ml-1" />
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </section>
  )
}
