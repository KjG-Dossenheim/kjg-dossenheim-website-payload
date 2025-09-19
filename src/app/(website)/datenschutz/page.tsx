import React from 'react'

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Shield, Calendar, Ticket } from 'lucide-react'

export default async function Page() {
  const privacyCards = [
    {
      title: 'Allgemeine Datenschutzerklärung',
      description: 'Erfahren Sie, wie wir Ihre persönlichen Daten sammeln, verwenden und schützen.',
      href: '/datenschutz/agb',
      icon: Shield,
    },
    {
      title: 'Sommerfreizeit',
      description: 'Spezielle Datenschutzbestimmungen für unsere Sommerferienprogramme.',
      href: '/datenschutz/sommerfreizeit',
      icon: Calendar,
    },
    {
      title: 'Pretix Ticketsystem',
      description: 'Datenschutzinformationen für unser Ticketbuchungssystem.',
      href: '/datenschutz/pretix',
      icon: Ticket,
    },
  ]

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-16">
      <div className="mb-12 text-center">
        <h1 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">Datenschutz</h1>
        <p className="text-muted-foreground mx-auto max-w-2xl text-lg">
          Ihre Privatsphäre ist uns wichtig. Hier finden Sie alle Informationen zum Umgang mit Ihren
          Daten.
        </p>
      </div>

      <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {privacyCards.map((card) => {
          const IconComponent = card.icon
          return (
            <Card key={card.href} className="flex flex-col transition-shadow hover:shadow-lg">
              <CardHeader className="pb-4">
                <div className="bg-primary/10 mb-2 flex h-12 w-12 items-center justify-center rounded-lg">
                  <IconComponent className="text-primary h-6 w-6" />
                </div>
                <CardTitle className="text-xl">{card.title}</CardTitle>
                <CardDescription className="text-sm leading-relaxed">
                  {card.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1" />
              <CardFooter className="pt-0">
                <Button asChild className="w-full">
                  <Link href={card.href}>Mehr erfahren</Link>
                </Button>
              </CardFooter>
            </Card>
          )
        })}
      </section>
    </div>
  )
}
