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
import { Button, buttonVariants } from '@/components/ui/button'
import { ArrowRight, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

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
    <section className="mx-auto max-w-(--breakpoint-lg) space-y-6 p-6">
      <div className="text-center">
        <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">Teilnehmerbeitrag</h2>
      </div>
      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3">
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
                  <span className="text-5xl font-bold tracking-tight">{item.price}€</span>
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
                  <Link
                    href="/sommerfreizeit/buchen/"
                    className={cn(
                      buttonVariants({ size: 'lg' }),
                      'h-12 w-full text-base transition-all',
                    )}
                  >
                    Jetzt Buchen
                  </Link>
                ) : (
                  <Button disabled className="h-12 w-full text-base transition-all" size="lg">
                    Jetzt Buchen
                  </Button>
                )}
                <Link
                  href="/sommerfreizeit/anmelden/"
                  className={buttonVariants({ variant: 'link', size: 'xs' })}
                >
                  Anmeldung abschließen <ArrowRight data-icon="inline-end" />
                </Link>
              </CardFooter>
            </Card>
          )
        })}
      </div>
    </section>
  )
}
