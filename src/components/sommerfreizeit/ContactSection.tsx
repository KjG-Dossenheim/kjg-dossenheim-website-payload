import React from 'react'
import Link from 'next/link'
import { Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function ContactSection() {
  return (
    <section className="mx-auto w-full px-4 md:px-6">
      <div className="flex flex-col items-center justify-center space-y-4 text-center">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tighter">Kontakt</h1>
          <div className="text-muted-foreground mx-auto max-w-[700px] md:text-xl">
            <p>Hast du Fragen oder möchtest du mehr erfahren?</p>
            <p>Wir würden uns freuen, von Dir zu hören.</p>
          </div>
        </div>
        <div className="w-full max-w-sm space-y-2">
          <div className="flex justify-center">
            <Button asChild size="lg">
              <Link href="mailto:sommerfreizeit@kjg-dossenheim.org">
                <span className="flex items-center gap-2">
                  <Mail className="size-5" />
                  <span>sommerfreizeit@kjg-dossenheim.org</span>
                </span>
              </Link>
            </Button>
          </div>
          <p className="text-muted-foreground text-xs">
            Wir antworten in der Regel innerhalb von 24-48 Stunden.
          </p>
        </div>
      </div>
    </section>
  )
}
