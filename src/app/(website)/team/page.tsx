import { getPayload } from 'payload'
import React from 'react'
import config from '@payload-config'
import Image from 'next/image'
import Link from 'next/link'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

import { Badge } from '@/components/ui/badge'
import { badgeVariants } from '@/components/ui/badge'

import type { Metadata } from 'next'
export function generateMetadata(): Metadata {
  return {
    title: 'Team | KjG Dossenheim',
    description: 'Hier findest du alle Mitglieder des KjG Teams',
  }
}

export default async function Page() {
  const payload = await getPayload({ config })
  const team = await payload.find({
    collection: 'team',
    sort: 'firstName',
    pagination: false,
  })

  return (
    <section>
      <div className="mx-auto max-w-screen-xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <div className="mx-auto mb-10 max-w-2xl text-center lg:mb-14">
          <h2 className="text-4xl font-bold">Unser Team</h2>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {team.docs.map((member) => (
            <Card key={member.id} id={member.id}>
              <div className="flex items-center">
                <Avatar className="m-6 mr-0 size-16">
                  {typeof member.profilePicture === 'object' && member.profilePicture?.url ? (
                    <AvatarImage src={member.profilePicture.url} />
                  ) : (
                    <AvatarFallback>KjG</AvatarFallback>
                  )}
                </Avatar>
                <CardHeader>
                  <CardTitle>
                    {member.firstName} {member.lastName}
                  </CardTitle>
                  <CardDescription className="space-x-2">
                    {member.position.map((position) => (
                      <Badge className="uppercase" key={position}>
                        {position}
                      </Badge>
                    ))}
                  </CardDescription>
                </CardHeader>
              </div>
              {member.description && (
                <CardContent>
                  <p>{member.description}</p>
                </CardContent>
              )}
              {member.email && (
                <CardFooter>
                  <Link
                    href={`mailto:${member.email}`}
                    className={`${badgeVariants({ variant: 'default' })} uppercase`}
                  >
                    E-Mail
                  </Link>
                </CardFooter>
              )}
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
