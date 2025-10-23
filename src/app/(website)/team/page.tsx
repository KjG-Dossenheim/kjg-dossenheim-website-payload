// ⬇️ ISR-Zeit (in Sekunden) einstellen
export const revalidate = 60 // 1 Minute

// React and Next.js
import React from 'react'
import Link from 'next/link'
import type { Metadata } from 'next'

// Third-party libraries
import { Mail, ArrowRight } from 'lucide-react'

// Payload CMS
import { getPayload } from 'payload'
import config from '@payload-config'
import type { Team } from '@/payload-types'

// UI Components
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

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
    <Card>
      <CardHeader>
        <Avatar className="aspect-square size-full rounded-lg">
          {hasProfilePicture ? (
            <AvatarImage
              src={(member.profilePicture as { url: string }).url}
              alt={`${member.firstName} ${member.lastName}`}
            />
          ) : (
            <AvatarFallback className="flex-col gap-2 rounded-lg">
              <p className="text-4xl leading-none font-extralight">{member.firstName}</p>
              <p className="text-4xl leading-none font-extralight">{member.lastName}</p>
            </AvatarFallback>
          )}
        </Avatar>
      </CardHeader>
      <CardContent className="space-y-2">
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
            <Link href={`mailto:${member.email}`}>
              <Badge className="uppercase" variant={'outline'}>
                <Mail className="size-4" />
              </Badge>
            </Link>
          )}
        </CardDescription>
      </CardContent>
      <CardFooter>
        <Link
          href={`/team/${member.id}`}
          className="flex items-center gap-2 text-sm hover:underline"
        >
          Mehr erfahren <ArrowRight className="size-4" />
        </Link>
      </CardFooter>
    </Card>
  )
}

export default async function TeamPage() {
  const teamMembers = await getTeamMembers()

  return (
    <section className="container mx-auto">
      <CardHeader>
        <CardTitle>Unser Team</CardTitle>
        <p>Hier findest du alle Mitglieder des KjG Dossenheim Teams</p>
      </CardHeader>
      {teamMembers.length > 0 ? (
        <div className="grid gap-6 p-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
