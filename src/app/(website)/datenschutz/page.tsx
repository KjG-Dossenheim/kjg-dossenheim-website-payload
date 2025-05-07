import { getPayload } from 'payload'
import React from 'react'
import config from '@payload-config'

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

import { Button } from '@/components/ui/button'

export default async function Page() {
  const payload = await getPayload({ config })
  const rechtliches = await payload.findGlobal({
    slug: 'rechtliches',
  })

  return (
    <section className="mx-auto flex flex-wrap gap-4 px-4 py-8 sm:max-w-(--breakpoint-lg) sm:px-6 lg:px-8 lg:py-14">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Allgemein</CardTitle>
          <CardDescription></CardDescription>
        </CardHeader>
        <CardFooter>
          <Button>Mehr</Button>
        </CardFooter>
      </Card>
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Sommerfreizeit</CardTitle>
          <CardDescription></CardDescription>
        </CardHeader>
        <CardFooter>
          <Button>Mehr</Button>
        </CardFooter>
      </Card>
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Pretix</CardTitle>
          <CardDescription></CardDescription>
        </CardHeader>
        <CardFooter>
          <Button>Mehr</Button>
        </CardFooter>
      </Card>
    </section>
  )
}
