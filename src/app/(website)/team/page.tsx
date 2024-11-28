import { getPayload } from 'payload'
import React from 'react'
import config from '@payload-config'
import Image from 'next/image'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

import { Badge } from "@/components/ui/badge"

import type { Metadata } from 'next'
export function generateMetadata(): Metadata {
  return {
    title: 'Team | KjG Dossenheim',
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
      <div className="max-w-screen-xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14 mx-auto">
        <div className="max-w-2xl mx-auto text-center mb-10 lg:mb-14">
          <h2 className="text-2xl font-bold md:text-4xl md:leading-tight text-secondary dark:text-primary">
            Unser Team
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {team.docs.map((member) => (
              <Card key={member.id} id={member.id}>
                <div className="flex items-center">
                  <Avatar className='m-6 mr-0 size-16'>
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
                        <Badge className='uppercase' key={position}>{position}</Badge>
                        
                      ))}
                    </CardDescription>
                  </CardHeader>
                </div>
                {member.description && (
                  <CardContent>
                    <p>{member.description}</p>
                  </CardContent>
                )}
              </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
