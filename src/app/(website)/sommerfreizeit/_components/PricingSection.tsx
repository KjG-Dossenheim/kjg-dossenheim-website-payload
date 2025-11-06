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
import { Badge } from '@/components/ui/badge'
import { Check, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

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
  // Determine the featured card (middle one for 3 items, or most expensive)
  const getFeaturedIndex = () => {
    if (pricing.length === 3) return 1 // Middle card
    if (pricing.length === 2) return 1 // Second card
    // Find most expensive
    const maxPrice = Math.max(...pricing.map((p) => p.price))
    return pricing.findIndex((p) => p.price === maxPrice)
  }

  const featuredIndex = getFeaturedIndex()

  return (
    <section className="py-12">
      <div className="mb-12 text-center">
        <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">Teilnehmerbeitrag</h2>
        <p className="text-muted-foreground mt-4 text-lg">Wähle das passende Paket für dich aus</p>
      </div>
      <div className="grid grid-cols-1 gap-8 px-4 sm:grid-cols-2 md:grid-cols-3 lg:px-6">
        {pricing.map((item, index) => {
          const isFeatured = index === featuredIndex
          return (
            <Card
              key={item.name}
              className={cn(
                'relative flex flex-col transition-all duration-300 hover:shadow-xl',
                isFeatured &&
                  'border-primary ring-primary/20 shadow-lg ring-2 sm:scale-105 sm:transform',
              )}
            >
              {isFeatured && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <Badge className="bg-primary px-4 py-1.5 text-sm font-semibold shadow-lg">
                    <Sparkles className="mr-1.5 size-3.5" />
                    Beliebt
                  </Badge>
                </div>
              )}

              <CardHeader className={cn('pb-8', isFeatured && 'pt-8')}>
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

              <CardFooter className="pt-0">
                <Button
                  asChild
                  className={cn(
                    'h-12 w-full text-base transition-all',
                    isFeatured && 'font-semibold shadow-lg',
                  )}
                  size="lg"
                  variant={isFeatured ? 'default' : 'outline'}
                >
                  <Link href={anmeldungWebsite} target="_blank">
                    Jetzt anmelden
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          )
        })}
      </div>
    </section>
  )
}
