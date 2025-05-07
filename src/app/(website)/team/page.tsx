import React from 'react'
import { getPayload } from 'payload'
import config from '@payload-config'
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
import { Badge, badgeVariants } from '@/components/ui/badge'
import type { Metadata } from 'next'

import type { Team } from '@/payload-types'
import { Mail } from 'lucide-react'

// Move data fetching to a separate function for better error handling and caching
async function getTeamMembers() {
  try {
    const payload = await getPayload({ config })
    const response = await payload.find({
      collection: 'team',
      sort: 'firstName',
      pagination: false,
    })

    return response.docs
  } catch (error) {
    console.error('Failed to fetch team members:', error)
    return []
  }
}

export function generateMetadata(): Metadata {
  return {
    title: 'Team | KjG Dossenheim',
    description: 'Hier findest du alle Mitglieder des KjG Teams',
  }
}

// Create a separate TeamMemberCard component for better reusability
function TeamMemberCard({ member }: { member: Team }) {
  const hasProfilePicture = typeof member.profilePicture === 'object' && member.profilePicture?.url

  return (
    <Link href={`/team/${member.id}`} key={member.id} id={member.id} className="w-full max-w-sm">
      <Card>
        <div className="flex cursor-pointer items-center transition-shadow hover:shadow-md">
          <Avatar className="m-6 mr-0 size-16">
            {hasProfilePicture ? (
              <AvatarImage
                src={(member.profilePicture as { url: string }).url}
                alt={`${member.firstName} ${member.lastName}`}
              />
            ) : (
              <AvatarFallback>
                {member.firstName.charAt(0)}
                {member.lastName.charAt(0)}
              </AvatarFallback>
            )}
          </Avatar>
          <CardHeader>
            <CardTitle>
              {member.firstName} {member.lastName}
            </CardTitle>
            <CardDescription className="flex flex-wrap gap-2">
              {member.position.map((position) => (
                <Badge className="uppercase" key={position} variant={'outline'}>
                  {position}
                </Badge>
              ))}
              {member.email && (
                <Badge className="uppercase" variant={'outline'}>
                  <Mail className="size-4" />
                </Badge>
              )}
            </CardDescription>
          </CardHeader>
        </div>
      </Card>
    </Link>
  )
}

export default async function TeamPage() {
  const teamMembers = await getTeamMembers()

  return (
    <section className="container mx-auto">
      <div className="p-6 text-center">
        <h1 className="text-4xl font-bold">Unser Team</h1>
      </div>
      {teamMembers.length > 0 ? (
        <div className="flex flex-wrap justify-center gap-4 p-4">
          {teamMembers.map((member) => (
            <TeamMemberCard key={member.id} member={member} />
          ))}
        </div>
      ) : (
        <div className="text-center">
          <p>Keine Teammitglieder gefunden.</p>
        </div>
      )}
    </section>
  )
}
