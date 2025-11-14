// React
import React from 'react'
import dynamic from 'next/dynamic'

// UI Components
import { CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

// Form Component - dynamically imported for better performance
const KnallbonbonAnmeldungForm = dynamic(
  () => import('./form').then((mod) => ({ default: mod.KnallbonbonAnmeldungForm })),
  {
    loading: () => (
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
    ),
  },
)

import type { Metadata } from 'next'

export function generateMetadata(): Metadata {
  return {
    title: 'Knallbonbon Anmeldung | ' + process.env.NEXT_PUBLIC_SITE_NAME,
    description: 'Melden Sie sich für das Knallbonbon Event an',
  }
}

export default function KnallbonbonAnmeldungPage() {
  return (
    <section className="mx-auto max-w-md">
      <KnallbonbonAnmeldungForm />
    </section>
  )
}
