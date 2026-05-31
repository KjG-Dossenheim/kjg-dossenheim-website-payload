import React from 'react'
import Link from 'next/link'
import { Mail } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'

export default function ContactSection() {
  return (
    <section className="mx-auto w-full p-6">
      <div className="flex flex-col items-center justify-center space-y-4 text-center">
        <div className="space-y-2">
          <h2 className="text-4xl font-bold tracking-tighter sm:text-5xl">Kontakt</h2>
          <div className="text-muted-foreground mx-auto max-w-175 md:text-xl">
            <p>Hast du Fragen oder möchtest du mehr erfahren?</p>
            <p>Wir würden uns freuen, von Dir zu hören.</p>
          </div>
        </div>
        <div className="w-full max-w-sm space-y-2">
          <div className="flex justify-center">
            <Link
              href="mailto:sommerfreizeit@kjg-dossenheim.org"
              className={buttonVariants({ size: 'lg' })}
            >
              <span className="flex items-center gap-2">
                <Mail className="size-5" />
                <span>sommerfreizeit@kjg-dossenheim.org</span>
              </span>
            </Link>
          </div>
          <p className="text-muted-foreground text-xs">
            Wir antworten in der Regel innerhalb von 24-48 Stunden.
          </p>
        </div>
      </div>
    </section>
  )
}
