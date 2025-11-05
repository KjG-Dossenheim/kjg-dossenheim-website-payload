'use client'

// React
import React, { Suspense } from 'react'

// UI Components
import { CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

// Form Component
import { KnallbonbonAnmeldungForm } from './form'

export default function KnallbonbonAnmeldungPage() {
  return (
    <section className="mx-auto max-w-md">
      <Suspense
        fallback={
          <>
            <CardHeader>
              <CardTitle>Knallbonbon Anmeldung</CardTitle>
              <CardDescription>
                Hier können Sie sich für unser Knallbonbon Event anmelden.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            </CardContent>
          </>
        }
      >
        <KnallbonbonAnmeldungForm />
      </Suspense>
    </section>
  )
}
